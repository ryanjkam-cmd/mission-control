'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { QuickLinksGrid } from '@/components/quick-links/QuickLinksGrid';

export default function QuickLinksPage() {
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
              <span className="text-2xl">🔗</span>
              <div>
                <h1 className="text-xl font-bold">Quick Links Manager</h1>
                <p className="text-sm text-mc-text-secondary">
                  Home &gt; Quick Links
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <QuickLinksGrid />
      </main>
    </div>
  );
}
