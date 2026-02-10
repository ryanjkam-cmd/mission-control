import LearningDashboard from '@/components/queue/LearningDashboard';

export const metadata = {
  title: 'Learning Dashboard | Mission Control',
  description: 'Track how the system improves over time',
};

export default function LearningDashboardPage() {
  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Learning Dashboard</h1>
          <p className="text-gray-400">Track how the system improves over time</p>
        </div>

        <LearningDashboard />
      </div>
    </div>
  );
}
