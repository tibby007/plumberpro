import { Draggable } from 'react-beautiful-dnd';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Lead } from '@/types';
import { formatDistanceToNow } from 'date-fns';

interface LeadCardProps {
  lead: Lead;
  index: number;
  onClick: () => void;
}

export function LeadCard({ lead, index, onClick }: LeadCardProps) {
  return (
    <Draggable draggableId={lead.id} index={index}>
      {(provided) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          className="cursor-pointer hover:shadow-md transition-shadow"
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <h4 className="font-semibold">{lead.customer_name}</h4>
              <Badge variant={lead.priority === 'high' ? 'destructive' : 'secondary'}>
                {lead.priority}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground line-clamp-2">{lead.message}</p>
            <div className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
            </div>
          </CardContent>
        </Card>
      )}
    </Draggable>
  );
}
