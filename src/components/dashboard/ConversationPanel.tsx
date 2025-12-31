import { X, Phone, Mail, Calendar, AlertCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { Lead, Message } from '@/types';
import { formatDistanceToNow, format } from 'date-fns';

interface ConversationPanelProps {
  lead: Lead | null;
  messages: Message[];
  onClose: () => void;
  onDelete: (leadId: string) => void;
  onComplete: (leadId: string) => void;
  onFollowUp: (lead: Lead) => void;
}

export function ConversationPanel({ lead, messages, onClose, onDelete, onComplete, onFollowUp }: ConversationPanelProps) {
  if (!lead) return null;

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete this lead from ${lead.customer_name}?`)) {
      onDelete(lead.id);
      onClose();
    }
  };

  const handleComplete = () => {
    onComplete(lead.id);
  };

  const handleFollowUp = () => {
    onFollowUp(lead);
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 animate-fade-in"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full md:w-[450px] bg-background border-l shadow-2xl flex flex-col z-50 animate-slide-in-right">
        {/* Header */}
        <div className="p-6 border-b bg-muted/30">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="font-semibold text-xl mb-1">{lead.customer_name}</h3>
              <Badge variant={lead.priority === 'high' ? 'destructive' : 'secondary'}>
                {lead.priority} priority
              </Badge>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4" />
              <a href={`tel:${lead.phone}`} className="hover:text-primary">
                {lead.phone}
              </a>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4" />
              <a href={`mailto:${lead.email}`} className="hover:text-primary">
                {lead.email}
              </a>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              <span>Intent: {lead.intent}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Created {format(new Date(lead.created_at), 'PPp')}</span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 bg-muted/10 overflow-hidden">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p className="text-sm">No messages yet</p>
            </div>
          ) : (
            <ScrollArea className="h-full p-6">
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`rounded-lg px-4 py-3 max-w-[85%] ${
                        msg.sender === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-background border shadow-sm'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                      <p className={`text-xs mt-2 ${
                        msg.sender === 'user' 
                          ? 'text-primary-foreground/70' 
                          : 'text-muted-foreground'
                      }`}>
                        {formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t bg-background space-y-2">
          <div className="flex gap-2">
            <Button 
              className="flex-1" 
              variant="outline"
              onClick={handleComplete}
              disabled={lead.status === 'completed'}
            >
              {lead.status === 'completed' ? 'Completed' : 'Mark as Complete'}
            </Button>
            <Button 
              className="flex-1"
              onClick={handleFollowUp}
            >
              Send Follow-up
            </Button>
          </div>
          <Button 
            className="w-full" 
            variant="destructive"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Lead
          </Button>
        </div>
      </div>
    </>
  );
}
