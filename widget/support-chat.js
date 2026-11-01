/*
 * Support chat widget. No dependencies, no build step, no cookies.
 *
 * Paste before </body> on any site (Shopify theme, WordPress, Webflow, GHL funnel):
 *
 *   <script src="/path/to/support-chat.js"
 *           data-endpoint="https://YOUR-N8N-HOST/webhook/support-chat"
 *           data-brand="Example Co"
 *           data-color="#1f3a5f"
 *           data-greeting="Hi! Ask me about delivery, returns or your order."
 *           defer></script>
 *
 * It posts { sessionId, message, history } to the n8n "Website support chat"
 * workflow and shows the { reply } it returns. Replies are rendered as text,
 * never as HTML, with links made clickable.
 */
(function () {
  'use strict';
  var script = document.currentScript;
  if (!script || !script.dataset.endpoint) return;
  var ENDPOINT = script.dataset.endpoint;
  var BRAND = script.dataset.brand || 'Support';
  var COLOR = script.dataset.color || '#1f3a5f';
  var GREETING = script.dataset.greeting || 'Hi! Ask me about delivery, returns or your order.';
  var FALLBACK = script.dataset.fallback || 'Sorry, I could not connect just now. Please try again in a moment.';

  function store(kind) { try { return window[kind]; } catch (e) { return null; } }
  var local = store('localStorage'), session = store('sessionStorage');
  function get(s, k) { try { return s ? s.getItem(k) : null; } catch (e) { return null; } }
  function set(s, k, v) { try { if (s) s.setItem(k, v); } catch (e) { /* private mode: carry on without */ } }

  var sessionId = get(local, 'sc-session');
  if (!sessionId) {
    sessionId = 's-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    set(local, 'sc-session', sessionId);
  }
  var history = [];
  try { history = JSON.parse(get(session, 'sc-history') || '[]'); } catch (e) { history = []; }

  var css = [
    '.sc-root{--sc:' + COLOR + ';position:fixed;right:16px;bottom:16px;z-index:2147483000;font:15px/1.45 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:#1a1a1a}',
    '.sc-launch{background:var(--sc);color:#fff;border:0;border-radius:999px;padding:12px 18px;font:inherit;font-weight:600;cursor:pointer;box-shadow:0 6px 20px rgba(0,0,0,.18)}',
    '.sc-launch:focus-visible,.sc-send:focus-visible,.sc-close:focus-visible{outline:3px solid #000;outline-offset:2px}',
    '.sc-panel{display:none;flex-direction:column;width:min(370px,calc(100vw - 32px));height:min(540px,calc(100vh - 100px));background:#fff;border-radius:16px;box-shadow:0 12px 40px rgba(0,0,0,.22);overflow:hidden}',
    '.sc-open .sc-panel{display:flex}.sc-open .sc-launch{display:none}',
    '.sc-head{background:var(--sc);color:#fff;padding:14px 16px;display:flex;align-items:center;justify-content:space-between;font-weight:600}',
    '.sc-close{background:transparent;border:0;color:#fff;font-size:22px;line-height:1;cursor:pointer;padding:2px 6px}',
    '.sc-log{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:8px;background:#f6f6f4}',
    '.sc-msg{max-width:85%;padding:9px 12px;border-radius:14px;white-space:pre-wrap;word-wrap:break-word}',
    '.sc-bot{background:#fff;border:1px solid #e4e4e0;align-self:flex-start;border-bottom-left-radius:4px}',
    '.sc-user{background:var(--sc);color:#fff;align-self:flex-end;border-bottom-right-radius:4px}',
    '.sc-msg a{color:inherit;text-decoration:underline}',
    '.sc-typing{color:#666;font-style:italic}',
    '.sc-form{display:flex;gap:8px;padding:10px;border-top:1px solid #e4e4e0;background:#fff}',
    '.sc-input{flex:1;border:1px solid #ccc;border-radius:10px;padding:9px 11px;font:inherit;min-width:0}',
    '.sc-send{background:var(--sc);color:#fff;border:0;border-radius:10px;padding:0 14px;font:inherit;font-weight:600;cursor:pointer}',
    '.sc-send[disabled]{opacity:.5;cursor:default}',
    '.sc-note{font-size:12px;color:#666;padding:0 12px 10px;background:#fff}'
  ].join('');

  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  var root = document.createElement('div');
  root.className = 'sc-root';
  root.innerHTML =
    '<button class="sc-launch" type="button" aria-expanded="false">Chat with us</button>' +
    '<section class="sc-panel" role="dialog" aria-label="">' +
      '<div class="sc-head"><span class="sc-title"></span><button class="sc-close" type="button" aria-label="Close chat">&times;</button></div>' +
      '<div class="sc-log" aria-live="polite"></div>' +
      '<form class="sc-form"><label class="sc-sr" style="position:absolute;left:-9999px" for="sc-input">Your message</label>' +
        '<input class="sc-input" id="sc-input" maxlength="1000" autocomplete="off" placeholder="Type your question">' +
        '<button class="sc-send" type="submit">Send</button></form>' +
      '<div class="sc-note">Automated assistant. A person picks up anything it can\'t answer.</div>' +
    '</section>';
  document.body.appendChild(root);

  var launch = root.querySelector('.sc-launch');
  var panel = root.querySelector('.sc-panel');
  var log = root.querySelector('.sc-log');
  var form = root.querySelector('.sc-form');
  var input = root.querySelector('.sc-input');
  var send = root.querySelector('.sc-send');
  root.querySelector('.sc-title').textContent = BRAND;
  panel.setAttribute('aria-label', BRAND + ' support chat');

  // Text only. URLs become links; nothing in a reply is ever parsed as HTML.
  function render(el, text) {
    var parts = String(text).split(/(https?:\/\/[^\s<>"']+)/g);
    parts.forEach(function (p, i) {
      if (i % 2 === 1) {
        var url = p.replace(/[.,;:!?)]+$/, ''), rest = p.slice(url.length);
        var a = document.createElement('a');
        a.href = url; a.textContent = url; a.target = '_blank'; a.rel = 'noopener noreferrer';
        el.appendChild(a);
        if (rest) el.appendChild(document.createTextNode(rest));
      } else if (p) el.appendChild(document.createTextNode(p));
    });
  }

  function add(role, text, extraClass) {
    var el = document.createElement('div');
    el.className = 'sc-msg ' + (role === 'user' ? 'sc-user' : 'sc-bot') + (extraClass ? ' ' + extraClass : '');
    render(el, text);
    log.appendChild(el);
    log.scrollTop = log.scrollHeight;
    return el;
  }

  function remember(role, text) {
    history.push({ role: role, text: text });
    history = history.slice(-12);
    set(session, 'sc-history', JSON.stringify(history));
  }

  add('bot', GREETING);
  history.forEach(function (t) { add(t.role, t.text); });

  function toggle(open) {
    root.classList.toggle('sc-open', open);
    launch.setAttribute('aria-expanded', String(open));
    if (open) input.focus(); else launch.focus();
  }
  launch.addEventListener('click', function () { toggle(true); });
  root.querySelector('.sc-close').addEventListener('click', function () { toggle(false); });
  root.addEventListener('keydown', function (e) { if (e.key === 'Escape') toggle(false); });

  var busy = false;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var text = input.value.trim();
    if (!text || busy) return;
    busy = true; send.disabled = true; input.value = '';
    add('user', text);
    var typing = add('bot', 'Typing…', 'sc-typing');
    var payload = { sessionId: sessionId, message: text, history: history.slice(-6) };
    remember('user', text);

    var controller = 'AbortController' in window ? new AbortController() : null;
    var timer = setTimeout(function () { if (controller) controller.abort(); }, 25000);
    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller ? controller.signal : undefined
    })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (data) {
        var reply = data && typeof data.reply === 'string' && data.reply.trim() ? data.reply : FALLBACK;
        typing.remove();
        add('bot', reply);
        remember('bot', reply);
      })
      .catch(function () { typing.remove(); add('bot', FALLBACK); })
      .then(function () { clearTimeout(timer); busy = false; send.disabled = false; input.focus(); });
  });
})();
