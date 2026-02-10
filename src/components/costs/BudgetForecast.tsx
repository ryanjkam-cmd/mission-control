'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, TrendingUp, Calendar } from 'lucide-react';
import { useCostStore } from '@/stores/costStore';

interface Anomaly {
  date: string;
  cost: number;
  multiplier: number;
  reason?: string;
}

/**
 * BudgetForecast - Monthly budget tracking and forecasting
 *
 * Features:
 * - Budget input (persisted to localStorage)
 * - Month-end forecast calculation
 * - Status badges (green/yellow/red)
 * - Anomaly detection (2σ above mean)
 * - Burn rate display
 */

export default function BudgetForecast() {
  const {
    monthSpend,
    monthlyBudget,
    projectedSpend,
    daysRemaining,
    setBudget
  } = useCostStore();

  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [budgetInput, setBudgetInput] = useState(monthlyBudget.toString());

  useEffect(() => {
    // Load budget from localStorage
    const saved = localStorage.getItem('mission-control-budget');
    if (saved) {
      const budget = parseFloat(saved);
      if (!isNaN(budget) && budget > 0) {
        setBudget(budget);
        setBudgetInput(budget.toString());
      }
    }

    // Fetch anomalies
    const fetchAnomalies = async () => {
      try {
        const res = await fetch('/api/costs/anomalies?days=30');
        const data = await res.json();
        setAnomalies(data.anomalies || []);
        setLoading(false);
      } catch (err) {
        console.error('Failed to detect anomalies:', err);
        setLoading(false);
      }
    };

    fetchAnomalies();
  }, [setBudget]);

  const handleBudgetSave = () => {
    const budget = parseFloat(budgetInput);
    if (!isNaN(budget) && budget > 0) {
      setBudget(budget);
      localStorage.setItem('mission-control-budget', budget.toString());
      setIsEditing(false);
    }
  };

  // Calculate days elapsed
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysElapsed = now.getDate();

  // Calculate burn rate
  const burnRate = monthSpend / daysElapsed;

  // Calculate budget status
  const budgetUsed = (monthSpend / monthlyBudget) * 100;
  const projectedPercent = (projectedSpend / monthlyBudget) * 100;

  let statusColor = 'green';
  let statusText = 'On Track';

  if (projectedPercent > 100) {
    statusColor = 'red';
    statusText = 'Over Budget';
  } else if (projectedPercent > 80) {
    statusColor = 'yellow';
    statusText = 'At Risk';
  }

  return (
    <div className="space-y-6">
      {/* Budget Settings Card */}
      <div className="rounded-lg border border-mc-border bg-mc-bg-secondary p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Monthly Budget</h3>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
            >
              Edit
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-mc-text-secondary mb-2">
                Monthly Budget (USD)
              </label>
              <input
                type="number"
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
                className="w-full px-3 py-2 bg-mc-bg border border-mc-border rounded text-mc-text focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="50.00"
                min="0"
                step="0.01"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleBudgetSave}
                className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors text-sm"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setBudgetInput(monthlyBudget.toString());
                  setIsEditing(false);
                }}
                className="px-4 py-2 bg-mc-border text-mc-text-secondary rounded hover:bg-mc-border/80 transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="text-3xl font-bold">${monthlyBudget.toFixed(2)}</div>
        )}
      </div>

      {/* Forecast Card */}
      <div className="rounded-lg border border-mc-border bg-mc-bg-secondary p-6">
        <h3 className="text-lg font-semibold mb-4">Budget Forecast</h3>

        {/* Status badge */}
        <div className="mb-4">
          <span
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
              statusColor === 'green'
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : statusColor === 'yellow'
                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}
          >
            {statusColor === 'red' && <AlertCircle className="w-4 h-4" />}
            {statusText}
          </span>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-sm text-mc-text-secondary mb-1">Current Spend</div>
            <div className="text-xl font-bold">${monthSpend.toFixed(2)}</div>
            <div className="text-xs text-mc-text-secondary">
              {budgetUsed.toFixed(1)}% of budget
            </div>
          </div>

          <div>
            <div className="text-sm text-mc-text-secondary mb-1">Projected</div>
            <div className="text-xl font-bold">${projectedSpend.toFixed(2)}</div>
            <div className="text-xs text-mc-text-secondary">
              {projectedPercent.toFixed(1)}% of budget
            </div>
          </div>

          <div>
            <div className="text-sm text-mc-text-secondary mb-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Burn Rate
            </div>
            <div className="text-xl font-bold">${burnRate.toFixed(2)}/day</div>
          </div>

          <div>
            <div className="text-sm text-mc-text-secondary mb-1 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Days Remaining
            </div>
            <div className="text-xl font-bold">{daysRemaining}</div>
            <div className="text-xs text-mc-text-secondary">
              {daysElapsed} / {daysInMonth} days elapsed
            </div>
          </div>
        </div>

        {/* Overage warning */}
        {projectedPercent > 100 && (
          <div className="p-3 rounded bg-red-500/10 border border-red-500/20">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-400">Budget Overage Warning</p>
                <p className="text-xs text-red-400/80 mt-1">
                  Projected to exceed budget by ${(projectedSpend - monthlyBudget).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Anomaly Detection */}
      <div className="rounded-lg border border-mc-border bg-mc-bg-secondary p-6">
        <h3 className="text-lg font-semibold mb-4">Spending Anomalies</h3>

        {loading ? (
          <div className="text-sm text-mc-text-secondary">Detecting anomalies...</div>
        ) : anomalies.length === 0 ? (
          <div className="text-sm text-mc-text-secondary">
            No unusual spending patterns detected (2σ threshold)
          </div>
        ) : (
          <div className="space-y-3">
            {anomalies.slice(0, 5).map((anomaly, index) => {
              const date = new Date(anomaly.date);
              const displayDate = date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
              });

              return (
                <div
                  key={index}
                  className="p-3 rounded bg-yellow-500/10 border border-yellow-500/20"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm font-medium text-yellow-400">
                        {displayDate}: ${anomaly.cost.toFixed(2)}
                      </div>
                      <div className="text-xs text-yellow-400/70 mt-1">
                        {anomaly.multiplier.toFixed(1)}x average
                      </div>
                    </div>
                  </div>
                  {anomaly.reason && (
                    <div className="text-xs text-mc-text-secondary mt-2">
                      {anomaly.reason}
                    </div>
                  )}
                </div>
              );
            })}

            {anomalies.length > 5 && (
              <div className="text-xs text-mc-text-secondary text-center">
                +{anomalies.length - 5} more anomalies detected
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
