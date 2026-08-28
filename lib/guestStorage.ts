"use client";

export interface GuestDhikr {
  id: string;
  name: string;
  targetCount: number;
  arabicText?: string;
  transliteration?: string;
  createdAt: number;
}

export interface GuestSession {
  id: string;
  dhikrId: string;
  currentCount: number;
  completed: boolean;
  startedAt: number;
  lastUpdated: number;
}

const GUEST_DHIKRS_KEY = 'tasbihfy-guest-dhikrs';
const GUEST_SESSIONS_KEY = 'tasbihfy-guest-sessions';
const GUEST_DAILY_TOTALS_KEY = 'tasbihfy-guest-daily-totals';
const DAILY_TOTALS_RETENTION_DAYS = 180;

function localDateString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export class GuestStorage {
  static getDhikrs(): GuestDhikr[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem(GUEST_DHIKRS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to parse guest dhikrs:', error);
      return [];
    }
  }

  static saveDhikrs(dhikrs: GuestDhikr[]): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(GUEST_DHIKRS_KEY, JSON.stringify(dhikrs));
    } catch (error) {
      console.error('Failed to save guest dhikrs:', error);
    }
  }

  static addDhikr(dhikr: Omit<GuestDhikr, 'id' | 'createdAt'>): GuestDhikr {
    const newDhikr: GuestDhikr = {
      ...dhikr,
      id: `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now(),
    };

    const dhikrs = this.getDhikrs();
    dhikrs.unshift(newDhikr); // Add to beginning
    this.saveDhikrs(dhikrs);

    return newDhikr;
  }

  static deleteDhikr(id: string): void {
    const dhikrs = this.getDhikrs();
    const filtered = dhikrs.filter(d => d.id !== id);
    this.saveDhikrs(filtered);

    // Also delete any sessions for this dhikr
    const sessions = this.getSessions();
    const filteredSessions = sessions.filter(s => s.dhikrId !== id);
    this.saveSessions(filteredSessions);
  }

  static updateDhikr(id: string, updates: Partial<Omit<GuestDhikr, 'id' | 'createdAt'>>): void {
    const dhikrs = this.getDhikrs();
    const index = dhikrs.findIndex(d => d.id === id);
    
    if (index !== -1) {
      dhikrs[index] = { ...dhikrs[index], ...updates };
      this.saveDhikrs(dhikrs);
    }
  }

  static getSessions(): GuestSession[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem(GUEST_SESSIONS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to parse guest sessions:', error);
      return [];
    }
  }

  static saveSessions(sessions: GuestSession[]): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(GUEST_SESSIONS_KEY, JSON.stringify(sessions));
    } catch (error) {
      console.error('Failed to save guest sessions:', error);
    }
  }

  static getSession(dhikrId: string): GuestSession | null {
    const sessions = this.getSessions();
    return sessions.find(s => s.dhikrId === dhikrId && !s.completed) || null;
  }

  /** Per-date dhikr count totals, for guest history and streaks */
  static getDailyTotals(): Record<string, number> {
    if (typeof window === 'undefined') return {};

    try {
      const stored = localStorage.getItem(GUEST_DAILY_TOTALS_KEY);
      const parsed = stored ? JSON.parse(stored) : {};
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
        ? parsed
        : {};
    } catch {
      return {};
    }
  }

  static recordDailyDelta(delta: number): void {
    if (typeof window === 'undefined' || delta <= 0) return;

    try {
      const totals = this.getDailyTotals();
      const today = localDateString();
      totals[today] = (totals[today] || 0) + delta;

      // Trim entries beyond the retention window
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - DAILY_TOTALS_RETENTION_DAYS);
      const cutoffStr = cutoff.toISOString().split('T')[0];
      for (const date of Object.keys(totals)) {
        if (date < cutoffStr) delete totals[date];
      }

      localStorage.setItem(GUEST_DAILY_TOTALS_KEY, JSON.stringify(totals));
    } catch (error) {
      console.warn('Failed to record guest daily total:', error);
    }
  }

  static saveSession(session: Omit<GuestSession, 'id'>): GuestSession {
    const sessions = this.getSessions();

    // Look for existing session
    const existingIndex = sessions.findIndex(s => s.dhikrId === session.dhikrId && !s.completed);

    if (existingIndex !== -1) {
      const previousCount = sessions[existingIndex].currentCount;
      this.recordDailyDelta(session.currentCount - previousCount);
      // Update existing session
      sessions[existingIndex] = {
        ...sessions[existingIndex],
        ...session,
        lastUpdated: Date.now(),
      };
      this.saveSessions(sessions);
      return sessions[existingIndex];
    } else {
      // Create new session
      this.recordDailyDelta(session.currentCount);
      const newSession: GuestSession = {
        ...session,
        id: `guest-session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        lastUpdated: Date.now(),
      };

      sessions.push(newSession);
      this.saveSessions(sessions);
      return newSession;
    }
  }

  static updateSessionCount(dhikrId: string, count: number, targetCount: number): GuestSession | null {
    const sessions = this.getSessions();
    const sessionIndex = sessions.findIndex(s => s.dhikrId === dhikrId && !s.completed);
    
    if (sessionIndex !== -1) {
      this.recordDailyDelta(count - sessions[sessionIndex].currentCount);
      sessions[sessionIndex].currentCount = count;
      sessions[sessionIndex].completed = count >= targetCount;
      sessions[sessionIndex].lastUpdated = Date.now();

      this.saveSessions(sessions);
      return sessions[sessionIndex];
    } else {
      // Create new session
      return this.saveSession({
        dhikrId,
        currentCount: count,
        completed: count >= targetCount,
        startedAt: Date.now(),
        lastUpdated: Date.now(),
      });
    }
  }

  static resetSession(dhikrId: string): void {
    const sessions = this.getSessions();
    const sessionIndex = sessions.findIndex(s => s.dhikrId === dhikrId && !s.completed);
    
    if (sessionIndex !== -1) {
      sessions[sessionIndex].currentCount = 0;
      sessions[sessionIndex].completed = false;
      sessions[sessionIndex].lastUpdated = Date.now();
      
      this.saveSessions(sessions);
    }
  }

  static clearAllData(): void {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem(GUEST_DHIKRS_KEY);
    localStorage.removeItem(GUEST_SESSIONS_KEY);
  }

  static pruneOldSessions(maxAge: number = 30 * 24 * 60 * 60 * 1000): number {
    if (typeof window === 'undefined') return 0;
    
    try {
      const sessions = this.getSessions();
      const now = Date.now();
      const originalCount = sessions.length;
      
      // Remove completed sessions older than maxAge
      const filtered = sessions.filter(session => {
        if (!session.completed) return true; // Keep incomplete sessions
        
        const lastUpdated = session.lastUpdated || session.startedAt || 0;
        return now - lastUpdated < maxAge;
      });
      
      if (filtered.length < originalCount) {
        this.saveSessions(filtered);
        return originalCount - filtered.length;
      }
      
      return 0;
    } catch (error) {
      console.warn('Failed to prune old guest sessions:', error);
      return 0;
    }
  }

  static exportGuestData(): { dhikrs: GuestDhikr[]; sessions: GuestSession[] } {
    return {
      dhikrs: this.getDhikrs(),
      sessions: this.getSessions(),
    };
  }
}