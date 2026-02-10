'use client';

import { useState, useEffect } from 'react';
import { Brain, Network, Layers } from 'lucide-react';

type TabId = 'brain' | 'agents' | 'system';

interface Tab {
  id: TabId;
  label: string;
  icon: any;
}

const tabs: Tab[] = [
  { id: 'brain', label: 'Brain Diagram', icon: Brain },
  { id: 'agents', label: 'Agent Topology', icon: Network },
  { id: 'system', label: 'System Topology', icon: Layers },
];

interface ArchitectureTabsProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export default function ArchitectureTabs({ activeTab, onTabChange }: ArchitectureTabsProps) {
  return (
    <div className="flex gap-2 mb-6 border-b border-mc-border">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-3 rounded-t-lg transition-all
              ${
                isActive
                  ? 'bg-mc-bg-secondary text-mc-text border-b-2 border-mc-accent'
                  : 'text-mc-text-secondary hover:text-mc-text hover:bg-mc-bg-secondary/50'
              }
            `}
          >
            <Icon className="w-4 h-4" />
            <span className="font-medium">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
