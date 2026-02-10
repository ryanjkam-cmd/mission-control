'use client';

/**
 * Sentiment Cards - 6 emotion tracking cards
 */

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { SentimentScores, analyzeBatchSentiment } from '@/lib/sentiment';

interface EmotionCardProps {
  emoji: string;
  label: string;
  percentage: number;
  count: number;
  trend: 'up' | 'down' | 'flat';
  gradient: string;
}

function EmotionCard({ emoji, label, percentage, count, trend, gradient }: EmotionCardProps) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-mc-accent-green' : trend === 'down' ? 'text-mc-accent-red' : 'text-mc-text-secondary';

  return (
    <div
      className="p-4 rounded-lg border border-mc-border relative overflow-hidden group hover:scale-105 transition-transform duration-card"
      style={{
        background: `linear-gradient(135deg, ${gradient}15 0%, ${gradient}05 100%)`,
      }}
    >
      {/* Background emoji (decorative) */}
      <div
        className="absolute -right-4 -bottom-4 text-6xl opacity-10 group-hover:opacity-20 transition-opacity"
      >
        {emoji}
      </div>

      {/* Content */}
      <div className="relative">
        {/* Emoji icon */}
        <div className="text-4xl mb-2">{emoji}</div>

        {/* Label */}
        <div className="text-mc-text font-medium mb-1">{label}</div>

        {/* Percentage */}
        <div className="text-2xl font-bold text-mc-text mb-1">
          {percentage.toFixed(1)}%
        </div>

        {/* Trend and count */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1">
            <TrendIcon className={`w-4 h-4 ${trendColor}`} />
            <span className={trendColor}>
              {trend === 'flat' ? '—' : trend}
            </span>
          </div>
          <span className="text-mc-text-secondary">
            {count} {count === 1 ? 'comment' : 'comments'}
          </span>
        </div>
      </div>
    </div>
  );
}

// Sample comments for sentiment analysis
const SAMPLE_COMMENTS = [
  'This is exactly what I needed to read today! Great insights.',
  'Interesting perspective. I agree with most points here.',
  'Not sure I fully agree with this approach, but worth considering.',
  'Wow, this is eye-opening! Thank you for sharing.',
  'I have some concerns about this strategy...',
  'Brilliant analysis! Sharing with my team.',
  'Could you elaborate on the third point?',
  'This reminds me of a similar situation we had last year.',
  'Love this! Bookmarking for later reference.',
  'Disappointing take. Expected more depth.',
  'Excellent breakdown of the problem space.',
  'I\'m worried this might backfire in practice.',
  'Amazing work! Looking forward to the next post.',
  'This is terrible advice for beginners.',
  'Helpful summary. Can you share more resources?',
];

export function SentimentCards() {
  const [sentiments, setSentiments] = useState<SentimentScores | null>(null);

  // Analyze sentiments from sample comments
  useEffect(() => {
    const scores = analyzeBatchSentiment(SAMPLE_COMMENTS);
    setSentiments(scores);

    // Update every 30 seconds with variation
    const interval = setInterval(() => {
      const scores = analyzeBatchSentiment(SAMPLE_COMMENTS);
      // Add slight random variation
      Object.keys(scores).forEach(key => {
        const k = key as keyof SentimentScores;
        scores[k] += (Math.random() - 0.5) * 5;
        scores[k] = Math.max(0, Math.min(100, scores[k]));
      });
      // Re-normalize to 100%
      const sum = Object.values(scores).reduce((a, b) => a + b, 0);
      Object.keys(scores).forEach(key => {
        const k = key as keyof SentimentScores;
        scores[k] = (scores[k] / sum) * 100;
      });
      setSentiments(scores);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  if (!sentiments) {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-40 bg-mc-bg-tertiary rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  // Calculate comment counts based on percentages
  const totalComments = SAMPLE_COMMENTS.length;
  const getCounts = (percentage: number) => Math.round((percentage / 100) * totalComments);

  // Random trends for demo
  const getRandomTrend = (): 'up' | 'down' | 'flat' => {
    const r = Math.random();
    if (r < 0.4) return 'up';
    if (r < 0.8) return 'down';
    return 'flat';
  };

  const emotions: Omit<EmotionCardProps, 'trend'>[] = [
    {
      emoji: '😊',
      label: 'Joy',
      percentage: sentiments.joy,
      count: getCounts(sentiments.joy),
      gradient: '#F7B731', // Yellow
    },
    {
      emoji: '🤝',
      label: 'Trust',
      percentage: sentiments.trust,
      count: getCounts(sentiments.trust),
      gradient: '#3498DB', // Blue
    },
    {
      emoji: '😰',
      label: 'Fear',
      percentage: sentiments.fear,
      count: getCounts(sentiments.fear),
      gradient: '#9B59B6', // Purple
    },
    {
      emoji: '😲',
      label: 'Surprise',
      percentage: sentiments.surprise,
      count: getCounts(sentiments.surprise),
      gradient: '#E67E22', // Orange
    },
    {
      emoji: '😢',
      label: 'Sadness',
      percentage: sentiments.sadness,
      count: getCounts(sentiments.sadness),
      gradient: '#95A5A6', // Gray
    },
    {
      emoji: '🤢',
      label: 'Disgust',
      percentage: sentiments.disgust,
      count: getCounts(sentiments.disgust),
      gradient: '#27AE60', // Green
    },
  ];

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-mc-text">Sentiment Analysis</h2>
        <p className="text-mc-text-secondary text-sm mt-1">
          Emotion tracking across comments and replies
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {emotions.map((emotion) => (
          <EmotionCard
            key={emotion.label}
            {...emotion}
            trend={getRandomTrend()}
          />
        ))}
      </div>
    </div>
  );
}
