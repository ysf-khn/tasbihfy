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

  static saveSession(session: Omit<GuestSession, 'id'>): GuestSession {
    const sessions = this.getSessions();
    
    // Look for existing session
    const existingIndex = sessions.findIndex(s => s.dhikrId === session.dhikrId && !s.completed);
    
    if (existingIndex !== -1) {
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

  static exportGuestData(): { dhikrs: GuestDhikr[]; sessions: GuestSession[] } {
    return {
      dhikrs: this.getDhikrs(),
      sessions: this.getSessions(),
    };
  }
}