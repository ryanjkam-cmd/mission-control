'use client';

/**
 * Social Feed - Real-time feed of social events with filtering
 */

import { useState, useEffect } from 'react';
import { Filter } from 'lucide-react';
import { SocialEventCard } from './SocialEventCard';
import { SocialEvent, SocialPlatform, SocialAction, generateSocialEvents, generateSocialEvent } from '@/lib/mock-social-data';

interface SocialFeedProps {
  onNewEvent?: (event: SocialEvent) => void;
}

export function SocialFeed({ onNewEvent }: SocialFeedProps) {
  const [events, setEvents] = useState<SocialEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<SocialEvent[]>([]);
  const [platformFilter, setPlatformFilter] = useState<SocialPlatform | 'all'>('all');
  const [actionFilter, setActionFilter] = useState<SocialAction | 'all'>('all');
  const [newEventCount, setNewEventCount] = useState(0);

  // Load initial events
  useEffect(() => {
    const initialEvents = generateSocialEvents(30);
    setEvents(initialEvents);
    setFilteredEvents(initialEvents);
  }, []);

  // Simulate new events every 5-10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const newEvent = generateSocialEvent();
      setEvents(prev => [newEvent, ...prev]);
      setNewEventCount(prev => prev + 1);

      if (onNewEvent) {
        onNewEvent(newEvent);
      }

      // Auto-clear badge after 3 seconds
      setTimeout(() => {
        setNewEventCount(prev => Math.max(0, prev - 1));
      }, 3000);
    }, Math.random() * 5000 + 5000); // 5-10 seconds

    return () => clearInterval(interval);
  }, [onNewEvent]);

  // Apply filters
  useEffect(() => {
    let filtered = events;

    if (platformFilter !== 'all') {
      filtered = filtered.filter(e => e.platform === platformFilter);
    }

    if (actionFilter !== 'all') {
      filtered = filtered.filter(e => e.action === actionFilter);
    }

    setFilteredEvents(filtered);
  }, [events, platformFilter, actionFilter]);

  return (
    <div className="flex flex-col h-full">
      {/* Header with filters */}
      <div className="flex items-center justify-between mb-4 gap-4">
        <div>
          <h2 className="text-xl font-semibold text-mc-text flex items-center gap-2">
            Real-time Feed
            {newEventCount > 0 && (
              <span className="px-2 py-0.5 bg-brand-purple text-white text-xs rounded-full animate-pulse">
                {newEventCount} new
              </span>
            )}
          </h2>
          <p className="text-mc-text-secondary text-sm mt-1">
            Live stream of social interactions across all platforms
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-mc-text-secondary" />

          {/* Platform filter */}
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value as SocialPlatform | 'all')}
            className="px-3 py-1.5 bg-mc-bg-tertiary border border-mc-border text-mc-text text-sm rounded focus:outline-none focus:ring-2 focus:ring-brand-purple"
          >
            <option value="all">All Platforms</option>
            <option value="linkedin">LinkedIn</option>
            <option value="x">X</option>
            <option value="substack">Substack</option>
            <option value="instagram">Instagram</option>
          </select>

          {/* Action filter */}
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value as SocialAction | 'all')}
            className="px-3 py-1.5 bg-mc-bg-tertiary border border-mc-border text-mc-text text-sm rounded focus:outline-none focus:ring-2 focus:ring-brand-purple"
          >
            <option value="all">All Actions</option>
            <option value="like">Likes</option>
            <option value="comment">Comments</option>
            <option value="share">Shares</option>
            <option value="mention">Mentions</option>
            <option value="reply">Replies</option>
          </select>
        </div>
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
        {filteredEvents.length > 0 ? (
          filteredEvents.map(event => (
            <div
              key={event.id}
              className="animate-slide-in-from-top"
            >
              <SocialEventCard event={event} />
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-64 text-mc-text-secondary">
            No events match the selected filters
          </div>
        )}
      </div>

      {/* Footer stats */}
      <div className="mt-4 pt-4 border-t border-mc-border flex items-center justify-between text-sm text-mc-text-secondary">
        <span>{filteredEvents.length} events</span>
        {(platformFilter !== 'all' || actionFilter !== 'all') && (
          <button
            onClick={() => {
              setPlatformFilter('all');
              setActionFilter('all');
            }}
            className="text-brand-purple hover:text-brand-cyan transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
