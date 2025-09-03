import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  timestamp?: number;
}

class AnalyticsTracker {
  private events: AnalyticsEvent[] = [];
  private sessionId: string;
  private userId?: string;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeTracking();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeTracking() {
    // Track page views
    this.track('session_start', {
      user_agent: navigator.userAgent,
      referrer: document.referrer,
      viewport: `${window.innerWidth}x${window.innerHeight}`
    });
  }

  setUserId(userId: string) {
    this.userId = userId;
    this.track('user_identified', { user_id: userId });
  }

  track(event: string, properties?: Record<string, any>) {
    const eventData: AnalyticsEvent = {
      event,
      properties: {
        ...properties,
        session_id: this.sessionId,
        user_id: this.userId,
        timestamp: Date.now(),
        url: window.location.href,
        pathname: window.location.pathname
      },
      timestamp: Date.now()
    };

    this.events.push(eventData);
    
    // Store in localStorage for persistence
    localStorage.setItem('analytics_events', JSON.stringify(this.events.slice(-100))); // Keep last 100 events
    
    // In production, send to analytics service
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics]', eventData);
    }
  }

  trackPageView(path: string) {
    this.track('page_view', {
      path,
      title: document.title
    });
  }

  trackTemplateUsage(templateId: string, action: 'view' | 'select' | 'customize') {
    this.track('template_usage', {
      template_id: templateId,
      action
    });
  }

  trackResumeAction(action: 'create' | 'edit' | 'save' | 'download' | 'share') {
    this.track('resume_action', { action });
  }

  trackPremiumInteraction(action: 'view_upgrade' | 'click_upgrade' | 'purchase_attempt') {
    this.track('premium_interaction', { action });
  }

  trackUserJourney(step: string, section?: string) {
    this.track('user_journey', {
      step,
      section,
      time_on_page: Date.now() - (this.events[this.events.length - 1]?.timestamp || Date.now())
    });
  }

  getEvents(): AnalyticsEvent[] {
    return this.events;
  }

  getSessionMetrics() {
    const events = this.events;
    const sessionStart = events[0]?.timestamp || Date.now();
    const sessionDuration = Date.now() - sessionStart;
    const pageViews = events.filter(e => e.event === 'page_view').length;
    
    return {
      session_duration: sessionDuration,
      page_views: pageViews,
      total_events: events.length,
      last_activity: events[events.length - 1]?.timestamp
    };
  }
}

// Singleton instance
export const analytics = new AnalyticsTracker();

// React hook for page view tracking
export function usePageTracking() {
  const location = useLocation();
  const lastPath = useRef<string>('');

  useEffect(() => {
    if (location.pathname !== lastPath.current) {
      analytics.trackPageView(location.pathname);
      lastPath.current = location.pathname;
    }
  }, [location.pathname]);
}

// React hook for user journey tracking
export function useJourneyTracking(step: string, section?: string) {
  const stepRef = useRef<string>('');
  
  useEffect(() => {
    if (step !== stepRef.current) {
      analytics.trackUserJourney(step, section);
      stepRef.current = step;
    }
  }, [step, section]);
}