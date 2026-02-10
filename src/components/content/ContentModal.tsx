/**
 * ContentModal Component
 * Form for creating and editing content items
 */

import { useState, useEffect } from 'react';
import { X, Calendar, Clock } from 'lucide-react';
import { ContentItem, ContentPlatform, ContentStatus } from '@/types';
import { useContentStore } from '@/stores/contentStore';
import { PlatformBadges } from './PlatformBadge';
import { format } from 'date-fns';

interface ContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  editItem?: ContentItem | null;
}

const PLATFORMS: { value: ContentPlatform; label: string }[] = [
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'x', label: 'X (Twitter)' },
  { value: 'substack', label: 'Substack' },
  { value: 'instagram', label: 'Instagram' },
];

export default function ContentModal({ isOpen, onClose, editItem }: ContentModalProps) {
  const { addItem, updateItem } = useContentStore();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [platforms, setPlatforms] = useState<ContentPlatform[]>([]);
  const [status, setStatus] = useState<ContentStatus>('draft');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Populate form when editing
  useEffect(() => {
    if (editItem) {
      setTitle(editItem.title);
      setBody(editItem.body);
      setPlatforms(editItem.platform);
      setStatus(editItem.status);
      if (editItem.scheduledDate) {
        const date = new Date(editItem.scheduledDate);
        setScheduleDate(format(date, 'yyyy-MM-dd'));
        setScheduleTime(format(date, 'HH:mm'));
      }
    } else {
      resetForm();
    }
  }, [editItem, isOpen]);

  const resetForm = () => {
    setTitle('');
    setBody('');
    setPlatforms([]);
    setStatus('draft');
    setScheduleDate('');
    setScheduleTime('');
    setErrors({});
  };

  const togglePlatform = (platform: ContentPlatform) => {
    setPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!body.trim()) {
      newErrors.body = 'Body is required';
    }

    if (platforms.length === 0) {
      newErrors.platforms = 'Select at least one platform';
    }

    if (status === 'scheduled') {
      if (!scheduleDate) {
        newErrors.scheduleDate = 'Schedule date is required';
      } else if (!scheduleTime) {
        newErrors.scheduleTime = 'Schedule time is required';
      } else {
        const scheduledDateTime = new Date(`${scheduleDate}T${scheduleTime}`);
        if (scheduledDateTime <= new Date()) {
          newErrors.scheduleDate = 'Schedule date must be in the future';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const scheduledDate = scheduleDate && scheduleTime
      ? new Date(`${scheduleDate}T${scheduleTime}`)
      : null;

    const contentData = {
      title: title.trim(),
      body: body.trim(),
      platform: platforms,
      status,
      scheduledDate,
    };

    if (editItem) {
      updateItem(editItem.id, contentData);
    } else {
      addItem(contentData);
    }

    onClose();
    resetForm();
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-mc-bg-secondary border border-mc-border rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-mc-border sticky top-0 bg-mc-bg-secondary z-10">
          <h2 className="text-xl font-semibold text-mc-text">
            {editItem ? 'Edit Content' : 'New Content'}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-mc-bg-tertiary transition-colors"
          >
            <X size={20} className="text-mc-text-secondary" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-mc-text mb-2">
              Title <span className="text-mc-accent-red">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 bg-mc-bg-tertiary border border-mc-border rounded-lg text-mc-text focus:outline-none focus:ring-2 focus:ring-brand-purple/50 focus:border-brand-purple transition-all"
              placeholder="AI sycophancy patterns in RLHF training"
            />
            {errors.title && (
              <p className="text-mc-accent-red text-xs mt-1">{errors.title}</p>
            )}
          </div>

          {/* Body */}
          <div>
            <label className="block text-sm font-medium text-mc-text mb-2">
              Body <span className="text-mc-accent-red">*</span>
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={8}
              className="w-full px-4 py-2 bg-mc-bg-tertiary border border-mc-border rounded-lg text-mc-text focus:outline-none focus:ring-2 focus:ring-brand-purple/50 focus:border-brand-purple transition-all resize-none font-mono text-sm"
              placeholder="Write your content here..."
            />
            {errors.body && (
              <p className="text-mc-accent-red text-xs mt-1">{errors.body}</p>
            )}
            <p className="text-mc-text-secondary text-xs mt-1">
              {body.length} characters
            </p>
          </div>

          {/* Platforms */}
          <div>
            <label className="block text-sm font-medium text-mc-text mb-2">
              Platforms <span className="text-mc-accent-red">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {PLATFORMS.map(({ value, label }) => (
                <label
                  key={value}
                  className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                    platforms.includes(value)
                      ? 'border-brand-purple bg-brand-purple/10'
                      : 'border-mc-border bg-mc-bg-tertiary hover:border-mc-accent/50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={platforms.includes(value)}
                    onChange={() => togglePlatform(value)}
                    className="w-4 h-4 rounded border-mc-border bg-mc-bg-tertiary text-brand-purple focus:ring-2 focus:ring-brand-purple/50"
                  />
                  <span className="text-sm text-mc-text">{label}</span>
                </label>
              ))}
            </div>
            {errors.platforms && (
              <p className="text-mc-accent-red text-xs mt-1">{errors.platforms}</p>
            )}
            {platforms.length > 0 && (
              <div className="mt-3">
                <PlatformBadges platforms={platforms} variant="icon-only" size="md" />
              </div>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-mc-text mb-2">
              Status
            </label>
            <div className="flex gap-3">
              <label className={`flex-1 flex items-center justify-center gap-2 p-3 border rounded-lg cursor-pointer transition-all ${
                status === 'draft'
                  ? 'border-mc-accent bg-mc-accent/10'
                  : 'border-mc-border bg-mc-bg-tertiary hover:border-mc-accent/50'
              }`}>
                <input
                  type="radio"
                  name="status"
                  value="draft"
                  checked={status === 'draft'}
                  onChange={(e) => setStatus(e.target.value as ContentStatus)}
                  className="w-4 h-4"
                />
                <span className="text-sm text-mc-text">Draft</span>
              </label>
              <label className={`flex-1 flex items-center justify-center gap-2 p-3 border rounded-lg cursor-pointer transition-all ${
                status === 'scheduled'
                  ? 'border-mc-accent-yellow bg-mc-accent-yellow/10'
                  : 'border-mc-border bg-mc-bg-tertiary hover:border-mc-accent/50'
              }`}>
                <input
                  type="radio"
                  name="status"
                  value="scheduled"
                  checked={status === 'scheduled'}
                  onChange={(e) => setStatus(e.target.value as ContentStatus)}
                  className="w-4 h-4"
                />
                <span className="text-sm text-mc-text">Scheduled</span>
              </label>
            </div>
          </div>

          {/* Schedule Date/Time (only if status is scheduled) */}
          {status === 'scheduled' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-mc-text mb-2">
                  <Calendar size={14} className="inline mr-1" />
                  Schedule Date <span className="text-mc-accent-red">*</span>
                </label>
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  min={format(new Date(), 'yyyy-MM-dd')}
                  className="w-full px-4 py-2 bg-mc-bg-tertiary border border-mc-border rounded-lg text-mc-text focus:outline-none focus:ring-2 focus:ring-brand-purple/50 focus:border-brand-purple transition-all"
                />
                {errors.scheduleDate && (
                  <p className="text-mc-accent-red text-xs mt-1">{errors.scheduleDate}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-mc-text mb-2">
                  <Clock size={14} className="inline mr-1" />
                  Schedule Time <span className="text-mc-accent-red">*</span>
                </label>
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="w-full px-4 py-2 bg-mc-bg-tertiary border border-mc-border rounded-lg text-mc-text focus:outline-none focus:ring-2 focus:ring-brand-purple/50 focus:border-brand-purple transition-all"
                />
                {errors.scheduleTime && (
                  <p className="text-mc-accent-red text-xs mt-1">{errors.scheduleTime}</p>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-mc-border">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 border border-mc-border rounded-lg text-mc-text hover:bg-mc-bg-tertiary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-brand rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
            >
              {editItem ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
