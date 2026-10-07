/* 貼貼 Pastee 官網的互動
   - 首屏：卡片像紙一樣放到桌上，47 從 0 數上來
   - 自動分類：47 筆從一堆亂放，隨捲動排進八種類型（滑動驅動，往回捲就倒放）
   - 搜尋：用跟 App 一樣的排序規則搜週三這 47 筆
   - 在這頁複製任何東西：會被分類、遮罩、計數，跟 App 一樣；只存在這個分頁的記憶體裡 */
(() => {
  'use strict';
  const doc = document.documentElement;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const G = window.gsap;
  const ST = window.ScrollTrigger;
  if (G && ST) G.registerPlugin(ST);

  const KINDS = ['text', 'link', 'code', 'image', 'color', 'email', 'file', 'rich'];
  const KIND_LABEL = { text: '文字', rich: '富文字', link: '連結', code: '程式碼', color: '顏色', email: 'Email', image: '圖片', file: '檔案' };
  const KIND_ICON = { text: 'i-text', rich: 'i-rich', link: 'i-link', code: 'i-code', color: 'i-color', email: 'i-mail', image: 'i-image', file: 'i-file' };

  // ───────── 週三的 47 筆 ─────────
  // [時間, 來源, 類型, 標題, 內容, 選項]
  const RAW = [
    ['09:12', 'Safari', 'link', 'App Intents 文件', 'developer.apple.com/documentation/appintents'],
    ['09:20', 'Slack', 'text', '', '收到，我下午把 build 傳上 TestFlight'],
    ['09:31', 'Slack', 'link', 'KO-482 搜尋框打字會卡', 'linear.app/studio-ko/issue/KO-482'],
    ['09:40', 'Figma', 'color', '', '#FF7B4F', { sw: '#FF7B4F' }],
    ['10:03', 'Xcode', 'code', 'debounce 工具函式', 'func debounce(_ interval: TimeInterval, action: @escaping () -> Void)', { pin: 1, use: 14 }],
    ['10:11', '備忘錄', 'text', '', '會議室 B 的 Wi-Fi：studio-ko-5G'],
    ['10:20', 'Safari', 'link', 'WidgetKit 文件', 'developer.apple.com/documentation/widgetkit'],
    ['10:36', '終端機', 'code', '', "xcodebuild test -scheme Pastee -destination 'platform=iOS Simulator,name=iPhone 17'"],
    ['10:48', 'Figma', 'color', '', '#2F6FEB', { sw: '#2F6FEB' }],
    ['11:02', 'LINE', 'link', '鼎泰豐 信義店', 'maps.app.goo.gl/7xQpZ3Lk'],
    ['11:15', '郵件', 'email', '', 'ken.wu@studio-ko.tw'],
    ['11:26', '截圖', 'image', '高鐵車票截圖', '0812 車次 7 車 12A　台北 → 左營'],
    ['11:40', 'Slack', 'text', '', 'WidgetKit 的 timeline 要記得 reloadTimelines', { use: 3 }],
    ['11:48', 'Xcode', 'code', '', 'WidgetCenter.shared.reloadTimelines(ofKind: "Recent")'],
    ['12:02', '截圖', 'image', '收據截圖', '合計 NT$1,280'],
    ['12:15', 'LINE', 'text', '', '午餐：牛肉麵兩碗、燙青菜、滷蛋'],
    ['12:30', 'Finder', 'file', 'Pastee-Press-Kit.zip', '4.2 MB'],
    ['12:47', 'Safari', 'link', '台灣高鐵 網路訂票', 'irs.thsrc.com.tw'],
    ['13:05', '行事曆', 'text', '', '週三 15:00 產品同步會議　地點：會議室 B　記得帶上一季的留存數據', { pin: 1, use: 5 }],
    ['13:15', 'Safari', 'image', 'logo-draft-3.png', '1024 × 1024'],
    ['13:20', '郵件', 'text', '', '統一編號 24536817'],
    ['13:38', '備忘錄', 'text', '', '訂位代號 K7Q2MZ'],
    ['13:52', '終端機', 'code', '', 'git rebase -i HEAD~3'],
    ['14:02', 'Keynote', 'text', '', '本季留存率從 31.4% 提升到 38.9%'],
    ['14:10', 'Safari', 'link', 'swift-async-algorithms', 'github.com/apple/swift-async-algorithms'],
    ['14:20', 'Xcode', 'color', '', '#1B1D22', { sw: '#1B1D22' }],
    ['14:32', '備忘錄', 'text', '', '', { secret: 1 }],
    ['14:36', 'TablePlus', 'code', '', 'SELECT date, count(*) FROM clips GROUP BY date;'],
    ['14:48', 'Slack', 'text', '', '@Ken 簡報第 7 頁的圖表換成週資料'],
    ['14:55', 'Pages', 'rich', '本季重點', '搜尋命中率、留存、Mac 面板'],
    ['15:05', '截圖', 'image', '錯誤訊息截圖', 'Signing certificate expired'],
    ['15:22', '郵件', 'link', 'Pastee Web – Figma', 'figma.com/design/k2Fq/Pastee-Web'],
    ['15:40', '備忘錄', 'text', '', 'Wedding gift 清單：鍋具、咖啡機、香氛蠟燭'],
    ['15:48', '郵件', 'email', '', 'lin.yating@studio-ko.tw'],
    ['16:05', 'Safari', 'link', 'Search: Visible and Simple', 'nngroup.com/articles/search-visible-and-simple'],
    ['16:15', 'VS Code', 'color', '', 'rgb(57, 194, 166)', { sw: '#39C2A6' }],
    ['16:30', '郵件', 'text', '', '退貨編號 RMA-20261007-0193'],
    ['16:44', 'Xcode', 'code', '', '@Observable final class ClipStore'],
    ['16:58', '相機', 'image', '白板照片', 'Q4 規劃：搜尋、小工具、Mac 面板'],
    ['17:02', 'Safari', 'email', '', 'invoice@studio-ko.tw'],
    ['17:10', 'Safari', 'text', '', 'Liquid Glass：內容在下面，控制項浮在上面'],
    ['17:30', '終端機', 'code', '', 'brew upgrade --cask'],
    ['17:45', '備忘錄', 'rich', '會議記錄', '決議：週五前送審 1.0.1'],
    ['17:55', 'LINE', 'link', 'WWDC 回顧：Liquid Glass 實作', 'youtu.be/q8Wz3xV0bLk?t=94'],
    ['18:10', '截圖', 'image', '鎖定畫面截圖', '鎖定畫面 Widget 尺寸表'],
    ['18:25', '備忘錄', 'text', '', '週五前回覆：報價單 v3 第 4 項要拆開'],
    ['18:40', 'Finder', 'file', '報價單_v3.pdf', '248 KB'],
  ];
  let seq = 0;
  const clips = RAW.map(([time, app, kind, title, body, o = {}]) => ({
    id: ++seq, time, app, kind, title, body, pin: !!o.pin, use: o.use || 0, secret: !!o.secret, sw: o.sw || '', order: seq,
  }));

  // ───────── 小工具 ─────────
  const esc = (s) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const norm = (s) => s.normalize('NFKC').toLowerCase();
  const icon = (kind) => `<svg class="i"><use href="#${KIND_ICON[kind]}"/></svg>`;
  function mulberry32(a) {
    return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }

  // 導覽列捲動後加一條線
  const nav = $('.nav');
  const onScroll = () => nav && nav.classList.toggle('scrolled', scrollY > 8);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ───────── 搜尋：和 App 一樣的排序 ─────────
  // 完全相同 > 開頭 > 詞首 > 中間；釘選、常用、最近再往前；命中太少時比對縮寫（子序列）
  const isWordChar = (c) => /[\p{L}\p{N}]/u.test(c);
  const isUpper = (c) => c !== c.toLowerCase() && c === c.toUpperCase();
  function wordStart(orig, i) {
    if (i === 0) return true;
    const p = orig[i - 1], c = orig[i];
    if (!isWordChar(p)) return true;
    if (isUpper(c) && !isUpper(p)) return true;
    return false;
  }
  function fieldQuality(orig, tok) {
    if (!orig) return 0;
    const h = norm(orig);
    if (h === tok) return 4;
    if (h.startsWith(tok)) return 3;
    let i = h.indexOf(tok), best = 0;
    while (i >= 0) { best = Math.max(best, wordStart(orig, i) ? 2 : 1); if (best === 2) break; i = h.indexOf(tok, i + 1); }
    return best;
  }
  function subseq(orig, tok) {
    const h = norm(orig); const idx = []; let from = 0;
    for (const ch of tok) { const i = h.indexOf(ch, from); if (i < 0) return null; idx.push(i); from = i + 1; }
    return idx[idx.length - 1] - idx[0] + 1 <= Math.ceil(tok.length * 2.5) ? idx : null;
  }
  function search(query) {
    const q = norm(query).trim();
    const pool = clips.filter((c) => !c.secret);
    if (!q) return pool.slice().sort((a, b) => b.order - a.order).slice(0, 6).map((c) => ({ c }));
    const toks = q.split(/\s+/).filter(Boolean);
    const hits = [];
    for (const c of pool) {
      let score = 0, ok = true;
      for (const t of toks) {
        const s = Math.max(fieldQuality(c.title, t), fieldQuality(c.body, t), fieldQuality(c.app, t) ? 1 : 0);
        if (!s) { ok = false; break; }
        score += s * 10;
      }
      if (!ok) continue;
      score += (c.pin ? 4 : 0) + Math.min(c.use, 6) * 0.5 + c.order / 100;
      hits.push({ c, score, toks });
    }
    hits.sort((a, b) => b.score - a.score);
    if (hits.length < 2 && toks.length === 1 && toks[0].length >= 3) {
      for (const c of pool) {
        if (hits.some((h) => h.c === c)) continue;
        const field = c.title || c.body;
        const idx = subseq(field, toks[0]);
        if (idx) hits.push({ c, score: c.order / 100, sub: idx });
      }
    }
    return hits;
  }
  function mark(text, toks) {
    if (!toks || !toks.length || !text) return esc(text || '');
    const h = norm(text); const on = new Array(text.length).fill(false);
    for (const t of toks) { let i = h.indexOf(t); while (i >= 0) { for (let k = i; k < i + t.length && k < on.length; k++) on[k] = true; i = h.indexOf(t, i + t.length); } }
    return paint(text, on);
  }
  function paint(text, on) {
    let out = '', open = false;
    for (let i = 0; i < text.length; i++) {
      if (on[i] && !open) { out += '<u>'; open = true; }
      if (!on[i] && open) { out += '</u>'; open = false; }
      out += esc(text[i]);
    }
    return out + (open ? '</u>' : '');
  }

  const input = $('#q');
  const list = $('#results');
  const hitsEl = $('.hits');
  const rows = new Map();
  function rowHTML(h, i) {
    const c = h.c;
    const main = c.title || c.body;
    let mainHTML, metaHTML;
    if (h.sub) {
      const on = new Array(main.length).fill(false); h.sub.forEach((k) => { on[k] = true; });
      mainHTML = paint(main, on);
      metaHTML = esc((c.title ? c.body + ' · ' : '') + c.app + ' · ' + c.time);
    } else {
      mainHTML = mark(main, h.toks);
      metaHTML = (c.title ? mark(c.body, h.toks) + ' · ' : '') + esc(c.app + ' · ' + c.time);
    }
    const k = c.kind === 'color' && c.sw
      ? `<span class="k sw-k" style="--sw:${c.sw}" aria-hidden="true"></span>`
      : `<span class="k" aria-hidden="true">${icon(c.kind)}</span>`;
    const right = h.sub ? '<span class="why">縮寫比對</span>' : `<span class="key">${i === 0 ? '↩' : '⌘' + (i + 1)}</span>`;
    return `${k}<span class="tx"><span class="tt">${mainHTML}</span><span class="mm">${metaHTML}</span></span>${right}`;
  }
  function render(query) {
    if (!list) return;
    const hits = search(query);
    const shown = hits.slice(0, 6);
    hitsEl.textContent = query.trim() ? `${hits.length} 筆` : '最近';
    const before = new Map();
    rows.forEach((el, id) => before.set(id, el.getBoundingClientRect().top));
    const keep = new Set();
    const frag = document.createDocumentFragment();
    shown.forEach((h, i) => {
      let el = rows.get(h.c.id);
      if (!el) { el = document.createElement('li'); el.className = 'res'; rows.set(h.c.id, el); el.dataset.new = '1'; }
      el.style.setProperty('--tint', `var(--k-${h.c.kind})`);
      el.innerHTML = rowHTML(h, i);
      keep.add(h.c.id);
      frag.appendChild(el);
    });
    rows.forEach((el, id) => { if (!keep.has(id)) { el.remove(); rows.delete(id); } });
    list.querySelector('.empty')?.remove();
    list.appendChild(frag);
    if (!shown.length) {
      const li = document.createElement('li'); li.className = 'empty';
      li.textContent = '週三沒有複製過這個。換個字試試？';
      list.appendChild(li);
    }
    // FLIP：留下的滑到新位置，新加入的淡入
    if (G && !reduce) {
      rows.forEach((el, id) => {
        if (el.dataset.new) { delete el.dataset.new; G.fromTo(el, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.28, ease: 'power2.out' }); return; }
        const was = before.get(id); if (was == null) return;
        const dy = was - el.getBoundingClientRect().top;
        if (Math.abs(dy) > 1) G.fromTo(el, { y: dy }, { y: 0, duration: 0.36, ease: 'power3.out' });
      });
    } else rows.forEach((el) => delete el.dataset.new);
  }
  let typing = null;
  function stopTyping() { if (typing) { clearInterval(typing); typing = null; } }
  function typeOut(text) {
    stopTyping(); let i = 0; input.value = ''; render('');
    typing = setInterval(() => { i++; input.value = text.slice(0, i); render(input.value); if (i >= text.length) stopTyping(); }, 260);
  }
  if (input) {
    render('');
    input.addEventListener('input', () => { stopTyping(); render(input.value); });
    input.addEventListener('focus', stopTyping);
    $$('.try button').forEach((b) => b.addEventListener('click', () => { stopTyping(); input.value = b.dataset.q; render(input.value); }));
  }

  // ───────── 自動分類：47 筆從一堆排進八欄 ─────────
  const board = $('.board');
  const pile = $('.pile');
  const chips = [];
  let sortTL = null;
  const landing = [];
  function tallyLanded() {
    const n = Object.fromEntries(KINDS.map((k) => [k, 0]));
    landing.forEach(({ el, tw }) => { if (tw && tw.progress() > 0.8) n[el.dataset.kind]++; });
    $$('.col').forEach((col) => { const b = $('.n', col); const v = String(n[col.dataset.kind]); if (b.textContent !== v) b.textContent = v; });
  }
  const countByKind = Object.fromEntries(KINDS.map((k) => [k, 0]));
  function chipFor(c, fresh) {
    const el = document.createElement('span');
    el.className = 'chip' + (fresh ? ' fresh' : '');
    el.style.setProperty('--tint', `var(--k-${c.kind})`);
    el.dataset.kind = c.kind;
    el.dataset.slot = countByKind[c.kind]++;
    pile.appendChild(el);
    chips.push(el);
    return el;
  }
  function layout() {
    const w = pile.clientWidth, h = pile.clientHeight;
    const cs = getComputedStyle(board);
    const ch = parseFloat(cs.getPropertyValue('--chip-h')) || 15;
    const gap = parseFloat(cs.getPropertyValue('--chip-gap')) || 4;
    const colGap = parseFloat(getComputedStyle($('.cols')).columnGap) || 12;
    const cw = (w - colGap * 7) / 8;
    return { w, h, ch, gap, cw, colGap };
  }
  const rand = mulberry32(20261008);
  const seeds = [];
  function seedFor(i) { while (seeds.length <= i) seeds.push([rand(), rand(), rand()]); return seeds[i]; }
  const startPos = (el, i, L) => { const [a, b, r] = seedFor(i); return { x: a * (L.w - L.cw), y: b * (L.h * 0.62) + L.h * 0.02, rotation: (r - 0.5) * 70 }; };
  const endPos = (el, L) => { const k = KINDS.indexOf(el.dataset.kind); const s = +el.dataset.slot; return { x: k * (L.cw + L.colGap), y: L.h - (s + 1) * (L.ch + L.gap), rotation: 0 }; };
  function sizeChips(L) { chips.forEach((el) => { el.style.width = L.cw + 'px'; }); }

  function buildSort() {
    if (!board) return;
    clips.forEach((c) => chipFor(c));
    const L = layout(); sizeChips(L);
    if (!G || !ST || reduce) {
      chips.forEach((el) => { const p = endPos(el, L); el.style.transform = `translate(${p.x}px,${p.y}px)`; });
      addEventListener('resize', () => { const L2 = layout(); sizeChips(L2); chips.forEach((el) => { const p = endPos(el, L2); el.style.transform = `translate(${p.x}px,${p.y}px)`; }); });
      return;
    }
    const stage = $('.sort-stage');
    const short = matchMedia('(max-width: 640px)').matches;
    sortTL = G.timeline({
      defaults: { ease: 'power2.inOut' },
      scrollTrigger: { trigger: '.sort', start: () => `top ${nav ? nav.offsetHeight : 0}px`, end: short ? '+=110%' : '+=150%', pin: stage, scrub: 0.7, invalidateOnRefresh: true, anticipatePin: 1,
        onRefresh: () => sizeChips(layout()) },
    });
    sortTL.to({}, { duration: 1 }, 0);
    sortTL.eventCallback('onUpdate', tallyLanded);
    chips.forEach((el, i) => {
      const k = KINDS.indexOf(el.dataset.kind);
      const at = 0.06 + k * 0.045 + (+el.dataset.slot) * 0.012;
      sortTL.fromTo(el, { x: () => startPos(el, i, layout()).x, y: () => startPos(el, i, layout()).y, rotation: () => startPos(el, i, layout()).rotation },
        { x: () => endPos(el, layout()).x, y: () => endPos(el, layout()).y, rotation: 0, duration: 0.42 }, Math.min(at, 0.55));
      landing.push({ el, tw: sortTL.getTweensOf(el)[0] });
    });
    sortTL.fromTo('.cols', { opacity: 0.4 }, { opacity: 1, duration: 0.25, ease: 'none' }, 0.1);
    sortTL.fromTo('.perks li', { opacity: 0, y: 10 }, { opacity: 1, y: 0, stagger: 0.04, duration: 0.12, ease: 'power2.out' }, 0.8);
    tallyLanded();
  }

  // ───────── 在這一頁複製 ─────────
  const luhn = (d) => { let s = 0, alt = false; for (let i = d.length - 1; i >= 0; i--) { let n = +d[i]; if (alt) { n *= 2; if (n > 9) n -= 9; } s += n; alt = !alt; } return s % 10 === 0; };
  function sensitive(s) {
    const d = s.replace(/[\s-]/g, '');
    if (/^\d{13,19}$/.test(d) && luhn(d)) return true;
    if (/-----BEGIN [A-Z ]*PRIVATE KEY-----/.test(s)) return true;
    if (/^eyJ[\w-]+\.[\w-]+\.[\w-]+$/.test(s)) return true;
    if (/^(sk|pk|rk)[-_](live|test)[-_][A-Za-z0-9]{12,}$/.test(s) || /^(ghp|gho|ghs|github_pat)_[A-Za-z0-9_]{20,}$/.test(s) || /^AKIA[0-9A-Z]{16}$/.test(s) || /^xox[abprs]-[A-Za-z0-9-]{10,}$/.test(s)) return true;
    return false;
  }
  function classify(s) {
    const one = !s.includes('\n');
    if (one && /^(#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})|rgba?\([\d\s.,%]+\)|hsla?\([\d\s.,%deg]+\))$/i.test(s)) return 'color';
    if (one && /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(s)) return 'email';
    if (one && (/^https?:\/\/\S+$/i.test(s) || /^(www\.)?[a-z0-9-]+(\.[a-z0-9-]+)+\/\S*$/i.test(s))) return 'link';
    if (/[{};=<>()]/.test(s) && /(\bfunc\b|\bfunction\b|\bconst\b|\blet\b|\bvar\b|\bimport\b|\breturn\b|\bclass\b|=>|->|;\s*$|^\s*(SELECT|git|npm|brew|curl|cd)\b)/m.test(s)) return 'code';
    return 'text';
  }
  const countEl = $('[data-count]');
  let total = clips.length;
  const toast = $('#toast');
  let toastTimer = null;
  function showToast(kind, title, prev, n) {
    if (!toast) return;
    toast.style.setProperty('--tint', `var(--k-${kind})`);
    toast.querySelector('.tk-kind').innerHTML = icon(kind);
    toast.querySelector('.tk-title').textContent = title;
    toast.querySelector('.tk-prev').textContent = prev;
    toast.querySelector('.tk-n').textContent = n;
    const wasHidden = toast.hidden;
    toast.hidden = false;
    if (G && !reduce && wasHidden) G.fromTo(toast, { y: 16, opacity: 0, scale: 0.98 }, { y: 0, opacity: 1, scale: 1, duration: 0.42, ease: 'back.out(1.6)' });
    else if (G && !reduce) G.fromTo(toast, { scale: 0.985 }, { scale: 1, duration: 0.3, ease: 'back.out(3)' });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      if (G && !reduce) G.to(toast, { y: 10, opacity: 0, duration: 0.22, ease: 'power2.in', onComplete: () => { toast.hidden = true; } });
      else toast.hidden = true;
    }, 3600);
  }
  function bump(to) {
    if (!countEl) return;
    if (!G || reduce) { countEl.textContent = to; return; }
    const o = { v: +countEl.textContent };
    G.to(o, { v: to, duration: 0.35, ease: 'power2.out', onUpdate: () => { countEl.textContent = Math.round(o.v); } });
    G.fromTo(countEl, { scale: 1.28, y: -4 }, { scale: 1, y: 0, duration: 0.6, ease: 'back.out(3)' });
  }
  function capture(text) {
    const secret = sensitive(text);
    const existing = clips.find((c) => !c.secret && c.body === text);
    if (existing) {
      existing.order = ++seq; existing.time = '剛剛';
      if (input && !input.value) render('');
      showToast(existing.kind, '已經有這一筆，提到最前面', text.replace(/\s+/g, ' ').slice(0, 80), `第 ${total} 筆`);
      return;
    }
    const kind = secret ? 'text' : classify(text);
    const c = { id: ++seq, time: '剛剛', app: '這個網頁', kind, title: '', body: secret ? '' : text, pin: false, use: 0, secret, sw: kind === 'color' ? text : '', order: seq };
    clips.push(c);
    total += 1;
    bump(total);
    const title = secret ? '已存進貼貼 · 已遮罩' : `已存進貼貼 · ${KIND_LABEL[kind]}`;
    const prev = secret ? '••••••••' : text.replace(/\s+/g, ' ').slice(0, 80);
    showToast(kind, title, prev, `第 ${total} 筆`);
    if (input && !input.value) render('');
    // 分類欄多一格
    if (board) {
      const el = chipFor(c, true);
      const L = layout(); el.style.width = L.cw + 'px';
      const n = $(`.col[data-kind="${kind}"] .n`);
      if (sortTL) {
        const i = chips.length - 1;
        sortTL.fromTo(el, { x: () => startPos(el, i, layout()).x, y: () => startPos(el, i, layout()).y, rotation: () => startPos(el, i, layout()).rotation },
          { x: () => endPos(el, layout()).x, y: () => endPos(el, layout()).y, rotation: 0, duration: 0.3 }, 0.6);
        landing.push({ el, tw: sortTL.getTweensOf(el)[0] });
        const p = sortTL.progress();
        sortTL.progress(0, true).progress(p, true);
        tallyLanded();
      } else {
        const p = endPos(el, L); el.style.transform = `translate(${p.x}px,${p.y}px)`;
        if (n) n.textContent = countByKind[kind];
      }
    }
  }
  document.addEventListener('copy', () => {
    const a = document.activeElement;
    let text = '';
    if (a && (a.tagName === 'INPUT' || a.tagName === 'TEXTAREA') && typeof a.selectionStart === 'number') text = a.value.slice(a.selectionStart, a.selectionEnd);
    else text = String(getSelection());
    text = text.trim();
    if (text) capture(text.slice(0, 4000));
  });

  // ───────── 動效 ─────────
  function ready() { doc.classList.add('ready'); }
  buildSort();
  if (!G || reduce) {
    ready();
    if (!G) return;
  }
  if (reduce) {
    const m = $('.rd-num'); if (m) { $('.g', m).style.opacity = 0; }
    return;
  }

  // 首屏：主角先到，卡片按時間依序放到桌上（紙：先快後慢，帶一點旋轉後擺正）
  const tiles = $$('.t').filter((t) => getComputedStyle(t).display !== 'none').sort((a, b) => a.dataset.t - b.dataset.t);
  const r2 = mulberry32(7);
  const intro = G.timeline({ defaults: { ease: 'expo.out' } });
  intro.from('.head .eyebrow', { opacity: 0, y: 8, duration: 0.5 }, 0)
    .from('h1 .ln', { opacity: 0, yPercent: 40, duration: 0.7, stagger: 0.08 }, 0.05)
    .from('.head .lede, .head .cta, .head .hint', { opacity: 0, y: 12, duration: 0.6, stagger: 0.06 }, 0.25)
    .from(tiles, { opacity: 0, y: -24, scale: 1.03, rotation: () => (r2() - 0.5) * 7, duration: 0.6, ease: 'power3.out', stagger: 0.07 }, 0.1);
  if (countEl) { const o = { v: 0 }; intro.to(o, { v: 47, duration: 0.9, ease: 'power2.out', onUpdate: () => { if (+countEl.textContent <= 47) countEl.textContent = Math.round(o.v); } }, 0.2); }
  ready();

  const once = (trigger, fn, start = 'top 90%') => ST.create({ trigger, start, once: true, onEnter: fn });

  // 標題：從下方升起、字距從略鬆收緊
  $$('h2.display').forEach((h) => {
    if (h.closest('.sort')) return;
    G.set(h, { opacity: 0, y: 26, letterSpacing: '0.02em' });
    once(h, () => G.to(h, { opacity: 1, y: 0, letterSpacing: '-0.01em', duration: 0.8, ease: 'expo.out' }), 'top 94%');
  });

  // 搜尋：規則沿閱讀方向展開；面板帶重量落下；第一次看到時自己打 wdgt
  G.set('.rules li', { opacity: 0, x: -12 });
  once('.rules', () => G.to('.rules li', { opacity: 1, x: 0, duration: 0.5, stagger: 0.07, ease: 'power3.out' }), 'top 97%');
  G.set('.panel', { opacity: 0, y: 36 });
  once('.panel', () => G.to('.panel', { opacity: 1, y: 0, duration: 0.7, ease: 'back.out(1.15)' }), 'top 95%');
  once('.panel', () => { if (input && !input.value && document.activeElement !== input) setTimeout(() => typeOut('wdgt'), 300); }, 'top 60%');

  // 轉換：追蹤參數先被劃掉，再收起來
  const strikes = $$('.clean-url s');
  if (strikes.length) {
    doc.classList.add('strike-anim');
    G.set(strikes, { '--strike': '0%' });
    once('.clean', () => {
      G.timeline()
        .to(strikes, { '--strike': '100%', duration: 0.35, stagger: 0.18, ease: 'power2.inOut' }, 0.2)
        .to(strikes, { width: 0, opacity: 0, duration: 0.5, stagger: 0.08, ease: 'power3.inOut' }, '+=0.6');
    }, 'top 70%');
  }

  // 圖片：遮罩從下往上揭開，同時從 1.06 回縮
  const reveal = (sel, delay = 0) => $$(sel).forEach((fig) => {
    const img = $('img', fig) || fig;
    G.set(fig, { clipPath: 'inset(100% 0% 0% 0% round 28px)' });
    G.set(img, { scale: 1.06 });
    once(fig, () => {
      G.to(fig, { clipPath: 'inset(0% 0% 0% 0% round 28px)', duration: 0.9, delay, ease: 'expo.out', clearProps: 'clipPath' });
      G.to(img, { scale: 1, duration: 1.1, delay, ease: 'expo.out' });
    }, 'top 95%');
  });
  reveal('.ph');

  // Mac：視窗先到，面板像真的一樣從底部滑上來
  if ($('.mac-desk')) {
    G.set('.mac-window', { y: 50, opacity: 0 });
    G.set('.mac-shelf', { yPercent: 110 });
    once('.mac-desk', () => {
      G.to('.mac-window', { y: 0, opacity: 1, duration: 0.8, ease: 'expo.out' });
      G.to('.mac-shelf', { yPercent: 0, duration: 0.75, delay: 0.35, ease: 'back.out(1.05)' });
    }, 'top 80%');
    G.set('.keys li', { opacity: 0, y: 10 });
    once('.keys', () => G.to('.keys li', { opacity: 1, y: 0, stagger: 0.06, duration: 0.45, ease: 'power3.out' }), 'top 97%');
  }
  G.set('.ways li', { opacity: 0, x: -10 });
  once('.ways', () => G.to('.ways li', { opacity: 1, x: 0, stagger: 0.06, duration: 0.45, ease: 'power3.out' }), 'top 95%');

  // 隱私：卡號一位一位變成圓點
  const rd = $('.rd-num');
  if (rd) {
    const g = $('.g', rd), m = $('.m', rd);
    const original = g.textContent;
    G.set(g, { opacity: 1 }); G.set(m, { opacity: 0 });
    once('.redact', () => {
      let i = 0; const chars = [...original];
      const tick = setInterval(() => {
        while (i < chars.length && chars[i] === ' ') i++;
        if (i >= chars.length) {
          clearInterval(tick);
          G.to(g, { opacity: 0, duration: 0.3, delay: 0.25 });
          G.fromTo(m, { opacity: 0, letterSpacing: '0.5em' }, { opacity: 1, letterSpacing: '0.12em', duration: 0.5, delay: 0.25, ease: 'expo.out' });
          return;
        }
        chars[i] = '•'; i++; g.textContent = chars.join('');
      }, 55);
    }, 'top 70%');
  }
  G.set('.facts li', { opacity: 0, y: 14 });
  once('.facts', () => G.to('.facts li', { opacity: 1, y: 0, stagger: 0.06, duration: 0.55, ease: 'power3.out' }), 'top 95%');

  // 方案：帶重量落下，過沖一點點後穩住
  G.set('.plan', { opacity: 0, y: -28 });
  once('.plans', () => G.to('.plan', { opacity: 1, y: 0, stagger: 0.07, duration: 0.7, ease: 'back.out(1.4)' }), 'top 95%');

  // 結尾：icon 像貼紙一樣貼上去
  G.set('.end-icon', { opacity: 0, y: -26, rotation: -10, scale: 0.9 });
  once('.end-icon', () => G.to('.end-icon', { opacity: 1, y: 0, rotation: 0, scale: 1, duration: 0.7, ease: 'back.out(2.2)' }), 'top 98%');

  addEventListener('load', () => ST.refresh());
})();
