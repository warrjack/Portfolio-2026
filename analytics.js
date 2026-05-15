(function () {
  var POST_SERVER = 'https://post-server-4nqs.onrender.com';
  var BOT = /bot|crawler|spider|crawl|facebookexternalhit|twitterbot|linkedinbot|slackbot|discordbot|telegrambot|whatsapp|preview|unfurl|applebot|curl|wget|python-requests|java\/|go-http-client/i;

  function getSessionId() {
    var id = sessionStorage.getItem('_asid');
    if (!id) {
      id = typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2) + Date.now().toString(36);
      sessionStorage.setItem('_asid', id);
    }
    return id;
  }

  function getDevice() {
    var ua = navigator.userAgent;
    if (/Mobi|Android/i.test(ua) && !/iPad/i.test(ua)) return 'mobile';
    if (/iPad|Tablet/i.test(ua)) return 'tablet';
    return 'desktop';
  }

  function getBrowser() {
    var ua = navigator.userAgent;
    if (/Edg\//.test(ua)) return 'Edge';
    if (/OPR|Opera/.test(ua)) return 'Opera';
    if (/Chrome/.test(ua)) return 'Chrome';
    if (/Firefox/.test(ua)) return 'Firefox';
    if (/Safari/.test(ua)) return 'Safari';
    return 'Other';
  }

  function getOS() {
    var ua = navigator.userAgent;
    if (/Windows/.test(ua)) return 'Windows';
    if (/iPhone|iPad/.test(ua)) return 'iOS';
    if (/Android/.test(ua)) return 'Android';
    if (/Mac/.test(ua)) return 'macOS';
    if (/Linux/.test(ua)) return 'Linux';
    return 'Other';
  }

  function post(path, body) {
    fetch(POST_SERVER + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
      body: JSON.stringify(body)
    }).catch(function () {});
  }

  function initAnalytics(pageName) {
    if (BOT.test(navigator.userAgent)) return;
    var sid = getSessionId();

    post('/session', {
      sessionId: sid,
      page: pageName,
      startedAt: new Date().toISOString(),
      device: getDevice(),
      browser: getBrowser(),
      os: getOS(),
      userAgent: navigator.userAgent,
      referrer: document.referrer || null
    });

    var t0 = Date.now();
    var maxScroll = 0;

    window.addEventListener('scroll', function () {
      var el = document.documentElement;
      var pct = Math.round(((el.scrollTop + el.clientHeight) / el.scrollHeight) * 100);
      if (pct > maxScroll) maxScroll = pct;
    }, { passive: true });

    function sendEnd() {
      post('/event', {
        sessionId: sid,
        type: 'session_end',
        timeOnPageMs: Date.now() - t0,
        maxScrollPct: maxScroll,
        occurredAt: new Date().toISOString()
      });
    }

    window.addEventListener('beforeunload', sendEnd);
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'hidden') sendEnd();
    });
  }

  function trackClick(name) {
    if (BOT.test(navigator.userAgent)) return;
    post('/event', {
      sessionId: getSessionId(),
      type: 'cta_click',
      name: name,
      occurredAt: new Date().toISOString()
    });
  }

  function trackConversion(name, metadata) {
    if (BOT.test(navigator.userAgent)) return;
    post('/event', {
      sessionId: getSessionId(),
      type: 'conversion',
      name: name,
      metadata: metadata || null,
      occurredAt: new Date().toISOString()
    });
  }

  window.initAnalytics = initAnalytics;
  window.trackClick = trackClick;
  window.trackConversion = trackConversion;
})();
