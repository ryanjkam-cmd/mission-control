export default function DashboardPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-mc-text">Dashboard</h1>
        <p className="text-mc-text-secondary mt-1">
          Home &gt; Dashboard
        </p>
      </div>
      <div className="grid gap-6">
        {/* Overview Section */}
        <div className="rounded-lg border border-mc-border bg-mc-bg-secondary p-6">
          <h2 className="text-xl font-semibold text-mc-text mb-4">Overview</h2>
          <p className="text-mc-text-secondary">
            Coming soon: System overview, real-time status, and key metrics.
          </p>
        </div>

        {/* Live Status Section */}
        <div className="rounded-lg border border-mc-border bg-mc-bg-secondary p-6">
          <h2 className="text-xl font-semibold text-mc-text mb-4">Live Status</h2>
          <p className="text-mc-text-secondary">
            Coming soon: Gateway health, daemon status, and active agents.
          </p>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-lg border border-mc-border bg-mc-bg-secondary p-4">
            <p className="text-mc-text-secondary text-sm mb-2">Active Tasks</p>
            <div className="h-12 flex items-center justify-center">
              <span className="text-mc-text-secondary text-sm">—</span>
            </div>
          </div>
          <div className="rounded-lg border border-mc-border bg-mc-bg-secondary p-4">
            <p className="text-mc-text-secondary text-sm mb-2">API Cost (Today)</p>
            <div className="h-12 flex items-center justify-center">
              <span className="text-mc-text-secondary text-sm">—</span>
            </div>
          </div>
          <div className="rounded-lg border border-mc-border bg-mc-bg-secondary p-4">
            <p className="text-mc-text-secondary text-sm mb-2">Content Published</p>
            <div className="h-12 flex items-center justify-center">
              <span className="text-mc-text-secondary text-sm">—</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
