'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ConditionBuilder } from './ConditionBuilder';
import type { ActionType, AutoApproveRule, RuleCondition } from '@/lib/types/queue';

interface RuleBuilderModalProps {
  onClose: () => void;
  onSave: () => void | Promise<void>;
  existingRule?: AutoApproveRule | null;
}

const ACTION_TYPES: ActionType[] = [
  'email_reply',
  'imessage',
  'calendar_block',
  'health_suggestion',
  'trip_plan',
  'task_create',
  'reminder_create',
  'notion_update',
];

const FIELD_OPTIONS: Record<ActionType, string[]> = {
  email_reply: ['recipient', 'subject', 'body_length', 'has_attachment', 'tone'],
  imessage: ['recipient', 'message_length', 'contains_keyword', 'time_of_day'],
  calendar_block: ['title', 'duration_minutes', 'time_of_day', 'day_of_week'],
  health_suggestion: ['suggestion_type', 'text_length', 'priority'],
  trip_plan: ['destination', 'duration_days', 'budget', 'has_flights'],
  task_create: ['title', 'priority', 'assigned_to'],
  reminder_create: ['title', 'priority', 'due_date'],
  notion_update: ['database', 'property', 'value'],
};

export function RuleBuilderModal({ onClose, onSave, existingRule }: RuleBuilderModalProps) {
  const [step, setStep] = useState(1);
  const [actionType, setActionType] = useState<ActionType | ''>(
    existingRule?.action_type || ''
  );
  const [conditions, setConditions] = useState<RuleCondition[]>(
    existingRule ? JSON.parse(existingRule.conditions) : []
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddCondition = () => {
    setConditions([...conditions, { field: '', op: 'equals', value: '' }]);
  };

  const handleUpdateCondition = (index: number, condition: RuleCondition) => {
    const updated = [...conditions];
    updated[index] = condition;
    setConditions(updated);
  };

  const handleRemoveCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const describeRule = (): string => {
    if (!actionType) return '';
    if (conditions.length === 0) return actionType.replace(/_/g, ' ');

    const conditionText = conditions
      .filter((c) => c.field && c.value)
      .map((c) => {
        const field = c.field.replace(/_/g, ' ');
        const op = c.op === 'equals' ? '=' : c.op === 'contains' ? 'contains' : c.op;
        return `${field} ${op} "${c.value}"`;
      })
      .join(' AND ');

    return `${actionType.replace(/_/g, ' ')} where ${conditionText}`;
  };

  const handleSave = async () => {
    if (!actionType) {
      setError('Please select an action type');
      return;
    }

    const validConditions = conditions.filter((c) => c.field && c.value);
    if (validConditions.length === 0) {
      setError('Please add at least one condition');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/queue/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action_type: actionType,
          conditions: validConditions,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create rule');
      }

      await onSave();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save rule');
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-mc-text">
              {existingRule ? 'Edit Rule' : 'Create Auto-Approve Rule'}
            </h2>
            <button
              onClick={onClose}
              className="text-mc-text-secondary hover:text-mc-text"
            >
              ✕
            </button>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`flex-1 h-1 rounded ${
                  s <= step ? 'bg-brand-purple' : 'bg-mc-border'
                }`}
              />
            ))}
          </div>

          {/* Step 1: Select action type */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-mc-text mb-2">Select Action Type</h3>
                <div className="grid grid-cols-2 gap-2">
                  {ACTION_TYPES.map((type) => (
                    <button
                      key={type}
                      onClick={() => setActionType(type)}
                      className={`p-3 rounded border text-left transition-all ${
                        actionType === type
                          ? 'border-brand-purple bg-brand-purple/10 text-mc-text'
                          : 'border-mc-border text-mc-text-secondary hover:border-mc-text-secondary'
                      }`}
                    >
                      {type.replace(/_/g, ' ').toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={() => setStep(2)}
                  disabled={!actionType}
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Add conditions */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-mc-text mb-2">Add Conditions</h3>
                <p className="text-sm text-mc-text-secondary mb-4">
                  All conditions must match (AND logic)
                </p>

                <div className="space-y-3">
                  {conditions.map((condition, index) => (
                    <ConditionBuilder
                      key={index}
                      condition={condition}
                      availableFields={FIELD_OPTIONS[actionType as ActionType] || []}
                      onChange={(updated) => handleUpdateCondition(index, updated)}
                      onRemove={() => handleRemoveCondition(index)}
                    />
                  ))}
                </div>

                <Button
                  onClick={handleAddCondition}
                  variant="outline"
                  className="mt-3"
                >
                  + Add Condition
                </Button>
              </div>

              <div className="flex justify-between">
                <Button onClick={() => setStep(1)} variant="outline">
                  Back
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={conditions.filter((c) => c.field && c.value).length === 0}
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Preview and save */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-mc-text mb-2">Rule Preview</h3>
                <Card variant="glass" className="p-4">
                  <p className="text-mc-text">{describeRule()}</p>
                </Card>
              </div>

              {error && (
                <div className="p-3 rounded bg-mc-accent-red/10 border border-mc-accent-red/50 text-mc-accent-red text-sm">
                  {error}
                </div>
              )}

              <div className="flex justify-between">
                <Button onClick={() => setStep(2)} variant="outline">
                  Back
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Rule'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
