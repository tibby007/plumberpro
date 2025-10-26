import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import type { Lead } from '@/types';

interface KanbanBoardProps {
  leads: Lead[];
  onStatusChange: (leadId: string, newStatus: Lead['status']) => void;
}

export function KanbanBoard({ leads, onStatusChange }: KanbanBoardProps) {
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const newStatus = result.destination.droppableId as Lead['status'];
    onStatusChange(result.draggableId, newStatus);
  };

  const newLeads = leads.filter(lead => lead.status === 'new');
  const inProgressLeads = leads.filter(lead => lead.status === 'in_progress');
  const completedLeads = leads.filter(lead => lead.status === 'completed');

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-3 gap-6 h-full">
        <KanbanColumn title="New" droppableId="new" leads={newLeads} />
        <KanbanColumn title="In Progress" droppableId="in_progress" leads={inProgressLeads} />
        <KanbanColumn title="Completed" droppableId="completed" leads={completedLeads} />
      </div>
    </DragDropContext>
  );
}

interface KanbanColumnProps {
  title: string;
  droppableId: string;
  leads: Lead[];
}

function KanbanColumn({ title, droppableId, leads }: KanbanColumnProps) {
  return (
    <div className="flex flex-col bg-muted/50 rounded-lg p-4">
      <h3 className="font-semibold mb-4">{title}</h3>
      <Droppable droppableId={droppableId}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="flex-1 space-y-3"
          >
            <p className="text-sm text-muted-foreground">Lead cards will appear here...</p>
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
