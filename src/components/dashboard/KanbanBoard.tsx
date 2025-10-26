import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { LeadCard } from './LeadCard';
import type { Lead } from '@/types';

interface KanbanBoardProps {
  leads: Lead[];
  onStatusChange: (leadId: string, newStatus: Lead['status']) => void;
  onLeadClick: (lead: Lead) => void;
}

export function KanbanBoard({ leads, onStatusChange, onLeadClick }: KanbanBoardProps) {
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
        <KanbanColumn title="New" droppableId="new" leads={newLeads} onLeadClick={onLeadClick} />
        <KanbanColumn title="In Progress" droppableId="in_progress" leads={inProgressLeads} onLeadClick={onLeadClick} />
        <KanbanColumn title="Completed" droppableId="completed" leads={completedLeads} onLeadClick={onLeadClick} />
      </div>
    </DragDropContext>
  );
}

interface KanbanColumnProps {
  title: string;
  droppableId: string;
  leads: Lead[];
  onLeadClick: (lead: Lead) => void;
}

function KanbanColumn({ title, droppableId, leads, onLeadClick }: KanbanColumnProps) {
  return (
    <div className="flex flex-col bg-muted/50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">{title}</h3>
        <span className="text-sm text-muted-foreground">({leads.length})</span>
      </div>
      <Droppable droppableId={droppableId}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 space-y-3 min-h-[200px] transition-colors ${
              snapshot.isDraggingOver ? 'bg-muted' : ''
            }`}
          >
            {leads.map((lead, index) => (
              <Draggable key={lead.id} draggableId={lead.id} index={index}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <LeadCard lead={lead} index={index} onClick={() => onLeadClick(lead)} />
                  </div>
                )}
              </Draggable>
            ))}
            {leads.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                No leads yet
              </p>
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
