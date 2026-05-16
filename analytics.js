(function () {
  // ─── Config ──────────────────────────────────────────────────────────
  var POST_SERVER = 'https://post-server-4nqs.onrender.com';
  var ANALYTICS_TOKEN = 'c0cf16cb-9bad-4588-a018-1142ec38d95f-1f0c38c9-1fba-49b8-b439-239855019648';
  // ─────────────────────────────────────────────────────────────────────

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

  function getUtmParams() {
    var p = new URLSearchParams(window.location.search);
    return {
      utmSource: p.get('utm_source'),
      utmMedium: p.get('utm_medium'),
      utmCampaign: p.get('utm_campaign'),
      utmContent: p.get('utm_content'),
    };
  }

  // Returns true if this is a return visit; sets the flag on first visit.
  function checkReturnVisitor() {
    var flag = localStorage.getItem('_arv');
    if (!flag) { localStorage.setItem('_arv', '1'); return false; }
    return true;
  }

  // Visit ?_internal=1 once to mark your browser as internal traffic.
  function checkInternalTraffic() {
    var params = new URLSearchParams(window.location.search);
    if (params.get('_internal') === '1') {
      var exp = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString();
      document.cookie = '_internal=1; path=/; expires=' + exp;
    }
    return document.cookie.split(';').some(function (c) { return c.trim() === '_internal=1'; });
  }

  function post(path, body) {
    fetch(POST_SERVER + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Analytics-Token': ANALYTICS_TOKEN },
      keepalive: true,
      body: JSON.stringify(body),
    }).catch(function () {});
  }

  function sendPageLoad(sid) {
    var timing = window.performance && window.performance.timing;
    if (!timing || !timing.loadEventEnd) return;
    var ms = timing.loadEventEnd - timing.navigationStart;
    if (ms > 0 && ms < 60000) {
      post('/event', { sessionId: sid, type: 'page_load', metadata: { loadTimeMs: ms }, occurredAt: new Date().toISOString() });
    }
  }

  function initAnalytics(pageName) {
    if (BOT.test(navigator.userAgent)) return;
    var sid = getSessionId();
    var utms = getUtmParams();
    var returning = checkReturnVisitor();
    var internal = checkInternalTraffic();

    post('/session', {
      sessionId: sid,
      page: pageName,
      startedAt: new Date().toISOString(),
      device: getDevice(),
      browser: getBrowser(),
      os: getOS(),
      userAgent: navigator.userAgent,
      referrer: document.referrer || null,
      utmSource: utms.utmSource,
      utmMedium: utms.utmMedium,
      utmCampaign: utms.utmCampaign,
      utmContent: utms.utmContent,
      isReturnVisitor: returning,
      isInternal: internal,
    });

    // ── Scroll depth + time on page ──────────────────────────────────
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
        occurredAt: new Date().toISOString(),
      });
    }

    window.addEventListener('beforeunload', sendEnd);
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'hidden') sendEnd();
    });

    // ── Section visibility ───────────────────────────────────────────
    // Tags sections with data-section="name" or <section id="name">
    if (typeof IntersectionObserver !== 'undefined') {
      var sectionEls = document.querySelectorAll('[data-section], section[id]');
      if (sectionEls.length) {
        var sectionObs = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              var name = entry.target.dataset.section || entry.target.id || 'section';
              post('/event', { sessionId: sid, type: 'section_view', name: name, occurredAt: new Date().toISOString() });
              sectionObs.unobserve(entry.target);
            }
          });
        }, { threshold: 0.25 });
        sectionEls.forEach(function (el) { sectionObs.observe(el); });
      }
    }

    // ── External link click tracking ─────────────────────────────────
    document.addEventListener('click', function (e) {
      var anchor = e.target && e.target.closest ? e.target.closest('a') : null;
      if (!anchor || !anchor.href) return;
      var href = anchor.href;
      var isExternal = /^https?:\/\//.test(href) && href.indexOf(window.location.origin) !== 0;
      if (isExternal) {
        var label = (anchor.textContent || '').trim().slice(0, 80) || href.slice(0, 80);
        post('/event', {
          sessionId: sid,
          type: 'link_click',
          name: label,
          metadata: { url: href, isExternal: true },
          occurredAt: new Date().toISOString(),
        });
      }
    });

    // ── Form funnel ──────────────────────────────────────────────────
    var forms = document.querySelectorAll('form');
    forms.forEach(function (form) {
      var formName = form.dataset.trackForm || form.getAttribute('name') || form.id || 'form';
      var started = false;
      var submitted = false;

      if (typeof IntersectionObserver !== 'undefined') {
        var fobs = new IntersectionObserver(function (entries) {
          if (entries[0].isIntersecting) {
            post('/event', { sessionId: sid, type: 'form_view', name: formName, occurredAt: new Date().toISOString() });
            fobs.disconnect();
          }
        }, { threshold: 0.5 });
        fobs.observe(form);
      }

      form.addEventListener('focusin', function () {
        if (!started) {
          started = true;
          post('/event', { sessionId: sid, type: 'form_start', name: formName, occurredAt: new Date().toISOString() });
        }
      });

      form.addEventListener('submit', function () {
        submitted = true;
        post('/event', { sessionId: sid, type: 'form_submit', name: formName, occurredAt: new Date().toISOString() });
      });

      window.addEventListener('beforeunload', function () {
        if (started && !submitted) {
          post('/event', { sessionId: sid, type: 'form_abandon', name: formName, occurredAt: new Date().toISOString() });
        }
      });
    });

    // ── JS error tracking ────────────────────────────────────────────
    window.addEventListener('error', function (e) {
      post('/event', {
        sessionId: sid,
        type: 'js_error',
        name: (e.message || 'Error').slice(0, 200),
        metadata: {
          file: e.filename ? e.filename.split('/').pop() : null,
          line: e.lineno || null,
        },
        occurredAt: new Date().toISOString(),
      });
    });

    // ── Page load time ───────────────────────────────────────────────
    if (document.readyState === 'complete') {
      setTimeout(function () { sendPageLoad(sid); }, 0);
    } else {
      window.addEventListener('load', function () {
        setTimeout(function () { sendPageLoad(sid); }, 0);
      });
    }
  }

  function trackClick(name) {
    if (BOT.test(navigator.userAgent)) return;
    post('/event', {
      sessionId: getSessionId(),
      type: 'cta_click',
      name: name,
      occurredAt: new Date().toISOString(),
    });
  }

  function trackConversion(name, metadata) {
    if (BOT.test(navigator.userAgent)) return;
    post('/event', {
      sessionId: getSessionId(),
      type: 'conversion',
      name: name,
      metadata: metadata || null,
      occurredAt: new Date().toISOString(),
    });
  }

  window.initAnalytics = initAnalytics;
  window.trackClick = trackClick;
  window.trackConversion = trackConversion;
})();
