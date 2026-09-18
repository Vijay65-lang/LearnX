/**
 * LearnX Offline Resilience & Service Worker Caching Manager
 * Enables seamless offline study, lesson caching, and automatic sync.
 */

import { useState, useEffect, useCallback } from "react";
import { W3Course } from "../data/coursesData";

const OFFLINE_COURSES_KEY = "learnx_offline_courses_cache";
const OFFLINE_SYNC_QUEUE_KEY = "learnx_pending_sync_queue";

export interface PendingSyncItem {
  id: string;
  type: "lesson_complete" | "question_attempt" | "course_enroll";
  studentId: string;
  payload: any;
  timestamp: string;
}

/**
 * Register the Service Worker in supported browsers.
 */
export function registerServiceWorker(): void {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return;
  }

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        console.log("[LearnX] Service Worker registered with scope:", reg.scope);
      })
      .catch((err) => {
        console.warn("[LearnX] Service Worker registration skipped or failed:", err);
      });
  });
}

/**
 * Cache all academic courses into localStorage for instant offline access.
 */
export function cacheAllCoursesLocally(courses: W3Course[]): void {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.setItem(OFFLINE_COURSES_KEY, JSON.stringify(courses));
      localStorage.setItem("learnx_courses_cached_at", new Date().toISOString());
    }
  } catch (err) {
    console.warn("[LearnX] Failed to cache courses locally:", err);
  }
}

/**
 * Retrieve cached courses from localStorage.
 */
export function getCachedCoursesLocally(): W3Course[] | null {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      const raw = localStorage.getItem(OFFLINE_COURSES_KEY);
      return raw ? JSON.parse(raw) : null;
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * Check if courses are already saved offline.
 */
export function areCoursesCachedOffline(): boolean {
  try {
    const raw = localStorage.getItem(OFFLINE_COURSES_KEY);
    return !!raw && raw.length > 100;
  } catch {
    return false;
  }
}

/**
 * Add an item to the pending offline sync queue.
 */
export function enqueuePendingSync(item: Omit<PendingSyncItem, "id" | "timestamp">): void {
  try {
    const raw = localStorage.getItem(OFFLINE_SYNC_QUEUE_KEY);
    const queue: PendingSyncItem[] = raw ? JSON.parse(raw) : [];
    queue.push({
      ...item,
      id: "sync_" + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem(OFFLINE_SYNC_QUEUE_KEY, JSON.stringify(queue));
  } catch (err) {
    console.warn("[LearnX] Failed to enqueue pending sync:", err);
  }
}

/**
 * Get all pending sync items for the current student.
 */
export function getPendingSyncItems(studentId?: string): PendingSyncItem[] {
  try {
    const raw = localStorage.getItem(OFFLINE_SYNC_QUEUE_KEY);
    const queue: PendingSyncItem[] = raw ? JSON.parse(raw) : [];
    if (!studentId) return queue;
    return queue.filter((item) => item.studentId === studentId);
  } catch {
    return [];
  }
}

/**
 * Remove items from sync queue after successful background sync.
 */
export function clearSyncedItems(syncedIds: string[]): void {
  try {
    const raw = localStorage.getItem(OFFLINE_SYNC_QUEUE_KEY);
    let queue: PendingSyncItem[] = raw ? JSON.parse(raw) : [];
    queue = queue.filter((item) => !syncedIds.includes(item.id));
    localStorage.setItem(OFFLINE_SYNC_QUEUE_KEY, JSON.stringify(queue));
  } catch (err) {
    console.warn("[LearnX] Failed to clear synced items:", err);
  }
}

/**
 * React Hook for real-time online/offline status, queue count, and auto-sync trigger.
 */
export function useOfflineStatus(studentId?: string) {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  const refreshQueueCount = useCallback(() => {
    const items = getPendingSyncItems(studentId);
    setPendingCount(items.length);
  }, [studentId]);

  useEffect(() => {
    refreshQueueCount();

    const handleOnline = () => {
      setIsOnline(true);
      triggerSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Also poll queue count periodically
    const interval = setInterval(refreshQueueCount, 15000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, [refreshQueueCount]);

  const triggerSync = async () => {
    if (!navigator.onLine || isSyncing) return;
    const items = getPendingSyncItems(studentId);
    if (items.length === 0) return;

    setIsSyncing(true);
    const successfullySyncedIds: string[] = [];

    try {
      for (const item of items) {
        try {
          if (item.type === "lesson_complete") {
            const res = await fetch(`/api/courses/lessons/${item.payload.lessonId}/complete`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(item.payload),
            });
            if (res.ok) successfullySyncedIds.push(item.id);
          } else if (item.type === "question_attempt") {
            const res = await fetch("/api/learning/attempts", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(item.payload),
            });
            if (res.ok) successfullySyncedIds.push(item.id);
          } else if (item.type === "course_enroll") {
            const res = await fetch(`/api/courses/${item.payload.courseId}/enroll`, {
              method: "POST",
            });
            if (res.ok) successfullySyncedIds.push(item.id);
          }
        } catch {
          // If network drops mid-sync, stop and leave remainder in queue
          break;
        }
      }

      if (successfullySyncedIds.length > 0) {
        clearSyncedItems(successfullySyncedIds);
        setLastSyncedAt(new Date().toLocaleTimeString());
        refreshQueueCount();
      }
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    isOnline,
    isSyncing,
    pendingCount,
    lastSyncedAt,
    triggerSync,
    refreshQueueCount,
  };
}
