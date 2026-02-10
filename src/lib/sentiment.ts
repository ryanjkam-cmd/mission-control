/**
 * Sentiment Analysis - Mock implementation for social monitoring
 *
 * Uses keyword matching to classify emotions in comments/replies.
 * Returns percentages across 6 emotions that sum to 100%.
 */

export interface SentimentScores {
  joy: number;
  trust: number;
  fear: number;
  surprise: number;
  sadness: number;
  disgust: number;
}

// Keyword patterns for each emotion
const EMOTION_KEYWORDS = {
  joy: ['great', 'love', 'awesome', 'excellent', 'amazing', 'fantastic', 'wonderful', 'brilliant', 'happy', 'excited', 'perfect', 'beautiful', 'best'],
  trust: ['reliable', 'helpful', 'support', 'agree', 'trust', 'believe', 'confident', 'solid', 'dependable', 'honest', 'accurate'],
  fear: ['worried', 'concerned', 'afraid', 'scary', 'dangerous', 'risk', 'uncertain', 'anxious', 'nervous', 'doubt'],
  surprise: ['wow', 'amazing', 'unexpected', 'shocking', 'incredible', 'unbelievable', 'surprising', 'astonishing', 'whoa'],
  sadness: ['disappointed', 'sad', 'unfortunate', 'sorry', 'depressed', 'upset', 'unhappy', 'down', 'missed'],
  disgust: ['terrible', 'awful', 'worst', 'horrible', 'disgusting', 'hate', 'gross', 'nasty', 'bad'],
};

/**
 * Analyze sentiment of text and return emotion distribution
 */
export function analyzeSentiment(text: string): SentimentScores {
  const lowercaseText = text.toLowerCase();

  // Count matches for each emotion
  const counts: Record<keyof SentimentScores, number> = {
    joy: 0,
    trust: 0,
    fear: 0,
    surprise: 0,
    sadness: 0,
    disgust: 0,
  };

  // Count keyword matches
  for (const [emotion, keywords] of Object.entries(EMOTION_KEYWORDS)) {
    for (const keyword of keywords) {
      // Use word boundaries to avoid partial matches
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = lowercaseText.match(regex);
      if (matches) {
        counts[emotion as keyof SentimentScores] += matches.length;
      }
    }
  }

  // Calculate total
  const total = Object.values(counts).reduce((sum, count) => sum + count, 0);

  // If no matches, return neutral distribution
  if (total === 0) {
    return {
      joy: 20,
      trust: 20,
      fear: 15,
      surprise: 15,
      sadness: 15,
      disgust: 15,
    };
  }

  // Convert to percentages (round to 1 decimal, ensure sums to 100)
  const percentages = Object.entries(counts).reduce((acc, [emotion, count]) => {
    acc[emotion as keyof SentimentScores] = Math.round((count / total) * 100 * 10) / 10;
    return acc;
  }, {} as SentimentScores);

  // Adjust to ensure sum is exactly 100
  const sum = Object.values(percentages).reduce((a, b) => a + b, 0);
  if (sum !== 100) {
    const diff = 100 - sum;
    percentages.joy += diff;
  }

  return percentages;
}

/**
 * Get dominant emotion from sentiment scores
 */
export function getDominantEmotion(scores: SentimentScores): keyof SentimentScores {
  return Object.entries(scores).reduce((max, [emotion, score]) =>
    score > max.score ? { emotion: emotion as keyof SentimentScores, score } : max,
    { emotion: 'joy' as keyof SentimentScores, score: 0 }
  ).emotion;
}

/**
 * Mock sentiment analysis for array of comments
 */
export function analyzeBatchSentiment(comments: string[]): SentimentScores {
  if (comments.length === 0) {
    return {
      joy: 20,
      trust: 20,
      fear: 15,
      surprise: 15,
      sadness: 15,
      disgust: 15,
    };
  }

  // Aggregate sentiment across all comments
  const aggregated = comments.reduce((acc, comment) => {
    const scores = analyzeSentiment(comment);
    Object.entries(scores).forEach(([emotion, score]) => {
      acc[emotion as keyof SentimentScores] += score;
    });
    return acc;
  }, {
    joy: 0,
    trust: 0,
    fear: 0,
    surprise: 0,
    sadness: 0,
    disgust: 0,
  });

  // Average
  return Object.entries(aggregated).reduce((acc, [emotion, total]) => {
    acc[emotion as keyof SentimentScores] = Math.round((total / comments.length) * 10) / 10;
    return acc;
  }, {} as SentimentScores);
}
