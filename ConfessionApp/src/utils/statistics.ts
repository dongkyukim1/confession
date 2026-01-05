/**
 * Statistics Utilities
 *
 * Calculate user writing statistics and insights
 */
import {DiaryEntry, UserStatistics} from '../types/features';

/**
 * Calculate writing streak
 */
export const calculateStreak = (entries: DiaryEntry[]): {
  current: number;
  longest: number;
} => {
  if (entries.length === 0) {
    return {current: 0, longest: 0};
  }

  // Sort entries by date (newest first)
  const sorted = [...entries].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 1;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastEntryDate = new Date(sorted[0].created_at);
  lastEntryDate.setHours(0, 0, 0, 0);

  // Check if last entry was today or yesterday
  const daysSinceLastEntry = Math.floor(
    (today.getTime() - lastEntryDate.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (daysSinceLastEntry <= 1) {
    currentStreak = 1;

    // Calculate current streak
    for (let i = 1; i < sorted.length; i++) {
      const currentDate = new Date(sorted[i].created_at);
      currentDate.setHours(0, 0, 0, 0);

      const previousDate = new Date(sorted[i - 1].created_at);
      previousDate.setHours(0, 0, 0, 0);

      const daysDiff = Math.floor(
        (previousDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (daysDiff === 1) {
        currentStreak++;
      } else if (daysDiff > 1) {
        break;
      }
    }
  }

  // Calculate longest streak
  for (let i = 1; i < sorted.length; i++) {
    const currentDate = new Date(sorted[i].created_at);
    currentDate.setHours(0, 0, 0, 0);

    const previousDate = new Date(sorted[i - 1].created_at);
    previousDate.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor(
      (previousDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysDiff === 1) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else if (daysDiff > 1) {
      tempStreak = 1;
    }
  }

  longestStreak = Math.max(longestStreak, currentStreak, tempStreak);

  return {current: currentStreak, longest: longestStreak};
};

/**
 * Calculate word count for a text
 */
export const calculateWordCount = (text: string): number => {
  // Korean text: count characters (excluding spaces)
  // English text: count words
  const koreanChars = text.replace(/\s/g, '').replace(/[^\u3131-\uD79D]/g, '');
  const englishWords = text.match(/[a-zA-Z]+/g);

  return koreanChars.length + (englishWords?.length || 0);
};

/**
 * Get most used tags from entries
 */
export const getMostUsedTags = (
  entries: DiaryEntry[],
): {tag: string; count: number}[] => {
  const tagCounts: Record<string, number> = {};

  entries.forEach(entry => {
    entry.tags?.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  return Object.entries(tagCounts)
    .map(([tag, count]) => ({tag, count}))
    .sort((a, b) => b.count - a.count);
};

/**
 * Get entries distribution by day of week (0 = Sunday)
 */
export const getEntriesByDayOfWeek = (entries: DiaryEntry[]): number[] => {
  const distribution = [0, 0, 0, 0, 0, 0, 0];

  entries.forEach(entry => {
    const date = new Date(entry.created_at);
    const dayOfWeek = date.getDay();
    distribution[dayOfWeek]++;
  });

  return distribution;
};

/**
 * Get entries distribution by hour
 */
export const getEntriesByHour = (entries: DiaryEntry[]): number[] => {
  const distribution = new Array(24).fill(0);

  entries.forEach(entry => {
    const date = new Date(entry.created_at);
    const hour = date.getHours();
    distribution[hour]++;
  });

  return distribution;
};

/**
 * Get mood distribution
 */
export const getMoodDistribution = (
  entries: DiaryEntry[],
): Record<string, number> => {
  const moodCounts: Record<string, number> = {};

  entries.forEach(entry => {
    if (entry.mood) {
      moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
    }
  });

  return moodCounts;
};

/**
 * Calculate comprehensive user statistics
 */
export const calculateUserStatistics = (
  entries: DiaryEntry[],
): UserStatistics => {
  const {current, longest} = calculateStreak(entries);
  const mostUsedTags = getMostUsedTags(entries);
  const entriesByDayOfWeek = getEntriesByDayOfWeek(entries);
  const entriesByHour = getEntriesByHour(entries);
  const moodDistribution = getMoodDistribution(entries);

  const totalWords = entries.reduce((sum, entry) => {
    return sum + (entry.word_count || calculateWordCount(entry.content));
  }, 0);

  return {
    totalEntries: entries.length,
    currentStreak: current,
    longestStreak: longest,
    totalWords,
    averageWordsPerEntry: entries.length > 0 ? totalWords / entries.length : 0,
    mostUsedTags,
    moodDistribution,
    entriesByDayOfWeek,
    entriesByHour,
  };
};
