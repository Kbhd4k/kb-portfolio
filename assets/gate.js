/* ============================================================
   KEITH BROOKS — CASE STUDY PASSWORD GATE
   Soft, client-side gate for case-study pages. Loaded in <head>
   so it runs before <body> paints — no flash of protected content.
   Unlock persists for the browser session (all 3 studies share it).
   NOTE: client-side only — keeps casual visitors & crawlers out,
   not a substitute for server-side auth on truly sensitive material.
   ============================================================ */
(function () {
  'use strict';
  var KEY = 'kb-cs-unlock';
  var PASS = 'MaximumEffort@ux';

  // Already unlocked this session? bail — page shows normally.
  try { if (sessionStorage.getItem(KEY) === '1') return; } catch (e) {}

  var docEl = document.documentElement;
  var theme = 'light';
  try { theme = localStorage.getItem('kb-theme') || 'light'; } catch (e) {}

  // Hide the real page until unlocked (body may not exist yet).
  var pre = document.createElement('style');
  pre.textContent =
    'html.kb-lock body{visibility:hidden!important}' +
    'html.kb-lock{overflow:hidden}' +
    '#kb-gate *{box-sizing:border-box}';
  docEl.appendChild(pre);
  docEl.classList.add('kb-lock');

  var dark = theme === 'dark';
  var bg     = dark ? '#0E0E0E' : '#F4F4F4';
  var card   = dark ? '#1A1A1A' : '#FFFFFF';
  var ink    = dark ? '#F0F0F0' : '#0E0E0E';
  var muted  = dark ? '#888888' : '#5C5C5C';
  var dim    = dark ? '#666666' : '#9A9A9A';
  var border = dark ? 'rgba(220,220,220,.12)' : 'rgba(17,17,17,.10)';
  var field  = dark ? '#0E0E0E' : '#F4F4F4';
  var accent = '#E63020';

  var gate = document.createElement('div');
  gate.id = 'kb-gate';
  gate.setAttribute('role', 'dialog');
  gate.setAttribute('aria-modal', 'true');
  gate.setAttribute('aria-label', 'Password protected case study');
  gate.style.cssText =
    'position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;' +
    'justify-content:center;padding:24px;background:' + bg + ';' +
    "font-family:'Epilogue',-apple-system,BlinkMacSystemFont,sans-serif;" +
    'visibility:visible;opacity:1;';

  gate.innerHTML =
    '<div style="position:absolute;top:0;left:0;height:2px;width:100%;background:' + accent + '"></div>' +
    '<div id="kb-gate-card" style="width:100%;max-width:440px;background:' + card + ';border:1px solid ' + border + ';' +
      'border-radius:20px;padding:46px 42px;text-align:center;transition:transform .12s ease;' +
      'box-shadow:0 30px 80px -20px rgba(0,0,0,' + (dark ? '.7' : '.18') + ')">' +

      '<div style="font-family:\'Bebas Neue\',sans-serif;font-size:26px;letter-spacing:.06em;color:' + ink + ';margin-bottom:30px">' +
        'KEITH<span style="color:' + accent + '">.</span></div>' +

      '<div style="width:54px;height:54px;margin:0 auto 22px;border-radius:50%;border:1.5px solid ' + border + ';' +
        'display:flex;align-items:center;justify-content:center">' +
        '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="' + accent + '" stroke-width="2" ' +
        'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></div>' +

      '<div style="font-family:\'DM Mono\',monospace;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:' + muted + ';margin-bottom:12px">Protected Work</div>' +
      '<h1 style="font-family:\'Bebas Neue\',sans-serif;font-size:46px;line-height:.94;letter-spacing:.02em;color:' + ink + ';margin:0 0 14px">CASE STUDY<br>LOCKED</h1>' +
      '<p style="font-size:14.5px;line-height:1.6;font-weight:300;color:' + muted + ';margin:0 auto 28px;max-width:320px">This case study is password protected. Enter the password to view it — ask Keith if you need access.</p>' +

      '<form id="kb-gate-form" autocomplete="off" style="display:flex;flex-direction:column;gap:12px">' +
        '<input id="kb-gate-input" type="password" placeholder="Enter password" aria-label="Password" autocomplete="current-password" ' +
          'style="width:100%;padding:15px 18px;border-radius:12px;border:1px solid ' + border + ';background:' + field + ';' +
          'color:' + ink + ';font-family:\'DM Mono\',monospace;font-size:14px;letter-spacing:.04em;outline:none;text-align:center;transition:border-color .2s"/>' +
        '<button id="kb-gate-btn" type="submit" ' +
          'style="width:100%;padding:15px 18px;border:none;border-radius:12px;background:' + accent + ';color:#fff;' +
          'font-family:\'DM Mono\',monospace;font-size:12px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;cursor:pointer;transition:transform .15s ease,filter .2s">Unlock ↗</button>' +
      '</form>' +

      '<div id="kb-gate-err" role="alert" style="height:16px;margin-top:14px;font-family:\'DM Mono\',monospace;font-size:11px;letter-spacing:.06em;color:' + accent + ';opacity:0">Incorrect password — try again</div>' +

      '<a href="index.html" style="display:inline-block;margin-top:18px;font-family:\'DM Mono\',monospace;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:' + dim + ';text-decoration:none;transition:color .2s" ' +
        'onmouseover="this.style.color=\'' + accent + '\'" onmouseout="this.style.color=\'' + dim + '\'">← Back to portfolio</a>' +
    '</div>';

  function mount() {
    docEl.appendChild(gate);

    var form  = document.getElementById('kb-gate-form');
    var input = document.getElementById('kb-gate-input');
    var err   = document.getElementById('kb-gate-err');
    var btn   = document.getElementById('kb-gate-btn');
    var cardEl = document.getElementById('kb-gate-card');

    input.addEventListener('focus', function () { input.style.borderColor = accent; });
    input.addEventListener('blur',  function () { input.style.borderColor = border; });
    btn.addEventListener('mouseenter', function () { btn.style.filter = 'brightness(1.08)'; });
    btn.addEventListener('mouseleave', function () { btn.style.filter = 'none'; });

    function fail() {
      err.style.opacity = '1';
      input.value = '';
      // shake
      var n = 0, dir = 1;
      var iv = setInterval(function () {
        cardEl.style.transform = 'translateX(' + (dir * 6) + 'px)';
        dir *= -1; n++;
        if (n > 5) { clearInterval(iv); cardEl.style.transform = 'translateX(0)'; }
      }, 45);
      input.focus();
    }

    function unlock() {
      try { sessionStorage.setItem(KEY, '1'); } catch (e) {}
      docEl.classList.remove('kb-lock');
      if (gate.parentNode) gate.parentNode.removeChild(gate);
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (input.value === PASS) unlock();
      else fail();
    });

    input.addEventListener('input', function () { err.style.opacity = '0'; });
    setTimeout(function () { input.focus(); }, 120);
  }

  if (document.body) mount();
  else document.addEventListener('DOMContentLoaded', mount);
})();
