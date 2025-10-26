import { useState, useEffect } from 'react';
import { KanbanBoard } from '@/components/dashboard/KanbanBoard';
import { ConversationPanel } from '@/components/dashboard/ConversationPanel';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import type { Lead, Message } from '@/types';
import { Loader2 } from 'lucide-react';

const Dashboard = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Fetch leads on mount
  useEffect(() => {
    fetchLeads();
    setupRealtimeSubscription();
  }, []);

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
      
      // Transform timestamps to Date objects
      const transformedMessages: Message[] = (data || []).map(msg => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      } as Message));
      
      setMessages(transformedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to load conversation.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">PlumberPro Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Manage your leads and conversations
          </p>
        </header>

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
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
