import { SocialFeed } from '@/components/social/SocialFeed';
import { EngagementDashboard } from '@/components/social/EngagementDashboard';
import { PlatformGrid } from '@/components/social/PlatformGrid';
import { SentimentCards } from '@/components/social/SentimentCards';
import { PlatformStatus } from '@/components/social/PlatformStatus';

export default function SocialMonitoringPage() {
  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-mc-text">Social Monitoring</h1>
        <p className="text-mc-text-secondary mt-1">
          Home &gt; Social Monitoring
        </p>
      </div>

      {/* Platform Status (Top) */}
      <div className="mb-6">
        <PlatformStatus />
      </div>

      {/* Main Layout: Feed (left 60%) + Engagement (right 40%) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
        {/* Left: Feed */}
        <div className="lg:col-span-3">
          <div className="rounded-lg border border-mc-border bg-mc-bg-secondary p-6 h-[600px]">
            <SocialFeed />
          </div>
        </div>

        {/* Right: Engagement Dashboard */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-lg border border-mc-border bg-mc-bg-secondary p-6">
            <EngagementDashboard />
          </div>

          {/* Platform Comparison Grid */}
          <div className="rounded-lg border border-mc-border bg-mc-bg-secondary p-6">
            <PlatformGrid />
          </div>
        </div>
      </div>

      {/* Sentiment Analysis (Full Width) */}
      <div className="rounded-lg border border-mc-border bg-mc-bg-secondary p-6">
        <SentimentCards />
      </div>
    </div>
  );
}
