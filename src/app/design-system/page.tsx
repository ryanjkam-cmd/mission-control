'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { StatusBadge, PlatformBadge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export default function DesignSystemPage() {
  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text-brand">Design System</h1>
          <p className="text-mc-text-secondary mt-2">
            Arkeus Marketing Agency - Mission Control
          </p>
        </div>
        <ThemeToggle />
      </div>

      {/* Colors */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-mc-text">Brand Colors</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <div className="w-full h-24 rounded-lg bg-brand-purple" />
            <p className="text-sm text-mc-text-secondary">Purple #a855f7</p>
          </div>
          <div className="space-y-2">
            <div className="w-full h-24 rounded-lg bg-brand-cyan" />
            <p className="text-sm text-mc-text-secondary">Cyan #22d3ee</p>
          </div>
          <div className="space-y-2">
            <div className="w-full h-24 rounded-lg gradient-brand" />
            <p className="text-sm text-mc-text-secondary">Gradient</p>
          </div>
          <div className="space-y-2">
            <div className="w-full h-24 rounded-lg bg-mc-accent" />
            <p className="text-sm text-mc-text-secondary">Accent #58a6ff</p>
          </div>
        </div>
      </section>

      {/* Buttons */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-mc-text">Buttons</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="primary">Primary Button</Button>
          <Button variant="ghost">Ghost Button</Button>
          <Button variant="outline">Outline Button</Button>
        </div>
      </section>

      {/* Cards */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-mc-text">Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card variant="default">
            <h3 className="font-semibold mb-2">Default Card</h3>
            <p className="text-sm text-mc-text-secondary">
              Standard background with border
            </p>
          </Card>
          <Card variant="glass">
            <h3 className="font-semibold mb-2">Glass Card</h3>
            <p className="text-sm text-mc-text-secondary">
              Glassmorphism effect with blur
            </p>
          </Card>
          <Card variant="elevated">
            <h3 className="font-semibold mb-2">Elevated Card</h3>
            <p className="text-sm text-mc-text-secondary">
              Hover effect with brand border
            </p>
          </Card>
          <Card variant="active">
            <h3 className="font-semibold mb-2">Active Card</h3>
            <p className="text-sm text-mc-text-secondary">
              Brand gradient border
            </p>
          </Card>
        </div>
      </section>

      {/* Status Badges */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-mc-text">Status Badges</h2>
        <div className="flex flex-wrap gap-3">
          <StatusBadge status="draft">Draft</StatusBadge>
          <StatusBadge status="scheduled">Scheduled</StatusBadge>
          <StatusBadge status="published">Published</StatusBadge>
          <StatusBadge status="failed">Failed</StatusBadge>
        </div>
      </section>

      {/* Platform Badges */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-mc-text">Platform Badges</h2>
        <div className="flex flex-wrap gap-3">
          <PlatformBadge platform="linkedin">LinkedIn</PlatformBadge>
          <PlatformBadge platform="x">X</PlatformBadge>
          <PlatformBadge platform="substack">Substack</PlatformBadge>
          <PlatformBadge platform="instagram">Instagram</PlatformBadge>
        </div>
      </section>

      {/* Glassmorphism Examples */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-mc-text">Glassmorphism</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative h-48 rounded-lg overflow-hidden">
            <div className="absolute inset-0 gradient-brand opacity-50" />
            <div className="absolute inset-4 glass rounded-lg flex items-center justify-center">
              <p className="font-semibold">Light Glass Effect</p>
            </div>
          </div>
          <div className="relative h-48 rounded-lg overflow-hidden">
            <div className="absolute inset-0 bg-mc-accent opacity-30" />
            <div className="absolute inset-4 glass-dark rounded-lg flex items-center justify-center">
              <p className="font-semibold">Dark Glass Effect</p>
            </div>
          </div>
        </div>
      </section>

      {/* Typography */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-mc-text">Typography</h2>
        <div className="space-y-3">
          <h1 className="text-4xl font-bold">Heading 1 (4xl)</h1>
          <h2 className="text-3xl font-semibold">Heading 2 (3xl)</h2>
          <h3 className="text-2xl font-semibold">Heading 3 (2xl)</h3>
          <h4 className="text-xl font-medium">Heading 4 (xl)</h4>
          <p className="text-base">Body text (base) - Regular paragraph text</p>
          <p className="text-sm text-mc-text-secondary">
            Small text (sm) - Secondary information
          </p>
          <p className="text-xs text-mc-text-secondary">
            Extra small text (xs) - Captions and metadata
          </p>
          <p className="font-mono text-sm bg-mc-bg-tertiary px-2 py-1 rounded">
            Monospace font for code
          </p>
          <p className="text-2xl font-bold gradient-text-brand">
            Gradient Text Effect
          </p>
        </div>
      </section>

      {/* Glow Effects */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-mc-text">Glow Effects</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-32 rounded-lg bg-mc-bg-secondary border border-mc-border flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-brand-purple glow-brand-purple" />
          </div>
          <div className="h-32 rounded-lg bg-mc-bg-secondary border border-mc-border flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-brand-cyan glow-brand-cyan" />
          </div>
          <div className="h-32 rounded-lg bg-mc-bg-secondary border border-mc-border flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-mc-accent-green online-glow" />
          </div>
        </div>
      </section>

      {/* Transitions */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-mc-text">Transitions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card variant="default" className="hover:scale-105 transition-transform duration-nav cursor-pointer">
            <h3 className="font-semibold mb-2">Nav Transition</h3>
            <p className="text-sm text-mc-text-secondary">150ms ease-out</p>
          </Card>
          <Card variant="default" className="hover:scale-105 transition-transform duration-card cursor-pointer">
            <h3 className="font-semibold mb-2">Card Transition</h3>
            <p className="text-sm text-mc-text-secondary">200ms ease-out</p>
          </Card>
          <Card variant="default" className="hover:scale-105 transition-transform duration-smooth cursor-pointer">
            <h3 className="font-semibold mb-2">Smooth Transition</h3>
            <p className="text-sm text-mc-text-secondary">300ms cubic-bezier</p>
          </Card>
        </div>
      </section>
    </div>
  );
}
