// Session management utility for deal room auto-save and draft management

export interface SessionInfo {
  sessionId: string;
  userId?: string;
  createdAt: Date;
  lastActivity: Date;
}

class SessionManager {
  private static instance: SessionManager;
  private sessionInfo: SessionInfo | null = null;
  private readonly SESSION_KEY = 'dealroom_session';
  private readonly SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  private constructor() {
    this.initializeSession();
  }

  public static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  private initializeSession(): void {
    try {
      const storedSession = localStorage.getItem(this.SESSION_KEY);
      if (storedSession) {
        const parsed = JSON.parse(storedSession);
        const sessionInfo: SessionInfo = {
          ...parsed,
          createdAt: new Date(parsed.createdAt),
          lastActivity: new Date(parsed.lastActivity)
        };

        // Check if session is still valid
        const now = new Date();
        const timeSinceLastActivity = now.getTime() - sessionInfo.lastActivity.getTime();
        
        if (timeSinceLastActivity < this.SESSION_DURATION) {
          this.sessionInfo = sessionInfo;
          this.updateLastActivity();
        } else {
          // Session expired, create new one
          this.createNewSession();
        }
      } else {
        this.createNewSession();
      }
    } catch (error) {
      console.warn('Error initializing session, creating new one:', error);
      this.createNewSession();
    }
  }

  private createNewSession(): void {
    const now = new Date();
    this.sessionInfo = {
      sessionId: this.generateSessionId(),
      createdAt: now,
      lastActivity: now
    };
    this.saveSession();
  }

  private generateSessionId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 9);
    const browserInfo = this.getBrowserFingerprint();
    return `session_${timestamp}_${random}_${browserInfo}`;
  }

  private getBrowserFingerprint(): string {
    // Create a simple browser fingerprint for session uniqueness
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Session fingerprint', 2, 2);
    }
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      window.screen.width + 'x' + window.screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL()
    ].join('|');

    // Create a simple hash
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(36).substr(0, 6);
  }

  private saveSession(): void {
    if (this.sessionInfo) {
      try {
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(this.sessionInfo));
      } catch (error) {
        console.warn('Error saving session to localStorage:', error);
      }
    }
  }

  private updateLastActivity(): void {
    if (this.sessionInfo) {
      this.sessionInfo.lastActivity = new Date();
      this.saveSession();
    }
  }

  public getSessionId(): string {
    if (!this.sessionInfo) {
      this.createNewSession();
    }
    this.updateLastActivity();
    return this.sessionInfo!.sessionId;
  }

  public getSessionInfo(): SessionInfo | null {
    this.updateLastActivity();
    return this.sessionInfo;
  }

  public setUserId(userId: string): void {
    if (this.sessionInfo) {
      this.sessionInfo.userId = userId;
      this.saveSession();
    }
  }

  public clearSession(): void {
    this.sessionInfo = null;
    try {
      localStorage.removeItem(this.SESSION_KEY);
    } catch (error) {
      console.warn('Error clearing session from localStorage:', error);
    }
  }

  public isSessionValid(): boolean {
    if (!this.sessionInfo) {
      return false;
    }

    const now = new Date();
    const timeSinceLastActivity = now.getTime() - this.sessionInfo.lastActivity.getTime();
    return timeSinceLastActivity < this.SESSION_DURATION;
  }

  public renewSession(): void {
    if (this.sessionInfo && this.isSessionValid()) {
      this.updateLastActivity();
    } else {
      this.createNewSession();
    }
  }
}

// Export singleton instance
export const sessionManager = SessionManager.getInstance();

// Export utility functions
export const getSessionId = (): string => sessionManager.getSessionId();
export const getSessionInfo = (): SessionInfo | null => sessionManager.getSessionInfo();
export const setUserId = (userId: string): void => sessionManager.setUserId(userId);
export const clearSession = (): void => sessionManager.clearSession();
export const isSessionValid = (): boolean => sessionManager.isSessionValid();
export const renewSession = (): void => sessionManager.renewSession();