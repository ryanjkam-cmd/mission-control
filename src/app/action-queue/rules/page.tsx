'use client';

import { AutoApproveRules } from '@/components/queue/AutoApproveRules';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AutoApproveRulesPage() {
  return (
    <div className="min-h-screen bg-mc-bg">
      {/* Header */}
      <header className="border-b border-mc-border bg-mc-bg-secondary">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/action-queue"
              className="flex items-center gap-2 text-mc-text-secondary hover:text-mc-text transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Queue
            </Link>
          </div>
          <div className="mt-2">
            <h1 className="text-2xl font-bold mb-1">Auto-Approve Rules</h1>
            <p className="text-mc-text-secondary text-sm">
              Configure rules to automatically approve matching actions
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <AutoApproveRules />
      </main>
    </div>
  );
}
