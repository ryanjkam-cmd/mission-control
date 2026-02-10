'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import SpendDashboard from '@/components/costs/SpendDashboard';
import TrendChart from '@/components/costs/TrendChart';
import ModelBreakdown from '@/components/costs/ModelBreakdown';
import DomainBreakdown from '@/components/costs/DomainBreakdown';
import BudgetForecast from '@/components/costs/BudgetForecast';

/**
 * Cost Tracking Page
 *
 * Layout:
 * - 3 spend cards at top (Today, Week, Month)
 * - Trend chart in middle (full width)
 * - Model/Domain breakdowns below (2-col)
 * - Budget forecast in sidebar (right 30% on desktop)
 */

export default function CostTrackingPage() {
  return (
    <div className="min-h-screen bg-mc-bg">
      {/* Header */}
      <header className="border-b border-mc-border bg-mc-bg-secondary sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-mc-text-secondary hover:text-mc-text transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-3">
              <span className="text-2xl">💰</span>
              <div>
                <h1 className="text-xl font-bold">Cost Tracking</h1>
                <p className="text-sm text-mc-text-secondary">
                  Home &gt; Cost Tracking
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (2/3 width on desktop) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Spend Cards */}
            <SpendDashboard />

            {/* Trend Chart */}
            <TrendChart />

            {/* Breakdowns (2-col on tablet+) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ModelBreakdown />
              <DomainBreakdown />
            </div>
          </div>

          {/* Right Sidebar (1/3 width on desktop) */}
          <div className="lg:col-span-1">
            <BudgetForecast />
          </div>
        </div>

        {/* Info Footer */}
        <div className="mt-8 p-4 rounded-lg border border-mc-border bg-mc-bg-secondary/50">
          <p className="text-sm text-mc-text-secondary">
            <strong>Data Source:</strong> ~/.arkeus/brain_body_actions.jsonl
          </p>
          <p className="text-xs text-mc-text-secondary mt-2">
            Cost calculations based on Anthropic pricing (Feb 2026): Haiku $0.80/$4.00, Sonnet $3.00/$15.00, Opus $15.00/$75.00 per 1M tokens (input/output).
            Sample data generated if action log doesn&apos;t contain cost fields yet.
          </p>
        </div>
      </main>
    </div>
  );
}
