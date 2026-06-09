/* ============================================================
   KEITH BROOKS — DESIGN SYSTEM / interactions
   Theme · cursor · scroll progress · reveal · active section nav.
   Requires DOM nodes: #_cur #_ring #scroll-prog #back-top #nav #tt-cb
   Optional: [data-section-nav] rail with <a href="#id"> children.
   ============================================================ */
(function(){
'use strict';
var RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var root = document.documentElement;

/* ---------- THEME (shared key with homepage) ---------- */
var cb = document.getElementById('tt-cb');
var theme = localStorage.getItem('kb-theme') || 'light';
function applyTheme(t){
  root.setAttribute('data-theme', t);
  if (cb) cb.checked = (t === 'dark');
  localStorage.setItem('kb-theme', t);
  theme = t;
}
applyTheme(theme);
if (cb) cb.addEventListener('change', function(){ applyTheme(cb.checked ? 'dark' : 'light'); });

/* ---------- CURSOR ---------- */
if (!RM && window.matchMedia('(hover:hover)').matches) {
  var $c = document.getElementById('_cur');
  var $r = document.getElementById('_ring');
  if ($c && $r) {
    var mx=0,my=0,rx=0,ry=0;
    window.addEventListener('mousemove', function(e){
      mx=e.clientX; my=e.clientY; $c.style.left=mx+'px'; $c.style.top=my+'px';
    }, {passive:true});
    (function raf(){ rx+=(mx-rx)*0.12; ry+=(my-ry)*0.12; $r.style.left=rx+'px'; $r.style.top=ry+'px'; requestAnimationFrame(raf); })();
    document.querySelectorAll('a,button,label,.hovers').forEach(function(el){
      el.addEventListener('mouseenter', function(){ document.body.classList.add('ch'); });
      el.addEventListener('mouseleave', function(){ document.body.classList.remove('ch'); });
    });
  }
  var ctaZone = document.querySelector('[data-cta-zone]');
  if (ctaZone) {
    new IntersectionObserver(function(es){
      es.forEach(function(e){ document.body.classList.toggle('cta-zone', e.isIntersecting); });
    }, {threshold:0.15}).observe(ctaZone);
  }
}

/* ---------- SMOOTH ANCHOR SCROLL ---------- */
var NAV_H = 80;
function smoothScrollTo(target){
  if (!target) return;
  var top = window.scrollY + target.getBoundingClientRect().top - NAV_H;
  window.scrollTo(RM ? {top:top} : {top:top, behavior:'smooth'});
}
document.querySelectorAll('a[href^="#"]').forEach(function(link){
  link.addEventListener('click', function(e){
    var id = link.getAttribute('href').slice(1);
    if (!id) return;
    var target = document.getElementById(id);
    if (target){ e.preventDefault(); smoothScrollTo(target); history.pushState(null,'','#'+id); }
  });
});

/* ---------- SCROLL: nav bg, progress, back-to-top ---------- */
var nav = document.getElementById('nav');
var prog = document.getElementById('scroll-prog');
var backTop = document.getElementById('back-top');
function onScroll(){
  var y = window.scrollY;
  if (nav) nav.classList.toggle('sc', y > 48);
  if (prog){ var docH = document.documentElement.scrollHeight - window.innerHeight; prog.style.width = (docH>0 ? y/docH*100 : 0) + '%'; }
  if (backTop) backTop.classList.toggle('visible', y > window.innerHeight*0.5);
}
window.addEventListener('scroll', onScroll, {passive:true});
if (backTop) backTop.addEventListener('click', function(){ window.scrollTo(RM?{top:0}:{top:0,behavior:'smooth'}); });
onScroll();

/* ---------- REVEAL ---------- */
var revealObs = new IntersectionObserver(function(es){
  es.forEach(function(e){
    if (e.isIntersecting){ e.target.classList.add('vi','vis','in'); revealObs.unobserve(e.target); }
  });
}, {threshold:0.07, rootMargin:'0px 0px -40px 0px'});
document.querySelectorAll('.rv,.section-fade').forEach(function(el){ revealObs.observe(el); });

/* ---------- ACTIVE SECTION NAV (rail + top nav) ---------- */
var rail = document.querySelector('[data-section-nav]');
var railLinks = rail ? Array.from(rail.querySelectorAll('a')) : [];
var topLinks  = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));
var watched = Array.from(document.querySelectorAll('[data-section]'));
var lastId = null;
function activeSection(){
  var best=null, bestScore=-Infinity, wh=window.innerHeight;
  watched.forEach(function(el){
    var r = el.getBoundingClientRect();
    var visTop=Math.max(r.top,NAV_H), visBottom=Math.min(r.bottom,wh);
    var visible=Math.max(0,visBottom-visTop);
    var score=visible - Math.max(0,r.top-NAV_H)*0.1;
    if (score>bestScore){ bestScore=score; best=el.id; }
  });
  return best;
}
function updateSectionNav(){
  if (!watched.length) return;
  var id = activeSection();
  if (id === lastId) return; lastId = id;
  railLinks.forEach(function(a){ a.classList.toggle('active', a.getAttribute('href')==='#'+id); });
  topLinks.forEach(function(a){ a.classList.toggle('active', a.getAttribute('href')==='#'+id); });
}
window.addEventListener('scroll', updateSectionNav, {passive:true});
updateSectionNav();

/* ---------- COUNT-UP for [data-val] numbers ---------- */
var counters = document.querySelectorAll('[data-val]');
if (counters.length){
  var cObs = new IntersectionObserver(function(es){
    es.forEach(function(e){
      if (!e.isIntersecting) return;
      var el = e.target; cObs.unobserve(el);
      var end = parseFloat(el.getAttribute('data-val'));
      var dec = (el.getAttribute('data-dec')==='1');
      var pre = el.getAttribute('data-pre')||'';
      var suf = el.getAttribute('data-suf')||'';
      if (RM){ el.textContent = pre + (dec?end.toFixed(1):end) + suf; return; }
      var dur=1100, t0=null;
      function step(ts){ if(!t0)t0=ts; var p=Math.min((ts-t0)/dur,1); var e2=1-Math.pow(1-p,3); var v=end*e2;
        el.textContent = pre + (dec?v.toFixed(1):Math.round(v)) + suf;
        if(p<1) requestAnimationFrame(step); }
      requestAnimationFrame(step);
    });
  }, {threshold:0.5});
  counters.forEach(function(c){ cObs.observe(c); });
}
})();
