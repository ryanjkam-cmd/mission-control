'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RuleBuilderModal } from './RuleBuilderModal';
import type { AutoApproveRule } from '@/lib/types/queue';

export function AutoApproveRules() {
  const [rules, setRules] = useState<AutoApproveRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<AutoApproveRule | null>(null);

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      const response = await fetch('/api/queue/rules');
      const data = await response.json();
      setRules(data.rules || []);
    } catch (error) {
      console.error('Failed to fetch rules:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleRule = async (id: number, enabled: boolean) => {
    try {
      await fetch(`/api/queue/rules/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled }),
      });
      await fetchRules();
    } catch (error) {
      console.error('Failed to toggle rule:', error);
    }
  };

  const deleteRule = async (id: number) => {
    if (!confirm('Delete this rule?')) return;

    try {
      await fetch(`/api/queue/rules/${id}`, {
        method: 'DELETE',
      });
      await fetchRules();
    } catch (error) {
      console.error('Failed to delete rule:', error);
    }
  };

  const describeConditions = (conditions: any[]): string => {
    if (!conditions || conditions.length === 0) return 'No conditions';

    return conditions
      .map((c) => {
        const field = c.field.replace(/_/g, ' ');
        const op = c.op === 'equals' ? '=' : c.op === 'contains' ? 'contains' : c.op;
        return `${field} ${op} "${c.value}"`;
      })
      .join(' AND ');
  };

  if (loading) {
    return <div className="text-mc-text-secondary">Loading rules...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-mc-text">Auto-Approve Rules</h2>
          <p className="text-sm text-mc-text-secondary mt-1">
            Rules with success rate ≥ 80% will auto-approve matching actions
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>Create New Rule</Button>
      </div>

      {rules.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-mc-text-secondary">No rules yet. Create one to get started.</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {rules.map((rule) => (
            <Card key={rule.id} variant="elevated" className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-mc-text">
                      {rule.action_type.replace(/_/g, ' ').toUpperCase()}
                    </h3>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        rule.enabled
                          ? 'bg-mc-accent-green/20 text-mc-accent-green'
                          : 'bg-mc-text-secondary/20 text-mc-text-secondary'
                      }`}
                    >
                      {rule.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>

                  <p className="text-sm text-mc-text-secondary">
                    {describeConditions(JSON.parse(rule.conditions))}
                  </p>

                  <div className="flex items-center gap-6 text-sm">
                    <div>
                      <span className="text-mc-text-secondary">Triggered:</span>{' '}
                      <span className="text-mc-text font-medium">{rule.times_triggered || 0}</span>
                    </div>
                    {rule.success_rate !== null && rule.success_rate !== undefined && (
                      <div>
                        <span className="text-mc-text-secondary">Success Rate:</span>{' '}
                        <span
                          className={`font-medium ${
                            rule.success_rate >= 0.8
                              ? 'text-mc-accent-green'
                              : rule.success_rate >= 0.6
                              ? 'text-mc-accent-yellow'
                              : 'text-mc-accent-red'
                          }`}
                        >
                          {(rule.success_rate * 100).toFixed(0)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleRule(rule.id, !rule.enabled)}
                    className="text-sm px-3 py-1.5 rounded border border-mc-border text-mc-text hover:bg-mc-bg-tertiary transition-colors"
                  >
                    {rule.enabled ? 'Disable' : 'Enable'}
                  </button>
                  <button
                    onClick={() => deleteRule(rule.id)}
                    className="text-sm px-3 py-1.5 rounded border border-mc-accent-red/50 text-mc-accent-red hover:bg-mc-accent-red/10 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {isModalOpen && (
        <RuleBuilderModal
          onClose={() => {
            setIsModalOpen(false);
            setEditingRule(null);
          }}
          onSave={async () => {
            await fetchRules();
            setIsModalOpen(false);
            setEditingRule(null);
          }}
          existingRule={editingRule}
        />
      )}
    </div>
  );
}
