import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Lead } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { Phone, Mail, MessageSquare } from 'lucide-react';

interface LeadCardProps {
  lead: Lead;
  index: number;
  onClick: () => void;
}

export function LeadCard({ lead, onClick }: LeadCardProps) {
  const getPriorityVariant = (priority: Lead['priority']) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <Card
      onClick={onClick}
      className="cursor-pointer hover:shadow-md transition-shadow bg-background"
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold text-base truncate">{lead.customer_name}</h4>
          <Badge variant={getPriorityVariant(lead.priority)} className="shrink-0">
            {lead.priority}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="h-3 w-3" />
            <span className="truncate">{lead.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="h-3 w-3" />
            <span className="truncate">{lead.email}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MessageSquare className="h-3 w-3" />
            <span className="truncate">{lead.intent}</span>
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground line-clamp-2">
          {lead.message}
        </p>
        
        <div className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
        </div>
      </CardContent>
    </Card>
  );
}
