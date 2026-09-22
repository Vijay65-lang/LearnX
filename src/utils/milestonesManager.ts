import { MilestoneBadge, StudentAnalytics } from "../types";
import { getStudentStorageKey, getLocalQuestionAttempts, getLocalDoubts } from "../api";

/**
 * Format Date as YYYY-MM-DD in local time
 */
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Record today as an active study session day for the current student.
 * Also back-fills any dates from existing attempt and doubt timestamps.
 */
export function recordActiveStudyDay(customDateStr?: string): {
  currentStreak: number;
  longestStreak: number;
  totalStudyDays: number;
  studyDates: string[];
  studiedToday: boolean;
} {
  const key = getStudentStorageKey("study_dates");
  let datesSet = new Set<string>();

  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        parsed.forEach((d: string) => datesSet.add(d));
      }
    }
  } catch {}

  // Automatically add today's date
  const todayStr = customDateStr || getLocalDateString();
  datesSet.add(todayStr);

  // Backfill from local attempts
  try {
    const attempts = getLocalQuestionAttempts();
    for (const att of attempts) {
      if (att.timestamp) {
        const d = new Date(att.timestamp);
        if (!isNaN(d.getTime())) {
          datesSet.add(getLocalDateString(d));
        }
      }
    }
  } catch {}

  // Backfill from local doubts
  try {
    const doubts = getLocalDoubts();
    for (const dbt of doubts) {
      if (dbt.timestamp) {
        const d = new Date(dbt.timestamp);
        if (!isNaN(d.getTime())) {
          datesSet.add(getLocalDateString(d));
        }
      }
    }
  } catch {}

  const sortedDates = Array.from(datesSet).sort();

  try {
    localStorage.setItem(key, JSON.stringify(sortedDates));
  } catch {}

  const streakInfo = calculateStreaks(sortedDates);
  return {
    ...streakInfo,
    studyDates: sortedDates,
    studiedToday: true,
  };
}

/**
 * Get all recorded study dates and streak metrics
 */
export function getStudyStreakInfo(): {
  currentStreak: number;
  longestStreak: number;
  totalStudyDays: number;
  studyDates: string[];
  studiedToday: boolean;
} {
  const key = getStudentStorageKey("study_dates");
  let sortedDates: string[] = [];

  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        sortedDates = parsed.sort();
      }
    }
  } catch {}

  // If empty, auto-record today
  const todayStr = getLocalDateString();
  if (sortedDates.length === 0) {
    return recordActiveStudyDay();
  }

  const streakInfo = calculateStreaks(sortedDates);
  const studiedToday = sortedDates.includes(todayStr);

  return {
    ...streakInfo,
    studyDates: sortedDates,
    studiedToday,
  };
}

/**
 * Add simulated streak days (for demonstration & preview testing)
 */
export function addSimulatedStudyDays(count: number): void {
  const key = getStudentStorageKey("study_dates");
  let datesSet = new Set<string>();

  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        parsed.forEach((d: string) => datesSet.add(d));
      }
    }
  } catch {}

  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getTime() - i * 86400000);
    datesSet.add(getLocalDateString(d));
  }

  try {
    localStorage.setItem(key, JSON.stringify(Array.from(datesSet).sort()));
  } catch {}
}

/**
 * Compute current streak and longest streak from sorted YYYY-MM-DD date list
 */
function calculateStreaks(sortedDates: string[]): {
  currentStreak: number;
  longestStreak: number;
  totalStudyDays: number;
} {
  if (sortedDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0, totalStudyDays: 0 };
  }

  const dateSet = new Set(sortedDates);
  const now = new Date();
  const todayStr = getLocalDateString(now);
  const yesterday = new Date(now.getTime() - 86400000);
  const yesterdayStr = getLocalDateString(yesterday);

  // Determine current streak
  let currentStreak = 0;
  let checkDate: Date;

  if (dateSet.has(todayStr)) {
    currentStreak = 1;
    checkDate = new Date(now.getTime() - 86400000);
  } else if (dateSet.has(yesterdayStr)) {
    currentStreak = 1;
    checkDate = new Date(yesterday.getTime() - 86400000);
  } else {
    currentStreak = 0;
    checkDate = new Date(0);
  }

  if (currentStreak > 0) {
    while (true) {
      const str = getLocalDateString(checkDate);
      if (dateSet.has(str)) {
        currentStreak++;
        checkDate = new Date(checkDate.getTime() - 86400000);
      } else {
        break;
      }
    }
  }

  // Calculate longest historical streak
  let longestStreak = 0;
  let currentRun = 0;
  let prevDateMs: number | null = null;

  for (const dateStr of sortedDates) {
    const parts = dateStr.split("-").map(Number);
    const dateMs = new Date(parts[0], parts[1] - 1, parts[2]).getTime();

    if (prevDateMs === null) {
      currentRun = 1;
    } else {
      const diffDays = Math.round((dateMs - prevDateMs) / 86400000);
      if (diffDays === 1) {
        currentRun++;
      } else if (diffDays > 1) {
        currentRun = 1;
      }
    }

    if (currentRun > longestStreak) {
      longestStreak = currentRun;
    }
    prevDateMs = dateMs;
  }

  return {
    currentStreak,
    longestStreak: Math.max(longestStreak, currentStreak),
    totalStudyDays: sortedDates.length,
  };
}

/**
 * Get or save unlocked milestone badges timestamp dictionary
 */
function getUnlockedTimestamps(): Record<string, string> {
  const key = getStudentStorageKey("milestone_unlocks");
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveUnlockedTimestamp(badgeId: string): string {
  const key = getStudentStorageKey("milestone_unlocks");
  const stamps = getUnlockedTimestamps();
  if (!stamps[badgeId]) {
    stamps[badgeId] = new Date().toISOString();
    try {
      localStorage.setItem(key, JSON.stringify(stamps));
    } catch {}
  }
  return stamps[badgeId];
}

/**
 * Evaluates all Mastery Milestones against the student's live analytics
 */
export function computeMasteryMilestones(analytics: StudentAnalytics): {
  badges: MilestoneBadge[];
  streakInfo: {
    currentStreak: number;
    longestStreak: number;
    totalStudyDays: number;
    studyDates: string[];
    studiedToday: boolean;
  };
  stats: {
    totalBadges: number;
    unlockedBadges: number;
    completionPercentage: number;
    completedCoursesCount: number;
    topicsMasteredCount: number;
  };
} {
  const streakInfo = getStudyStreakInfo();
  const stamps = getUnlockedTimestamps();

  // Completed courses count
  const certificatesCount = analytics.certificates?.length || 0;
  const enrolledCompleted = analytics.enrolledCourses?.filter(
    (c) => c.enrollment_status === "completed" || (c.completion_percentage || 0) >= 100
  ).length || 0;
  const completedCoursesCount = Math.max(certificatesCount, enrolledCompleted);

  // Topics mastered
  const topicsMasteredCount =
    analytics.stats?.topicsMasteredCount ||
    analytics.masteryRecords?.filter((m) => m.mastery_state === "Mastered").length ||
    0;

  // Question attempts & Accuracy
  const totalAttempts = analytics.stats?.totalAttempts || 0;
  const overallAccuracy = analytics.stats?.overallAccuracy || 0;
  const totalDoubts = analytics.stats?.totalDoubts || 0;

  // Active or longest streak (highest of current or longest to preserve achievements)
  const effectiveStreak = Math.max(streakInfo.currentStreak, streakInfo.longestStreak);

  // Definitions for all Mastery Milestone Badges
  const badgeDefinitions: Array<{
    id: string;
    title: string;
    description: string;
    category: "streak" | "courses" | "mastery" | "inquiry";
    tier: "Bronze" | "Silver" | "Gold" | "Diamond";
    iconName: string;
    targetValue: number;
    currentValue: number;
    unit: string;
    condition: boolean;
  }> = [
    // --- STREAK BADGES ---
    {
      id: "streak_1",
      title: "Day One Spark",
      description: "Took your first step on the learning journey by logging an active study day.",
      category: "streak",
      tier: "Bronze",
      iconName: "Flame",
      targetValue: 1,
      currentValue: effectiveStreak,
      unit: "days",
      condition: effectiveStreak >= 1,
    },
    {
      id: "streak_3",
      title: "3-Day Consistency",
      description: "Maintained 3 consecutive days of active academic study without interruption.",
      category: "streak",
      tier: "Silver",
      iconName: "Zap",
      targetValue: 3,
      currentValue: effectiveStreak,
      unit: "days",
      condition: effectiveStreak >= 3,
    },
    {
      id: "streak_7",
      title: "7-Day Momentum",
      description: "An entire week of non-stop daily learning. Habits turn into mastery!",
      category: "streak",
      tier: "Gold",
      iconName: "Sparkles",
      targetValue: 7,
      currentValue: effectiveStreak,
      unit: "days",
      condition: effectiveStreak >= 7,
    },
    {
      id: "streak_14",
      title: "14-Day Dedicated Scholar",
      description: "Two straight weeks of uninterrupted focus, review, and conceptual practice.",
      category: "streak",
      tier: "Gold",
      iconName: "Trophy",
      targetValue: 14,
      currentValue: effectiveStreak,
      unit: "days",
      condition: effectiveStreak >= 14,
    },
    {
      id: "streak_30",
      title: "30-Day Master Habit",
      description: "30 consecutive study days. Elite discipline and unwavering academic dedication.",
      category: "streak",
      tier: "Diamond",
      iconName: "Award",
      targetValue: 30,
      currentValue: effectiveStreak,
      unit: "days",
      condition: effectiveStreak >= 30,
    },

    // --- COURSE COMPLETION BADGES ---
    {
      id: "course_1",
      title: "Course Debutant",
      description: "Successfully finished your first complete curriculum course with all modules cleared.",
      category: "courses",
      tier: "Bronze",
      iconName: "GraduationCap",
      targetValue: 1,
      currentValue: completedCoursesCount,
      unit: "courses",
      condition: completedCoursesCount >= 1,
    },
    {
      id: "course_2",
      title: "Curriculum Explorer",
      description: "Completed 2 full courses across your academic specialization.",
      category: "courses",
      tier: "Silver",
      iconName: "BookOpen",
      targetValue: 2,
      currentValue: completedCoursesCount,
      unit: "courses",
      condition: completedCoursesCount >= 2,
    },
    {
      id: "course_3",
      title: "Multi-Discipline Scholar",
      description: "Completed 3 full courses and secured verified accreditation seals.",
      category: "courses",
      tier: "Gold",
      iconName: "Award",
      targetValue: 3,
      currentValue: completedCoursesCount,
      unit: "courses",
      condition: completedCoursesCount >= 3,
    },
    {
      id: "course_5",
      title: "Capstone Master",
      description: "Completed 5 full academic courses. A master of comprehensive subject curriculum.",
      category: "courses",
      tier: "Diamond",
      iconName: "Trophy",
      targetValue: 5,
      currentValue: completedCoursesCount,
      unit: "courses",
      condition: completedCoursesCount >= 5,
    },

    // --- MASTERY & PRACTICE BADGES ---
    {
      id: "mastery_1",
      title: "First Concept Master",
      description: "Achieved deterministic 'Mastered' status (≥90% accuracy) on your first topic.",
      category: "mastery",
      tier: "Bronze",
      iconName: "CheckCircle2",
      targetValue: 1,
      currentValue: topicsMasteredCount,
      unit: "topics",
      condition: topicsMasteredCount >= 1,
    },
    {
      id: "mastery_3",
      title: "Triple Topic Mastery",
      description: "Demonstrated solid conceptual retention across 3 distinct academic topics.",
      category: "mastery",
      tier: "Silver",
      iconName: "ShieldCheck",
      targetValue: 3,
      currentValue: topicsMasteredCount,
      unit: "topics",
      condition: topicsMasteredCount >= 3,
    },
    {
      id: "practice_20",
      title: "Centurion Practitioner",
      description: "Completed 20 practice questions to reinforce lecture theory with active recall.",
      category: "mastery",
      tier: "Gold",
      iconName: "Target",
      targetValue: 20,
      currentValue: totalAttempts,
      unit: "questions",
      condition: totalAttempts >= 20,
    },
    {
      id: "accuracy_80",
      title: "Precision Ace",
      description: "Maintained over 80% overall accuracy across at least 10 question attempts.",
      category: "mastery",
      tier: "Diamond",
      iconName: "Star",
      targetValue: 80,
      currentValue: overallAccuracy,
      unit: "% acc",
      condition: overallAccuracy >= 80 && totalAttempts >= 10,
    },

    // --- INQUIRY BADGES ---
    {
      id: "inquiry_5",
      title: "Curious Inquirer",
      description: "Asked 5 conceptual doubts to uncover nuances and resolve core misconceptions.",
      category: "inquiry",
      tier: "Silver",
      iconName: "HelpCircle",
      targetValue: 5,
      currentValue: totalDoubts,
      unit: "doubts",
      condition: totalDoubts >= 5,
    },
  ];

  const badges: MilestoneBadge[] = badgeDefinitions.map((def) => {
    let unlockedAt: string | undefined = stamps[def.id];
    if (def.condition && !unlockedAt) {
      unlockedAt = saveUnlockedTimestamp(def.id);
    }

    return {
      id: def.id,
      title: def.title,
      description: def.description,
      category: def.category,
      tier: def.tier,
      iconName: def.iconName,
      targetValue: def.targetValue,
      currentValue: Math.min(def.currentValue, def.targetValue),
      unit: def.unit,
      unlocked: def.condition,
      unlockedAt,
    };
  });

  const unlockedCount = badges.filter((b) => b.unlocked).length;

  return {
    badges,
    streakInfo,
    stats: {
      totalBadges: badges.length,
      unlockedBadges: unlockedCount,
      completionPercentage: Math.round((unlockedCount / badges.length) * 100),
      completedCoursesCount,
      topicsMasteredCount,
    },
  };
}
