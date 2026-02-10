'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface LinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: LinkFormData) => Promise<void>;
  link?: {
    id: number;
    title: string;
    url: string;
    category: string;
    tags: string[];
  } | null;
}

export interface LinkFormData {
  title: string;
  url: string;
  category: 'Notion' | 'Google' | 'External' | 'Tool';
  tags: string[];
}

export function LinkModal({ isOpen, onClose, onSave, link }: LinkModalProps) {
  const [formData, setFormData] = useState<LinkFormData>({
    title: '',
    url: '',
    category: 'External',
    tags: [],
  });
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (link) {
      setFormData({
        title: link.title,
        url: link.url,
        category: link.category as LinkFormData['category'],
        tags: link.tags || [],
      });
    } else {
      setFormData({
        title: '',
        url: '',
        category: 'External',
        tags: [],
      });
    }
    setErrors({});
  }, [link, isOpen]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.url.trim()) {
      newErrors.url = 'URL is required';
    } else {
      try {
        new URL(formData.url);
        if (!formData.url.startsWith('http://') && !formData.url.startsWith('https://')) {
          newErrors.url = 'URL must start with http:// or https://';
        }
      } catch {
        newErrors.url = 'Invalid URL format';
      }
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Failed to save link:', error);
      setErrors({ submit: 'Failed to save link. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData({ ...formData, tags: [...formData.tags, tag] });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove),
    });
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative bg-mc-bg-secondary border border-mc-border rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-mc-bg-secondary border-b border-mc-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-mc-text">
            {link ? 'Edit Link' : 'Add New Link'}
          </h2>
          <button
            onClick={onClose}
            className="text-mc-text-secondary hover:text-mc-text transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-mc-text mb-1">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 bg-mc-bg border border-mc-border rounded text-mc-text placeholder-mc-text-secondary focus:outline-none focus:ring-2 focus:ring-mc-accent-purple"
              placeholder="Enter link title"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-400">{errors.title}</p>
            )}
          </div>

          {/* URL */}
          <div>
            <label className="block text-sm font-medium text-mc-text mb-1">
              URL <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="w-full px-3 py-2 bg-mc-bg border border-mc-border rounded text-mc-text placeholder-mc-text-secondary focus:outline-none focus:ring-2 focus:ring-mc-accent-purple font-mono text-sm"
              placeholder="https://example.com"
            />
            {errors.url && (
              <p className="mt-1 text-sm text-red-400">{errors.url}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-mc-text mb-1">
              Category <span className="text-red-400">*</span>
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as LinkFormData['category'] })}
              className="w-full px-3 py-2 bg-mc-bg border border-mc-border rounded text-mc-text focus:outline-none focus:ring-2 focus:ring-mc-accent-purple"
            >
              <option value="Notion">Notion</option>
              <option value="Google">Google</option>
              <option value="External">External</option>
              <option value="Tool">Tool</option>
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-400">{errors.category}</p>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-mc-text mb-1">
              Tags
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInputKeyDown}
                className="flex-1 px-3 py-2 bg-mc-bg border border-mc-border rounded text-mc-text placeholder-mc-text-secondary focus:outline-none focus:ring-2 focus:ring-mc-accent-purple"
                placeholder="Add tag (press Enter)"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 bg-mc-accent-purple/20 text-mc-accent-purple border border-mc-accent-purple/30 rounded hover:bg-mc-accent-purple/30 transition-colors"
              >
                Add
              </button>
            </div>
            {formData.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded text-sm bg-mc-bg-tertiary text-mc-text border border-mc-border"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-mc-text-secondary hover:text-mc-text"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <p className="text-sm text-red-400">{errors.submit}</p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-mc-bg text-mc-text border border-mc-border rounded hover:bg-mc-bg-tertiary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-mc-accent-purple to-mc-accent-cyan text-white rounded hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : link ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
