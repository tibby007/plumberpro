import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Lead, Message } from '@/types';
import { formatDistanceToNow } from 'date-fns';

interface ConversationPanelProps {
  lead: Lead | null;
  messages: Message[];
  onClose: () => void;
}

export function ConversationPanel({ lead, messages, onClose }: ConversationPanelProps) {
  if (!lead) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-background border-l shadow-lg flex flex-col">
      <div className="p-4 border-b flex items-center justify-between">
        <div>
          <h3 className="font-semibold">{lead.customer_name}</h3>
          <p className="text-sm text-muted-foreground">{lead.phone}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`rounded-lg px-4 py-2 max-w-[80%] ${
                  message.sender === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <p className="text-sm">{message.text}</p>
                <p className="text-xs opacity-70 mt-1">
                  {formatDistanceToNow(message.timestamp, { addSuffix: true })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <div className="space-y-2 text-sm">
          <div><strong>Email:</strong> {lead.email}</div>
          <div><strong>Intent:</strong> {lead.intent}</div>
          <div><strong>Priority:</strong> {lead.priority}</div>
        </div>
      </div>
    </div>
  );
}
