import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { KanbanBoard } from '@/components/dashboard/KanbanBoard';
import { ConversationPanel } from '@/components/dashboard/ConversationPanel';
import { DashboardSkeleton } from '@/components/dashboard/Skeletons';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Lead, Message } from '@/types';
import { Session, User } from '@supabase/supabase-js';
import { Loader2, Wifi, WifiOff, LogOut } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

const Dashboard = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isPlumber, setIsPlumber] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { toast } = useToast();

  // Check authentication and role
  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Check plumber role using setTimeout to avoid deadlock
          setTimeout(() => {
            checkPlumberRole(session.user.id);
          }, 0);
        } else {
          navigate('/login');
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        checkPlumberRole(session.user.id);
      } else {
        navigate('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkPlumberRole = async (userId: string) => {
    try {
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'plumber');
      
      if (!roles || roles.length === 0) {
        toast({
          title: 'Access Denied',
          description: 'You need plumber privileges to access this dashboard.',
          variant: 'destructive',
        });
        await supabase.auth.signOut();
        navigate('/login');
      } else {
        setIsPlumber(true);
      }
    } catch (error) {
      console.error('Error checking role:', error);
      navigate('/login');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: 'Logged out',
      description: 'You have been successfully logged out.',
    });
    navigate('/login');
  };

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: 'Back Online',
        description: 'Connection restored.',
      });
      fetchLeads(); // Refresh data when back online
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: 'Offline',
        description: 'You are currently offline.',
        variant: 'destructive',
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch leads on mount (only if authenticated as plumber)
  useEffect(() => {
    if (isPlumber) {
      fetchLeads();
      setupRealtimeSubscription();
    }
  }, [isPlumber]);

  const fetchLeads = async () => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeads((data || []) as Lead[]);
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast({
        title: 'Error',
        description: 'Failed to load leads.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leads',
        },
        (payload) => {
          console.log('Real-time update:', payload);
          
          if (payload.eventType === 'INSERT') {
            setLeads((prev) => [payload.new as Lead, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setLeads((prev) =>
              prev.map((lead) =>
                lead.id === payload.new.id ? (payload.new as Lead) : lead
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setLeads((prev) => prev.filter((lead) => lead.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleStatusChange = async (leadId: string, newStatus: Lead['status']) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', leadId);

      if (error) throw error;

      toast({
        title: 'Status Updated',
        description: 'Lead status has been updated.',
      });
    } catch (error) {
      console.error('Error updating lead:', error);
      toast({
        title: 'Error',
        description: 'Failed to update lead status.',
        variant: 'destructive',
      });
    }
  };

  const handleLeadClick = async (lead: Lead) => {
    setSelectedLead(lead);
    
    // Fetch messages for this lead
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', lead.id)
        .order('timestamp', { ascending: true });

      if (error) throw error;
      
      setMessages((data || []) as Message[]);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to load conversation.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', leadId);

      if (error) throw error;

      toast({
        title: 'Lead Deleted',
        description: 'Lead has been permanently deleted.',
      });
    } catch (error) {
      console.error('Error deleting lead:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete lead.',
        variant: 'destructive',
      });
    }
  };

  const handleCompleteLead = async (leadId: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ status: 'completed', updated_at: new Date().toISOString() })
        .eq('id', leadId);

      if (error) throw error;

      toast({
        title: 'Lead Completed',
        description: 'Lead marked as complete.',
      });
      setSelectedLead(null);
    } catch (error) {
      console.error('Error completing lead:', error);
      toast({
        title: 'Error',
        description: 'Failed to complete lead.',
        variant: 'destructive',
      });
    }
  };

  const handleFollowUp = (lead: Lead) => {
    // Open email client with pre-filled template
    const subject = encodeURIComponent(`Follow-up: ${lead.intent}`);
    const body = encodeURIComponent(
      `Hi ${lead.customer_name},\n\nThank you for contacting PlumberPro AI. ` +
      `I wanted to follow up regarding your ${lead.intent} inquiry.\n\n` +
      `Please let me know if you have any questions or would like to schedule a service.\n\n` +
      `Best regards,\nPlumberPro Team`
    );
    window.location.href = `mailto:${lead.email}?subject=${subject}&body=${body}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-bold">PlumberPro Dashboard</h1>
            <p className="text-muted-foreground mt-2">Loading your leads...</p>
          </header>
          <DashboardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6 md:mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">PlumberPro Dashboard</h1>
              <p className="text-muted-foreground mt-2 text-sm md:text-base">
                Manage your leads and conversations
              </p>
            </div>
            <div className="flex items-center gap-3">
              {isOnline ? (
                <Wifi className="h-5 w-5 text-green-600" />
              ) : (
                <WifiOff className="h-5 w-5 text-destructive" />
              )}
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleLogout}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </header>

        {!isOnline && (
          <Alert className="mb-6">
            <WifiOff className="h-4 w-4" />
            <AlertDescription>
              You're currently offline. Some features may be unavailable.
            </AlertDescription>
          </Alert>
        )}

        <div className="relative">
          <KanbanBoard 
            leads={leads} 
            onStatusChange={handleStatusChange}
            onLeadClick={handleLeadClick}
          />
          <ConversationPanel
            lead={selectedLead}
            messages={messages}
            onClose={() => setSelectedLead(null)}
            onDelete={handleDeleteLead}
            onComplete={handleCompleteLead}
            onFollowUp={handleFollowUp}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
