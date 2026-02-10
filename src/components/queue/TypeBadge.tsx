import { Mail, MessageCircle, Calendar, Heart, Plane, Bell, CheckSquare, AlertCircle, FileText } from 'lucide-react';
import type { ActionType } from '@/lib/types';

interface TypeBadgeProps {
  type: ActionType;
  className?: string;
}

const TYPE_CONFIG: Partial<Record<ActionType, { icon: React.ElementType; label: string; color: string }>> = {
  email: {
    icon: Mail,
    label: 'Email',
    color: 'text-blue-400 bg-blue-500/20 border-blue-500/40',
  },
  email_reply: {
    icon: Mail,
    label: 'Email Reply',
    color: 'text-blue-400 bg-blue-500/20 border-blue-500/40',
  },
  imessage: {
    icon: MessageCircle,
    label: 'iMessage',
    color: 'text-green-400 bg-green-500/20 border-green-500/40',
  },
  calendar: {
    icon: Calendar,
    label: 'Calendar',
    color: 'text-purple-400 bg-purple-500/20 border-purple-500/40',
  },
  calendar_block: {
    icon: Calendar,
    label: 'Calendar Block',
    color: 'text-purple-400 bg-purple-500/20 border-purple-500/40',
  },
  reminder: {
    icon: Bell,
    label: 'Reminder',
    color: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/40',
  },
  reminder_create: {
    icon: Bell,
    label: 'Create Reminder',
    color: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/40',
  },
  task: {
    icon: CheckSquare,
    label: 'Task',
    color: 'text-cyan-400 bg-cyan-500/20 border-cyan-500/40',
  },
  task_create: {
    icon: CheckSquare,
    label: 'Create Task',
    color: 'text-cyan-400 bg-cyan-500/20 border-cyan-500/40',
  },
  health: {
    icon: Heart,
    label: 'Health',
    color: 'text-red-400 bg-red-500/20 border-red-500/40',
  },
  health_suggestion: {
    icon: Heart,
    label: 'Health Suggestion',
    color: 'text-red-400 bg-red-500/20 border-red-500/40',
  },
  trip: {
    icon: Plane,
    label: 'Trip',
    color: 'text-indigo-400 bg-indigo-500/20 border-indigo-500/40',
  },
  trip_plan: {
    icon: Plane,
    label: 'Trip Plan',
    color: 'text-indigo-400 bg-indigo-500/20 border-indigo-500/40',
  },
  notion_update: {
    icon: FileText,
    label: 'Notion Update',
    color: 'text-gray-400 bg-gray-500/20 border-gray-500/40',
  },
  notification: {
    icon: AlertCircle,
    label: 'Notification',
    color: 'text-orange-400 bg-orange-500/20 border-orange-500/40',
  },
};

export function TypeBadge({ type, className = '' }: TypeBadgeProps) {
  const config = TYPE_CONFIG[type] || {
    icon: AlertCircle,
    label: type,
    color: 'text-gray-400 bg-gray-500/20 border-gray-500/40',
  };
  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${config.color} ${className}`}>
      <Icon className="w-3.5 h-3.5" />
      <span className="text-xs font-medium">{config.label}</span>
    </div>
  );
}
