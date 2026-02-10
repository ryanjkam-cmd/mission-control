'use client';

import type { RuleCondition } from '@/lib/types/queue';

interface ConditionBuilderProps {
  condition: RuleCondition;
  availableFields: string[];
  onChange: (condition: RuleCondition) => void;
  onRemove: () => void;
}

const OPERATORS = [
  { value: 'equals', label: '=' },
  { value: 'contains', label: 'contains' },
  { value: 'regex', label: 'matches regex' },
  { value: 'gt', label: '>' },
  { value: 'lt', label: '<' },
] as const;

export function ConditionBuilder({
  condition,
  availableFields,
  onChange,
  onRemove,
}: ConditionBuilderProps) {
  return (
    <div className="flex items-center gap-2 p-3 bg-mc-bg-tertiary rounded border border-mc-border">
      <select
        value={condition.field}
        onChange={(e) => onChange({ ...condition, field: e.target.value })}
        className="flex-1 px-3 py-2 bg-mc-bg-secondary border border-mc-border rounded text-mc-text text-sm focus:outline-none focus:border-brand-purple"
      >
        <option value="">Select field...</option>
        {availableFields.map((field) => (
          <option key={field} value={field}>
            {field.replace(/_/g, ' ')}
          </option>
        ))}
      </select>

      <select
        value={condition.op}
        onChange={(e) =>
          onChange({ ...condition, op: e.target.value as RuleCondition['op'] })
        }
        className="w-32 px-3 py-2 bg-mc-bg-secondary border border-mc-border rounded text-mc-text text-sm focus:outline-none focus:border-brand-purple"
      >
        {OPERATORS.map((op) => (
          <option key={op.value} value={op.value}>
            {op.label}
          </option>
        ))}
      </select>

      <input
        type="text"
        value={condition.value}
        onChange={(e) => onChange({ ...condition, value: e.target.value })}
        placeholder="Value..."
        className="flex-1 px-3 py-2 bg-mc-bg-secondary border border-mc-border rounded text-mc-text text-sm focus:outline-none focus:border-brand-purple"
      />

      <button
        onClick={onRemove}
        className="px-3 py-2 text-mc-accent-red hover:bg-mc-accent-red/10 rounded transition-colors"
        title="Remove condition"
      >
        ✕
      </button>
    </div>
  );
}
