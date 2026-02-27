/**
 * Self-Hosted Analytics (PostgreSQL)
 * Tracks to YOUR database - no external services
 * 
 * Place in: templates/analytics.js
 * Copy to: backend/generated_apps/{slug}/public/analytics.js
 */

(function() {
  // Configuration (injected by backend)
  const APP_ID = window.__APP_ID__ || 'unknown';
  const API_BASE = window.__API_BASE__ || 'http://localhost:8000';
  
  // Generate/get user ID
  let userId = localStorage.getItem('analytics_user_id');
  if (!userId) {
    userId = 'user_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('analytics_user_id', userId);
  }
  
  // Generate session ID
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = 'session_' + Math.random().toString(36).substr(2, 9);
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  
  const sessionStart = Date.now();
  
  /**
   * Send event to backend
   */
  function track(type, payload = {}) {
    const event = {
      app_id: APP_ID,
      user_id: userId,
      session_id: sessionId,
      type: type,
      payload: payload,
      ts: new Date().toISOString(),
      url: window.location.href,
      referrer: document.referrer || null,
      user_agent: navigator.userAgent
    };
    
    // Use sendBeacon for reliability
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(event)], { type: 'application/json' });
      navigator.sendBeacon(API_BASE + '/analytics/event', blob);
    } else {
      // Fallback to fetch
      fetch(API_BASE + '/analytics/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
        keepalive: true
      }).catch(err => console.warn('Analytics error:', err));
    }
  }
  
  // === AUTOMATIC TRACKING ===
  
  // Page view
  track('page_view', {
    path: location.pathname,
    title: document.title,
    screen: screen.width + 'x' + screen.height
  });
  
  // Session start
  track('session_start');
  
  // Session end
  window.addEventListener('beforeunload', function() {
    track('session_end', {
      duration: Date.now() - sessionStart
    });
  });
  
  // JavaScript errors
  window.addEventListener('error', function(e) {
    track('error', {
      message: e.message,
      filename: e.filename,
      line: e.lineno,
      column: e.colno
    });
  });
  
  // Clicks
  document.addEventListener('click', function(e) {
    const target = e.target.closest('a, button');
    if (target) {
      track('click', {
        tag: target.tagName,
        text: target.textContent.substring(0, 100),
        href: target.href || null
      });
    }
  });
  
  // Form submissions
  document.addEventListener('submit', function(e) {
    const form = e.target;
    track('form_submit', {
      form_name: form.getAttribute('name') || form.getAttribute('id') || 'unnamed',
      form_action: form.action
    });
  });
  
  // Public API
  window.trackEvent = track;
  
  console.log('📊 Analytics initialized');
  console.log('   App ID:', APP_ID);
  console.log('   User ID:', userId);
  console.log('   Session ID:', sessionId);
})();