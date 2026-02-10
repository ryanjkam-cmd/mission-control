/**
 * ContentCalendar Component
 * Multi-view calendar with drag-and-drop support
 * Views: Week, Month, Kanban
 */

import { useState, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { ContentItem, ContentStatus } from '@/types';
import ContentCard from './ContentCard';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks, startOfMonth, endOfMonth, addMonths, subMonths, isSameDay, parseISO } from 'date-fns';
import { useContentStore } from '@/stores/contentStore';

interface ContentCalendarProps {
  view: 'week' | 'month' | 'kanban';
  onEditItem?: (item: ContentItem) => void;
  onDeleteItem?: (id: string) => void;
  onDuplicateItem?: (item: ContentItem) => void;
}

const KANBAN_COLUMNS: { status: ContentStatus; label: string; color: string }[] = [
  { status: 'draft', label: 'Draft', color: 'border-mc-text-secondary' },
  { status: 'scheduled', label: 'Scheduled', color: 'border-mc-accent-yellow' },
  { status: 'published', label: 'Published', color: 'border-mc-accent-green' },
];

export default function ContentCalendar({
  view,
  onEditItem,
  onDeleteItem,
  onDuplicateItem,
}: ContentCalendarProps) {
  const { items, updateItem } = useContentStore();
  const [currentDate, setCurrentDate] = useState(new Date());

  // Calculate date range based on view
  const dateRange = useMemo(() => {
    if (view === 'week') {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday
      const end = endOfWeek(currentDate, { weekStartsOn: 1 });
      return eachDayOfInterval({ start, end });
    } else if (view === 'month') {
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);
      return eachDayOfInterval({ start, end });
    }
    return [];
  }, [currentDate, view]);

  // Group items by date or status
  const groupedItems = useMemo(() => {
    if (view === 'kanban') {
      return KANBAN_COLUMNS.reduce((acc, col) => {
        acc[col.status] = items.filter((item) => item.status === col.status);
        return acc;
      }, {} as Record<ContentStatus, ContentItem[]>);
    } else {
      // Group by date
      return dateRange.reduce((acc, date) => {
        const dateKey = format(date, 'yyyy-MM-dd');
        acc[dateKey] = items.filter((item) => {
          if (!item.scheduledDate) return false;
          const itemDate = new Date(item.scheduledDate);
          return isSameDay(itemDate, date);
        });
        return acc;
      }, {} as Record<string, ContentItem[]>);
    }
  }, [items, view, dateRange]);

  // Navigation
  const handlePrevious = () => {
    if (view === 'week') {
      setCurrentDate(subWeeks(currentDate, 1));
    } else if (view === 'month') {
      setCurrentDate(subMonths(currentDate, 1));
    }
  };

  const handleNext = () => {
    if (view === 'week') {
      setCurrentDate(addWeeks(currentDate, 1));
    } else if (view === 'month') {
      setCurrentDate(addMonths(currentDate, 1));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Drag and drop
  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId) return;

    const item = items.find((i) => i.id === draggableId);
    if (!item) return;

    if (view === 'kanban') {
      // Update status
      updateItem(item.id, { status: destination.droppableId as ContentStatus });
    } else {
      // Update scheduled date
      const newDate = parseISO(destination.droppableId);
      updateItem(item.id, { scheduledDate: newDate });
    }
  };

  // Render header
  const renderHeader = () => (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-semibold text-mc-text">
          {view === 'kanban'
            ? 'Content Pipeline'
            : format(currentDate, view === 'week' ? 'MMM d, yyyy' : 'MMMM yyyy')}
        </h2>
        {view !== 'kanban' && (
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevious}
              className="p-2 rounded-lg hover:bg-mc-bg-tertiary transition-colors"
            >
              <ChevronLeft size={18} className="text-mc-text-secondary" />
            </button>
            <button
              onClick={handleToday}
              className="px-3 py-1.5 text-sm border border-mc-border rounded-lg text-mc-text hover:bg-mc-bg-tertiary transition-colors"
            >
              Today
            </button>
            <button
              onClick={handleNext}
              className="p-2 rounded-lg hover:bg-mc-bg-tertiary transition-colors"
            >
              <ChevronRight size={18} className="text-mc-text-secondary" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // Render week view
  const renderWeekView = () => (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-7 gap-4">
        {dateRange.map((date, index) => {
          const dateKey = format(date, 'yyyy-MM-dd');
          const dayItems = (groupedItems as Record<string, ContentItem[]>)[dateKey] || [];
          const isToday = isSameDay(date, new Date());

          return (
            <Droppable key={dateKey} droppableId={dateKey}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`min-h-[400px] p-3 rounded-lg border-2 transition-all ${
                    snapshot.isDraggingOver
                      ? 'border-brand-purple bg-brand-purple/5'
                      : isToday
                      ? 'border-brand-cyan bg-brand-cyan/5'
                      : 'border-mc-border bg-mc-bg-secondary'
                  }`}
                >
                  {/* Day header */}
                  <div className="mb-3 pb-2 border-b border-mc-border">
                    <div className="text-xs font-medium text-mc-text-secondary uppercase">
                      {format(date, 'EEE')}
                    </div>
                    <div className={`text-lg font-semibold ${
                      isToday ? 'text-brand-cyan' : 'text-mc-text'
                    }`}>
                      {format(date, 'd')}
                    </div>
                  </div>

                  {/* Content cards */}
                  <div className="space-y-2">
                    {dayItems.map((item, itemIndex) => (
                      <Draggable key={item.id} draggableId={item.id} index={itemIndex}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              ...provided.draggableProps.style,
                              opacity: snapshot.isDragging ? 0.5 : 1,
                            }}
                          >
                            <ContentCard
                              item={item}
                              variant="calendar"
                              onEdit={onEditItem}
                              onDelete={onDeleteItem}
                              onDuplicate={onDuplicateItem}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          );
        })}
      </div>
    </DragDropContext>
  );

  // Render month view
  const renderMonthView = () => (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-7 gap-2">
        {/* Day headers */}
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-mc-text-secondary uppercase py-2"
          >
            {day}
          </div>
        ))}

        {/* Days */}
        {dateRange.map((date) => {
          const dateKey = format(date, 'yyyy-MM-dd');
          const dayItems = (groupedItems as Record<string, ContentItem[]>)[dateKey] || [];
          const isToday = isSameDay(date, new Date());

          return (
            <Droppable key={dateKey} droppableId={dateKey}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`min-h-[120px] p-2 rounded-lg border transition-all ${
                    snapshot.isDraggingOver
                      ? 'border-brand-purple bg-brand-purple/5'
                      : isToday
                      ? 'border-brand-cyan bg-brand-cyan/5'
                      : 'border-mc-border bg-mc-bg-secondary'
                  }`}
                >
                  {/* Date number */}
                  <div className={`text-sm font-semibold mb-1 ${
                    isToday ? 'text-brand-cyan' : 'text-mc-text'
                  }`}>
                    {format(date, 'd')}
                  </div>

                  {/* Content bubbles */}
                  <div className="space-y-1">
                    {dayItems.slice(0, 3).map((item, itemIndex) => (
                      <Draggable key={item.id} draggableId={item.id} index={itemIndex}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              ...provided.draggableProps.style,
                              opacity: snapshot.isDragging ? 0.5 : 1,
                            }}
                            className="text-xs p-1.5 rounded bg-mc-bg-tertiary border border-mc-border hover:border-mc-accent/50 cursor-pointer truncate"
                            onClick={() => onEditItem?.(item)}
                          >
                            {item.title}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {dayItems.length > 3 && (
                      <div className="text-xs text-mc-text-secondary pl-1.5">
                        +{dayItems.length - 3} more
                      </div>
                    )}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          );
        })}
      </div>
    </DragDropContext>
  );

  // Render kanban view
  const renderKanbanView = () => (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-3 gap-6">
        {KANBAN_COLUMNS.map((column) => {
          const columnItems = (groupedItems as Record<ContentStatus, ContentItem[]>)[column.status] || [];

          return (
            <Droppable key={column.status} droppableId={column.status}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`rounded-lg border-t-4 ${column.color} bg-mc-bg-secondary`}
                >
                  {/* Column header */}
                  <div className="p-4 border-b border-mc-border">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-mc-text">
                        {column.label}
                      </h3>
                      <span className="text-sm text-mc-text-secondary">
                        {columnItems.length}
                      </span>
                    </div>
                  </div>

                  {/* Column content */}
                  <div
                    className={`min-h-[600px] p-4 space-y-3 transition-colors ${
                      snapshot.isDraggingOver ? 'bg-brand-purple/5' : ''
                    }`}
                  >
                    {columnItems.map((item, index) => (
                      <Draggable key={item.id} draggableId={item.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              ...provided.draggableProps.style,
                              opacity: snapshot.isDragging ? 0.5 : 1,
                              cursor: snapshot.isDragging ? 'grabbing' : 'grab',
                            }}
                          >
                            <ContentCard
                              item={item}
                              variant="kanban"
                              onEdit={onEditItem}
                              onDelete={onDeleteItem}
                              onDuplicate={onDuplicateItem}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          );
        })}
      </div>
    </DragDropContext>
  );

  return (
    <div>
      {renderHeader()}
      {view === 'week' && renderWeekView()}
      {view === 'month' && renderMonthView()}
      {view === 'kanban' && renderKanbanView()}
    </div>
  );
}
