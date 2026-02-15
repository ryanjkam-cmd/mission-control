'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import {
  LayoutDashboard,
  Activity,
  Edit3,
  Calendar,
  FileText,
  Video,
  MessageSquare,
  Layers,
  Radio,
  MessageCircle,
  TrendingUp,
  BarChart3,
  BarChart,
  Brain,
  Network,
  Boxes,
  Workflow,
  GraduationCap,
  DollarSign,
  PieChart,
  Target,
  AlertTriangle,
  Share2,
  Bookmark,
  StickyNote,
  Hammer,
  Wand2,
  Pencil,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';
import { useNavStore } from '@/stores/navStore';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavSection {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    items: [
      { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Live Status', href: '/dashboard/live', icon: Activity },
    ],
  },
  {
    title: 'Content Studio',
    icon: Edit3,
    items: [
      { label: 'Production Calendar', href: '/content-studio', icon: Calendar },
      { label: 'Blog Posts', href: '/content-studio/blog', icon: FileText },
      { label: 'Video Projects', href: '/content-studio/video', icon: Video },
      { label: 'Social Posts', href: '/content-studio/social', icon: MessageSquare },
      { label: 'Content Pipeline', href: '/content-studio/pipeline', icon: Layers },
    ],
  },
  {
    title: 'Social Monitoring',
    icon: Radio,
    items: [
      { label: 'Real-time Feed', href: '/social-monitoring', icon: Radio },
      { label: 'Engagement Dashboard', href: '/social-monitoring/engagement', icon: MessageCircle },
      { label: 'Sentiment Analysis', href: '/social-monitoring/sentiment', icon: TrendingUp },
      { label: 'Platform Status', href: '/social-monitoring/platforms', icon: BarChart3 },
    ],
  },
  {
    title: 'Arkeus Systems',
    icon: Brain,
    items: [
      { label: 'Brain Mission Control', href: '/arkeus-systems', icon: Brain },
      { label: 'Action Queue', href: '/action-queue', icon: Target },
      { label: 'Build Projects', href: '/projects', icon: Hammer },
      { label: 'Agent Topology', href: '/arkeus-systems/agents', icon: Network },
      { label: 'System Architecture', href: '/arkeus-systems/architecture', icon: Boxes },
      { label: 'Workflow Diagrams', href: '/arkeus-systems/workflows', icon: Workflow },
      { label: 'Learning Outcomes', href: '/arkeus-systems/learning', icon: GraduationCap },
    ],
  },
  {
    title: 'Cost Tracking',
    icon: DollarSign,
    items: [
      { label: 'API Spend Dashboard', href: '/cost-tracking', icon: DollarSign },
      { label: 'Budget Forecasting', href: '/cost-tracking/forecast', icon: PieChart },
      { label: 'Model Attribution', href: '/cost-tracking/attribution', icon: BarChart },
      { label: 'Anomaly Detection', href: '/cost-tracking/anomalies', icon: AlertTriangle },
    ],
  },
  {
    title: 'Knowledge Graph',
    icon: Share2,
    items: [
      { label: 'Neo4j Explorer', href: '/knowledge-graph', icon: Share2 },
    ],
  },
  {
    title: 'Quick Links',
    icon: Bookmark,
    items: [
      { label: 'Notion Dashboards', href: '/quick-links', icon: StickyNote },
    ],
  },
  {
    title: 'AI Tools',
    icon: Wand2,
    items: [
      { label: 'Content Creation Workflow', href: '/ai-tools', icon: Pencil },
    ],
  },
];

export default function SideNav() {
  const pathname = usePathname();
  const { collapsed, toggleCollapse } = useNavStore();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(NAV_SECTIONS.map((section) => section.title))
  );

  const toggleSection = (title: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(title)) {
        next.delete(title);
      } else {
        next.add(title);
      }
      return next;
    });
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile overlay */}
      {!collapsed && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={toggleCollapse}
        />
      )}

      {/* Sidebar */}
      <nav
        className={`
          fixed left-0 top-0 h-screen
          bg-gradient-to-b from-zinc-900/95 to-zinc-950/95
          backdrop-blur-xl border-r border-purple-500/20
          transition-all duration-300 ease-in-out z-50
          ${collapsed ? 'w-16' : 'w-72'}
          ${collapsed ? '-translate-x-full lg:translate-x-0' : 'translate-x-0'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-purple-500/20">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-white">Arkeus</span>
                <span className="text-xs text-zinc-400">Marketing Agency</span>
              </div>
            </div>
          )}
          <button
            onClick={toggleCollapse}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <Menu className="w-5 h-5 text-zinc-400" />
            ) : (
              <X className="w-5 h-5 text-zinc-400" />
            )}
          </button>
        </div>

        {/* Navigation sections */}
        <div className="flex-1 overflow-y-auto py-4 px-2 space-y-1 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
          {NAV_SECTIONS.map((section) => {
            const isExpanded = expandedSections.has(section.title);
            const SectionIcon = section.icon;
            const hasActiveItem = section.items.some((item) => isActive(item.href));

            return (
              <div key={section.title} className="space-y-1">
                {/* Section header */}
                <button
                  onClick={() => !collapsed && toggleSection(section.title)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2 rounded-lg
                    transition-all duration-150
                    ${hasActiveItem ? 'bg-purple-500/10 text-purple-400' : 'text-zinc-400 hover:bg-white/5'}
                    ${collapsed ? 'justify-center' : 'justify-between'}
                  `}
                  title={collapsed ? section.title : undefined}
                >
                  <div className="flex items-center gap-3">
                    <SectionIcon className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && (
                      <span className="text-xs font-medium uppercase tracking-wider">
                        {section.title}
                      </span>
                    )}
                  </div>
                  {!collapsed && (
                    <div className="flex-shrink-0">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </div>
                  )}
                </button>

                {/* Section items */}
                {!collapsed && isExpanded && (
                  <div className="space-y-0.5 pl-2">
                    {section.items.map((item) => {
                      const ItemIcon = item.icon;
                      const active = isActive(item.href);

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`
                            flex items-center gap-3 px-3 py-2 rounded-lg
                            transition-all duration-150 group relative
                            ${
                              active
                                ? 'bg-gradient-to-r from-purple-500/20 to-cyan-500/10 text-white'
                                : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                            }
                          `}
                        >
                          {/* Active indicator */}
                          {active && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-purple-500 to-cyan-500 rounded-r-full" />
                          )}

                          <ItemIcon className="w-4 h-4 flex-shrink-0" />
                          <span className="text-sm">{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}

                {/* Collapsed tooltips */}
                {collapsed && (
                  <div className="relative group">
                    <div className="absolute left-full top-0 ml-2 px-3 py-2 bg-zinc-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                      {section.title}
                      <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-zinc-800 rotate-45" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        {!collapsed && (
          <div className="border-t border-purple-500/20 p-4">
            <div className="text-xs text-zinc-500 text-center">
              Mission Control v1.0
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
