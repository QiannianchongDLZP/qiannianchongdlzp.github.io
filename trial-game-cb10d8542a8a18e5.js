window.Y2K_LANGS=['zh'];window.Y2K_STATS_CONFIG={"endpoint":"https://qiannianchong-stats.chenhao2003.chatgpt.site/api/stats2","allowedOrigins":["https://qiannianchong2.chenhao2003.chatgpt.site","https://qiannianchongdlzp.github.io","https://qiannianchonggametwo.github.io","https://automatic-wildfowl-d0ch94a37e6e3-1533818985.tcloudbaseapp.com"],"game":"2-sixth-disk","leaderboardEndpoint":"https://qiannianchong-stats.chenhao2003.chatgpt.site/api/leaderboard?game=2-sixth-disk","showTitleStats":true,"showHiddenEndingOnLeaderboard":true};
'use strict';
// 只传递随机标识与游玩状态；与剧情、昵称和存档无关。
window.Y2KStats = (() => {
  const words = {
    zh: { visits: '累计访问', online: '当前在线', loading: '正在读取统计', error: '统计暂时不可用', offline: '离线模式', preview: '本地预览不计入统计', retry: '重新连接' },
    en: { visits: 'Total visits', online: 'Online now', loading: 'Loading statistics', error: 'Statistics temporarily unavailable', offline: 'Offline mode', preview: 'Local previews are not counted', retry: 'Reconnect' },
    ja: { visits: '累計アクセス', online: '現在オンライン', loading: '統計を読み込み中', error: '統計を取得できません', offline: 'オフラインモード', preview: 'ローカルプレビューは集計対象外です', retry: '再接続' },
  };
  const showOnTitle = window.Y2K_STATS_CONFIG?.showTitleStats === true;
  let started = false, playing = false, pageId, sessionId, visitorId, registered = false;
  let flight = false, queued = false, seq = 0, lastApplied = 0, online = null, visits = null, mode = 'loading';
  let endpoint = '', enabled = false, departed = false;
  let retryTimer = 0, retryAttempt = 0;
  const panels = new Map();
  const uuid = () => {
    if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
    // Older Safari/WebViews support getRandomValues but not randomUUID.
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 15) | 64; bytes[8] = (bytes[8] & 63) | 128;
    const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  };
  const validId = value => /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value || '');
  function beginPage(reload) {
    pageId = uuid(); sessionId = uuid(); seq = 0; lastApplied = 0; registered = false;
    try {
      const previous = sessionStorage.getItem('y2k2_stats_visit');
      if (reload && validId(previous)) pageId = previous;
      sessionStorage.setItem('y2k2_stats_visit', pageId);
    } catch (_) {}
  }
  function paint() {
    for (const [el, lang] of panels) {
      if (!el.isConnected) { panels.delete(el); continue; }
      const w = words[lang] || words.zh;
      const format = value => new Intl.NumberFormat(lang === 'zh' ? 'zh-CN' : lang).format(value);
      const ready = mode === 'ready';
      el.querySelector('[data-stat="visits"]').textContent = ready ? format(visits) : '—';
      el.querySelector('[data-stat="online"]').textContent = ready ? format(online) : '—';
      el.querySelector('.stats-state').textContent = ready ? '' : w[mode];
      el.querySelector('.stats-retry').hidden = mode !== 'error' || !enabled;
      el.dataset.state = mode;
    }
  }
  function mount(lang) {
    const w = words[lang] || words.zh, el = document.createElement('div');
    el.className = 'site-stats'; el.setAttribute('role', 'group');
    for (const key of ['online', 'visits']) {
      const item = document.createElement('span'), value = document.createElement('strong');
      item.className = 'stat-item'; value.dataset.stat = key; value.textContent = '—';
      item.append(w[key], value); el.append(item);
    }
    const state = document.createElement('span'); state.className = 'stats-state'; state.setAttribute('role', 'status'); el.append(state);
    const retry = document.createElement('button'); retry.type = 'button'; retry.className = 'stats-retry'; retry.hidden = true;
    retry.textContent = w.retry;
    retry.onclick = () => { retryAttempt = 0; mode = 'loading'; paint(); void send(); }; el.append(retry);
    panels.set(el, lang); queueMicrotask(paint); return el;
  }
  function active() { return playing && document.visibilityState === 'visible'; }
  function payload(event) { return { event, pageId, sessionId, visitorId, seq: ++seq, playing: event === 'leave' ? false : active() }; }
  function leave() {
    if (!enabled) return;
    clearTimeout(retryTimer); retryTimer = 0;
    const body = JSON.stringify(payload('leave'));
    // 递增序号避免迟到的心跳把已离开的玩家重新记为在线。
    fetch(endpoint, { method: 'POST', body, headers: { 'Content-Type': 'text/plain;charset=UTF-8' }, keepalive: true, credentials: 'omit' }).catch(() => {
      try { navigator.sendBeacon?.(endpoint, new Blob([body], { type: 'text/plain;charset=UTF-8' })); } catch (_) {}
    });
  }
  async function send() {
    if (!enabled || departed) return;
    if (flight) { queued = true; return; }
    clearTimeout(retryTimer); retryTimer = 0;
    flight = true;
    const message = payload(registered ? 'heartbeat' : 'visit'), controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=UTF-8' }, body: JSON.stringify(message), credentials: 'omit', cache: 'no-store', signal: controller.signal });
      if (!response.ok) throw new Error('stats unavailable');
      const result = await response.json();
      if (!Number.isSafeInteger(result.online) || result.online < 0 || (showOnTitle && (!Number.isSafeInteger(result.visits) || result.visits < 0))) throw new Error('invalid statistics');
      if (message.sessionId !== sessionId) return;
      if (message.event === 'visit') registered = true;
      retryAttempt = 0;
      if (message.seq >= lastApplied && document.visibilityState === 'visible') { lastApplied = message.seq; online = result.online; visits = result.visits; mode = 'ready'; paint(); }
    } catch (_) {
      if (departed || message.sessionId !== sessionId) return;
      mode = 'error'; paint();
      if (retryAttempt < 3) retryTimer = setTimeout(() => { retryTimer = 0; void send(); }, [1500, 4000, 10000][retryAttempt++]);
    }
    finally { clearTimeout(timeout); flight = false; if (queued) { queued = false; void send(); } }
  }
  function setPlaying(value) { const changed = playing !== value; playing = value; if (started && changed) void send(); }
  function start() {
    if (started) return; started = true;
    const config = window.Y2K_STATS_CONFIG || {};
    if (location.protocol === 'file:') { mode = 'offline'; paint(); return; }
    if (!(config.allowedOrigins || []).includes(location.origin)) { mode = 'preview'; paint(); return; }
    try {
      const url = new URL(config.endpoint); if (url.protocol !== 'https:') throw new Error('HTTPS required');
      endpoint = url.href; beginPage(performance.getEntriesByType('navigation')[0]?.type === 'reload');
      try {
        visitorId = localStorage.getItem('y2k2_stats_visitor');
        if (!validId(visitorId)) { visitorId = uuid(); localStorage.setItem('y2k2_stats_visitor', visitorId); }
      } catch (_) { visitorId = uuid(); }
      enabled = true;
    } catch (_) { mode = 'error'; paint(); return; }
    // 后台仍属于同一次访问；只有离开页面才结束这个标签页。
    document.addEventListener('visibilitychange', () => void send());
    window.addEventListener('pagehide', () => { departed = true; leave(); });
    window.addEventListener('pageshow', e => { if (e.persisted) { departed = false; beginPage(false); void send(); } });
    window.addEventListener('online', () => void send());
    setInterval(() => void send(), 30000); void send();
  }
  return { mount, setPlaying, start, showOnTitle };
})();

// Anonymous results are separate from story saves; only completed runs are submitted.
(() => {
  'use strict';
  const config = window.Y2K_STATS_CONFIG || {}, game = config.game;
  const scoresOnly = !!window.Y2KStats?.showOnTitle;
  const legacyEndpoint = config.leaderboardEndpoint;
  const endpoint = legacyEndpoint && new URL(legacyEndpoint, location.href);
  if (endpoint) endpoint.searchParams.set('layout', 'abc-h');
  // Queue and receipt keys use the original score buckets across client upgrades.
  const bucket = { A: 'D', B: 'A', C: 'C', H: 'H' };
  const display = Object.fromEntries(Object.entries(bucket).map(([ending, key]) => [key, ending]));
  const enabled = !!endpoint && location.protocol === 'https:' && (config.allowedOrigins || []).includes(location.origin);
  const prefix = `y2k${game}_leaderboard_`, endings = Object.keys(bucket);
  const words = {
    zh: { notice: '排行榜公告', rule: '每个结局列出前 20 名。用时越短，名次越靠前；用时相同，就比谁用的提示少。', privacy: '成绩会匿名上榜。在这个浏览器里，同一个结局只保留最好的一次。', clock: '通关用时会随存档累加。停在首页、切到后台或阅读结局时，计时暂停。', swipe: '左右滑动查看各结局的成绩', ending: '结局 ', hidden: '隐藏结局', rank: '名次', time: '通关用时', hints: '提示', empty: '暂无通关记录', loading: '正在读取排行榜…', error: '暂时无法读取排行榜，请稍后重试。', offline: '排行榜仅在在线版开放。', retry: '刷新榜单' },
    en: { notice: 'Leaderboard notice', rule: 'Top 20 per ending · Fastest time first; fewer hints break ties', privacy: 'Anonymous results. Each browser keeps its best result per ending.', clock: 'Time follows the save. Home, background tabs and ending screens are paused.', swipe: 'Swipe to see the ending scores', ending: 'Ending ', hidden: 'Hidden ending', rank: 'Rank', time: 'Clear time', hints: 'Hints', empty: 'No completed runs yet', loading: 'Loading leaderboard…', error: 'Unable to load the leaderboard. Please try again.', offline: 'Leaderboards are available in the online edition.', retry: 'Refresh' },
    ja: { notice: 'ランキングのお知らせ', rule: '各結末の上位20件 · クリア時間順、同タイムならヒント回数順', privacy: '匿名で記録。同じブラウザでは各結末の最高記録を残します。', clock: '時間はセーブごとに累計。タイトル・バックグラウンド・結末閲覧中は停止。', swipe: '横にスワイプして各結末の記録を表示', ending: '結末 ', hidden: '隠しエンド', rank: '順位', time: 'クリア時間', hints: 'ヒント', empty: 'まだ記録がありません', loading: 'ランキングを読込中…', error: 'ランキングを読み込めません。時間をおいて再試行してください。', offline: 'ランキングはオンライン版で利用できます。', retry: '更新' }
  };
  Object.assign(words.zh, { reviewTitle: '故事结束了，想留下几句话吗？', reviewTitleEpilogue: '进入尾声之前，想留下几句话吗？', reviewLabel: '你的感受或评价（选填）', reviewHelp: '最多 500 字。评价会随本次成绩公开展示，可留空。', reviewOffline: '最多 500 字。离线版评价仅保存在本机。', reviewPlaceholder: '玩到哪儿印象最深？也可以说说哪里没看懂。', reviewSubmit: '保存并继续', reviewSkip: '不留评价，继续', reviewHint: '悬停或点按名次、用时、提示次数，查看该次通关的评价。', reviewRead: '查看通关评价', reviewEmpty: '这位玩家没有留下评价。' });
  Object.assign(words.en, { reviewTitle: 'The story has ended. Would you like to leave a few words?', reviewTitleEpilogue: 'Before the epilogue, would you like to leave a few words?', reviewLabel: 'Your thoughts or review (optional)', reviewHelp: 'Up to 500 characters. Your review will be public alongside this result. You may leave it blank.', reviewOffline: 'Up to 500 characters. Offline reviews are saved only on this device.', reviewPlaceholder: 'A moment that stayed with you, or something that could be improved…', reviewSubmit: 'Save and continue', reviewSkip: 'Continue without a review', reviewHint: 'Hover over or tap a rank, clear time or hint count to read the review for that run.', reviewRead: 'Read this run’s review', reviewEmpty: 'This player did not leave a review.' });
  Object.assign(words.ja, { reviewTitle: '物語を読み終えて、ひと言残しませんか？', reviewTitleEpilogue: 'エピローグの前に、ひと言残しませんか？', reviewLabel: '感想・評価（任意）', reviewHelp: '500文字以内。感想は今回の記録とともに公開されます。空欄でも構いません。', reviewOffline: '500文字以内。オフライン版の感想はこの端末にのみ保存されます。', reviewPlaceholder: '心に残った場面や、改善してほしいことなど……', reviewSubmit: '保存して続ける', reviewSkip: '感想を残さず続ける', reviewHint: '順位・クリア時間・ヒント回数にカーソルを合わせるか、タップすると、その記録の感想が読めます。', reviewRead: 'この記録の感想を読む', reviewEmpty: 'このプレイヤーは感想を残していません。' });
  function get(key, fallback) { try { return JSON.parse(localStorage.getItem(prefix + key)) ?? fallback; } catch { return fallback; } }
  function put(key, value) { try { localStorage.setItem(prefix + key, JSON.stringify(value)); } catch {} }
  function newRun() {
    if (crypto.randomUUID) return crypto.randomUUID();
    return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, c => (Number(c) ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> Number(c) / 4).toString(16));
  }
  let playerId = get('player', null);
  if (typeof playerId !== 'string' || !/^[0-9a-f-]{36}$/i.test(playerId)) { playerId = newRun(); put('player', playerId); }
  const savedQueue = get('pending', {});
  const pending = savedQueue && typeof savedQueue === 'object' && !Array.isArray(savedQueue) ? savedQueue : {};
  let sending = false;
  async function flush() {
    if (!enabled || sending) return;
    sending = true;
    try {
      while (Object.keys(pending).length) {
        const [key, score] = Object.entries(pending)[0];
        let response;
        const ending = display[score.ending];
        const payload = { ...score, ending: ending || score.ending };
        if (scoresOnly) delete payload.review;
        try { response = await fetch(ending ? endpoint : legacyEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), signal: AbortSignal.timeout(10000) }); } catch { break; }
        if (response.ok || response.status === 400) { if (pending[key] === score) delete pending[key]; put('pending', pending); }
        else break;
      }
    } finally { sending = false; }
  }
  function capture(state, ending) {
    if (!endings.includes(ending)) return;
    // 测试用的存档（自动跑出来的各章开头存档）不计成绩。
    if (state.noRank) return;
    state.finishRecords ||= {};
    // Legacy saves do not know when an already-unlocked ending was first reached.
    if (!state.finishRecords[ending] && !(state.ends || []).includes(ending)) {
      const durationMs = Math.round(state.playMs || 0);
      const hints = Object.values(state.hints || {}).reduce((n, x) => n + (Number.isSafeInteger(x) && x > 0 ? x : 0), 0);
      if (durationMs < 1000 || durationMs > 31536000000 || hints > 10000) return;
      state.runId ||= newRun();
      state.finishRecords[ending] = { durationMs, hints, review: null };
    }
    const result = state.finishRecords[ending];
    // A pre-ending/manual save may predate a submitted review. Restore only an
    // exact completion's receipt, never a different run's (or ending's) comment.
    if (result && state.runId) {
      const receipt = get(reviewKey(state, ending), null);
      if (typeof receipt === 'string') { result.review = receipt; delete result.reviewDraft; }
    }
    if (!enabled || !result || !state.runId) return;
    pending[`${state.runId}:${bucket[ending]}`] = { game, ending: bucket[ending], playerId, runId: state.runId, durationMs: result.durationMs, hints: result.hints,
      ...(typeof result.review === 'string' ? { review: result.review } : {}) };
    put('pending', pending); void flush();
  }
  function resume(state) {
    for (const ending of endings) if (state.finishRecords?.[ending]) capture(state, ending);
  }
  function time(ms) {
    const seconds = Math.floor(ms / 1000), pad = n => String(n).padStart(2, '0');
    return `${pad(Math.floor(seconds / 3600))}:${pad(Math.floor(seconds / 60) % 60)}:${pad(seconds % 60)}.${String(ms % 1000).padStart(3, '0')}`;
  }
  function el(tag, className, text) { const node = document.createElement(tag); if (className) node.className = className; if (text !== undefined) node.textContent = text; return node; }
  function reviewKey(state, ending) {
    const result = state.finishRecords[ending];
    return `review:${state.runId}:${bucket[ending]}:${result.durationMs}:${result.hints}`;
  }
  // 结局页的按钮点下去时才问；问完（或不用问）再执行按钮原本的动作。
  function reviewPending(state, ending) { const r = state.finishRecords?.[ending]; return !scoresOnly && !!r && r.review === null; }
  function requestReview(host, state, ending, language, save, opts = {}) {
    const result = state.finishRecords?.[ending];
    // Older completed saves are not prompted retroactively.
    if (!result || result.review !== null) { opts.onDone?.(); return; }
    const t = words[language] || words.zh;
    const dialog = el('dialog', 'finish-review'); dialog.setAttribute('aria-labelledby', 'finish-review-title');
    const heading = el('h2', '', (opts.title && t[opts.title]) || t.reviewTitle); heading.id = 'finish-review-title'; heading.tabIndex = -1;
    const summary = el('p', 'finish-review-summary', `${ending === 'H' ? t.hidden : t.ending + ending} · ${t.time} ${time(result.durationMs)} · ${t.hints} ${result.hints}`);
    const label = el('label', '', t.reviewLabel); label.htmlFor = 'finish-review-input';
    const input = el('textarea'); input.id = 'finish-review-input'; input.maxLength = 500; input.rows = 5; input.placeholder = t.reviewPlaceholder;
    input.value = typeof result.reviewDraft === 'string' ? result.reviewDraft.slice(0, 500) : '';
    input.setAttribute('aria-describedby', 'finish-review-help finish-review-count');
    const help = el('p', 'leaderboard-note', enabled ? t.reviewHelp : t.reviewOffline); help.id = 'finish-review-help';
    const count = el('p', 'finish-review-count', `${input.value.length} / 500`); count.id = 'finish-review-count';
    input.oninput = () => { result.reviewDraft = input.value.slice(0, 500); count.textContent = `${input.value.length} / 500`; save(); };
    let done = false;
    const finish = text => {
      if (done) return; done = true;
      result.review = text.trim().slice(0, 500); delete result.reviewDraft;
      put(reviewKey(state, ending), result.review); save(); capture(state, ending);
      dialog.close(); dialog.remove(); host.tabIndex = -1; host.focus({ preventScroll: true });
      opts.onDone?.();
    };
    const actions = el('div', 'finish-review-actions');
    const submit = el('button', 'tbtn finish-review-submit', t.reviewSubmit); submit.type = 'button'; submit.onclick = () => finish(input.value);
    const skip = el('button', 'tbtn finish-review-skip', t.reviewSkip); skip.type = 'button'; skip.onclick = () => finish('');
    actions.append(submit, skip); dialog.append(heading, summary, label, input, count, help, actions); host.append(dialog);
    dialog.addEventListener('cancel', e => { e.preventDefault(); finish(''); });
    dialog.addEventListener('keydown', e => e.stopPropagation());
    dialog.showModal(); heading.focus({ preventScroll: true });
  }
  function mount(body, language, hiddenUnlocked = false) {
    const t = words[language] || words.zh;
    body.closest('.title-panel').classList.add('leaderboard-panel');
    const status = el('p', 'leaderboard-status'); status.setAttribute('role', 'status');
    const refresh = el('button', 'tbtn', t.retry); refresh.type = 'button';
    const toolbar = el('div', 'leaderboard-toolbar'); toolbar.append(status, refresh);
    const scroll = el('div', 'leaderboard-scroll'); scroll.tabIndex = 0; scroll.setAttribute('aria-label', t.swipe);
    const grid = el('div', 'leaderboard-grid'); scroll.append(grid);
    const notice = el('section', 'leaderboard-notice');
    notice.append(el('h4', '', t.notice), el('p', 'leaderboard-rule', t.rule), el('p', 'leaderboard-note', t.privacy), el('p', 'leaderboard-note', t.clock));
    if (!scoresOnly) notice.append(el('p', 'leaderboard-note', t.reviewHint));
    body.append(notice, toolbar, el('p', 'leaderboard-swipe', t.swipe), scroll);
    const layer = body.closest('.title-panel-layer');
    const tip = el('div', 'leaderboard-review'); tip.id = 'leaderboard-review'; tip.setAttribute('role', 'tooltip'); tip.hidden = true;
    layer.append(tip);
    let current = null, pinned = false, hideTimer;
    function hideReview() {
      clearTimeout(hideTimer); current?.removeAttribute('aria-describedby'); current = null; pinned = false; tip.hidden = true;
    }
    function showReview(button, score, ending, rank) {
      clearTimeout(hideTimer); current?.removeAttribute('aria-describedby'); current = button;
      button.setAttribute('aria-describedby', tip.id);
      tip.replaceChildren(el('strong', '', `${ending === 'H' ? t.hidden : t.ending + ending} · ${t.rank} ${rank}`),
        el('p', 'leaderboard-review-score', `${t.time} ${time(score.durationMs)} · ${t.hints} ${score.hints}`),
        el('p', 'leaderboard-review-text', typeof score.review === 'string' && score.review.trim() ? score.review : t.reviewEmpty));
      tip.hidden = false;
      const r = button.getBoundingClientRect(), rect = tip.getBoundingClientRect();
      tip.style.left = `${Math.max(8, Math.min(innerWidth - rect.width - 8, r.x + r.width / 2 - rect.width / 2))}px`;
      tip.style.top = `${Math.max(8, r.bottom + rect.height + 12 <= innerHeight ? r.bottom + 6 : r.top - rect.height - 6)}px`;
    }
    const deferHide = () => { if (!pinned) hideTimer = setTimeout(hideReview, 180); };
    tip.onpointerenter = () => clearTimeout(hideTimer); tip.onpointerleave = deferHide;
    layer.addEventListener('pointerdown', e => { if (!e.target.closest('.leaderboard-number, .leaderboard-review')) hideReview(); });
    layer.addEventListener('keydown', e => { if (e.key === 'Escape' && current) { e.preventDefault(); e.stopImmediatePropagation(); hideReview(); } }, true);
    body.addEventListener('scroll', e => { if (!tip.contains(e.target)) hideReview(); }, true);
    function render(data) {
      hideReview();
      grid.replaceChildren();
      for (const ending of endings) {
        if (ending === 'H' && !hiddenUnlocked && !config.showHiddenEndingOnLeaderboard) continue;
        const column = el('section', 'leaderboard-column'); column.dataset.ending = ending;
        column.append(el('h4', '', ending === 'H' ? t.hidden : t.ending + ending));
        const viewport = el('div', 'leaderboard-rows'); viewport.tabIndex = 0;
        viewport.setAttribute('role', 'region'); viewport.setAttribute('aria-label', (ending === 'H' ? t.hidden : t.ending + ending) + ' · ' + t.rank);
        const table = el('table'); const head = el('thead'), tr = el('tr');
        [t.rank, t.time, t.hints].forEach(label => { const th = el('th', '', label); th.scope = 'col'; tr.append(th); });
        head.append(tr); const rows = el('tbody');
        (data?.[ending] || []).slice(0, 20).forEach((score, i) => {
          const row = el('tr');
          [i + 1, time(score.durationMs), score.hints].forEach((value, columnIndex) => {
            if (scoresOnly) { row.append(el('td', '', value)); return; }
            const cell = el('td'), button = el('button', 'leaderboard-number', value); button.type = 'button';
            button.setAttribute('aria-label', `${[t.rank, t.time, t.hints][columnIndex]} ${value} · ${t.reviewRead}`);
            button.onpointerenter = e => { if (e.pointerType === 'mouse' && !pinned) showReview(button, score, ending, i + 1); };
            button.onpointerleave = deferHide;
            button.onfocus = () => { if (!pinned) showReview(button, score, ending, i + 1); };
            button.onblur = hideReview;
            button.onclick = () => { if (pinned && current === button) hideReview(); else { showReview(button, score, ending, i + 1); pinned = true; } };
            cell.append(button); row.append(cell);
          });
          rows.append(row);
        });
        table.append(head, rows); viewport.append(table); column.append(viewport);
        if (!rows.children.length) viewport.append(el('p', 'leaderboard-empty', t.empty));
        grid.append(column);
      }
    }
    async function refreshBoard() {
      if (!enabled) { status.textContent = t.offline; refresh.hidden = true; render(); return; }
      refresh.disabled = true; status.textContent = t.loading;
      try {
        await flush();
        const response = await fetch(endpoint, { cache: 'no-store', signal: AbortSignal.timeout(10000) });
        if (!response.ok) throw new Error('unavailable');
        const data = await response.json();
        if (data.game !== game || Object.hasOwn(data.endings || {}, 'D') || !endings.every(id => Array.isArray(data.endings?.[id]) && data.endings[id].every(s => Number.isSafeInteger(s.durationMs) && s.durationMs >= 1000 && Number.isSafeInteger(s.hints) && s.hints >= 0))) throw new Error('invalid response');
        if (!body.isConnected) return;
        render(data.endings); status.textContent = '';
      } catch { if (body.isConnected) status.textContent = t.error; }
      finally { refresh.disabled = false; }
    }
    render();
    refresh.onclick = () => refreshBoard().finally(() => { if (body.isConnected) refresh.focus(); });
    void refreshBoard();
  }
  window.Y2KLeaderboard = { newRun, capture, resume, mount, requestReview, reviewPending };
  window.addEventListener('online', flush);
  setInterval(flush, 60000);
  void flush();
})();

window.Y2K2_AUDIO = {};
// 《千年虫2》游戏声音：现场合成的场景配乐，以及结局 C 合影处的内嵌录音。
// 清单与编号见 docs/剧本重构/09_配乐清单.md。现在只有：结局C读到合影时的《换我等你》、望舒号主页的 MIDI，
// 以及手机和界面的提示音（新消息、答对答错、回铃音、按键音）。没有环境声、录像声和机器杂音。
// 两条总线：音乐、音效。引擎每隔一会儿报一次“现在是什么场景”（scene），这里决定放什么；一次性的声音由引擎直接调用。
(() => {
  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
  const rand = (a, b) => a + Math.random() * (b - a);

  // 望舒号主页的 MIDI（2002）：一段小曲，节拍有点僵，第六小节有一个错音。
  const WANGSHU = [[67, .5], [71, .5], [74, 1], [72, .5], [71, .5], [69, 1], [67, .5], [69, .5], [71, .5], [72, .5], [74, 2],
    [76, .5], [74, .5], [72, 1], [71, .5], [70, .5], [69, 1], [67, .5], [66, .5], [67, .5], [69, .5], [67, 2]];
  const WANGSHU_BASS = [43, 43, 48, 48, 50, 50, 43, 43, 48, 48, 45, 45, 50, 50, 43, 43];

  // ------------------------------------------------------------
  // 合成器：绑定到一个 AudioContext（实时的，或试听台/检查用的离线的）
  // out = { music, sfx } 两个目的节点
  // ------------------------------------------------------------
  function createSynth(ctx, out) {
    const G = (v, dest) => { const g = ctx.createGain(); g.gain.value = v; if (dest) g.connect(dest); return g; };
    const F = (type, f, q, dest) => { const b = ctx.createBiquadFilter(); b.type = type; b.frequency.value = f; if (q != null) b.Q.value = q; if (dest) b.connect(dest); return b; };
    function osc(type, f, t0, t1, dest, bag, cents = 0) {
      const o = ctx.createOscillator(); o.type = type; o.frequency.value = f; if (cents) o.detune.value = cents;
      o.connect(dest); o.start(t0); if (t1 != null) o.stop(t1); if (bag) bag.push(o); return o;
    }
    function env(dest, t, peak, attack, release, hold = 0) {
      const g = ctx.createGain(); g.connect(dest);
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(Math.max(.0002, peak), t + attack);
      if (hold) g.gain.setValueAtTime(Math.max(.0002, peak), t + attack + hold);
      g.gain.exponentialRampToValueAtTime(.0001, t + attack + hold + release); return g;
    }

    // ---------- 乐器 ----------
    // PC 喇叭：单声道方波，开关很硬
    function pcBeep(t, f, dur, vol, dest, bag) {
      const g = ctx.createGain(); g.connect(dest);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .002);
      g.gain.setValueAtTime(vol, t + Math.max(.003, dur - .003)); g.gain.linearRampToValueAtTime(0, t + dur);
      osc('square', f, t, t + dur + .01, F('lowpass', 4200, .7, g), bag);
    }
    // 2002 年个人主页那种 MIDI：方波加三角波，没有力度变化
    function midiNote(t, m, dur, vol, dest, bag) {
      const e = env(dest, t, vol, .004, Math.max(.05, dur * .9 - .004));
      osc('square', mtof(m), t, t + dur, G(.35, e), bag); osc('triangle', mtof(m), t, t + dur, e, bag);
    }

    // ---------- 按键音 ----------
    function keypad(t, digits, speed, vol, dest, bag) {
      let x = t;
      for (const d of digits) { if (d === '0') { x += .4 * speed; continue; } pcBeep(x, 1568, .06, vol, F('bandpass', 1600, 1.5, dest), bag); x += .16 * speed; }
      return x - t;
    }

    // ---------- 配乐（M） ----------
    // 每首：fn(t, 目的节点, 节点袋, s, ctl, 参数) → { len }。
    // 标题、章节卡、结局 A、B 和隐藏结局都不放音乐；结局C读到合影时放《换我等你》（startPhotoSong）。
    // 以后要给某处加录好的音乐，登记在 src/audio-manifest.json，这里按同名位置播放。
    const music = {
      // M09 望舒号主页的背景 MIDI
      wangshu(t, dest, bag) {
        const beat = 60 / 112; let x = t + .2;
        WANGSHU.forEach(([m, b], i) => { midiNote(x, i === 15 ? m - 1 : m, b * beat * .92, .055, dest, bag); x += b * beat; });
        WANGSHU_BASS.forEach((m, i) => midiNote(t + .2 + i * beat, m, beat * .85, .04, dest, bag));
        return { len: x - t + beat };
      },
    };

    // ---------- 一次性的声音（S） ----------
    const shots = {
      // 游戏原有的提示音：答对、答错、进入桌面、点击音量调低了；
      // 消息音和第一部完全一样：两个正弦音 880 / 1320 Hz，起音即最大、指数衰减。第一部直接接扬声器，这里要过总音量 ×1.4，所以音量除回去。
      msg: (t, d, b) => {
        const tone = (f, dur, at) => { const g = ctx.createGain(); g.gain.setValueAtTime(.06 / 1.4, t + at); g.gain.exponentialRampToValueAtTime(.0001 / 1.4, t + at + dur); g.connect(d); osc('sine', f, t + at, t + at + dur + .02, g, b); };
        tone(880, .12, 0); tone(1320, .18, .1);
      },
      ok: (t, d, b) => { [660, 880, 1175].forEach((f, i) => osc('sine', f, t + i * .1, t + i * .1 + .45, env(d, t + i * .1, .05, .005, i === 2 ? .3 : .14), b)); },
      err: (t, d, b) => { osc('square', 220, t, t + .28, F('lowpass', 900, .5, env(d, t, .03, .005, .24)), b); },
      chime: (t, d, b) => { [523, 659, 784, 1047].forEach((f, i) => osc('triangle', f, t + i * .22, t + i * .22 + 1.7, env(d, t + i * .22, .04, .01, 1.6 - i * .2), b)); },
      click: (t, d, b) => pcBeep(t, 1800, .03, .01, F('lowpass', 2500, .5, d), b),
      // S10 回铃音、语音信箱提示音
      ringback: (t, d, b) => { for (let k = 0; k < 3; k++) osc('sine', 450, t + k * 2.2, t + k * 2.2 + 1.1, F('bandpass', 450, 1, env(d, t + k * 2.2, .03, .01, .05, .95)), b); },
      voicemail: (t, d, b) => { osc('sine', 1000, t, t + .55, env(d, t, .035, .01, .05, .45), b); },
      // S12 那串数字的按键音
      keypad: (t, d, b) => { keypad(t, window.QNC2.mengfanSms.lastCode, 1, .035, d, b); },
    };

    return { music, shots };
  }

  // ------------------------------------------------------------
  // 实时播放：引擎调用这一层
  // ------------------------------------------------------------
  let ctx = null, buses = null, SY = null, unlocked = false, disabled = false;
  // 构建时由 tools/audio-embed.cjs 写进来：{ 位置: { src, gainDb, fadeIn, fadeOut, delay, repeatGap } }
  const FILES = window.Y2K2_AUDIO || {};
  const hasFile = id => !!(FILES[id] && FILES[id].use !== 'synth');
  const media = {};
  function mediaFor(id) {
    if (media[id] || !FILES[id] || !init()) return media[id] || null;
    try {
      const f = FILES[id], bin = atob(f.src.slice(f.src.indexOf(',') + 1)), u = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
      const el = new Audio(); el.preload = 'auto'; el.src = URL.createObjectURL(new Blob([u], { type: f.src.slice(5, f.src.indexOf(';')) }));
      const g = ctx.createGain(); g.gain.value = .0001; ctx.createMediaElementSource(el).connect(g); g.connect(buses.music);
      return media[id] = { el, g, f, token: 0 };
    } catch (e) { return null; }
  }
  // 放一首录好的：淡入；曲尾按 fadeOut 收住；repeatGap 有值就隔一会儿再放一遍
  function filePlayer(id) {
    const md = mediaFor(id); if (!md) return null;
    const { el, g, f } = md, lvl = Math.pow(10, (f.gainDb || 0) / 20), token = ++md.token, mine = () => md.token === token;
    let timer = 0, tail = false, stopped = false;
    const ramp = (to, secs) => { const n = ctx.currentTime; g.gain.cancelScheduledValues(n); g.gain.setValueAtTime(Math.max(.0001, g.gain.value), n); g.gain.exponentialRampToValueAtTime(Math.max(.0001, to), n + Math.max(.05, secs)); };
    const watch = () => {
      if (!mine() || stopped) return;
      if (!el.paused && el.duration && f.fadeOut && !tail && el.currentTime > el.duration - f.fadeOut - .25) { tail = true; ramp(.0001, el.duration - el.currentTime); }
      if (el.ended && f.repeatGap == null) return;
      timer = setTimeout(watch, 200);
    };
    const start = () => {
      if (!mine() || stopped) return;
      tail = false; try { el.currentTime = 0; } catch (e) {}
      g.gain.cancelScheduledValues(ctx.currentTime); g.gain.setValueAtTime(.0001, ctx.currentTime); ramp(lvl, f.fadeIn || .3);
      const p = el.play(); if (p && p.catch) p.catch(() => {});
      clearTimeout(timer); watch();
    };
    el.onended = () => { if (mine() && !stopped && f.repeatGap != null) { clearTimeout(timer); timer = setTimeout(start, f.repeatGap * 1000); } };
    timer = setTimeout(start, (f.delay || 0) * 1000);
    return { stop(fade = 2) { stopped = true; clearTimeout(timer); if (!mine()) return; ramp(.0001, fade); setTimeout(() => { if (mine()) el.pause(); }, fade * 1000 + 120); } };
  }
  const prefs = { music: true, sfx: true };
  const live = { musicId: null, music: null, scene: {}, lastShot: {}, preview: false };

  function init() {
    if (ctx) return true;
    if (disabled) return false;
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return false;
    try { ctx = new AC(); } catch (e) { return false; }
    // 总音量，后面挂一个限幅器：几层声音叠在一起时不爆音
    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -6; limiter.knee.value = 0; limiter.ratio.value = 12; limiter.attack.value = .003; limiter.release.value = .25;
    limiter.connect(ctx.destination);
    const master = ctx.createGain(); master.gain.value = 1.4; master.connect(limiter);
    const bus = v => { const g = ctx.createGain(); g.gain.value = v; g.connect(master); return g; };
    buses = { music: bus(prefs.music ? 1 : 0), sfx: bus(prefs.sfx ? 1 : 0) };
    SY = createSynth(ctx, buses);
    document.addEventListener('visibilitychange', () => { if (!ctx) return; if (document.hidden) ctx.suspend(); else if (unlocked) ctx.resume(); });
    return true;
  }
  // 浏览器要求先有一次点击或按键才能出声
  function unlock() {
    if (disabled || !init()) return;
    if (ctx.state === 'suspended' && !document.hidden) ctx.resume();
    if (!unlocked) { unlocked = true; if (!live.preview) scene(live.scene); }
  }
  ['pointerdown', 'keydown', 'touchend'].forEach(ev => document.addEventListener(ev, unlock, true));

  function stopMusic(fade = 2) {
    const m = live.music; live.music = null; if (!m) return;
    if (m.file) return m.file.stop(fade);
    clearTimeout(m.ctl.fallback); clearTimeout(m.timer);
    const n = ctx.currentTime; m.g.gain.cancelScheduledValues(n); m.g.gain.setValueAtTime(Math.max(.0001, m.g.gain.value), n); m.g.gain.exponentialRampToValueAtTime(.0001, n + fade);
    setTimeout(() => { m.bag.forEach(x => { try { x.stop(); } catch (e) {} }); try { m.g.disconnect(); } catch (e) {} }, fade * 1000 + 200);
  }
  function startMusic(id, arg, synth) {
    if (id === 'photoC') {
      startPhotoSong();
      return;
    }
    if (!synth && hasFile(id)) { const file = filePlayer(id); if (file) { live.music = { id, file }; return; } }
    const fn = SY.music[id]; if (!fn) return;
    const g = ctx.createGain(); g.connect(buses.music);
    const bag = [], ctl = {}, t0 = ctx.currentTime + .05, looped = id === 'wangshu';
    g.gain.setValueAtTime(.0001, t0); g.gain.exponentialRampToValueAtTime(1, t0 + (looped ? 1.5 : .3));
    const m = { id, g, bag, ctl, timer: 0 };
    const sx = { sfx: g };   // 结局里的音效类声音跟着这首曲子一起淡出
    const run = t => fn(t, g, bag, sx, ctl, arg).len;
    let next = t0 + run(t0);
    const tick = () => {
      if (live.music !== m) return;
      if (looped && ctx.currentTime > next - 3) next += run(next);
      if (ctl.loop) ctl.loop();
      m.timer = setTimeout(tick, 1000);
    };
    m.timer = setTimeout(tick, 1000);
    live.music = m;
  }
  async function startPhotoSong() {
    const g = ctx.createGain(); g.gain.value = .7; g.connect(buses.music);
    const m = { id: 'photoC', g, bag: [], ctl: {} };
    live.music = m;
    try {
      const raw = atob(document.getElementById('ending-c-song').textContent);
      const bytes = new Uint8Array(raw.length);
      for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
      const buffer = await ctx.decodeAudioData(bytes.buffer);
      if (live.music !== m) return;
      const source = ctx.createBufferSource();
      source.buffer = buffer; source.connect(g); m.bag.push(source);
      source.start();
    } catch (error) {
      if (live.music !== m) return;
      console.warn('结局 C 歌曲解码失败', error);
      stopMusic(.1);   // 解码失败就保持安静：结局不放别的音乐
    }
  }
  // 引擎每 0.4 秒报一次场景：{ title, ending, endingPhoto, page }
  function scene(sc) {
    if (live.preview) return;
    live.scene = sc || {};
    if (disabled || !unlocked || !ctx) return;
    sc = live.scene;
    let want = sc.ending || sc.title ? null : sc.page || null;   // 标题和结局 A、B、H 不放音乐
    if (sc.ending === 'C' && sc.endingPhoto && document.getElementById('ending-c-song')) want = 'photoC';
    if (want !== live.musicId) {
      live.musicId = want;
      if (live.music) stopMusic(want === 'photoC' || live.music.id === 'photoC' ? .25 : sc.ending ? 1.5 : 2);
      if (want && prefs.music) startMusic(want);
    }
  }
  function shot(kind) {
    if (disabled || !prefs.sfx || !init() || !unlocked || !SY.shots[kind]) return;
    const now = ctx.currentTime, gap = { ringback: 6, keypad: 8 }[kind] || 0;
    if (gap && live.lastShot[kind] && now - live.lastShot[kind] < gap) return;
    live.lastShot[kind] = now;
    SY.shots[kind](now + .02, buses.sfx, null);
  }
  window.Y2KAudio = {
    scene, unlock,
    sfx: shot,
    moment(name) { const m = live.music; if (m && m.ctl.moment) m.ctl.moment(name); },
    setPrefs(p) {
      const before = { ...prefs }; Object.assign(prefs, p || {});
      if (before.music !== prefs.music) document.dispatchEvent(new Event('y2k-music-pref'));
      if (!ctx) return;
      const n = ctx.currentTime;
      buses.music.gain.setTargetAtTime(prefs.music ? 1 : 0, n, .3);
      buses.sfx.gain.setTargetAtTime(prefs.sfx ? 1 : 0, n, .3);
      if (prefs.music && !before.music && live.music?.id !== 'photoC') { live.musicId = null; scene(live.scene); }
    },
    get prefs() { return { ...prefs }; },
    // 测试用：现在在放什么
    get status() { return { ctx: ctx ? ctx.state : 'none', unlocked, music: live.music ? live.music.id : null, file: !!(live.music && live.music.file), playingFiles: Object.entries(media).filter(([, m]) => !m.el.paused).map(([k]) => k) }; },
    disable() { disabled = true; if (ctx) { stopMusic(.1); ctx.suspend(); } },
    // 试听台：不跟游戏场景走，直接放
    preview: {
      on() { live.preview = true; init(); unlock(); },
      music(id, arg, synth) { this.on(); stopMusic(.4); live.musicId = '__preview'; startMusic(id, arg, synth); },
      stopMusic() { if (ctx) stopMusic(.6); },
      hasFile,
      shot(kind) { this.on(); SY.shots[kind](ctx.currentTime + .02, buses.sfx, null); },
      moment: name => window.Y2KAudio.moment(name),
      stopAll() { if (ctx) stopMusic(.6); },
    },
    // 离线渲染一段，返回峰值和响度（检查用）
    async render(kind, id, seconds, arg) {
      const OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
      const oc = new OAC(2, Math.ceil(44100 * seconds), 44100);
      const master = oc.createGain(); master.gain.value = 1.4; master.connect(oc.destination);   // 和实时播放的总音量一致（不含限幅器，便于看出会不会爆）
      const mk = () => { const g = oc.createGain(); g.connect(master); return g; };
      const out = { music: mk(), sfx: mk() };
      const sy = createSynth(oc, out), bag = [];
      if (kind === 'file' || kind === 'song') {
        const src = kind === 'song' ? document.getElementById('ending-c-song').textContent : FILES[id].src.slice(FILES[id].src.indexOf(',') + 1);
        const bin = atob(src), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
        const buf = await new Promise((res, rej) => oc.decodeAudioData(u.buffer, res, rej));
        const node = oc.createBufferSource(); node.buffer = buf; const g = oc.createGain();
        g.gain.value = kind === 'song' ? .7 : Math.pow(10, (FILES[id].gainDb || 0) / 20);
        node.connect(g); g.connect(out.music); node.start(0);
      }
      else if (kind === 'music') sy.music[id](0, out.music, bag, { sfx: out.sfx, offline: true }, {}, arg);
      else if (kind === 'shot') sy.shots[id](0, out.sfx, bag);
      const buf = await oc.startRendering();
      let peak = 0, sum = 0, n = 0;
      for (let ch = 0; ch < buf.numberOfChannels; ch++) { const d = buf.getChannelData(ch); for (let i = 0; i < d.length; i++) { const v = Math.abs(d[i]); if (v > peak) peak = v; sum += d[i] * d[i]; n++; } }
      const db = v => v > 0 ? Math.round(20 * Math.log10(v) * 10) / 10 : -Infinity;
      return { peakDb: db(peak), rmsDb: db(Math.sqrt(sum / n)) };
    },
  };
})();

'use strict';
// 《千年虫2》引擎：数据合并、标记与条件、动作、存档、2026 手机、Windows 98 桌面与各个应用。
const Y2K = (() => {
  // ============================================================
  // 语言：界面文字走 _t()（词表在 window.Y2K_UI），内容译文用 Y2K.lang() 注册、启动时按键写回数据
  // ============================================================
  const LANGS = { zh: '中文', en: 'English', ja: '日本語' };
  const savePrefix = window.QNC2StandaloneTrial ? 'qnc2_trial_' : '';
  let LANG = 'zh';
  try { LANG = JSON.parse(localStorage.getItem(savePrefix + 'y2k2_meta') || '{}').lang || 'zh'; } catch (e) { }
  // 只有打包进来、译完的语言才可选（tools/build.js 写入 Y2K_LANGS）
  const READY = (typeof window !== 'undefined' && Array.isArray(window.Y2K_LANGS) && window.Y2K_LANGS.length) ? window.Y2K_LANGS : ['zh'];
  if (!LANGS[LANG] || !READY.includes(LANG)) LANG = 'zh';
  const UI = (typeof window !== 'undefined' && window.Y2K_UI) || {};
  function _t(s) { const d = UI[LANG]; return d && d[s] != null ? d[s] : window.Y2K2Locale ? window.Y2K2Locale.translate(s, LANG) : s; }
  const LANGMAP = {};
  function lang(code, map) { LANGMAP[code] = Object.assign(LANGMAP[code] || {}, map); }
  const SEG = {};   // 路径段（文件夹名、文件名）的显示译名

  // ============================================================
  // 数据
  // ============================================================
  const D = {
    chapters: [], apps: {}, contacts2018: {}, boot: {}, files: [], threads: [], loginLog: [], mails: [], pages: [],
    users: [], bbsBoards: [], adminSections: {}, bbsMeta: {}, userExtras: [], gxAccount: {}, gxAccounts: {}, gxContacts: [], gxLogs: [],
    puzzles: {}, boards: {}, dialogues: [], mails2018: [], items2018: [], notes: {}, collectibles: {}, endings: {}, screensaver: [], journal: {}, readings: [],
    sites: {}, web: [],
  };
  function add(o) {
    const push = (k, arr) => { if (arr) D[k].push(...arr); };
    push('chapters', o.chapters); push('files', o.files); push('dialogues', o.dialogues); push('mails2018', o.mails2018);
    push('items2018', o.items2018); push('screensaver', o.screensaver); push('userExtras', o.userExtras);
    push('readings', o.readings); push('web', o.web); Object.assign(D.sites, o.sites || {}); Object.assign(D.journal, o.journal || {});
    Object.assign(D.apps, o.apps || {}); Object.assign(D.contacts2018, o.contacts2018 || {}); Object.assign(D.boot, o.boot || {});
    for (const k of ['puzzles', 'boards', 'notes', 'collectibles', 'endings']) Object.assign(D[k], o[k] || {});
    if (o.bbs) {
      const b = o.bbs;
      push('threads', b.threads); push('loginLog', b.loginLog); push('mails', b.mails); push('pages', b.pages);
      push('users', b.users); push('bbsBoards', b.boards); Object.assign(D.adminSections, b.adminSections || {});
      for (const k of ['name', 'sub', 'host', 'software', 'adminPuzzle', 'homeNotice', 'homeSource']) if (b[k]) D.bbsMeta[k] = b[k];
    }
    if (o.gexun) {
      if (o.gexun.account) D.gxAccount = o.gexun.account;
      Object.assign(D.gxAccounts, o.gexun.accounts || {});
      push('gxContacts', o.gexun.contacts); push('gxLogs', o.gexun.logs);
    }
  }
  // 选择题/多选题按选项位置判定，所以要在译文覆盖选项文字之前记下正确答案的位置
  function prepAnswers() {
    for (const p of Object.values(D.puzzles)) {
      if (p.kind === 'choice') p._ai = (p.options || []).indexOf(p.answer);
      if (p.kind === 'pick') p._as = (p.answerSet || []).map(a => (p.options || []).indexOf(a));
    }
  }
  // 把译文按键写回数据。键的规则和 tools/i18n-extract.js 一一对应：
  //   <类别>.<id>.<路径…>；路径末尾带 + 表示追加（answers+、near+）；seg|<名字> 是路径段显示名；bbs.<字段> 是 BBS 站点信息
  function translationTarget(obj, parts, append) {
    if (!obj || typeof obj !== 'object') return null;
    // 字典键本身可能含小数点（如 speeds['1.5']），优先匹配完整的现有键。
    for (let n = parts.length; n > 0; n--) {
      const key = parts.slice(0, n).join('.');
      if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
      if (n === parts.length) return { obj, key };
      const target = translationTarget(obj[key], parts.slice(n), append);
      if (target) return target;
    }
    // answers+ / near+ 可以在已存在的父对象中新增末级字段。
    return append && parts.length === 1 ? { obj, key: parts[0] } : null;
  }
  function applyLang(map) {
    if (!map) return;
    const byId = (arr) => { const o = {}; arr.forEach(x => { o[x.id] = x; }); return o; };
    const roots = {
      chapter: byId(D.chapters), app: D.apps, contact: D.contacts2018, file: byId(D.files), dlg: byId(D.dialogues),
      mail26: byId(D.mails2018), item: byId(D.items2018), reading: byId(D.readings), journal: D.journal, ux: byId(D.userExtras), puzzle: D.puzzles, board: D.boards,
      note: D.notes, col: D.collectibles, ending: D.endings, saver: D.screensaver, bboard: byId(D.bbsBoards), user: byId(D.users),
      thread: byId(D.threads), bmail: byId(D.mails), page: byId(D.pages), gxc: byId(D.gxContacts), gx: byId(D.gxLogs), gxacc: { me: D.gxAccount },
    };
    for (const [key, val] of Object.entries(map)) {
      if (key.startsWith('seg|')) { SEG[key.slice(4)] = val; continue; }
      if (key.startsWith('bbs.')) { D.bbsMeta[key.slice(4)] = val; continue; }
      const append = key.endsWith('+');
      const parts = (append ? key.slice(0, -1) : key).split('.');
      const root = roots[parts[0]];
      const target = translationTarget(root && root[parts[1]], parts.slice(2), append);
      if (!target) continue;
      const { obj, key: last } = target;
      // 未完成译文中的占位符不应覆盖原照片，保留可读的中文原件。
      if (typeof val === 'string' && /^__SVG_[A-Z0-9_]+__$/.test(val) && typeof obj[last] === 'string' && obj[last].includes('<svg')) continue;
      if (append) {
        if (Array.isArray(val)) obj[last] = (obj[last] || []).concat(val);
        else if (val && typeof val === 'object') obj[last] = Object.assign({}, obj[last] || {}, val);
      } else obj[last] = val;
    }
  }
  let DLG = {}, USER = {}, THREAD = {}, MAIL26 = {}, ITEM = {};
  function index() {
    DLG = {}; D.dialogues.forEach(d => DLG[d.id] = d);
    USER = {}; D.users.forEach(u => USER[u.id] = u);
    THREAD = {}; D.threads.forEach(t => THREAD[t.id] = t);
    MAIL26 = {}; D.mails2018.forEach(m => MAIL26[m.id] = m);
    ITEM = {}; D.items2018.forEach(m => ITEM[m.id] = m);
    D.threads.sort((a, b) => a.id - b.id);
  }

  // 将原图替换为写实照片。原 SVG 的证据文字作为独立图层保留，
  // 防止生成图中的日期、编号或笔迹失真，影响玩家推理。
  function applyPhotos() {
    const photos = window.Y2K_PHOTOS || {};
    const svgNS = 'http://www.w3.org/2000/svg';
    const overlayHTML = {
      group: '<rect x="260" y="25" width="140" height="55" rx="2" fill="#101010" stroke="#555" stroke-width="2"/>',
      ice: '<rect x="499" y="82" width="60" height="27" rx="1" fill="#6b4d30" stroke="#49351f" stroke-width="1"/><rect x="597" y="96" width="24" height="12" rx="1" fill="#a21c1c"/>',
    };
    for (const [name, photo] of Object.entries(photos)) {
      for (const target of photo.targets) {
        const entity = (D[target.collection] || []).find(x => x.id === target.id);
        if (!entity || !entity.html) continue;
        const box = document.createElement('div'); box.innerHTML = entity.html;
        const svg = box.querySelector('svg'); if (!svg) continue;
        const vb = svg.viewBox.baseVal;
        const width = vb.width || 640, height = vb.height || 420;
        const texts = [...svg.querySelectorAll('text')];
        if (photo.overlay === 'portrait') {
          texts.filter(node => /[（(]照片[）)]|[（(]photo[）)]|[（(]写真[）)]/i.test(node.textContent)).forEach(node => node.remove());
          const portrait = document.createElementNS(svgNS, 'image');
          portrait.setAttribute('x', '470'); portrait.setAttribute('y', '120'); portrait.setAttribute('width', '110'); portrait.setAttribute('height', '140');
          portrait.setAttribute('preserveAspectRatio', 'xMidYMid slice'); portrait.setAttribute('href', photo.data);
          svg.append(portrait); svg.setAttribute('data-photo', name); entity.html = box.innerHTML; continue;
        }
        if (photo.overlay === 'group') {
          // 与真实合影中的站位一一对应：前排六人，后排七人，右侧主持老师。
          const positions = { 1:[64,78], 2:[153,169], 3:[248,169], 4:[339,165], 5:[405,176], 6:[495,185], 7:[159,78], 8:[298,90], 9:[228,94], 10:[66,177], 11:[383,84], 12:[455,95], 13:[526,78], 14:[582,110] };
          texts.forEach(node => {
            const value = node.textContent.trim();
            if (positions[value]) { node.setAttribute('x', positions[value][0]); node.setAttribute('y', positions[value][1]); }
            else if (value === '距 2000 年') { node.setAttribute('x', '330'); node.setAttribute('y', '44'); node.setAttribute('font-size', '11'); }
            else if (value === '00:01:47') { node.setAttribute('x', '330'); node.setAttribute('y', '69'); node.setAttribute('font-size', '23'); }
          });
        }
        if (photo.overlay === 'ice' && texts.length >= 4) {
          [[529,94,9], [529,105,9], [609,105,8]].forEach(([x, y, size], i) => { texts[i].setAttribute('x', x); texts[i].setAttribute('y', y); texts[i].setAttribute('font-size', size); });
        }
        if (name === 'key_half' && texts.length) {
          texts[0].setAttribute('fill', '#46566c'); texts[texts.length - 1].setAttribute('fill', '#46566c');
        }
        if (photo.overlay === 'date') texts.slice(0, -1).forEach(node => node.remove());
        if (name === 'photo_back') texts.filter(node => node.textContent.includes('梧城彩扩')).forEach(node => node.remove());
        svg.querySelectorAll('defs, rect, path, circle, ellipse, line, polygon, polyline, image').forEach(node => node.remove());
        const raster = document.createElementNS(svgNS, 'image');
        raster.setAttribute('x', '0'); raster.setAttribute('y', '0');
        raster.setAttribute('width', width); raster.setAttribute('height', height);
        raster.setAttribute('preserveAspectRatio', 'xMidYMid slice'); raster.setAttribute('href', photo.data);
        svg.insertBefore(raster, svg.firstChild);
        if (overlayHTML[photo.overlay]) {
          const layer = document.createElementNS(svgNS, 'g'); layer.innerHTML = overlayHTML[photo.overlay];
          raster.after(layer);
        }
        if (name === 'photo_back') {
          const stains = document.createElementNS(svgNS, 'g');
          stains.innerHTML = '<ellipse cx="112" cy="180" rx="48" ry="16" fill="#bfa877" opacity=".3"/><path d="M76 182 q10 -8 20 0 t20 0 t20 0" stroke="#6c7bb0" stroke-width="4" fill="none" opacity=".35"/><ellipse cx="325" cy="288" rx="34" ry="14" fill="#bfa877" opacity=".3"/><path d="M303 290 q9 -7 18 0 t18 0" stroke="#6c7bb0" stroke-width="4" fill="none" opacity=".35"/>';
          svg.append(stains);
        }
        svg.setAttribute('data-photo', name);
        entity.html = box.innerHTML;
      }
    }
  }

  // ============================================================
  // 工具
  // ============================================================
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const strip = (h) => String(h || '').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
  // Resolve legacy default names at display time so existing saves stay intact.
  // 玩家沿用第一部的昵称时，“K哥”“K老师”也跟着换成昵称（第一部一律“{player}师傅”，不分性别）。
  function playerText(s, html = false, name = S ? S.player : '') {
    const nm = name || '老K', own = nm !== '老K' && nm !== _t('老K');
    return String(s == null ? '' : s).replace(/\{player\}|老K|K哥|K老师/g, m => {
      const out = m === 'K哥' ? (own ? nm : m) : m === 'K老师' ? (own ? nm + '老师' : m) : nm;
      return html ? esc(out) : out;
    });
  }
  function fmt(s, player = S ? S.player : '') { return playerText(_t(String(s == null ? '' : s)), true, player); }
  function h(tag, attrs, ...kids) {
    const el = document.createElement(tag);
    if (attrs) for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'html') el.innerHTML = v;
      else if (k === 'text') el.textContent = v;
      else if (k === 'onclick' && (tag === 'button' || attrs.role === 'button')) bindControl(el, v);
      else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
      else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
      else el.setAttribute(k, v === true ? '' : v);
    }
    for (const k of kids.flat()) if (k != null && k !== false) el.append(k.nodeType ? k : document.createTextNode(k));
    if (tag === 'summary') bindControl(el, event => {
      if (event.type !== 'click' && el.parentElement?.tagName === 'DETAILS') el.parentElement.open = !el.parentElement.open;
    });
    return el;
  }
  function norm(s) {
    return String(s == null ? '' : s).normalize('NFKC').toLowerCase()
      .replace(/[\s，。、！？,.!?;:：；'"“”‘’()（）\[\]【】\-—_·\/\\《》<>~～…「」『』|]/g, '');
  }
  // 在触屏松手时直接执行操作；兼容没有补发 click 的浏览器，并去掉同次触摸的重复点击。
  function controlButton(attrs, action, ...children) {
    const button = h('button', Object.assign({ type: 'button' }, attrs), ...children);
    return bindControl(button, action);
  }
  const controlCancels = new WeakMap();
  let controlClickGuard = null, controlClickGuardInstalled = false;
  function guardControlClicks() {
    if (controlClickGuardInstalled) return;
    controlClickGuardInstalled = true;
    const nextPress = () => { controlClickGuard = null; };
    document.addEventListener('pointerdown', nextPress, true);
    document.addEventListener('touchstart', nextPress, { capture: true, passive: true });
    document.addEventListener('click', event => {
      const guard = controlClickGuard;
      // A redraw can detach the touched node and retarget its compatibility click.
      // Keep keyboard activation, script-triggered downloads and the next press intact.
      if (!guard || !event.isTrusted || event.detail === 0 || Date.now() >= guard.until || Math.hypot(event.clientX - guard.x, event.clientY - guard.y) > 28) return;
      event.preventDefault(); event.stopImmediatePropagation();
    }, true);
  }
  function bindControl(button, action, targetOf = () => button) {
    let press = null, suppressClickUntil = 0;
    const reset = () => { press = null; button.classList.remove('pressed-control'); };
    const start = (kind, id, x, y, target) => { reset(); press = { kind, id, x, y, moved: false, target }; if (target === button) button.classList.add('pressed-control'); };
    const move = (x, y) => { if (press && Math.hypot(x - press.x, y - press.y) > 12) { press.moved = true; button.classList.remove('pressed-control'); } };
    const cancel = () => { if (press) suppressClickUntil = Date.now() + 800; reset(); };
    controlCancels.set(button, cancel);
    const finish = (event, x, y) => {
      if (!press) return;
      const current = press, r = current.target.getBoundingClientRect(); move(x, y); reset();
      suppressClickUntil = Date.now() + 800;
      controlClickGuard = { until: suppressClickUntil, x, y };
      if (event.cancelable) event.preventDefault(); event.stopPropagation();
      if (!current.target.disabled && !current.moved && x >= r.left - 6 && x <= r.right + 6 && y >= r.top - 6 && y <= r.bottom + 6) action(event, current.target);
    };
    button.addEventListener('pointerdown', e => {
      const target = targetOf(e); if (!target) return;
      if (e.pointerType === 'mouse') { suppressClickUntil = 0; return; }
      if (!['touch', 'pen'].includes(e.pointerType)) return;
      if (!e.isPrimary) return cancel();
      start('pointer', e.pointerId, e.clientX, e.clientY, target);
    });
    button.addEventListener('pointermove', e => { if (press && press.kind === 'pointer' && press.id === e.pointerId) move(e.clientX, e.clientY); });
    button.addEventListener('pointerup', e => { if (press && press.kind === 'pointer' && press.id === e.pointerId) finish(e, e.clientX, e.clientY); });
    button.addEventListener('pointercancel', cancel);
    button.addEventListener('touchstart', e => {
      const target = targetOf(e); if (!target) return;
      if (e.touches.length !== 1) return cancel();
      if (!press) { const t = e.touches[0]; start('touch', t.identifier, t.clientX, t.clientY, target); }
    }, { passive: true });
    button.addEventListener('touchmove', e => { if (press && press.kind === 'touch') { const t = [...e.touches].find(t => t.identifier === press.id); if (t) move(t.clientX, t.clientY); } }, { passive: true });
    button.addEventListener('touchend', e => {
      if (!targetOf(e)) return;
      const t = press && [...e.changedTouches].find(t => press.kind === 'pointer' || t.identifier === press.id);
      if (t) finish(e, t.clientX, t.clientY);
      else if (Date.now() < suppressClickUntil) { if (e.cancelable) e.preventDefault(); e.stopPropagation(); }
    }, { passive: false });
    button.addEventListener('touchcancel', cancel, { passive: true });
    button.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') suppressClickUntil = 0; });
    button.addEventListener('click', e => {
      const target = targetOf(e); if (!target) return;
      e.stopPropagation();
      if (target.disabled || Date.now() < suppressClickUntil) { e.preventDefault(); return; }
      action(e, target);
    });
    return button;
  }
  function bindChoice(label, input) {
    return bindControl(label, event => {
      if (event.type === 'click' || input.disabled) return;
      input.checked = input.type === 'radio' || !input.checked;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
  }
  // Use visible in-page options on touch devices instead of relying on a native picker click.
  function bindTouchSelect(select, win) {
    const open = () => {
      if (select.disabled || !select.isConnected || win.selectPicker) return;
      const title = select.getAttribute('aria-label') || _t('选择');
      const dialog = h('dialog', { class: 'dlg98 out touch-select-dialog', 'aria-label': title });
      const list = h('div', { class: 'touch-select-options', role: 'listbox', 'aria-label': title });
      let done = false;
      const finish = value => {
        if (done) return; done = true;
        win.selectPicker = null;
        if (dialog.open) dialog.close(); dialog.remove();
        if (!select.isConnected) return;
        select.focus({ preventScroll: true });
        if (value !== undefined && value !== select.value) {
          select.value = value;
          select.dispatchEvent(new Event('input', { bubbles: true }));
          select.dispatchEvent(new Event('change', { bubbles: true }));
        } else if (win.refreshPending) win.refresh();
      };
      for (const option of select.options) {
        const button = controlButton({ class: 'b98 touch-select-option' + (option.selected ? ' down' : ''),
          role: 'option', 'aria-selected': String(option.selected), disabled: option.disabled,
          'data-select-value': option.value, text: option.textContent }, () => finish(option.value));
        list.append(button);
      }
      dialog.append(h('div', { class: 'titlebar' }, h('span', { class: 't', text: title }),
        controlButton({ class: 'b98 tbb', 'aria-label': _t('关闭'), text: '×' }, () => finish())),
        h('div', { class: 'wbody' }, list, h('div', { class: 'row' }, controlButton({ class: 'b98', text: _t('取消') }, () => finish()))));
      dialog.addEventListener('cancel', event => { event.preventDefault(); finish(); });
      dialog.addEventListener('close', () => finish());
      dialog.addEventListener('keydown', event => event.stopPropagation());
      list.addEventListener('keydown', event => {
        const buttons = [...list.querySelectorAll('button:not(:disabled)')], index = buttons.indexOf(document.activeElement);
        const next = { ArrowDown: Math.min(buttons.length - 1, index + 1), ArrowUp: Math.max(0, index - 1), Home: 0, End: buttons.length - 1 }[event.key];
        if (next !== undefined) { event.preventDefault(); buttons[next]?.focus(); }
      });
      win.selectPicker = { close: () => finish() };
      document.body.append(dialog); dialog.showModal();
      const current = list.querySelector('[aria-selected="true"]:not(:disabled)') || list.querySelector('button:not(:disabled)');
      current?.focus({ preventScroll: true }); current?.scrollIntoView({ block: 'nearest' });
    };
    // Cancel only these native pickers, leaving other form controls and page scrolling alone.
    select.addEventListener('pointerdown', event => { if (['touch', 'pen'].includes(event.pointerType) && event.cancelable) event.preventDefault(); });
    select.addEventListener('touchstart', event => { if (event.cancelable) event.preventDefault(); }, { passive: false });
    bindControl(select, event => { if (event.type !== 'click' || touchKeyboard()) { event.preventDefault(); open(); } });
    return select;
  }
  const pad = (n) => String(n).padStart(2, '0');
  const timers = new Set();
  function later(fn, ms) { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); return t; }
  function clearTimers() { timers.forEach(clearTimeout); timers.clear(); }
  const coarse = () => window.matchMedia && matchMedia('(pointer: coarse)').matches;
  const narrow = () => window.innerWidth <= 960;
  const touchKeyboard = () => navigator.maxTouchPoints > 0 || coarse();
  const confirmInput = e => e.key === 'Enter' && !e.isComposing && e.keyCode !== 229;
  const textInputTarget = target => {
    const input = target?.closest?.('input, textarea, [contenteditable="true"]');
    if (!input || input.disabled || input.readOnly) return null;
    return input.isContentEditable || input.tagName === 'TEXTAREA' || ['text', 'search', 'password', 'email', 'url', 'tel', 'number'].includes(input.type) ? input : null;
  };
  // iPad can omit the compatibility click after a touch. Focus the actual field
  // synchronously inside the trusted gesture so WebKit may show its keyboard.
  // Leave scrolling, selection, paste and native click behavior untouched.
  function bindTextInputs() {
    let touch = null, pen = null;
    const begin = (input, id, x, y) => input && ({ input, id, x, y, moved: false });
    const move = (press, x, y) => { if (press && Math.hypot(x - press.x, y - press.y) > 12) press.moved = true; };
    const finish = (press, e, x, y) => {
      if (!press || !e.isTrusted || press.moved || !press.input.isConnected || textInputTarget(e.target) !== press.input) return;
      const r = press.input.getBoundingClientRect();
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) press.input.focus();
    };
    document.addEventListener('touchstart', e => { const t = e.touches[0]; touch = e.touches.length === 1 ? begin(textInputTarget(e.target), t.identifier, t.clientX, t.clientY) : null; }, { capture: true, passive: true });
    document.addEventListener('touchmove', e => { const t = touch && [...e.touches].find(t => t.identifier === touch.id); if (t) move(touch, t.clientX, t.clientY); }, { capture: true, passive: true });
    document.addEventListener('touchend', e => { const t = touch && [...e.changedTouches].find(t => t.identifier === touch.id); if (t) { move(touch, t.clientX, t.clientY); finish(touch, e, t.clientX, t.clientY); } touch = null; }, { capture: true, passive: true });
    document.addEventListener('touchcancel', () => { touch = null; }, { capture: true, passive: true });
    document.addEventListener('pointerdown', e => { if (e.pointerType === 'pen') pen = begin(textInputTarget(e.target), e.pointerId, e.clientX, e.clientY); }, true);
    document.addEventListener('pointermove', e => { if (pen && pen.id === e.pointerId) move(pen, e.clientX, e.clientY); }, true);
    document.addEventListener('pointerup', e => { if (pen && pen.id === e.pointerId) { move(pen, e.clientX, e.clientY); finish(pen, e, e.clientX, e.clientY); pen = null; } }, true);
    document.addEventListener('pointercancel', () => { pen = null; }, true);
  }


  // ============================================================
  // 状态、条件、动作
  // ============================================================
  // 3：现行少年宫剧情。早期档案室剧情的存档（v2）读不进现行剧情，按空存档处理。
  const VER = 4;
  let S = null;
  let flagVer = 0;
  function fresh(player) {
    return {
      v: VER, player: player || _t('老K'), flags: { start: true }, opened: {}, hints: {}, notes: [], noteCh: {}, collected: [],
      dlg: {}, dlgQ: {}, chat: {}, unread: {}, wait: {}, mails: [], mailRead: {}, items: [], itemSeen: {}, boardFill: {},
      seenBoards: {}, seenAsk: {}, chapter: null, chTime: null, stage: 'off', clock: '2026-12-20 21:30', clockAt: Date.now(),
      showHidden: false, playMs: 0, runId: window.Y2KLeaderboard?.newRun(), finishRecords: {}, created: Date.now(), newNotes: 0, newBoards: 0, sound: true, readingSeen: {},
      snap: 'cur', hh: {}, gxRememberedAccounts: [], gxSession: null, storyRevision: D.storyRevision || 0, chatTimeVersion: 1,
    };
  }
  const compiled = {};
  function compile(expr) {
    const toks = expr.match(/[A-Za-z0-9_]+|[()&|!]/g) || [];
    let i = 0;
    const or = () => { let a = and(); while (toks[i] === '|') { i++; const b = and(), x = a; a = (f) => x(f) || b(f); } return a; };
    const and = () => { let a = not(); while (toks[i] === '&') { i++; const b = not(), x = a; a = (f) => x(f) && b(f); } return a; };
    const not = () => { if (toks[i] === '!') { i++; const a = not(); return (f) => !a(f); } return atom(); };
    const atom = () => { const t = toks[i++]; if (t === '(') { const a = or(); i++; return a; } if (!t) return () => true; return (f) => !!f[t]; };
    return or();
  }
  function test(expr) {
    if (!expr) return true;
    const fn = compiled[expr] || (compiled[expr] = compile(expr));
    return fn(S.flags);
  }
  function setFlag(f) { if (!S.flags[f]) { S.flags[f] = true; flagVer++; } }

  let preEndSnap = null, pendingEnding = null;
  function markInteraction() { try { preEndSnap = JSON.stringify(S); } catch (e) { preEndSnap = null; } }

  function setSceneTime(value) {
    // Late optional conversations retain their content without rewinding the present.
    if (S.clock && value < S.clock) return;
    S.clock = value; S.clockAt = Date.now();
    const [date, time] = value.split(' ');
    S.chTime = { date, time, at: S.clockAt };
  }

  // Only an explicit story checkpoint can move a conversation into a later time slot.
  // Ordinary replies and their follow-ups belong to the current slot until the exchange ends.
  function dialogueTime(dialogue, state) {
    const step = dialogue.steps[state?.i || 0];
    const received = state?.at || S.clock;
    const segment = dialogue.startsAt && received < dialogue.startsAt ? dialogue.startsAt : received;
    if (state?.rep || !step) return segment;
    const checkpoint = step.at || step.action?.clock;
    if (checkpoint) return checkpoint > segment ? checkpoint : segment;
    if (step.choice?.length && step.choice.every(option => option.action?.clock)) {
      return step.choice.map(option => option.action.clock).sort()[0];
    }
    return segment;
  }
  function canReachTime(target, currentDialogue) {
    if (!target || (!currentDialogue && target <= S.clock)) return true;
    if (S.pendingTimedActions?.some(entry => entry.action.clock < target)) return false;
    return !D.dialogues.some(dialogue => {
      const state = S.dlg[dialogue.id];
      // Personal catch-ups in the epilogue can still be answered after the next email arrives.
      if (dialogue.blocksClock === false || dialogue.id === currentDialogue || state?.done || (!state && !test(dialogue.trigger))) return false;
      return dialogueTime(dialogue, state) < target;
    });
  }
  function act(a, once, currentDialogue) {
    if (!a) return;
    if (a.clock && !currentDialogue && a.clock > S.clock && !canReachTime(a.clock)) {
      (S.pendingTimedActions ||= []).push({ action: a, once });
      dirty();
      return;
    }
    (a.set || []).forEach(setFlag);
    (a.unset || []).forEach(f => { if (S.flags[f]) { delete S.flags[f]; flagVer++; } });
    [].concat(a.note || []).forEach(addNote);
    if (a.mail) deliverMail(a.mail);
    if (a.toast && once !== false) toast(fmt(a.toast));
    if (a.clock) setSceneTime(a.clock);
    if (a.ending) pendingEnding = a.ending;
    dirty();
  }
  function addNote(id) {
    if (!D.notes[id] || S.notes.includes(id)) return;
    S.notes.push(id); S.noteCh[id] = S.chapter; S.newNotes++;
    toast(_t('笔记 · ') + clipText(strip(fmt(D.notes[id].text)), 34));
  }
  function photoCount() { return Object.keys(D.collectibles).filter(id => S.collected.includes(id)).length; }
  function photoTotal() { return D.trialLimit?.totalNotebookPages ?? Object.keys(D.collectibles).length; }
  function collectPhoto(id, notify = true) {
    const piece = D.collectibles[id];
    if (!piece || S.collected.includes(id) || !piece.parts.every(part => test(part.flag))) return false;
    S.collected.push(id);
    setFlag('col_' + id);
    document.querySelector('.fragment-dialog')?.dispatchEvent(new Event('fragmentchange'));
    if (notify) showPhotoNotice(piece.title);
    return true;
  }
  function recordPhotoRewards(notify = true) {
    const pieces = Object.entries(D.collectibles);
    for (const [id, piece] of pieces) if (!piece.pickup) collectPhoto(id, notify);
    if (!D.trialLimit && pieces.length && pieces.every(([id]) => S.collected.includes(id))) setFlag('collected_all');
  }
  function fragmentPickup(surface, target) {
    return Object.entries(D.collectibles).find(([, piece]) => piece.pickup?.surface === surface && piece.pickup.target === target);
  }
  function takeFragment(id) {
    if (!collectPhoto(id)) return;
    recordPhotoRewards();
    save('auto');
    dirty();
  }
  function deliverMail(id) {
    if (S.mails.includes(id) || !MAIL26[id]) return;
    S.mails.push(id); toast(_t('新邮件 · ') + strip(fmt(MAIL26[id].subject))); sfx('msg');
  }
  // 第一次打开某个东西
  function opened(id, onOpen) {
    if (id) { if (S.opened[id]) return; setFlag('seen_' + id); S.opened[id] = 1; }
    act(onOpen);
    dirty();
  }
  function onceFlag(flag, action) { if (S.flags[flag]) return; setFlag(flag); act(action); }

  // ============================================================
  // 主循环
  // ============================================================
  let dirtyT = 0;
  function dirty() { if (!dirtyT) dirtyT = setTimeout(update, 0); }
  const cardQ = [];
  function update() {
    dirtyT = 0;
    if (!S || titleOn) return;
    // Save the answer now, but wait for the player to finish reading the result.
    if (awaitingPuzzleFeedback()) { save('auto'); return; }
    for (let pass = 0; pass < 4; pass++) {
      const before = flagVer;
      recordPhotoRewards();
      if (S.pendingTimedActions?.length) {
        S.pendingTimedActions.sort((a, b) => a.action.clock.localeCompare(b.action.clock));
        const first = S.pendingTimedActions[0];
        if (canReachTime(first.action.clock)) { S.pendingTimedActions.shift(); act(first.action, first.once); }
      }
      for (const c of D.chapters) {
        const starts = c.date + ' ' + (c.time || '09:00');
        if (!S.flags[c.id] && test(c.trigger) && canReachTime(starts)) {
          setFlag(c.id); S.chapter = c.id; setSceneTime(starts);
          cardQ.push(c);
        }
      }
      const limit = D.trialLimit;
      if (limit && test(limit.trigger) && canReachTime(limit.starts)) {
        if (limit.standalone) {
          const saved = writeSave('auto');
          showTitle();
          const panel = titlePanel($('#title .title-panel-host'), '试玩结束', $('#title .menu button'));
          panel.append(h('p', { text: limit.lastFreeLabel + '《' + D.chapters.at(-1).name + '》已完成，感谢试玩。' }),
            h('p', { text: saved ? '进度已保存。你也可以导出存档，在完整版中继续。' : '浏览器未能保存进度，请导出存档。' }),
            controlButton({ class: 'tbtn', text: '导出存档' }, exportSave));
        } else if (writeSave('auto')) { showTitle(); openFullUnlock(true); }
        else msgBox('保存试玩进度', '浏览器未能保存进度。请先导出存档，解锁后可以导入。', [
          { text: '导出存档', fn: exportSave },
          { text: '前往解锁', fn: () => { showTitle(); openFullUnlock(false); } }
        ]);
        return;
      }
      D.mails2018.forEach(m => { if (m.requires && !S.mails.includes(m.id) && test(m.requires) && (!m.date || !S.clock || m.date <= S.clock)) deliverMail(m.id); });
      D.dialogues.forEach(d => {
        if (S.dlg[d.id] || !test(d.trigger)) return;
        const cursor = S.heldDialogues?.[d.id] || { i: 0 };
        cursor.at = cursor.at && cursor.at > S.clock ? cursor.at : S.clock;
        S.dlg[d.id] = cursor;
        if (S.heldDialogues) delete S.heldDialogues[d.id];
        (S.dlgQ[d.contact] ||= []).push(d.id);
      });
      if (flagVer === before) break;
    }
    for (const [id, b] of Object.entries(D.boards)) {
      if (!canOpenBoard(id) && S.seenBoards[id]) { delete S.seenBoards[id]; S.newBoards = Math.max(0, S.newBoards - 1); }
      if (!S.flags['board_' + id] && !S.seenBoards[id] && canOpenBoard(id)) { S.seenBoards[id] = 1; S.newBoards++; toast(_t('推理板解锁 · ') + b.title, 'good'); sfx('ok'); }
    }
    for (const [id, p] of Object.entries(D.puzzles)) {
      if (p.ask && !S.seenAsk[id] && test(p.requires) && !S.flags['solved_' + id]) { S.seenAsk[id] = 1; S.newNotes++; }
    }
    // 旧事：读到相应原件后出现一篇，提示一句，在“笔记 · 旧事”里看。
    S.readingKnown = S.readingKnown || {};
    for (const r of D.readings) {
      if (r.archiveOfMail && S.mailRead[r.archiveOfMail]) {
        S.readingKnown[r.id] = 1;
        (S.readingSeen ||= {})[r.id] = true;
        continue;
      }
      if (!S.readingKnown[r.id] && test(r.requires)) { S.readingKnown[r.id] = 1; S.newNotes++; toast(_t('旧事 · ') + r.title); }
    }
    D.items2018.forEach(it => { if (!S.items.includes(it.id) && test(it.requires)) { S.items.push(it.id); } });
    forumBatchNotice();
    runDialogues();
    if (pendingEnding) { const e = pendingEnding; pendingEnding = null; showEnding(e); }
    else if (S.flags.c6_sendout && !S.flags.sent_done && !titleOn && !cardOn && !overlay().classList.contains('on') && !ui._sendShown) { ui._sendShown = true; later(openSendOut, 600); }
    showCards();
    renderAll();
    save('auto');
  }

  // ============================================================
  // 存档
  // ============================================================
  const LS = {
    get(k) { try { return localStorage.getItem(savePrefix + k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(savePrefix + k, v); return true; } catch (e) { return false; } },
    del(k) { try { localStorage.removeItem(savePrefix + k); } catch (e) { } },
  };
  const slotCount = globalThis.location?.protocol === 'file:' && LS.get('y2k2_slot9') !== null ? 9 : 8;
  const MANUAL_SLOTS = Array.from({ length: slotCount }, (_, i) => 's' + (i + 1));
  const KEY = { auto: 'y2k2_auto', ...Object.fromEntries(MANUAL_SLOTS.map((slot, i) => [slot, 'y2k2_slot' + (i + 1)])), pre: 'y2k2_preend', meta: 'y2k2_meta' };
  let saveT = 0, storageOK = true;
  function save(slot) {
    if (!S) return;
    if (slot === 'auto') { if (saveT) return; saveT = setTimeout(() => { saveT = 0; writeSave('auto'); }, 400); return; }
    return writeSave(slot);
  }
  function tickPlay() {
    const now = Date.now();
    if (S && playClockRunning && lastTick) S.playMs = Math.max(0, Number(S.playMs) || 0) + Math.max(0, now - lastTick);
    lastTick = now;
  }
  let lastTick = 0, playClockRunning = false;
  function syncPlayClock() {
    tickPlay();
    playClockRunning = !titleOn && document.visibilityState === 'visible' && !document.querySelector('.ending');
  }
  function writeSave(slot) {
    tickPlay();
    if (!titleOn) S.view = captureView();
    S.saved = Date.now();
    const ok = LS.set(KEY[slot], JSON.stringify(S));
    if (!ok && storageOK) { storageOK = false; toast(_t('浏览器不允许本地存储。请用"菜单 → 导出存档"手动保存进度。')); }
    return ok;
  }
  function readSave(slot) { const t = LS.get(KEY[slot]); if (!t) return null; try { const o = JSON.parse(t); return o && o.v === VER ? o : null; } catch (e) { return null; } }
  const previousPhotoCredits = {
    group_photo: 'roof_portrait', whole_tape: 'roof_new_year', spare_disk: 'roof_telescope',
    back_row: 'roof_meteors', saturn_ring: 'roof_wait', call_back: 'roof_letter',
  };
  const retiredExcerptIds = new Set([
    'l_yiming', 'l_xiaochuan', 'l_bailu', 'l_mengfan', 'l_mile', 'k1', 'k2', 'k3', 'k4', 'k5', 'k6', 'k7',
    'forty_credits', 'forty_laugh', 'forty_dark', 'forty_saturn', 'forty_patient',
    'forty_daughter', 'forty_teams', 'forty_birthday', 'forty_key', 'forty_last',
  ]);
  function removeRetiredSaveData(state) {
    const pageIds = Object.keys(D.collectibles);
    let changed = false;
    for (let save = state; save && typeof save === 'object'; save = save.programmeCheckpoint) {
      for (const key of ['communityPosts', 'webMessages']) {
        if (Object.hasOwn(save, key)) {
          delete save[key];
          changed = true;
        }
      }
      if (!Array.isArray(save.collected)) { save.collected = []; changed = true; }
      for (const [oldId, newId] of Object.entries(previousPhotoCredits)) {
        if (!save.collected.includes(oldId) && !save.flags?.['col_' + oldId]) continue;
        save.collected = save.collected.filter(id => id !== oldId);
        if (!save.collected.includes(newId)) save.collected.push(newId);
        if (save.flags) {
          delete save.flags['col_' + oldId];
          save.flags['col_' + newId] = true;
        }
        changed = true;
      }
      if (save.collected.some(id => retiredExcerptIds.has(id))) {
        save.collected = save.collected.filter(id => !retiredExcerptIds.has(id));
        changed = true;
      }
      if (!save.flags) continue;
      for (const id of retiredExcerptIds) {
        const flag = 'col_' + id;
        if (Object.hasOwn(save.flags, flag)) {
          delete save.flags[flag];
          changed = true;
        }
      }
      // 试玩不核销付费章节的进度，留到完整版按全部照片碎片重新核对。
      if (save.flags.collected_all && !needsFullGame(save) &&
          (D.trialLimit || pageIds.some(id => !save.collected?.includes(id)))) {
        delete save.flags.collected_all;
        changed = true;
      }
    }
    return changed;
  }
  function cleanStoredSaveData() {
    for (const slot of ['auto', ...MANUAL_SLOTS, 'pre']) {
      const state = readSave(slot);
      if (state && removeRetiredSaveData(state)) LS.set(KEY[slot], JSON.stringify(state));
    }
  }
  function meta() { try { return JSON.parse(LS.get(KEY.meta) || '{}'); } catch (e) { return {}; } }
  function setMeta(m) { LS.set(KEY.meta, JSON.stringify(m)); }
  function hintCount(state = S) { return Object.values(state?.hints || {}).reduce((sum, n) => sum + (Number.isSafeInteger(n) && n > 0 ? n : 0), 0); }
  function describe(s) {
    if (!s) return _t('空');
    const c = D.chapters.find(x => x.id === s.chapter);
    const d = new Date(s.saved || s.created);
    const pt = Math.round((s.playMs || 0) / 60000);
    const ending = s.activeEnding === 'H' && !meta().endings?.H ? null : D.endings[s.activeEnding];
    const label = ending ? (s.activeEnding === 'H' ? _t('隐藏结局') : _t('结局') + ' ' + s.activeEnding) + ' · ' + ending.title
      : c ? c.num + ' ' + c.name : needsFullGame(s) ? '完整版存档' : _t('序章');
    return `${label} ${_t('· 游玩')} ${Math.floor(pt / 60)}${_t('小时')}${pt % 60}${_t('分 ·')} ${d.getMonth() + 1}/${d.getDate()} ${pad(d.getHours())}:${pad(d.getMinutes())} · ${_t('提示次数')}：${hintCount(s)}`;
  }
  function needsFullGame(o) {
    return D.trialLimit && (o.flags?.[D.trialLimit.firstPaidChapter] || (o.chapter && !D.chapters.some(c => c.id === o.chapter)));
  }
  function loadState(o) {
    if (needsFullGame(o)) {
      if (D.trialLimit.standalone) {
        msgBox('完整版存档', '这份存档已超过试玩范围，请在完整版中打开。', [{ text: '返回' }], true);
        return;
      }
      msgBox('完整版存档', '这个存档已进入' + D.trialLimit.firstPaidLabel + '或后续章节。解锁后可从读取存档继续。', [
        { text: '返回' }, { text: '解锁完整版', fn: () => { if (!titleOn) showTitle(); openFullUnlock(false); } }
      ], true);
      return;
    }
    clearTimers(); running = {}; typing = {};
    clearTimeout(dirtyT); dirtyT = 0; clearTimeout(saveT); saveT = 0;
    closeAllWins(); closeOverlay(); closeModal(false);
    $('#toast')?.replaceChildren();
    $('#fragmentNotices').replaceChildren();
    removeRetiredSaveData(o);
    restoreCollectedEndings(o);
    S = Object.assign(fresh(o.player), o);
    delete S.collectionEndings;
    if (!Array.isArray(o.gxRememberedAccounts)) {
      const previous = o.gxRemember && (o.gxRememberedAccount || o.gxSession);
      S.gxRememberedAccounts = previous && gxAccount(previous) ? [previous] : [];
      if (!o.gxRemember) S.gxSession = null;
    }
    delete S.gxRemember;
    delete S.gxRememberedAccount;
    for (const item of D.items2018) {
      if (!item.replaces) continue;
      if (S.items.includes(item.replaces)) S.items = [...new Set(S.items.map(id => id === item.replaces ? item.id : id))];
      if (o.view?.phone?.item === item.replaces) o.view.phone.item = item.id;
    }
    for (const [id, wasOpened] of Object.entries(S.opened || {})) {
      if (wasOpened) setFlag('seen_' + id);
    }
    // 词卡合并后保留旧档中每一格的选择，含回到节目单时恢复的进度。
    for (let saved = S; saved; saved = saved.programmeCheckpoint) {
      for (const [id, fill] of Object.entries(saved.boardFill || {})) {
        const aliases = D.boards[id]?.wordAliases;
        if (!aliases || !fill) continue;
        for (const [slot, word] of Object.entries(fill)) {
          if (Object.hasOwn(aliases, word)) fill[slot] = aliases[word];
        }
      }
    }
    if (D.migrateStory) { S.storyRevision = o.storyRevision || 0; D.migrateStory(S); }
    else S.storyRevision = D.storyRevision || S.storyRevision;
    recordPhotoRewards(false);
    if (o.chatTimeVersion !== 1) repairChatTimes();
    // A save can be reopened halfway through an older exchange after a later notification.
    for (const dialogue of D.dialogues) {
      const history = S.chat[dialogue.contact] || [];
      for (const [index, step] of dialogue.steps.entries()) {
        for (const [optionIndex, option] of (step.choice || []).entries()) {
          if (!option.previousText && !option.previousReplies) continue;
          const revise = (oldText, newText, replyIndex) => {
            if (!oldText) return;
            const isReply = replyIndex != null;
            for (const message of history) {
              const ref = message.ref;
              if (ref && (ref.d !== dialogue.id || ref.i !== index || ref.o !== optionIndex || ref.r !== replyIndex)) continue;
              if (message.from === (isReply ? 'npc' : 'me') && message.text === oldText) message.text = newText;
            }
            const progress = S.dlg[dialogue.id];
            if (isReply && progress?.i === index + 1 && Array.isArray(progress.rep)) {
              progress.rep = progress.rep.map(line => line === oldText ? newText : line);
            }
          };
          revise(option.previousText, option.text);
          option.previousReplies?.forEach((old, r) => revise(old, replyText(option.reply[r]), r));
        }
        if (!step.previousText) continue;
        const oldLines = [].concat(step.previousText);
        const from = ['npc', 'me', 'sys'].find(key => typeof step[key] === 'string');
        if (!from) continue;
        for (const message of history) {
          const ref = message.ref;
          if (ref && (ref.d !== dialogue.id || ref.i !== index || ref.o != null)) continue;
          if (!ref && message.from !== from && message.from !== step.previousFrom) continue;
          if (!oldLines.includes(message.text)) continue;
          message.from = from;
          message.text = step[from];
        }
        if (step.mergedFollowup) {
          const matchesStep = (message, i) => message.from === from && (!message.ref ||
            (message.ref.d === dialogue.id && message.ref.i === i && message.ref.o == null));
          const tail = history.findIndex(m => matchesStep(m, index + 1) && step.mergedFollowup.includes(m.text));
          if (tail < 0) continue;
          const first = history.findIndex(m => matchesStep(m, index) && m.text === step[from]);
          if (first < 0) {
            history[tail].text = step[from];
            history[tail].ref = { d: dialogue.id, i: index };
          } else {
            const laterIncoming = history.slice(first + 1).filter(m => m.from === 'npc').length;
            if (S.unread[dialogue.contact] > laterIncoming) S.unread[dialogue.contact]--;
            history.splice(tail, 1);
          }
        }
      }
      const state = S.dlg[dialogue.id];
      if (!state || state.done || state.at) continue;
      const completedSteps = dialogue.steps.slice(0, state.i);
      const lastClock = completedSteps.map(step => step.action?.clock).filter(Boolean).at(-1);
      const message = history.findLast(m => m.ref ? m.ref.d === dialogue.id : completedSteps.some(step => step[m.from] && step[m.from] === m.text));
      state.at = [lastClock, message && chatTimestamp(message)].filter(Boolean).sort().at(-1) || S.clock;
    }
    // Keep in-chapter date advances (overnight investigation / next-day hospital) when loading.
    if (D.retime) Object.values(S.chat).forEach(log => log.forEach(m => { if (typeof m.text === 'string') m.text = D.retime(m.text); }));
    if (window.Y2K2Locale) Object.values(S.chat).forEach(log => log.forEach(m => { if (!m.ref && typeof m.text === 'string') m.text = window.Y2K2Locale.history(m.text, LANG); }));
    flagVer++; cardQ.length = 0; cardOn = false; pendingEnding = null;
    preEndSnap = null;
    lastTick = Date.now(); playClockRunning = false;
    window.Y2KLeaderboard?.resume(S);
    ui.tab = 'msg'; ui.chat = null; ui.mail = null; ui.item = null;
    ui._viewKey = null; ui.scroll = {}; ui.menuView = null; ui.boardLead = null;
    ui.noteTab = 'questions'; ui.noteQuery = ''; ui.itemQuery = '';
    ui.reading = null; ui.clueScope = 'current'; ui.clueGroups = {}; ui.questionGroups = {};
    ui.clip = null; ui.frameSel = null; ui.framePuzzle = null; ui.frameMsg = ''; ui.returnBoard = null;
    ui.phoneOpen = false; $('#phone').classList.remove('open');
    hideTitle();
    renderScreen(); renderAll(); restoreView(o.view); dirty();
    const unfinishedReview = Object.keys(S.finishRecords || {}).find(id => S.finishRecords[id]?.review === null);
    const legacyEnding = !Object.hasOwn(o, 'activeEnding') && !S.flags.c8_begin && S.ends?.at(-1);
    const resumeEnding = unfinishedReview || S.activeEnding || legacyEnding;
    if (resumeEnding && D.endings[resumeEnding]) showEnding(resumeEnding, true);
  }
  function portableSave() {
    tickPlay();
    return { ...S, view: captureView(), collectionEndings: meta().endings || {} };
  }
  function restoreCollectedEndings(state) {
    const m = meta();
    const endings = m.endings ||= {};
    let changed = false;
    for (const id of ['A', 'B', 'C', 'H']) {
      let date = state.collectionEndings?.[id];
      if (!Number.isSafeInteger(date) || date <= 0) {
        if (!Array.isArray(state.ends) || !state.ends.includes(id) || !state.flags?.['ending_' + id]) continue;
        date = Number.isSafeInteger(state.saved) && state.saved > 0 ? state.saved : Date.now();
      }
      if (!endings[id] || date < endings[id]) {
        endings[id] = date;
        changed = true;
      }
    }
    if (changed) setMeta(m);
  }
  function exportSave() {
    const blob = new Blob([JSON.stringify(portableSave(), null, 1)], { type: 'application/json' });
    const a = h('a', { href: URL.createObjectURL(blob), download: `${_t('千年虫2存档_')}${new Date().toISOString().slice(0, 10)}.json` });
    document.body.append(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    toast(_t('已导出存档文件'));
  }
  function importFile(cb, onPack) {
    const inp = h('input', { type: 'file', accept: '.json,application/json', style: { display: 'none' } });
    inp.onchange = () => {
      const f = inp.files[0]; if (!f) return;
      const r = new FileReader();
      r.onload = () => { try { const o = JSON.parse(r.result);
        // 存档包：一个文件里装着几个手动存档位（例如各章开头的测试存档），确认后写进对应的存档位。
        if (o && o.kind === 'y2k2-slots' && o.slots && typeof o.slots === 'object') {
          const list = Object.entries(o.slots).filter(([k, s]) => MANUAL_SLOTS.includes(k) && s && s.v === VER && s.flags);
          if (!list.length) throw 0;
          const nums = list.map(([k]) => MANUAL_SLOTS.indexOf(k) + 1).join('、');
          msgBox(_t('导入存档包'), `${esc(o.note || '')}<br><br>${_t('将写入存档位')} ${nums}${_t('，原来在这些存档位里的进度会被覆盖。')}`, [
            { text: _t('导入'), fn: () => {
              let n = 0;
              for (const [slot, state] of list) {
                removeRetiredSaveData(state);
                if (LS.set(KEY[slot], JSON.stringify(state))) n++;
              }
              toast(`${_t('已导入')} ${n} ${_t('个存档位')}`, 'good');
              renderPhone(); onPack && onPack();
            } },
            { text: _t('取消') }], titleOn);
          return;
        }
        if (o.v !== VER || !o.flags) throw 0; loadState(o); toast(_t('存档已读取')); cb && cb(); } catch (e) { toast(_t('这个文件不是《千年虫2》的存档')); } };
      r.readAsText(f);
    };
    document.body.append(inp); inp.click(); setTimeout(() => inp.remove(), 60000);
  }
  const b64e = (s) => btoa(unescape(encodeURIComponent(s)));
  const b64d = (s) => decodeURIComponent(escape(atob(s.trim())));

  // Save the reading position as well as story progress. Old saves need no view data.
  const viewKeys = ['tab', 'chat', 'mail', 'item', 'phoneOpen', 'noteTab', 'noteQuery', 'itemQuery', 'reading', 'clueScope', 'clueGroups', 'questionGroups', 'scroll', 'clip', 'frameSel', 'framePuzzle', 'frameMsg', 'returnBoard'];
  function rememberQuestionGroups(body) {
    if (!ui._viewKey?.startsWith('notes:')) return;
    for (const section of body.querySelectorAll('details[data-question-group]')) {
      ui.questionGroups[section.dataset.questionGroup] = section.open;
    }
  }
  function captureView() {
    const body = $('#phBody');
    if (body && ui._viewKey) {
      ui.scroll[ui._viewKey] = body.scrollTop;
      rememberQuestionGroups(body);
    }
    const phone = Object.fromEntries(viewKeys.map(key => [key, ui[key]]));
    const windows = wins.slice().sort((a, b) => a.z - b.z).map(w => ({
      key: w.key, file: w.o.file?.id, draftName: w.key?.startsWith('np_') && !w.o.file?.id ? w.o.file?.path : undefined,
      state: w.state, min: w.min, max: w.el.classList.contains('max'),
      rect: ['left', 'top', 'width', 'height'].map(key => parseFloat(w.el.style[key]) || 0),
      scroll: [w.body, ...w.body.querySelectorAll('*')].map((el, index) => ({ index, top: el.scrollTop, left: el.scrollLeft })).filter(s => s.top || s.left),
    }));
    return JSON.parse(JSON.stringify({ phone, windows, board: $('.board')?.dataset.board || null }));
  }
  function restoreView(view) {
    if (!view || typeof view !== 'object') return;
    const phone = view.phone || {};
    for (const key of viewKeys) if (Object.hasOwn(phone, key)) ui[key] = phone[key];
    if (!['msg', 'mail', 'items', 'notes', 'boards', 'clips', 'list', 'menu'].includes(ui.tab)) ui.tab = 'msg';
    if (ui.chat && !contactVisible(ui.chat)) ui.chat = null;
    if (!S.items.includes(ui.item)) ui.item = null;
    if (!S.mails.includes(ui.mail)) ui.mail = null;
    ui.scroll ||= {}; ui.clueGroups ||= {}; ui.questionGroups ||= {}; ui.phoneOpen = narrow() && !!ui.phoneOpen;
    // Only reopen known applications and currently available files, never saved HTML.
    if (S.stage === 'win') for (const saved of Array.isArray(view.windows) ? view.windows : []) {
      const st = saved.state || {}, file = saved.file && D.files.find(f => f.id === saved.file);
      let win;
      if (file) { if (!test(file.requires)) continue; openFile(file); }
      else if (typeof saved.key === 'string' && saved.key.startsWith('np_') && !saved.file && typeof st.text === 'string') {
        openNotepad({path: typeof saved.draftName === 'string' ? saved.draftName : '无标题', text: ''}, saved.key);
      }
      else if (saved.key === 'explorer') openExplorer(typeof st.path === 'string' ? st.path : '');
      else if (saved.key === 'ie' && test((D.apps.internet || D.apps.bbs)?.requires)) {
        const local = st.local?.id && D.files.find(f => f.id === st.local.id);
        win = createIE({ ...st, local: local || null });
      }
      else if (['gexun', 'diskfix', 'compare', 'map'].includes(saved.key) && D.apps[saved.key] && test(D.apps[saved.key].requires)) openApp(saved.key);
      else if (saved.key === 'display') openDisplay();
      else if (saved.key === 'recycle') openRecycle();
      else continue;
      if (!win) {
        win = wins.find(w => w.key === saved.key);
        if (!win) continue;
        const restoredState = { ...st };
        // 只读原件始终显示当前正文。玩家自己的记事本仍从存档恢复草稿。
        if (file && win.key === 'np_' + file.id) delete restoredState.text;
        Object.assign(win.state, restoredState);
      }
      if (Object.hasOwn(win.state, 'playing')) win.state.playing = false;
      const rect = Array.isArray(saved.rect) ? saved.rect : [], dk = desktop();
      const width = Math.max(220, Math.min(Number(rect[2]) || 560, dk.clientWidth - 10));
      const height = Math.max(140, Math.min(Number(rect[3]) || 400, dk.clientHeight - 10));
      win.el.style.width = width + 'px'; win.el.style.height = height + 'px';
      win.el.style.left = windowLeft(Number(rect[0]) || 0, width, dk.clientWidth) + 'px';
      win.el.style.top = Math.max(0, Math.min(Number(rect[1]) || 0, dk.clientHeight - height)) + 'px';
      win.toggleMax(narrow() || !!saved.max); win.refresh(true);
      const nodes = [win.body, ...win.body.querySelectorAll('*')];
      for (const pos of saved.scroll || []) if (nodes[pos.index]) { nodes[pos.index].scrollTop = pos.top; nodes[pos.index].scrollLeft = pos.left; }
      win.min = !!saved.min; win.el.hidden = win.min;
    }
    renderTasks(); $('#phone').classList.toggle('open', ui.phoneOpen); renderPhone();
    if (view.board && canOpenBoard(view.board)) openBoard(view.board);
  }
  function sessionScreen(value) {
    try {
      const key = 'y2k2_screen:' + location.pathname;
      if (value) sessionStorage.setItem(key, value);
      return sessionStorage.getItem(key);
    } catch (e) { return null; }
  }

  // ============================================================
  // 声音（WebAudio 合成，可关闭）
  // ============================================================
  // 实际的合成和播放在 src/audio.js（Y2KAudio）；这里只转一下名字。下面的旧实现保留作没有 audio.js 时的后备。
  let actx = null;
  function sfx(kind) {
    if (window.Y2KAudio) return window.Y2KAudio.sfx(kind === 'boot' ? 'chime' : kind);
    if (!S || !S.sound) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      if (actx.state === 'suspended') actx.resume();
      const t = actx.currentTime;
      const tone = (f, d, at = 0, type = 'sine', vol = .06) => {
        const o = actx.createOscillator(), g = actx.createGain();
        o.type = type; o.frequency.value = f; g.gain.setValueAtTime(vol, t + at); g.gain.exponentialRampToValueAtTime(.0001, t + at + d);
        o.connect(g).connect(actx.destination); o.start(t + at); o.stop(t + at + d + .02);
      };
      if (kind === 'msg') { tone(880, .12); tone(1320, .18, .1); }
      else if (kind === 'ok') { tone(660, .12); tone(880, .12, .1); tone(1175, .25, .2); }
      else if (kind === 'err') { tone(220, .25, 0, 'square', .04); }
      else if (kind === 'boot') { [523, 659, 784, 1047].forEach((f, i) => tone(f, 1.6 - i * .2, i * .22, 'triangle', .05)); }
      else if (kind === 'click') { tone(1800, .03, 0, 'square', .02); }
    } catch (e) { }
  }

  // ============================================================
  // 提示条
  // ============================================================
  // 提示里只放一句话：太长就在标点处收住，收不住才加省略号；角标超过99显示99+
  function clipText(t, n) { if (t.length <= n + 2) return t; const cut = t.slice(0, n + 1); const i = Math.max(cut.lastIndexOf('。'), cut.lastIndexOf('；'), cut.lastIndexOf('，')); return i >= n * 0.6 ? t.slice(0, i) + '……' : t.slice(0, n) + '……'; }
  function badgeText(n) { return n > 99 ? '99+' : String(n); }
  function toast(text, kind) {
    const box = $('#toast'); if (!box) return;
    if (typeof S !== 'undefined' && S && S.activeEnding) return; // 结局页上不弹提示，免得盖住正文
    const el = h('div', { class: 'tst' + (kind ? ' ' + kind : ''), html: text });
    box.append(el);
    while (box.children.length > 3) box.firstChild.remove();
    setTimeout(() => el.remove(), 3800);
  }
  function showPhotoNotice(title) {
    const notice = h('div', { class: 'tst fragment-notice' },
      h('span', { 'aria-hidden': 'true', html: icon('img') }),
      h('span', { text: _t('发现照片碎片') + ' · ' + title }),
      h('small', { text: photoCount() + ' / ' + photoTotal() }));
    $('#fragmentNotices').append(notice);
    setTimeout(() => notice.remove(), 5000);
  }

  // ============================================================
  // 图标（像素风小 SVG）
  // ============================================================
  const ICONS = {
    diskfix: '<rect x="5" y="3" width="22" height="26" fill="#2b2b2b" stroke="#000"/><rect x="10" y="3" width="12" height="8" fill="#c0c0c0"/><rect x="9" y="16" width="14" height="11" fill="#fff"/><path d="M11 19h10M11 22h6" stroke="#d33" stroke-width="2"/>',
    floppy: '<rect x="5" y="3" width="22" height="26" fill="#1d4fa0" stroke="#000"/><rect x="10" y="3" width="12" height="8" fill="#c0c0c0"/><rect x="9" y="16" width="14" height="11" fill="#fff"/>',
    restore: '<circle cx="16" cy="16" r="11" fill="#fff" stroke="#1f5fbf" stroke-width="2"/><path d="M16 9v7l5 3" stroke="#1f5fbf" stroke-width="2" fill="none"/><path d="M4 10l2 6 6-3" fill="#2e9e46"/>',
    map: '<path d="M3 7l8-3 10 3 8-3v21l-8 3-10-3-8 3z" fill="#f4e7b5" stroke="#000"/><path d="M11 4v21M21 7v21" stroke="#000" fill="none"/><path d="M5 19c4-2 6 2 10 0s6-4 12-2" stroke="#2e9e46" stroke-width="2" fill="none"/><circle cx="17" cy="12" r="2.5" fill="#d33"/>',
    compare: '<rect x="3" y="5" width="12" height="22" fill="#fff" stroke="#000"/><rect x="17" y="5" width="12" height="22" fill="#fff" stroke="#000"/><rect x="5" y="12" width="8" height="3" fill="#f2c94c"/><rect x="19" y="12" width="8" height="3" fill="#f2c94c"/><rect x="5" y="18" width="8" height="3" fill="#e57373"/><rect x="19" y="21" width="8" height="3" fill="#81c784"/>',
    computer: '<rect x="4" y="4" width="24" height="17" fill="#c0c0c0" stroke="#000"/><rect x="7" y="7" width="18" height="11" fill="#008080"/><rect x="10" y="22" width="12" height="3" fill="#c0c0c0" stroke="#000"/><rect x="5" y="25" width="22" height="4" fill="#c0c0c0" stroke="#000"/>',
    folder: '<path d="M2 8h10l2 3h16v16H2z" fill="#f6d36b" stroke="#7a5c00"/><path d="M2 12h28v15H2z" fill="#ffe28a" stroke="#7a5c00"/>',
    drive: '<rect x="3" y="11" width="26" height="12" fill="#c0c0c0" stroke="#000"/><rect x="6" y="16" width="12" height="2" fill="#404040"/><rect x="23" y="15" width="3" height="3" fill="#0c0"/>',
    floppy: '<rect x="5" y="4" width="22" height="24" fill="#2b2b7a" stroke="#000"/><rect x="10" y="4" width="12" height="8" fill="#c0c0c0"/><rect x="18" y="5" width="3" height="6" fill="#2b2b7a"/><rect x="9" y="17" width="14" height="10" fill="#fff"/>',
    txt: '<path d="M7 3h13l5 5v21H7z" fill="#fff" stroke="#000"/><path d="M20 3v5h5" fill="none" stroke="#000"/><path d="M10 12h12M10 15h12M10 18h12M10 21h9" stroke="#000080"/>',
    doc: '<path d="M7 3h13l5 5v21H7z" fill="#fff" stroke="#000"/><path d="M20 3v5h5" fill="none" stroke="#000"/><rect x="10" y="11" width="12" height="9" fill="#1d55c4"/><text x="12" y="19" font-size="8" fill="#fff" font-family="Arial" font-weight="bold">W</text><path d="M10 23h12" stroke="#000"/>',
    img: '<rect x="4" y="6" width="24" height="20" fill="#fff" stroke="#000"/><rect x="6" y="8" width="20" height="14" fill="#7ec0ff"/><path d="M6 22l7-8 5 5 3-3 5 6z" fill="#2f8a2f"/><circle cx="21" cy="12" r="2" fill="#ff0"/>',
    video: '<path d="M3 5h26v22H3z" fill="#434446" stroke="#000"/><path d="M7 8h18v16H7z" fill="#86b6ce"/><path d="M4 8v3m0 3v3m0 3v3M27 8v3m0 3v3m0 3v3" stroke="#fff" stroke-width="2"/><path d="M13 11l8 5-8 5z" fill="white"/>',
    audio: '<rect x="3" y="8" width="26" height="17" rx="2" fill="#333" stroke="#000"/><rect x="6" y="10" width="20" height="5" fill="#f3edd8"/><circle cx="11" cy="20" r="3" fill="#ddd"/><circle cx="21" cy="20" r="3" fill="#ddd"/>',
    zip: '<rect x="6" y="4" width="20" height="24" fill="#f2c94c" stroke="#000"/><path d="M16 4v24" stroke="#000" stroke-dasharray="2 2"/><rect x="13" y="16" width="6" height="6" fill="#c0c0c0" stroke="#000"/>',
    exe: '<rect x="4" y="6" width="24" height="20" fill="#c0c0c0" stroke="#000"/><rect x="4" y="6" width="24" height="4" fill="#000080"/><rect x="8" y="14" width="16" height="2" fill="#000"/><rect x="8" y="18" width="10" height="2" fill="#000"/>',
    sys: '<path d="M7 3h13l5 5v21H7z" fill="#fff" stroke="#000"/><circle cx="16" cy="18" r="5" fill="#c0c0c0" stroke="#000"/><circle cx="16" cy="18" r="2" fill="#fff" stroke="#000"/>',
    htm: '<path d="M7 3h13l5 5v21H7z" fill="#fff" stroke="#000"/><circle cx="16" cy="18" r="6" fill="#3a7bd5"/><path d="M10 18h12M16 12v12" stroke="#fff"/>',
    ie: '<circle cx="16" cy="16" r="11" fill="#3a7bd5" stroke="#0b2a6b"/><text x="10" y="22" font-size="17" font-family="Georgia" font-style="italic" font-weight="bold" fill="#fff">e</text><path d="M4 20c6-10 18-14 25-12" stroke="#f2c94c" stroke-width="2" fill="none"/>',
    pigeon: '<path d="M5 20c2-8 10-12 17-10l5-3-1 6c2 4 0 9-6 11H9z" fill="#e8eef7" stroke="#2b4a7a"/><circle cx="22" cy="12" r="1.3" fill="#000"/><path d="M27 12l3 1-3 1" fill="#f2a33a"/>',
    recycle: '<path d="M8 9h16l-2 19H10z" fill="#d9e6ef" stroke="#3a4a5a"/><rect x="6" y="6" width="20" height="3" fill="#b9c9d6" stroke="#3a4a5a"/><path d="M13 13v12M16 13v12M19 13v12" stroke="#7b8c9a"/>',
    recyclefull: '<path d="M8 9h16l-2 19H10z" fill="#d9e6ef" stroke="#3a4a5a"/><rect x="6" y="6" width="20" height="3" fill="#b9c9d6" stroke="#3a4a5a"/><path d="M11 9l3-5 4 3 4-4 1 6" fill="#fff" stroke="#555"/>',
    display: '<rect x="4" y="5" width="24" height="17" fill="#c0c0c0" stroke="#000"/><rect x="7" y="8" width="18" height="11" fill="#000"/><text x="9" y="16" font-size="6" fill="#ff0" font-family="Arial">abc</text><rect x="12" y="23" width="8" height="4" fill="#c0c0c0" stroke="#000"/>',
    help: '<circle cx="16" cy="16" r="11" fill="#fff" stroke="#000"/><text x="11" y="22" font-size="16" font-weight="bold" font-family="Arial" fill="#000080">?</text>',
    win: '<g transform="skewX(-12) translate(4 0)"><path d="M9 3q5-2 10 0t10 0v22q-5 2-10 0t-10 0z" fill="#171717"/><path d="M11 5q4-1 7 0v8q-4-1-7 0z" fill="#f04426"/><path d="M20 6q4 1 7-1v8q-3 2-7 1z" fill="#59aa38"/><path d="M11 15q3-1 7 0v8q-4-1-7 0z" fill="#2869bc"/><path d="M20 16q3 1 7-1v8q-3 2-7 1z" fill="#ffd538"/><path d="M6 4h2v3H6zm-4 1h2v2H2zm3 4h3v3H5zm-4 1h2v2H1zm5 4h2v3H6zm-3 2h2v2H3zm2 4h3v3H5z" fill="#222"/></g>',
    lock: '<rect x="18" y="20" width="12" height="10" fill="#f2c94c" stroke="#000"/><path d="M20 20v-3a4 4 0 0 1 8 0v3" fill="none" stroke="#000" stroke-width="2"/>',
    shutdown: '<rect x="5" y="6" width="22" height="16" fill="#c0c0c0" stroke="#000"/><rect x="8" y="9" width="16" height="10" fill="#000080"/><rect x="11" y="23" width="10" height="4" fill="#c0c0c0" stroke="#000"/>',
    notepad: '<rect x="6" y="4" width="20" height="25" fill="#fff" stroke="#000"/><path d="M6 4h20v4H6z" fill="#7aa7e0"/><path d="M9 12h14M9 15h14M9 18h14M9 21h10" stroke="#555"/>',
  };
  // Small toolbar bitmaps share the desktop icon palette and fixed pixel grid.
  const navGlyphs = {
    back: '<path d="M2 10l8-7v4h8v6h-8v4z" fill="#44993d" stroke="#1c5720"/><path d="M4 10l5-4m1 2h7" fill="none" stroke="#a8db86"/>',
    up: '<path d="M1 7h6l2 2h10v9H1z" fill="#ffdc73" stroke="#765900"/><path d="M10 13V5H7l5-4 5 4h-3v8z" fill="#4c9845" stroke="#23581e"/>',
    refresh: '<path d="M3 1h10l4 4v13H3z" fill="#fff" stroke="#666"/><path d="M13 1v5h4" fill="none" stroke="#777"/><path d="M5 10a5 5 0 0 1 8-3l2-2v6h-6l2-2a3 3 0 0 0-6 1zm10 2a5 5 0 0 1-8 3l-2 2v-6h6l-2 2a3 3 0 0 0 6-1z" fill="#38854b"/>',
    home: '<path d="M3 9L10 3l7 6v9H3z" fill="#faecc3" stroke="#674f32"/><path d="M1 9l9-8 9 8-2 2-7-6-7 6z" fill="#ad533b" stroke="#79382c"/><path d="M8 12h4v6H8z" fill="#717c8f"/>',
    search: '<path d="M9 12l-7 7" stroke="#272328" stroke-width="5"/><path d="M8 13l-5 5" stroke="#956840" stroke-width="3"/><circle cx="12" cy="7" r="6" fill="#cbebf6" stroke="#455368" stroke-width="2"/><path d="M8 7q1-4 5-4" fill="none" stroke="#fff" stroke-width="2"/>',
    props: '<path d="M3 1h10l4 4v13H3z" fill="#fff" stroke="#666"/><path d="M13 1v5h4M6 8h6M6 11h6M6 14h4" fill="none" stroke="#557085"/>',
    favorite: '<path d="M10 1l2.4 5.2 5.8.8-4.2 4.1 1 5.9-5-2.8L5 17l1-5.9L1.8 7l5.8-.8z" fill="#ffcf55" stroke="#916424"/>',
    source: '<path d="M3 1h10l4 4v13H3z" fill="#fff" stroke="#555"/><path d="M13 1v5h4M8 9l-3 3 3 3m4-6 3 3-3 3" fill="none" stroke="#142e83" stroke-width="1.5"/>',
  };
  function navButton(glyph, label, action, disabled = false, accessible = label) {
    const artwork = glyph === 'forward' ? '<g transform="translate(20 0) scale(-1 1)">' + navGlyphs.back + '</g>' : navGlyphs[glyph];
    const svg = '<svg viewBox="0 0 20 20" aria-hidden="true">' + artwork + '</svg>';
    return controlButton({class:'b98 nav-command', disabled, title:label, 'aria-label':accessible}, action,
      h('span', {html:svg}), h('span', {text:label}));
  }
  const TYPEICON = { folder: 'folder', txt: 'txt', log: 'txt', bas: 'txt', ini: 'sys', bat: 'sys', bak: 'sys', dat: 'sys', sys: 'sys', doc: 'doc', htm: 'htm', img: 'img', audio: 'audio', video: 'video', zip: 'zip', exe: 'exe', lnk: 'exe' };
  const TYPENAME = { folder: _t('文件夹'), txt: _t('文本文档'), log: _t('日志文件'), ini: _t('配置设置'), bas: _t('BASIC 源文件'), bat: _t('MS-DOS 批处理程序'), bak: _t('BAK 文件'), dat: _t('DAT 文件'), sys: _t('系统文件'), doc: _t('写字板文档'), htm: _t('HTML 文档'), img: _t('位图图像'), audio: _t('波形声音'), zip: _t('ZIP 压缩文件'), exe: _t('应用程序'), lnk: _t('快捷方式'), video: _t('视频文件') };
  function icon(name, locked) {
    return `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">${ICONS[name] || ICONS.txt}${locked ? ICONS.lock : ''}</svg>`;
  }
  const PHICON = {
    clips: '<rect x="3" y="6" width="13" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M16 10l5-3v10l-5-3z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>',
    list: '<path d="M8 6h12M8 12h12M8 18h12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M3.5 6l1 1 2-2M3.5 12l1 1 2-2" stroke="currentColor" stroke-width="1.5" fill="none"/><circle cx="5" cy="18" r="1.3" fill="currentColor"/>',
    msg: '<path d="M4 5h16v11H9l-5 4z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M3 7l9 6 9-6" fill="none" stroke="currentColor" stroke-width="1.8"/>',
    items: '<path d="M4 8l8-4 8 4v9l-8 4-8-4z M4 8l8 4 8-4 M12 12v9" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>',
    notes: '<rect x="5" y="3" width="14" height="18" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M8 8h8M8 12h8M8 16h5" stroke="currentColor" stroke-width="1.8"/>',
    boards: '<rect x="3" y="4" width="18" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="8" cy="9" r="1.6" fill="currentColor"/><circle cx="16" cy="14" r="1.6" fill="currentColor"/><path d="M8 9l8 5" stroke="currentColor" stroke-width="1.5"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
    phone: '<rect x="7" y="2" width="10" height="20" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M11 18h2" stroke="currentColor" stroke-width="1.8"/>',
  };
  const phIcon = (k) => `<svg viewBox="0 0 24 24">${PHICON[k]}</svg>`;

  // ============================================================
  // 时间
  // ============================================================
  function machineNow() {
    const m = /^(\d{4})-(\d\d)-(\d\d) (\d\d):(\d\d)/.exec(S.clock || '1900-01-01 00:00');
    return { y: +m[1], mo: +m[2], d: +m[3], hm: `${m[4]}:${m[5]}` };
  }
  // Narrative dates advance only at story events, independently of real play time.
  function sceneTime() { return S.clock || '2026-12-20 21:30'; }
  function phoneTime(value) {
    const [ymd, hm] = value.split(' '), [y, M, Dd] = ymd.split('-').map(Number);
    const w = new Date(Date.UTC(y, M - 1, Dd)).getUTCDay();
    const date = LANG === 'en' ? `${'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' ')[M - 1]} ${Dd}` : `${M}月${Dd}日`;
    const wk = LANG === 'en' ? 'Sun Mon Tue Wed Thu Fri Sat'.split(' ')[w] : LANG === 'ja' ? '(' + '日月火水木金土'[w] + ')' : '周' + '日一二三四五六'[w];
    return { date, hm, wk };
  }
  function phoneNow() { return phoneTime(sceneTime()); }
  function chatTimestamp(m) {
    if (/^\d{4}-\d\d-\d\d \d\d:\d\d$/.test(m.sceneAt || '')) return m.sceneAt;
    const raw = String(m.at || '');
    let p = /^(\d{1,2})月(\d{1,2})日 (\d\d:\d\d)$/.exec(raw);
    if (!p) {
      const en = /^([A-Z][a-z]{2}) (\d{1,2}) (\d\d:\d\d)$/.exec(raw);
      const month = en && 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' ').indexOf(en[1]) + 1;
      if (month) p = [raw, month, en[2], en[3]];
    }
    if (!p) return null;
    const start = D.chapters[0].date, year = +start.slice(0, 4) + (+p[1] < +start.slice(5, 7) ? 1 : 0);
    return `${year}-${pad(+p[1])}-${pad(+p[2])} ${p[3]}`;
  }
  function chatTime(m) { const at = chatTimestamp(m); return at ? phoneTime(at) : { date: '', hm: '' }; }
  function chatListTime(m) {
    if (!m) return '';
    const t = chatTime(m), at = chatTimestamp(m);
    return at && at.slice(0, 10) !== sceneTime().slice(0, 10) ? t.date : t.hm;
  }
  function repairChatTimes() {
    // A later message is an upper bound for earlier ones. Keep order and content;
    // only clamp impossible future timestamps left by the former wall clock.
    for (const log of Object.values(S.chat || {})) {
      let ceiling = sceneTime();
      for (let i = log.length - 1; i >= 0; i--) {
        const m = log[i], at = chatTimestamp(m); if (!at) continue;
        m.sceneAt = at > ceiling ? ceiling : at; ceiling = m.sceneAt;
        const t = phoneTime(m.sceneAt); m.at = `${t.date} ${t.hm}`;
      }
    }
    S.chatTimeVersion = 1;
  }

  // ============================================================
  // 全局浮层：章节卡、结局、推理板、看图
  // ============================================================
  function overlay() { return $('#overlay'); }
  let overlayCleanup = null;
  function openOverlay(el, cleanup) { closeOverlay(); const o = overlay(); o.append(el); o.classList.add('on'); overlayCleanup = cleanup || null; }
  function closeOverlay() {
    const cleanup = overlayCleanup; overlayCleanup = null;
    const o = overlay(); if (o) { o.classList.remove('on'); o.innerHTML = ''; }
    if (cleanup) cleanup();
  }
  let cardOn = false;
  function showCards() {
    if (cardOn || !cardQ.length || titleOn || awaitingPuzzleFeedback() || overlay().classList.contains('on')) return;
    const c = cardQ.shift(); cardOn = true;
    const el = h('div', { class: 'card', tabindex: 0 },
      h('div', { class: 'num', text: c.num }),
      h('h1', { text: c.name }),
      h('div', { class: 'date', text: c.date.replace(/-/g, ' . ') }),
      c.intro ? h('div', { class: 'intro', html: fmt(c.intro) }) : null,
      h('div', { class: 'go', text: _t('点击继续') }));
    const go = () => { cardOn = false; closeOverlay(); showCards(); renderAll(); if (!cardOn) nudgeReplies(); };
    bindControl(el, go); el.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } };
    openOverlay(el); el.focus();
  }
  function nudgeReplies() {
    const who = Object.keys(S.wait || {}).filter(needsReply).map(c => contactInfo(c).name);
    if (who.length) toast(who.join('、') + _t(' 在等你回复。打开手机里的「消息」，点对话底部的回复。'));
  }
  function showEnding(id, restoring = false) {
    const e = D.endings[id]; if (!e) return;
    tickPlay(); playClockRunning = false;
    window.Y2KLeaderboard?.capture(S, id);
    if (!restoring && preEndSnap) LS.set(KEY.pre, preEndSnap);
    S.activeEnding = id;
    $('#toast')?.replaceChildren();
    setFlag('ending_' + id);
    recordPhotoRewards(!restoring);
    if (!S.ends) S.ends = [];
    if (!S.ends.includes(id)) S.ends.push(id);
    const m = meta(); m.endings = m.endings || {}; if (!m.endings[id]) m.endings[id] = Date.now();
    setMeta(m);
    writeSave('auto');
    const previous = readSave('pre');
    const sameRun = previous && (S.runId ? previous.runId === S.runId : previous.created === S.created);
    const exitEnding = () => { S.activeEnding = null; closeOverlay(); syncPlayClock(); dirty(); };
    // 评价框不挡结局正文：玩家读完、点了下面的按钮，才问要不要留几句话。
    let el;
    const afterReview = (fn, title) => () => {
      const lb = window.Y2KLeaderboard;
      if (lb?.reviewPending?.(S, id)) lb.requestReview(el, S, id, LANG, () => writeSave('auto'), { title, onDone: fn });
      else fn();
    };
    el = endingPage(id, [
        e.next && !S.flags.c8_begin ? h('button', { class: 'tbtn', text: _t('进入尾声'), onclick: afterReview(() => { exitEnding(); act(e.next); }, 'reviewTitleEpilogue') }) : null,
        (id === 'H' || (id === 'C' && S.flags.c8_begin)) ? h('button', { class: 'tbtn', text: _t('回到读盘机'), onclick: afterReview(() => { exitEnding(); renderAll(); showCards(); }) }) : null,
        S.programmeCheckpoint ? h('button', { class: 'tbtn', text: _t('回到填写节目单时'), onclick: afterReview(() => loadState(S.programmeCheckpoint)) }) : null,
        sameRun ? h('button', { class: 'tbtn', text: _t('回到结局前继续'), onclick: afterReview(() => loadState(previous)) }) : null,
        h('button', { class: 'tbtn', text: _t('返回标题画面'), onclick: afterReview(() => { closeOverlay(); showTitle(); }) })], S.player);
    openOverlay(el, bindEndingMemory(el));
  }
  function bindEndingMemory(el) {
    const sequence = el.querySelector('[data-memory-scroll]');
    if (!sequence) return;
    const frame = sequence.querySelector('.ending-memory-frame');
    // 部分浏览器能播放录音，但没有用于游戏合成配乐的 AudioContext。
    const songData = el.dataset.ending === 'C' && !(window.AudioContext || window.webkitAudioContext) && document.getElementById('ending-c-song');
    let player, retry;
    const playRecording = () => {
      if (!songData || !el.hasAttribute('data-photo-reached')) return;
      if (document.hidden || !window.Y2KAudio.prefs.music) { player?.pause(); return; }
      if (!player) player = new Audio('data:audio/mp4;base64,' + songData.textContent);
      if (player.ended || !player.paused) return;
      player.play().then(() => retry?.remove()).catch(error => {
        if (error.name !== 'NotAllowedError' || !el.isConnected || !window.Y2KAudio.prefs.music) return;
        if (!retry) retry = controlButton({ class: 'tbtn', text: '播放《换我等你》' }, playRecording);
        sequence.append(retry);
      });
    };
    if (songData) {
      document.addEventListener('visibilitychange', playRecording);
      document.addEventListener('y2k-music-pref', playRecording);
    }
    let queued = 0;
    const update = () => {
      queued = 0;
      if (!el.isConnected) return;
      const bounds = frame.getBoundingClientRect();
      const relativeTop = bounds.top - el.getBoundingClientRect().top;
      if (el.dataset.ending === 'C' && relativeTop < el.clientHeight && relativeTop + bounds.height > 0 && !el.hasAttribute('data-photo-reached')) {
        el.setAttribute('data-photo-reached', '');
        audioSync();
        playRecording();
      }
      // 五个人完整进入视野后才开始淡出，最迟在读到页底时结束。
      const startY = Math.max(0, el.clientHeight - bounds.height - 12);
      const startScroll = Math.max(0, el.scrollTop + relativeTop - startY);
      const available = el.scrollHeight - el.clientHeight - startScroll;
      const distance = Math.max(1, Math.min(bounds.height * .45, startY * .85, available));
      const t = Math.max(0, Math.min(1, (el.scrollTop - startScroll) / distance));
      const progress = t * t * (3 - 2 * t);
      sequence.style.setProperty('--memory-progress', progress.toFixed(4));
      sequence.classList.toggle('memory-after', t >= .5);
      frame.setAttribute('aria-label', t >= .5 ? frame.dataset.afterAlt : frame.dataset.beforeAlt);
    };
    const schedule = () => { if (!queued) queued = requestAnimationFrame(update); };
    el.addEventListener('scroll', schedule, {passive: true});
    const observer = new ResizeObserver(schedule);
    observer.observe(el); observer.observe(frame);
    schedule();
    return () => {
      el.removeEventListener('scroll', schedule); observer.disconnect(); cancelAnimationFrame(queued);
      document.removeEventListener('visibilitychange', playRecording);
      document.removeEventListener('y2k-music-pref', playRecording);
      if (player) { player.pause(); player.removeAttribute('src'); player.load(); }
      audioSync();
    };
  }
  function openEndingLyrics(event) {
    const opener = event.currentTarget;
    const body = h('div', { class: 'song-lyrics', tabindex: 0 });
    const verses = [
      `我们把明天说得那么轻，
仿佛谁都能一直年轻。
你话说一半，我就笑着说懂，
有一半，我到今天还在听。`,
      `你说慢慢来，我就真的信了，
以为再迟，也不过让你笑我。
我连你笑我的口气都还记得，
却没问过，你等我的时候，
会不会也怕，我真的忘了。`,
      `我最想你，偏在欢喜的时候，
有些话，还是想头一个告诉你。
有时我笑着笑着，忽然安静，
刚才那一声，多么像你。`,
      `如果你心里，也有一句怪我，
就让它说完吧，这次我听着。
你不必像从前那样，怕我难过，
轻轻一句“没事”，就带过。`,
      `你说慢慢来，我就真的信了，
把最想说的话，也留给了以后。
如今我有一生，可以慢慢想你，
却多想匀出一点，让那时的我，
早一点懂你，早一点开口。`,
      `若还有一句话，能从我这里到你那里，
我想把你说过的，还给你。`,
      `这一次，我先到。
你慢慢来。`
    ];
    for (const text of verses) body.append(h('p', { text }));
    const dialog = h('dialog', { class: 'ending-lyrics-dialog', 'aria-labelledby': 'ending-lyrics-heading' },
      h('div', { class: 'title-panel-head' },
        h('h3', { id: 'ending-lyrics-heading', text: '《换我等你》' }),
        controlButton({ class: 'tbtn title-panel-close', text: '×', 'aria-label': _t('关闭') }, () => dialog.close())),
      body);
    dialog.addEventListener('keydown', e => {
      e.stopPropagation();
      if (e.key === 'Escape') { e.preventDefault(); dialog.close(); }
    });
    dialog.addEventListener('close', () => {
      dialog.remove();
      if (opener.isConnected) opener.focus({ preventScroll: true });
    }, { once: true });
    opener.parentElement.append(dialog);
    dialog.showModal();
  }
  function endingPage(id, actions, player) {
    const e = D.endings[id];
    const memory = e.memory;
    const photo = memory?.before && memory.after ? h('figure', { class: 'ending-memory', 'data-memory-scroll': '' },
      h('div', { class: 'ending-memory-frame', role: 'img', 'aria-label': memory.beforeAlt,
        'data-before-alt': memory.beforeAlt, 'data-after-alt': memory.afterAlt },
        h('img', { src: memory.before, alt: '', width: 1448, height: 1086 }),
        h('img', { class: 'ending-memory-after', src: memory.after, alt: '', width: 1448, height: 1086 })),
      h('figcaption', { text: memory.quote })) : null;
    const names = { A: _t('结局 A'), B: _t('结局 B'), C: _t('结局 C'), H: _t('隐藏结局') };
    // 结局正文里放了 <div data-memory-slot></div> 时，照片就插在那个位置，成为场景里的东西；否则放在正文后面。
    const body = h('div', { class: 'body', html: fmt(e.html, player) });
    const slot = photo && body.querySelector('[data-memory-slot]');
    if (slot) slot.replaceWith(photo);
    const lyrics = id === 'C' ? controlButton({
      class: 'tbtn lyrics-entry', text: '《换我等你》', title: '查看歌词', 'aria-haspopup': 'dialog'
    }, openEndingLyrics) : null;
    return h('div', { class: 'ending', 'data-ending': id }, h('div', { class: 'in2' },
      h('div', { class: 'num', text: names[id] || _t('结局') }),
      h('h1', { text: e.title }),
      body,
      slot ? null : photo,
      h('div', { class: 'acts' }, actions)), lyrics);
  }
  function replayEnding(id, opener) {
    // 回看只读取解锁记录，不能重新触发结局、存档或成绩提交。
    if (!meta().endings?.[id] || !D.endings[id] || $('.ending-replay')) return;
    tickPlay(); playClockRunning = false;
    let cleanupMemory = () => {};
    const close = () => { el.remove(); cleanupMemory?.(); syncPlayClock(); if (opener?.isConnected) opener.focus({ preventScroll: true }); };
    const back = controlButton({ class: 'tbtn', text: _t('返回') }, close);
    const el = endingPage(id, [back], S?.player || readSave('auto')?.player || '你');
    const lastButton = el.querySelector('.lyrics-entry') || back;
    el.classList.add('ending-replay');
    el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-labelledby', 'ending-replay-heading');
    el.querySelector('h1').id = 'ending-replay-heading';
    const closeBtn = controlButton({ class: 'tbtn ending-replay-close', text: '×', 'aria-label': _t('关闭') }, close);
    el.prepend(closeBtn);
    el.addEventListener('keydown', event => {
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close(); }
      if (event.key === 'Tab') {
        if (event.shiftKey && document.activeElement === closeBtn) { event.preventDefault(); lastButton.focus(); }
        else if (!event.shiftKey && document.activeElement === lastButton) { event.preventDefault(); closeBtn.focus(); }
      }
    });
    document.body.append(el); cleanupMemory = bindEndingMemory(el); closeBtn.focus({ preventScroll: true });
  }
  function imageSize(root) {
    const svg = root.querySelector('svg'), img = root.querySelector('img');
    const vb = svg && svg.viewBox.baseVal;
    const w = (img && Number(img.getAttribute('width'))) || (vb && vb.width) || (img && (img.naturalWidth || img.width)) || 640;
    const hh = (img && Number(img.getAttribute('height'))) || (vb && vb.height) || (img && (img.naturalHeight || img.height)) || 480;
    return root.querySelector('.photo') ? { w: w + 20, h: hh + 38 } : { w, h: hh };
  }
  function bindImageZoom(root) {
    root.querySelectorAll('table').forEach(table => {
      const scroll = h('div', { class: 'table-scroll', tabindex: 0, 'aria-label': _t('表格，可左右滚动查看') });
      table.before(scroll); scroll.append(table);
    });
    root.querySelectorAll('.evidence-surface, svg, img').forEach(img => {
      if (img.parentElement?.closest('.evidence-surface')) return;
      img.style.cursor = 'zoom-in'; img.setAttribute('role', 'button'); img.setAttribute('tabindex', '0'); img.setAttribute('aria-label', _t('放大图片'));
      const open = () => viewImage(img.outerHTML, null, false, !!img.closest('#desktop'));
      bindControl(img, open);
      img.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } };
    });
  }
  function openPhotoCollection() {
    const origin = document.activeElement;
    const close = () => { closeOverlay(); showCards(); };
    const closeButton = controlButton({ class: 'b98 tbb', 'aria-label': '关闭照片碎片', title: '关闭', text: '×' }, close);
    const canvas = h('div', { class: 'fragment-canvas', role: 'group', 'aria-label': '楼顶照片' });
    const status = h('div', { class: 'fragment-count', 'aria-live': 'polite' });
    const panel = h('section', { class: 'fragment-dialog out', role: 'dialog', 'aria-modal': 'true', 'aria-label': '照片碎片' },
      h('div', { class: 'titlebar' }, h('span', { html: icon('img') }), h('span', { class: 't', text: '照片碎片' }), closeButton), canvas, status);
    const displayed = new Set();
    function refresh() {
      for (const id of S.collected) {
        const piece = D.collectibles[id];
        if (!piece || !piece.image || displayed.has(id)) continue;
        const [x, y, w, hgt] = piece.rect;
        canvas.append(h('img', { src: piece.image, alt: piece.title, draggable: 'false', 'data-fragment': id,
          style: { left: (100*x/1774)+'%', top: (100*y/887)+'%', width: (100*w/1774)+'%', height: (100*hgt/887)+'%' } }));
        displayed.add(id);
      }
      status.textContent = '已收集 ' + displayed.size + ' / ' + photoTotal();
      canvas.dataset.empty = String(!displayed.size);
    }
    refresh();
    panel.addEventListener('fragmentchange', refresh);
    panel.addEventListener('keydown', e => { if (e.key === 'Tab') { e.preventDefault(); closeButton.focus(); } });
    openOverlay(panel, () => { if (origin?.isConnected) origin.focus({preventScroll:true}); });
    closeButton.focus({preventScroll:true});
  }
  function imageFace(file, front, back) {
    if (!back || !file?.backHtml) return front;
    const flag = 'back_' + file.id;
    if (!S.flags[flag]) { setFlag(flag); dirty(); }
    return file.backHtml;
  }
  function viewImage(html, file, back = false, fromPC = !!file) {
    const previousFocus = document.activeElement;
    const canvas = h('div', { class: 'viewer-canvas', html: imageFace(file, html, back) });
    canvas.querySelectorAll('[tabindex]').forEach(el => { el.removeAttribute('tabindex'); el.removeAttribute('role'); el.removeAttribute('aria-label'); el.style.cursor = ''; });
    let size = imageSize(canvas);
    const area = h('div', { class: 'viewer-scroll', tabindex: 0, 'aria-label': _t('图片，可滚动查看') }, canvas);
    const value = h('output', { 'aria-live': 'polite' });
    let scale = 1, fitMode = true;
    const resize = (z, center = true) => {
      const oldW = canvas.offsetWidth || size.w, oldH = canvas.offsetHeight || size.h;
      const cx = (area.scrollLeft + area.clientWidth / 2) / oldW, cy = (area.scrollTop + area.clientHeight / 2) / oldH;
      scale = Math.max(.05, Math.min(4, z));
      canvas.style.width = Math.round(size.w * scale) + 'px';
      value.textContent = Math.round(scale * 100) + '%';
      minus.disabled = scale <= .05; plus.disabled = scale >= 4;
      area.classList.toggle('pannable', canvas.offsetWidth > area.clientWidth - 32 || canvas.offsetHeight > area.clientHeight - 32);
      area.scrollLeft = center ? cx * canvas.offsetWidth - area.clientWidth / 2 : 0;
      area.scrollTop = center ? cy * canvas.offsetHeight - area.clientHeight / 2 : 0;
    };
    const fit = () => { fitMode = true; resize(Math.min(1, Math.max(1, area.clientWidth - 32) / size.w, Math.max(1, area.clientHeight - 32) / size.h), false); };
    const zoom = factor => { fitMode = false; resize(scale * factor); };
    const minus = controlButton({ class: 'ph-btn', text: _t('缩小 −') }, () => zoom(1 / 1.25));
    const plus = controlButton({ class: 'ph-btn', text: _t('放大 +') }, () => zoom(1.25));
    const close = () => { closeOverlay(); showCards(); };
    const closeBtn = controlButton({ class: 'ph-btn viewer-close', text: _t('关闭'), title: 'Esc' }, close);
    const toolbar = h('div', { class: 'viewer-toolbar' }, minus, plus, value,
      controlButton({ class: 'ph-btn', text: _t('适应窗口') }, fit),
      controlButton({ class: 'ph-btn', text: _t('原始大小') }, () => { fitMode = false; resize(1); }),
      file?.backHtml ? controlButton({ class: 'ph-btn', text: back ? '看正面' : '看背面' }, e => {
        back = !back;
        canvas.innerHTML = imageFace(file, html, back);
        size = imageSize(canvas);
        if (fitMode) fit(); else resize(scale);
        e.currentTarget.textContent = back ? '看正面' : '看背面';
      }) : null,
      file && file.documentPhoto && file.caption ? controlButton({ class: 'ph-btn', text: _t('照片说明') }, () => msgBox(_t('照片说明'), fmt(file.caption), null, true)) : null,
      file ? controlButton({ class: 'ph-btn', text: _t('属性') }, () => showProps(file, true)) : null, closeBtn);
    const caption = file && file.caption && !file.documentPhoto ? h('div', { class: 'viewer-caption', html: fmt(file.caption) }) : null;
    const panel = h('div', { class: 'viewer-panel' + (fromPC ? ' classic-viewer out' : ''), role: 'dialog', 'aria-modal': 'true', 'aria-label': _t('图像查看器') }, toolbar, area, caption);
    if (fromPC) {
      const title = (file ? nameOf(file.path) + ' - ' : '') + _t('图像查看器');
      closeBtn.className = 'b98 tbb';
      closeBtn.setAttribute('aria-label', _t('关闭'));
      closeBtn.replaceChildren(h('span', { class: 'window-symbol close', 'aria-hidden': 'true' }));
      panel.prepend(h('div', { class: 'titlebar' }, h('span', { html: icon('img') }), h('span', { class: 't', text: title }), closeBtn));
      toolbar.querySelectorAll('button').forEach(button => button.className = 'b98');
    }
    const el = h('div', { class: 'viewer', onclick: e => { if (e.target === el) close(); } }, panel);
    if (file) bindCtx(area, () => [[_t('属性'), () => showProps(file, true)]], null, overlay());
    panel.onkeydown = e => {
      if (e.key === '+' || e.key === '=') { e.preventDefault(); zoom(1.25); }
      if (e.key === '-') { e.preventDefault(); zoom(1 / 1.25); }
      if (e.key === '0') { e.preventDefault(); fit(); }
      if (e.key === 'Tab') {
        const stops = [...panel.querySelectorAll('button:not(:disabled), [tabindex="0"]')];
        if (e.shiftKey && document.activeElement === stops[0]) { e.preventDefault(); stops[stops.length - 1].focus(); }
        else if (!e.shiftKey && document.activeElement === stops[stops.length - 1]) { e.preventDefault(); stops[0].focus(); }
      }
    };
    area.addEventListener('wheel', e => { if (e.ctrlKey) { e.preventDefault(); zoom(e.deltaY < 0 ? 1.15 : 1 / 1.15); } }, { passive: false });
    area.addEventListener('pointerdown', e => {
      if (e.pointerType !== 'mouse' || e.button !== 0 || !area.classList.contains('pannable')) return;
      e.preventDefault(); area.setPointerCapture(e.pointerId); area.classList.add('dragging');
      const x = e.clientX, y = e.clientY, left = area.scrollLeft, top = area.scrollTop;
      const move = ev => { area.scrollLeft = left + x - ev.clientX; area.scrollTop = top + y - ev.clientY; };
      const stop = () => { area.classList.remove('dragging'); area.removeEventListener('pointermove', move); area.removeEventListener('pointerup', stop); area.removeEventListener('pointercancel', stop); };
      area.addEventListener('pointermove', move); area.addEventListener('pointerup', stop); area.addEventListener('pointercancel', stop);
    });
    const observer = new ResizeObserver(() => { if (fitMode) fit(); });
    openOverlay(el, () => { observer.disconnect(); if (previousFocus && previousFocus.isConnected) previousFocus.focus({ preventScroll: true }); });
    fit(); observer.observe(area); closeBtn.focus({ preventScroll: true });
  }

  // ============================================================
  // 谜题
  // ============================================================
  function solved(id) { return !!S.flags['solved_' + id]; }
  function checkPuzzle(p, val) {
    const kind = p.kind || 'text';
    if (kind === 'text') return (p.answers || []).some(a => norm(a) === norm(val));
    if (kind === 'choice') return val === p._ai;
    if (kind === 'pick') { const set = new Set(val); return set.size === p._as.length && p._as.every(a => set.has(a)); }
    if (kind === 'multi') return p.fields.every((f, i) => (f.answers || []).some(a => norm(a) === norm(val[i])));
    return false;
  }
  function solvePuzzle(id) {
    const p = D.puzzles[id];
    if (solved(id)) return;
    setFlag('solved_' + id);
    act(p.onSolve);
    sfx('ok');
    dirty();
  }
  // Puzzle assistance stays beside the answer controls, separate from general Help.
  function puzzleHints(key, p, buttonClass = 'b98') {
    const box = h('div', { class: 'hints inline-hints', 'data-hints': key });
    const count = (p.hints || []).length;
    const used = () => Math.min(count, Math.max(0, Number(S.hints[key]) || 0));
    const button = controlButton({ class: buttonClass + ' hint-next', 'data-hint-for': key }, () => {
      if (!test(p.requires) || used() >= count) return;
      S.hints[key] = used() + 1; draw(); dirty();
    });
    function draw() {
      const available = test(p.requires); box.innerHTML = ''; button.hidden = !available || !count;
      if (available) (p.hints || []).slice(0, used()).forEach((text, i) => box.append(h('div', { class: 'hintbox', html: `<b>${_t('提示')} ${i + 1}：</b>${fmt(text)}` })));
      button.textContent = used() >= count ? _t('提示已用完') : used() === count - 1 ? _t('看答案') : `${_t('提示')}（${used()}/${count}）`;
      button.disabled = used() >= count;
    }
    draw(); return { box, button };
  }
  function awaitingPuzzleFeedback() { return !!document.querySelector('.pz[data-awaiting-ack]'); }
  // 返回一个谜题表单元素。opts: {style:'w98'|'bios'|'login'|'bbs', onSolved, submitLabel}
  function puzzleForm(id, opts = {}) {
    const p = D.puzzles[id];
    if (!p) return h('div', { text: _t('（缺少谜题 ') + id + '）' });
    const kind = p.kind || 'text';
    const box = h('div', { class: 'pz' });
    const prompt = h('div', { class: 'prompt', html: fmt(p.prompt || '') });
    const msg = h('div', { class: 'msg', role: 'status', 'aria-live': 'polite' });
    let getVal, focusEl;
    const inputs = h('div');
    if (kind === 'text') {
      const inp = h('input', { class: opts.style === 'bios' ? '' : 'f98', type: 'text', id: 'pz_' + id, placeholder: opts.placeholder || p.placeholder || '', autocomplete: 'off', spellcheck: 'false', style: { width: '100%' } });
      inp.onkeydown = (e) => { if (confirmInput(e)) submit(); };
      inputs.append(inp); getVal = () => inp.value; focusEl = inp;
    } else if (kind === 'choice' || kind === 'pick') {
      const wrap = h('div', { class: 'opts' });
      p.options.forEach((o, i) => {
        const input = h('input', { type: kind === 'choice' ? 'radio' : 'checkbox', name: 'pz_' + id, value: i, id: `pz_${id}_${i}` });
        wrap.append(bindChoice(h('label', {}, input, h('span', { html: fmt(o) })), input));
      });
      if (kind === 'pick') wrap.append(h('div', { class: 'selection-count', text: `${_t('（选择')} ${p.answerSet.length} ${_t('项）')}` }));
      inputs.append(wrap);
      getVal = () => { const sel = [...wrap.querySelectorAll('input:checked')].map(x => +x.value); return kind === 'choice' ? sel[0] : sel; };
    } else if (kind === 'multi') {
      const g = h('div', { class: 'fields' });
      const ins = p.fields.map((f, i) => { const inp = h('input', { class: 'f98', type: 'text', id: `pz_${id}_${i}`, autocomplete: 'off', placeholder: f.placeholder || '' }); inp.onkeydown = (e) => { if (confirmInput(e)) submit(); }; g.append(h('label', { for: `pz_${id}_${i}`, html: fmt(f.label) }), inp); return inp; });
      inputs.append(g); getVal = () => ins.map(x => x.value); focusEl = ins[0];
    }
    // 锁的谜题属于还没开始的章节：拒绝任何答案，也不给提示（避免提示提前泄露答案）
    const early = !!(p.requires && (p.requires.match(/\bch\d\b/g) || []).some(c => !S.flags[c]));
    const hints = puzzleHints(id, p, opts.style === 'bios' ? '' : 'b98');
    const okBtn = controlButton({ class: opts.style === 'bios' ? '' : 'b98', text: opts.submitLabel || _t('确定') }, submit);
    const ackBtn = controlButton({ class: opts.style === 'bios' ? '' : 'b98', text: opts.extraBtn ? _t('关闭') : _t('继续'), 'data-puzzle-ack': id }, () => box.acknowledge());
    ackBtn.hidden = true;
    box.acknowledge = () => {
      if (!box.hasAttribute('data-awaiting-ack')) return;
      box.removeAttribute('data-awaiting-ack');
      ackBtn.disabled = true;
      if (opts.onSolved) opts.onSolved();
      dirty();
    };
    let submitted = false;
    function submit() {
      if (submitted) return;
      markInteraction();
      const v = getVal();
      if (v == null || (Array.isArray(v) ? !v.length || v.every(x => !String(x).trim()) : !String(v).trim())) { msg.textContent = _t('请先作答。'); return; }
      if (!early && checkPuzzle(p, v)) {
        submitted = true; okBtn.disabled = true;
        box.setAttribute('data-awaiting-ack', id);
        inputs.querySelectorAll('input').forEach(input => { input.removeAttribute('aria-invalid'); input.disabled = true; });
        hints.button.hidden = true;
        if (opts.extraBtn) opts.extraBtn.hidden = true;
        okBtn.hidden = true; ackBtn.hidden = false;
        msg.className = 'msg ok'; msg.innerHTML = fmt(p.solvedText || _t('正确。'));
        if (opts.onAnswer) opts.onAnswer(v);
        solvePuzzle(id);
        save('auto');
      } else {
        sfx('err');
        let t = early ? _t('密码错误。') : (p.wrongText || opts.wrongText || _t('不对。'));
        if (!early && p.near) { const vals = kind === 'multi' ? v : kind === 'text' ? [v] : []; for (const [k, tx] of Object.entries(p.near)) if (vals.some(x => norm(k) === norm(x))) t = tx; }
        if (!early && kind === 'multi' && p.fieldFeedback) {
          const entries = [...inputs.querySelectorAll('input')];
          const result = p.fields.map((field, i) => {
            const correct = field.answers.some(answer => norm(answer) === norm(v[i]));
            entries[i].setAttribute('aria-invalid', String(!correct));
            return field.label + (correct ? ' ✓' : v[i].trim() ? '：请再核对' : '：还没填');
          });
          t = result.join('　');
        }
        msg.className = 'msg'; msg.innerHTML = fmt(t);
        opts.onWrong && opts.onWrong();
      }
    }
    if (!opts.hidePrompt) box.append(prompt);
    box.append(inputs, msg, hints.box, h('div', { class: 'row' }, hints.button, opts.extraBtn || null, okBtn, ackBtn));
    box.focusFirst = () => { if (focusEl && !touchKeyboard()) focusEl.focus(); };
    return box;
  }
  function positionPCDialog(root) {
    const bounds = screen().getBoundingClientRect();
    root.style.left = bounds.left + 'px';
    root.style.top = bounds.top + 'px';
    root.style.width = bounds.width + 'px';
    root.style.height = bounds.height + 'px';
  }
  function modalRoot(onPC = false) {
    const root = $('#modal');
    const pc = onPC && !titleOn && desktop() && !overlay().classList.contains('on');
    root.classList.toggle('pc-modal', !!pc);
    if (pc) positionPCDialog(root);
    return root;
  }
  function closeModal(acknowledge = true) {
    const m = modalRoot(), feedback = m && m.querySelector('.pz[data-awaiting-ack]');
    if (m) m.innerHTML = '';
    // Clear the old dialog first: its completion callback may open another one.
    if (acknowledge && feedback) feedback.acknowledge();
  }
  function askPuzzle(id, onSolved, phoneStyle, contact) {
    const p = D.puzzles[id];
    if (!p) return toast(_t('缺少谜题 ') + id);
    if (solved(id)) { onSolved && onSolved(); return; }
    if (p.kind === 'mark') { if (narrow()) togglePhone(false); return openCompare({ puzzle: id }); }
    if (p.kind === 'map') { if (narrow()) togglePhone(false); return openMap({ puzzle: id }); }
    if (p.kind === 'frame') { ui.tab = 'clips'; ui.clip = p.clip; ui.framePuzzle = id; ui.frameSel = null; ui.frameMsg = ''; if (narrow()) togglePhone(true); else renderPhone(); return; }
    if (p.kind === 'chain') { if (narrow()) togglePhone(false); return openDiskFix({ puzzle: id }); }
    const m = modalRoot(!phoneStyle); m.innerHTML = '';
    const shade = h('div', { class: 'shade', onclick: () => closeModal() });
    const dlg = h('div', { class: phoneStyle ? 'dlg98 dlgph' : 'dlg98 out', role: 'dialog' });
    const form = puzzleForm(id, { onSolved: () => { if (form.isConnected) closeModal(); onSolved && onSolved(); }, onAnswer: value => {
      const cur = contact && curDlg(contact);
      if (!cur || !S.wait[contact] || S.wait[contact].id !== id) return;
      const text = p.kind === 'choice' ? p.options[value] : p.kind === 'pick' ? value.map(i => p.options[i]).join('、') : Array.isArray(value) ? value.join('，') : String(value).trim();
      pushChat(contact, { from: 'me', text });
    }, onWrong: () => { dlg.classList.remove('shake'); void dlg.offsetWidth; dlg.classList.add('shake'); }, extraBtn: controlButton({ class: 'b98', text: _t('取消') }, closeModal) });
    dlg.append(h('div', { class: 'titlebar' }, h('span', { html: icon('lock') }), h('span', { class: 't', text: p.title || _t('需要密码') }), controlButton({ class: 'b98 tbb', 'aria-label': _t('关闭'), title: _t('关闭'), text: '×' }, closeModal)), h('div', { class: 'wbody' }, form));
    m.append(shade, dlg);
    form.focusFirst();
  }
  function msgBox(title, html, buttons, aboveOverlay, onPC = false) {
    const m = modalRoot(onPC); m.innerHTML = '';
    const dlg = h('div', { class: 'dlg98 out' + (aboveOverlay ? ' raised' : '') + (titleOn ? ' ontitle' : ''), role: 'dialog' });
    const row = h('div', { class: 'row' });
    (buttons || [{ text: _t('确定') }]).forEach(b => row.append(controlButton({ class: 'b98', text: b.text }, () => { closeModal(); b.fn && b.fn(); })));
    dlg.append(h('div', { class: 'titlebar' }, h('span', { class: 't', text: title }), controlButton({ class: 'b98 tbb', 'aria-label': _t('关闭'), title: _t('关闭'), text: '×' }, closeModal)), h('div', { class: 'wbody' }, h('div', { class: 'prompt', html }), row));
    m.append(h('div', { class: 'shade' + (aboveOverlay ? ' raised' : '') + (titleOn ? ' ontitle' : ''), onclick: () => closeModal() }), dlg);
  }
  // 带锁的东西：先解谜再执行
  function withLock(lock, fn) { if (!lock || solved(lock)) return fn(); askPuzzle(lock, fn); }

  // ============================================================
  // 推理板
  // ============================================================
  function canOpenBoard(id) {
    const board = D.boards[id];
    return !!board && (!!S.flags['board_' + id] || test(board.requires));
  }
  function originalForBoard(id) {
    if (S.items.includes(id)) return {type: 'item', id};
    if (S.mails.includes(id)) return {type: 'mail', id};
    if (D.footage.clips.some(clip => clip.id === id)) return {type: 'clip', id};
    if (D.files.some(file => file.id === id && test(file.requires))) return {type: 'file', id};
    if (D.gxLogs.some(log => log.id === id)) return {type: 'gx', id};
    const wp = (D.web || []).find(p => p.id === id); if (wp) return {type: 'url', value: webURL(wp)};
    if (/^t\d+$/.test(id)) return {type: 'url', value: '/thread.asp?id=' + id.slice(1)};
    if (D.mails.some(mail => mail.id === id)) return {type: 'url', value: '/admin/mail.asp?id=' + encodeURIComponent(id)};
    return null;
  }
  function lockedBoardCard(id, board) {
    const card = h('div', {class:'ph-card', 'data-locked-board':id}, h('div', {class:'k', text:_t('尚未解锁')}), h('strong', {text:board.title}));
    if (!test(board.investigationRequires)) {
      card.append(h('p', {text:_t('本章调查仍在进行。')}), h('button', {class:'ph-source', type:'button', text:_t('查看本章调查'), onclick:() => {
        ui.tab = 'notes'; ui.noteTab = 'questions'; ui.reading = null; renderPhone();
      }}));
      return card;
    }
    const missing = board.requiredSources.filter(sid => !S.flags['seen_' + sid]);
    card.append(h('p', {text:'还有 ' + missing.length + ' 份原件没看过。看完就能填这张推理板了。'}));
    const sid = missing.find(id => originalForBoard(id));
    if (sid) {
      const source = originalForBoard(sid);
      const mail = D.mails.find(m => m.id === sid);
      const owner = D.files.find(f => f.id === sid)?.evidenceOwner;
      const log = D.gxLogs.find(log => log.id === sid);
      const label = log ? '鸽讯 · ' + log.date : mail ? '站内信 · ' + mail.subject : (owner ? owner + '的' : '') + hhSourceLabel(sid);
      const lead = h('details', {class:'ph-facts'}, h('summary', {text:_t('找一条线索')}));
      lead.open = ui.boardLead === id;
      lead.ontoggle = () => { if (lead.isConnected) ui.boardLead = lead.open ? id : null; };
      lead.append(h('button', {class:'ph-source', type:'button', 'data-unread-source':sid, text:label, onclick:() => {
        ui.boardLead = null;
        ui.returnBoard = ['mail', 'item', 'clip'].includes(source.type) ? id : null;
        goEvidence(source);
      }}));
      card.append(lead);
    }
    return card;
  }
  function openBoard(id) {
    if (!canOpenBoard(id)) return;
    const b = D.boards[id];
    const fill = S.boardFill[id] = S.boardFill[id] || {};
    let active = null;
    const done = () => !!S.flags['board_' + id];
    const wrap = h('div', { class: 'board', 'data-board': id });
    const sheet = h('div', { class: 'sheet' });
    wrap.append(sheet);
    const mobileLayout = window.matchMedia('(max-width: 960px)');
    const choicesId = 'board-choices-' + id;
    const slotButton = key => sheet.querySelector('[data-s="' + key + '"]');
    const close = () => { closeOverlay(); showCards(); renderAll(); };
    function dismissChoices() {
      const key = active;
      active = null;
      draw();
      slotButton(key)?.focus({ preventScroll: true });
    }
    function selectSlot(key) {
      if (done()) return;
      if (mobileLayout.matches && active === key) return dismissChoices();
      active = key;
      draw();
      if (!mobileLayout.matches) return;
      const slot = slotButton(key);
      const picker = sheet.querySelector('.board-picker');
      const overlap = slot.getBoundingClientRect().bottom + 12 - picker.getBoundingClientRect().top;
      if (overlap > 0) wrap.scrollTop += overlap;
      const bank = picker.querySelector('.bank');
      const divider = slot.classList.contains('srcslot') && bank.querySelector('.bank-sep');
      if (divider) bank.scrollTop += divider.getBoundingClientRect().top - bank.getBoundingClientRect().top;
      const choice = divider ? divider.nextElementSibling : bank.querySelector('.chip');
      choice?.focus({ preventScroll: true });
    }
    wrap.addEventListener('click', e => {
      if (e.target === wrap) {
        if (mobileLayout.matches && active) dismissChoices();
        else close();
      }
    });
    wrap.addEventListener('keydown', e => {
      if (e.key !== 'Escape' || !mobileLayout.matches || !active) return;
      e.preventDefault();
      e.stopPropagation();
      dismissChoices();
    });
    function draw() {
      const compact = mobileLayout.matches;
      const scroll = wrap.scrollTop;
      wrap.classList.toggle('choosing', compact && !!active && !done());
      sheet.innerHTML = '';
      const W = boardWords(b);
      const slotsInText = [...b.text.matchAll(/\{([A-Za-z0-9_]+)\}/g)].map(m => m[1]).filter(s => s !== 'player');
      const html = fmt(b.text).replace(/\{([A-Za-z0-9_]+)\}/g, (m, s) => b.slots[s] ? `<button class="slot" data-s="${s}"></button>` : m);
      const txt = h('div', { class: 'txt', html });
      txt.querySelectorAll('.slot').forEach(el => {
        const s = el.dataset.s; const w = fill[s] || (done() ? [].concat(b.slots[s])[0] : null);
        el.textContent = w ? (W[w] || '？') : (String([].concat(b.slots[s])[0]).startsWith('src:') ? _t('〔依据〕') : '＿＿＿＿');
        el.classList.toggle('srcslot', String([].concat(b.slots[s])[0]).startsWith('src:'));
        el.classList.toggle('empty', !w);
        el.classList.toggle('act', active === s);
        if (compact && !done()) {
          el.setAttribute('aria-controls', choicesId);
          el.setAttribute('aria-expanded', String(active === s));
          const kind = el.classList.contains('srcslot') ? _t('原件') : _t('词语');
          el.setAttribute('aria-label', '第' + (slotsInText.indexOf(s) + 1) + '空，' + kind + (w ? '，' + el.textContent : ''));
        }
        if (b.fieldFeedback && lastRes && w && !done()) {
          const correct = [].concat(b.slots[s]).includes(w);
          const feedback = correct ? '已核对' : '请再核对';
          el.classList.add(correct ? 'slot-correct' : 'slot-wrong');
          el.setAttribute('aria-label', (el.getAttribute('aria-label') || el.textContent) + '，' + feedback);
          el.title = feedback;
        }
        bindControl(el, () => selectSlot(s));
        el.oncontextmenu = (e) => { e.preventDefault(); if (done()) return; delete fill[s]; lastRes = null; draw(); dirty(); };
        el.ondragover = (e) => { e.preventDefault(); el.classList.add('drop'); };
        el.ondragleave = () => el.classList.remove('drop');
        el.ondrop = (e) => { e.preventDefault(); const w2 = e.dataTransfer.getData('text/plain'); if (W[w2] && !done()) { fill[s] = w2; active = null; lastRes = null; draw(); dirty(); } };
      });
      const res = h('div', { class: 'res' });
      const bar = h('div', { class: 'bar' }, res);
      const hints = puzzleHints('board_' + id, b, 'bbtn');
      if (!done()) {
        bar.append(
          hints.button,
          h('button', { class: 'bbtn', text: _t('清空'), onclick: () => { for (const k in fill) delete fill[k]; active = null; lastRes = null; draw(); dirty(); } }),
          h('button', { class: 'bbtn pri', text: _t('检查'), onclick: () => check(res) }));
      }
      bar.append(h('button', { class: 'bbtn', text: _t('关闭'), onclick: close }));
      sheet.append(h('h2', { text: b.title }), h('p', { class: 'intro', text: _t(compact ? '点空格选词，同一张词卡可以用多次。' : '点空格选词，或把词卡拖进空格。同一张词卡可以用多次。') }));
      if (done()) sheet.append(h('div', { class: 'solved', html: (id === 'c4_final' ? _t('已整理，仍待核验。') : _t('✔ 推理成立。')) + (b.solvedText ? '<br>' + fmt(b.solvedText) : '') }));
      sheet.append(hints.box, bar, txt);
      if (!done()) {
        const bank = h('div', { class: 'bank' });
        let sourceHeadingAdded = false;
        Object.entries(W).sort((a, c) => (a[0].startsWith('src:') ? 1 : 0) - (c[0].startsWith('src:') ? 1 : 0) || a[1].localeCompare(c[1], 'zh-CN', {numeric:true})).forEach(([wid, label]) => {
          if (wid.startsWith('src:') && !sourceHeadingAdded) {
            bank.append(h('div', { class: 'bank-sep', text: _t('原件') }));
            sourceHeadingAdded = true;
          }
          const chip = h('button', { class: 'chip' + (wid.startsWith('src:') ? ' src' : ''), draggable: compact ? 'false' : 'true', text: label });
          chip.ondragstart = (e) => e.dataTransfer.setData('text/plain', wid);
          bindControl(chip, () => {
            const s = active || slotsInText.find(slot => !fill[slot]);
            if (!s) return;
            fill[s] = wid;
            lastRes = null;
            if (compact) dismissChoices();
            else {
              active = slotsInText.slice(slotsInText.indexOf(s) + 1).find(slot => !fill[slot]) || null;
              draw();
            }
            dirty();
          });
          bank.append(chip);
        });
        if (compact) {
          const label = _t(txt.querySelector('.slot.act.srcslot') ? '选择原件' : '选择词语');
          const picker = h('div', { id: choicesId, class: 'board-picker', role: 'group', 'aria-label': label, hidden: !active });
          picker.append(h('div', { class: 'board-picker-head' }, h('strong', { text: label }),
            h('button', { type: 'button', class: 'bbtn', text: _t('收起'), onclick: dismissChoices })), bank);
          sheet.append(picker);
        } else sheet.append(bank);
      }
      if (compact) wrap.scrollTop = scroll;
      if (lastRes) { res.className = 'res ' + lastRes.cls; res.textContent = lastRes.text; }
    }
    let lastRes = null;
    function check() {
      markInteraction();
      const keys = Object.keys(b.slots);
      let ok = 0;
      keys.forEach(s => { if ([].concat(b.slots[s]).includes(fill[s])) ok++; });
      if (ok === keys.length) {
        lastRes = { cls: 'ok', text: _t('全部正确。') };
        setFlag('board_' + id); act(b.onSolve); sfx('ok');
        S.newBoards = Math.max(0, S.newBoards - 1);
        draw(); dirty();
      } else {
        const filled = keys.filter(s => fill[s]).length;
        lastRes = { cls: 'bad', text: `${ok} / ${keys.length} ${_t('处正确')}` + (filled < keys.length ? `${_t('（还有')} ${keys.length - filled} ${_t('处没填）')}` : '') };
        sfx('err'); draw();
      }
    }
    const changeLayout = () => { active = null; draw(); };
    draw();
    openOverlay(wrap, () => mobileLayout.removeEventListener('change', changeLayout));
    mobileLayout.addEventListener('change', changeLayout);
  }

  // ============================================================
  // 2018 手机
  // ============================================================
  const ui = { tab: 'msg', chat: null, mail: null, item: null, phoneOpen: false, menuView: null, scroll: {}, noteTab: 'questions', noteQuery: '', itemQuery: '', reading: null, clueScope: 'current', clueGroups: {}, questionGroups: {} };
  let running = {}, typing = {}, FAST = false;
  function pushChat(c, m) {
    const at = (m.ref && S.dlg[m.ref.d]?.at) || sceneTime();
    const t = phoneTime(at);
    if (m.ref && m.html) { m = Object.assign({}, m); delete m.html; }
    (S.chat[c] = S.chat[c] || []).push(Object.assign({ at: `${t.date} ${t.hm}`, sceneAt: at }, m));
    const viewing = ui.tab === 'msg' && ui.chat === c && (!narrow() || ui.phoneOpen);
    if (m.from === 'npc' && !viewing) { S.unread[c] = (S.unread[c] || 0) + 1; sfx('msg'); }
    renderPhone();
  }
  // 选项回话：字符串，或带说话人的 { who, text }
  function replyText(r) { return r && typeof r === 'object' ? r.text : r; }
  function replyWho(r) { return r && typeof r === 'object' ? r.who : undefined; }
  // 聊天消息的文字：有引用就按当前语言从对话数据里取，没有就用保存时的文字
  function msgText(m) {
    const R = m.ref, d = R && DLG[R.d], s = d && d.steps[R.i];
    // 中文下历史消息就显示当时存下的原话：对话改版后句子序号会移位，按序号去取会对错位置（重复、缺句）。
    if (LANG === 'zh' && typeof m.text === 'string' && m.text !== '') return m.text;
    if (!s) return m.text;
    if (R.o != null) { const o = s.choice && s.choice[R.o]; if (!o) return m.text; return R.r != null ? (replyText((o.reply || [])[R.r]) ?? m.text) : o.text; }
    const v = m.from === 'npc' ? s.npc : m.from === 'me' ? s.me : s.sys;
    return v != null ? v : m.text;
  }
  function msgHtml(m) {
    const R = m.ref, d = R && DLG[R.d], s = d && d.steps[R.i];
    if (LANG === 'zh' && s && m.text && (s.npc ?? s.me ?? s.sys) !== m.text) return m.html;
    return s && R.o == null && s.html ? s.html : m.html;
  }
  function runDialogues() { Object.keys(S.dlgQ).forEach(stepDlg); }
  function curDlg(c) {
    const q = S.dlgQ[c];
    while (q?.length) {
      const first = q[0], state = S.dlg[first];
      if (!DLG[first] || !state || state.done) { q.shift(); continue; }
      // A night follow-up can already be queued when another daytime exchange unlocks
      // on the same contact. Finish the earlier exchange before this clock boundary.
      if (!running[c] && q.length > 1) {
        let earliest = 0;
        for (let i = 1; i < q.length; i++) {
          const candidate = DLG[q[i]], queued = S.dlg[q[i]];
          if (!candidate || !queued || queued.done) continue;
          if (dialogueTime(candidate, queued) < dialogueTime(DLG[q[earliest]], S.dlg[q[earliest]])) earliest = i;
        }
        if (earliest) { q.unshift(q.splice(earliest, 1)[0]); delete S.wait[c]; }
      }
      return [DLG[q[0]], S.dlg[q[0]]];
    }
    return null;
  }
  function typeDelay(text) { return Math.min(2600, 650 + String(text || '').length * 40); }
  // 过期对话：属于更早章节、玩家一直没回复的对话。调查已经推进到后面的章节时，
  // 这些对话快速补播完（回复自动发出、旧选择取不触发结局的选项、旧的等待和问答跳过），
  // 不再挡住本章的消息。本章的对话仍然需要玩家自己发送和选择。
  function isStale(d) {
    const m = /^c(\d)_/.exec(d.id), cur = S.chapter ? +String(S.chapter).replace('ch', '') : 0;
    return !!m && +m[1] < cur;
  }
  function stepDlg(c) {
    if (running[c] || titleOn || awaitingPuzzleFeedback()) return;
    const cur = curDlg(c);
    if (!cur) { delete S.wait[c]; return; }
    const [d, st] = cur;
    if (!canReachTime(dialogueTime(d, st), d.id)) {
      delete S.wait[c];
      const pending = S.pendingTimedActions?.[0];
      if (pending && canReachTime(pending.action.clock)) dirty();
      return;
    }
    const begins = d.steps[st.i]?.at || d.startsAt;
    if (begins && (!st.at || st.at < begins)) { st.at = begins; setSceneTime(begins); }
    const stale = isStale(d);
    const next = () => { st.i++; stepDlg(c); };
    const timed = (ms, fn, showTyping) => {
      if (stale) { ms = 60; showTyping = false; }
      if (FAST) ms = 15;
      running[c] = true; if (showTyping) { typing[c] = true; renderPhone(); }
      later(() => { running[c] = false; typing[c] = false; fn(); save('auto'); }, ms);
    };
    // 选项后的回话可以是字符串，也可以是 { who, text }：群聊里要标出是谁回的
    if (Array.isArray(st.rep) && st.rep.length) { const raw = st.rep[0], line = replyText(raw); return timed(typeDelay(line), () => { st.rep.shift(); pushChat(c, { from: 'npc', text: line, who: replyWho(raw) }); stepDlg(c); }, true); }
    if (st.rep && !Array.isArray(st.rep)) {
      const R = st.rep, o = (d.steps[R.i].choice || [])[R.o], raw = o && (o.reply || [])[R.r], line = replyText(raw);
      if (line == null) { delete st.rep; return stepDlg(c); }
      return timed(typeDelay(line), () => { pushChat(c, { from: 'npc', text: line, who: replyWho(raw), ref: { d: d.id, i: R.i, o: R.o, r: R.r } }); R.r++; stepDlg(c); }, true);
    }
    const s = d.steps[st.i];
    if (!s) { st.done = 1; setFlag('dlg_' + d.id); S.dlgQ[c].shift(); delete S.wait[c]; dirty(); return stepDlg(c); }
    if (s.npc !== undefined || (s.html && s.me === undefined)) return timed(typeDelay(s.npc), () => {
      pushChat(c, { from: 'npc', text: s.npc || '', html: s.html, who: s.who, ref: { d: d.id, i: st.i } });
      if (s.onReceive) act(s.onReceive, true, d.id);
      next();
    }, true);
    if (s.me !== undefined) {
      if (stale) { delete S.wait[c]; const ref = { d: d.id, i: st.i }; return timed(60, () => { pushChat(c, { from: 'me', text: s.me, html: s.html, ref }); next(); }); }
      S.wait[c] = { type: 'reply' }; renderPhone(); return;
    }
    if (s.sys !== undefined) return timed(400, () => { pushChat(c, { from: 'sys', text: s.sys, ref: { d: d.id, i: st.i } }); if (s.sound) window.Y2KAudio?.sfx(s.sound); next(); });
    if (s.action) {
      if (s.action.clock && (!st.at || s.action.clock > st.at)) st.at = s.action.clock;
      act(s.action, true, d.id); return next();
    }
    if (s.delay) return timed(s.delay, next);
    if (s.wait) { if (stale || test(s.wait)) { delete S.wait[c]; return next(); } S.wait[c] = { type: 'wait' }; return; }
    if (s.puzzle) { if (stale || solved(s.puzzle)) { delete S.wait[c]; return next(); } S.wait[c] = { type: 'puzzle', id: s.puzzle }; renderPhone(); return; }
    if (s.choice) {
      if (stale) {
        let k = s.choice.findIndex(o => test(o.requires) && !o.action?.ending);
        if (k < 0) k = s.choice.findIndex(o => test(o.requires));
        if (k < 0) return;
        const opt = s.choice[k]; delete S.wait[c];
        pushChat(c, { from: 'me', text: opt.text, ref: { d: d.id, i: st.i, o: k } });
        st.rep = (opt.reply || []).length ? { i: st.i, o: k, r: 0 } : null; st.i++;
        act(opt.action, true, d.id); dirty(); return stepDlg(c);
      }
      S.wait[c] = { type: 'choice' }; renderPhone(); return;
    }
    next();
  }
  function sendReply(c, dialogue, step) {
    const cur = curDlg(c); if (!cur || running[c] || titleOn) return;
    const [d, st] = cur, s = d.steps[st.i];
    if (d.id !== dialogue || st.i !== step || !s || s.me === undefined || !S.wait[c] || S.wait[c].type !== 'reply') return;
    if (!canReachTime(dialogueTime(d, st), d.id)) { delete S.wait[c]; dirty(); return; }
    markInteraction(); delete S.wait[c];
    if (d.blocksClock === false && (!st.at || st.at < S.clock)) st.at = S.clock;
    const ref = { d: d.id, i: st.i }; st.i++;
    pushChat(c, { from: 'me', text: s.me, html: s.html, ref });
    sfx('click'); dirty(); stepDlg(c);
  }
  function choose(c, idx, dialogue, step) {
    const cur = curDlg(c); if (!cur) return;
    const [d, st] = cur; const s = d.steps[st.i];
    if (running[c] || titleOn || !s || !s.choice || !s.choice[idx] || !test(s.choice[idx].requires) || !S.wait[c] || S.wait[c].type !== 'choice') return;
    if (dialogue != null && (d.id !== dialogue || st.i !== step)) return;
    if (!canReachTime(dialogueTime(d, st), d.id)) { dirty(); return; }
    markInteraction();
    if (d.programmeCheckpoint && !S.programmeCheckpoint && preEndSnap) {
      S.programmeCheckpoint = JSON.parse(preEndSnap);
      S.programmeCheckpoint.view = captureView();
    }
    const opt = s.choice[idx];
    delete S.wait[c];
    pushChat(c, { from: 'me', text: opt.text, ref: { d: d.id, i: st.i, o: idx } });
    st.rep = (opt.reply || []).length ? { i: st.i, o: idx, r: 0 } : null; st.i++;
    if (opt.action?.clock) st.at = opt.action.clock;
    act(opt.action, true, d.id);
    sfx('click');
    dirty(); stepDlg(c);
  }
  // 铅笔拓印：物品带 rub = { flag, lines, tip, onDone }。在空白页上拖动涂抹，压痕里的字以纸色显出来；
  // 涂到足够面积（或按“一次拓完”）后记下 flag。画布在重绘之间保留，手机刷新不会抹掉进度。
  const rubCache = {};
  function rubPad(it) {
    const R = it.rub;
    if (S.flags[R.flag]) return h('div', { class: 'rub' }, h('div', { class: 'rub-done', 'aria-label': _t('拓印结果') }, ...R.lines.map(t => h('div', { text: t || '\u00a0' }))));
    if (rubCache[it.id]) return rubCache[it.id];
    const W = 320, LH = 30, H = R.lines.length * LH + 36, GX = 12, GY = Math.max(4, R.lines.length);
    const cv = h('canvas', { width: W * 2, height: H * 2, role: 'img', 'aria-label': _t('空白页，按住来回涂抹') });
    cv.style.aspectRatio = W + ' / ' + H;
    const ctx = cv.getContext('2d'); ctx.scale(2, 2);
    const cut = () => { ctx.save(); ctx.globalCompositeOperation = 'destination-out'; ctx.font = '20px KaiTi, STKaiti, serif'; ctx.textBaseline = 'top'; R.lines.forEach((t, i) => ctx.fillText(t, 20, 18 + i * LH)); ctx.restore(); };
    const cells = new Set();
    const finish = () => { delete rubCache[it.id]; setFlag(R.flag); act(R.onDone); sfx('ok'); dirty(); renderPhone(); };
    let down = false;
    const rub = e => {
      const r = cv.getBoundingClientRect(), x = (e.clientX - r.left) * W / r.width, y = (e.clientY - r.top) * H / r.height;
      ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = 'rgba(64,64,70,.22)';
      for (let k = 0; k < 6; k++) { ctx.beginPath(); ctx.ellipse(x + (Math.random() - .5) * 16, y + (Math.random() - .5) * 8, 14, 6, -0.4, 0, Math.PI * 2); ctx.fill(); }
      cut(); cells.add(Math.min(GX - 1, Math.floor(x / W * GX)) + ':' + Math.min(GY - 1, Math.floor(y / H * GY)));
      if (cells.size >= GX * GY * 0.45) { down = false; finish(); }
    };
    cv.addEventListener('pointerdown', e => { down = true; try { cv.setPointerCapture(e.pointerId); } catch (x) { } markInteraction(); rub(e); });
    cv.addEventListener('pointermove', e => { if (down) rub(e); });
    cv.addEventListener('pointerup', () => { down = false; });
    cv.addEventListener('pointercancel', () => { down = false; });
    const box = h('div', { class: 'rub' }, cv,
      h('button', { class: 'ph-btn', type: 'button', text: _t('一次拓完'), onclick: () => { markInteraction(); finish(); } }));
    return (rubCache[it.id] = box);
  }
  function contactInfo(id) {
    const info = D.contacts2018[id];
    if (!info?.afterMessages) return info;
    const update = (S.chat[id] || []).findLast(message => message.from === 'sys' && info.afterMessages[msgText(message)]);
    return update ? {...info, ...info.afterMessages[msgText(update)]} : info;
  }

  function contactMessages(id) {
    const history = D.contacts2018[id]?.history;
    const messages = S.chat[id] || [];
    return history?.length ? history.concat(messages) : messages;
  }
  function contactVisible(id) {
    const contact = D.contacts2018[id];
    return contact && test(contact.requires) && (contactMessages(id).length || S.dlgQ[id]);
  }
  function needsReply(c) {
    const wait = S.wait[c], id = S.dlgQ[c]?.[0], dialogue = DLG[id], state = S.dlg[id];
    if (!wait || !dialogue || !state || state.done || isStale(dialogue) || !contactVisible(c)) return false;
    const step = dialogue.steps[state.i];
    if (wait.type === 'reply') return step?.me !== undefined;
    if (wait.type === 'choice') return step?.choice?.some(option => test(option.requires));
    return wait.type === 'puzzle' && step?.puzzle === wait.id && !solved(wait.id);
  }

  function phoneSearch(label, key, onSearch) {
    const input = h('input', { class: 'ph-search-input', type: 'search', 'aria-label': label, placeholder: label, autocomplete: 'off', value: ui[key] });
    const clear = h('button', { class: 'ph-search-clear', type: 'button', 'aria-label': _t('清空'), text: '×', onclick: () => { input.value = ''; ui[key] = ''; clear.hidden = true; onSearch(''); input.focus(); } });
    clear.hidden = !ui[key];
    input.addEventListener('input', () => { ui[key] = input.value; clear.hidden = !input.value; onSearch(input.value); });
    return h('div', { class: 'ph-search' }, h('span', { class: 'ph-search-icon', 'aria-hidden': 'true', text: '⌕' }), input, clear);
  }
  function searchText(value) { return strip(fmt(value)).normalize('NFKC').toLocaleLowerCase(); }


  // 只导航到已经开放的资料，仍走原有的文件锁、后台登录和谜题入口。
  function goEvidence(source) {
    if (!source) return;
    if (source.type === 'clip') {
      if (ui.clip !== source.id) { ui.frameSel = null; ui.frameMsg = ''; ui.framePuzzle = null; }
      ui.tab = 'clips'; ui.clip = source.id; ui.chat = null; ui.mail = null; ui.item = null;
      if (narrow()) togglePhone(true); else renderPhone();
      return;
    }
    if (['item', 'mail'].includes(source.type)) {
      const list = source.type === 'item' ? S.items : S.mails;
      if (!list.includes(source.id)) return toast(_t('这份资料尚未收到。'));
      ui.tab = source.type === 'item' ? 'items' : 'mail'; ui.chat = null; ui.reading = null;
      ui.item = source.type === 'item' ? source.id : null; ui.mail = source.type === 'mail' ? source.id : null;
      if (narrow()) togglePhone(true); else renderPhone(); return;
    }
    if (source.type === 'chat') { ui.tab = 'msg'; ui.chat = source.id; ui.reading = null; ui.item = null; ui.mail = null; renderPhone(); return; }
    if (source.type === 'board') { if (canOpenBoard(source.id)) openBoard(source.id); return; }
    if (S.stage !== 'win') {
      if (narrow()) togglePhone(false);
      if (S.stage === 'off') powerOn();
      return;
    }
    if (source.type === 'app') {
      if (narrow()) togglePhone(false);
      if (source.puzzle && D.puzzles[source.puzzle] && !solved(source.puzzle) && test(D.puzzles[source.puzzle].requires)) return askPuzzle(source.puzzle);
      return openApp(source.id);
    }
    if (source.type === 'file') {
      const f = D.files.find(f => f.id === source.id); if (!f || !test(f.requires)) return;
      if (narrow()) togglePhone(false);
      if (f.deleted && !S.flags['restored_' + f.id]) openRecycle(); else openFile(f);
    } else if (source.type === 'props') {
      const f = D.files.find(f => f.id === source.id);
      if (f && test(f.requires)) { if (narrow()) togglePhone(false); showProps(f); }
    } else if (source.type === 'url') {
      if (narrow()) togglePhone(false); openIE(source.value);
    } else if (source.type === 'gx') {
      if (narrow()) togglePhone(false);
      withLock(D.apps.gexun?.lock, () => openGexun(source.id));
    }
  }
  function sourceButton(source, label, onClick = () => goEvidence(source)) {
    return h('button', { class: 'ph-source', type: 'button', text: label || _t('查看原件'), onclick: onClick });
  }
  function noteChapter(id) { const m = /^c([0-7])_/.exec(id); return m ? 'ch' + m[1] : (S.noteCh[id] || S.chapter); }
  function noteSource(id) {
    const has = a => a && [].concat(a.note || []).includes(id);
    for (const f of D.files) {
      if (!has(f.onOpen) && !has(f.onProps)) continue;
      // 同一路径的残片会被更完整的版本替代，旧笔记仍能回到这份文件。
      const current = test(f.requires) ? f : nodeFile(f.path);
      return current ? { type: has(f.onOpen) ? 'file' : 'props', id: current.id } : null;
    }
    for (const t of D.threads) if (has(t.onOpen) || has(t.onSource)) return { type: 'url', value: '/thread.asp?id=' + t.id };
    for (const m of D.mails) if (has(m.onOpen)) return { type: 'url', value: '/admin/mail.asp?id=' + encodeURIComponent(m.id) };
    for (const m of D.mails2018) if (has(m.onOpen)) return { type: 'mail', id: m.id };
    for (const it of D.items2018) if (has(it.onOpen)) return { type: 'item', id: it.id };
    for (const l of D.gxLogs) if (has(l.onOpen)) return { type: 'gx', id: l.id };
    for (const p of (D.web || [])) if (has(p.onOpen) || has(p.onSource)) return { type: 'url', value: webURL(p) };
    for (const c of ((D.footage || {}).clips || [])) if (has(c.onOpen) || (c.frames || []).some(fr => has(fr.onView))) return { type: 'clip', id: c.id };
    return null;
  }
  // 日志里暂时挑不出可做的一步时（本章步骤做完、等人回话、等补读），给玩家一个能点的去处，不让指引空着。
  function journalFallback(journal) {
    const visible = c => D.contacts2018[c] && contactVisible(c);
    if (S.chapter === 'ch8' && S.flags.c8_end) return [_t('本次调查已结束。'), null];
    // 几个人同时有动静时，指向最近来消息的那一个。
    const lastAt = c => String((contactMessages(c).at(-1) || {}).sceneAt || '');
    const latest = list => list.sort((a, b) => lastAt(b).localeCompare(lastAt(a)))[0];
    const waiting = latest(Object.keys(S.wait || {}).filter(needsReply));
    if (waiting) return [contactInfo(waiting).name + _t(' 在等你回复。打开对话，点底部的回复。'), { type: 'chat', id: waiting }];
    // 对话还没走完的人优先；只是没点开的旧消息放到最后。
    const unreadOf = active => latest(Object.keys(S.unread || {}).filter(c => S.unread[c] && visible(c) && ((S.dlgQ[c] || []).length > 0) === active));
    const unread = unreadOf(true);
    if (unread) return [contactInfo(unread).name + _t(' 发来了新消息，还没读。'), { type: 'chat', id: unread }];
    const mail = S.mails.find(m => !S.mailRead[m]);
    if (mail) return [_t('收件箱里还有一封未读邮件。'), { type: 'mail', id: mail }];
    const board = Object.keys(D.boards).find(id => canOpenBoard(id) && !S.flags['board_' + id]);
    if (board) return [_t('已经找到这张推理板需要的线索，可以填了。'), { type: 'board', id: board }];
    // 本章步骤都做完了：剩下的是剧情自己往前走，不再把玩家支去翻旧文件。
    const left = (journal.steps || []).some(s => !test(s.until));
    if (!left) return [_t('本章的线索都整理好了。等下一条消息时，可以再翻翻原件。'), null];
    if (Object.entries(D.puzzles).some(([id, p]) => p.ask && test(p.requires) && !solved(id))) return [_t('手头还有几道题可以接着查。'), null];
    const fresh = S.stage === 'win' && D.files.find(f => f.type !== 'folder' && isNewFile(f));
    if (fresh) return [_t('电脑里有新读出来的文件还没打开：') + nameOf(fresh.path), { type: 'file', id: fresh.id }];
    const old = unreadOf(false);
    if (old) return [contactInfo(old).name + _t(' 发来过消息，还没读。'), { type: 'chat', id: old }];
    return [_t('暂时没有新的调查进展。等消息时，可以回看本章的线索和原件。'), null];
  }
  function isComputerSource(source) {
    return source && ['app', 'file', 'props', 'url', 'gx'].includes(source.type);
  }
  function renderJournal(body) {
    const journal = D.journal[S.chapter]; if (!journal) return;
    const next = nextJournalStep();
    const [text, source] = next ? [next.text, next.source] : journalFallback(journal);
    let action = _t('前往资料');
    if (isComputerSource(source) && S.stage !== 'win') action = S.stage === 'off' ? _t('打开读盘机') : _t('查看读盘机');
    body.append(h('section', { class: 'ph-journal', 'data-investigation': next?.until || 'fallback' },
      h('div', { class: 'k', text: _t('本章调查') }), h('h3', { text: journal.question }),
      h('p', { text }),
      source ? sourceButton(source, action, action === _t('前往资料') ? () => {
        msgBox(action, _t('是否确认跳转？') + '<br>' + _t('跳转会计入提示次数。'), [
          { text: _t('是'), fn: () => {
            S.hints ||= {};
            const used = S.hints.journal_direct_jump;
            S.hints.journal_direct_jump = (Number.isSafeInteger(used) && used > 0 ? used : 0) + 1;
            dirty();
            goEvidence(source);
          } },
          { text: _t('否') }
        ]);
      } : undefined) : null));
    const facts = (journal.facts || []).filter(f => test(f.requires));
    if (facts.length) body.append(h('details', { class: 'ph-facts', open: true },
      h('summary', { text: _t('目前能确认的事') + ' · ' + facts.length }),
      h('ul', {}, facts.map(f => h('li', { text: f.text })))));
  }
  function nextJournalStep() {
    const available = source => {
      if (!source) return false;
      if (isComputerSource(source) && S.stage !== 'win' && D.boot.requires && !test(D.boot.requires)) return false;
      if (source.type === 'item') return S.items.includes(source.id);
      if (source.type === 'mail') return S.mails.includes(source.id);
      if (source.type === 'chat') return contactVisible(source.id);
      if (source.type === 'app') return D.apps[source.id] && test(D.apps[source.id].requires);
      if (source.type === 'board') return D.boards[source.id] && test(D.boards[source.id].requires);
      if (source.type === 'clip') return clipsOpen() && clipList().some(c => c.id === source.id);
      if (['file', 'props'].includes(source.type)) return D.files.some(f => f.id === source.id && test(f.requires));
      if (source.type === 'url') return true;
      if (source.type === 'gx') return D.gxLogs.some(l => l.id === source.id && test(l.requires));
      return false;
    };
    return ((D.journal[S.chapter] || {}).steps || []).find(step => {
      if (test(step.until) || !test(step.requires) || !available(step.source)) return false;
      const puzzle = step.until.startsWith('solved_') && D.puzzles[step.until.slice(7)];
      // 引导玩家去读原件或查看属性；答题入口仍保留完整的证据条件。
      if (puzzle && !test((puzzle.requires || '').replace(/\b(?:seen|props)_\w+\b/g, 'start'))) return false;
      const dialogue = step.until.startsWith('dlg_') && DLG[step.until.slice(4)];
      if (dialogue && !test(dialogue.trigger)) return false;
      return true;
    });
  }
  function renderClues(body, controls) {
    const results = h('div', { class: 'ph-search-results' });
    const scope = h('select', { class: 'ph-scope', 'aria-label': _t('线索范围') },
      h('option', { value: 'current', text: _t('本章线索') }), h('option', { value: 'all', text: _t('全部已发现线索') }));
    D.chapters.filter(c => S.notes.some(id => noteChapter(id) === c.id)).forEach(c => scope.append(h('option', { value: c.id, text: c.num + ' · ' + c.name })));
    scope.value = ui.clueScope;
    const show = query => {
      results.innerHTML = ''; const q = searchText(query).trim();
      const ids = S.notes.slice().reverse().filter(id => {
        if (!D.notes[id]) return false;
        const ch = noteChapter(id), c = D.chapters.find(c => c.id === ch);
        return (ui.clueScope === 'all' || ch === (ui.clueScope === 'current' ? S.chapter : ui.clueScope))
          && (!q || searchText((c ? c.num + ' ' + c.name : '') + ' ' + D.notes[id].text).includes(q));
      });
      for (const c of D.chapters.slice().reverse()) {
        const group = ids.filter(id => noteChapter(id) === c.id); if (!group.length) continue;
        const opened = !!q || ui.clueScope !== 'all' || c.id === S.chapter || !!ui.clueGroups[c.id];
        const section = h('details', { class: 'ph-clue-group', open: opened },
          h('summary', { text: c.num + ' · ' + c.name + ' · ' + group.length }));
        section.addEventListener('toggle', () => { ui.clueGroups[c.id] = section.open; });
        group.forEach(id => {
          const source = noteSource(id);
          section.append(h('div', { class: 'ph-card', 'data-note': id },
            h('div', { class: 'k', text: c.num }), h('div', { html: fmt(D.notes[id].text) }), source ? sourceButton(source) : null));
        });
        results.append(section);
      }
      if (!ids.length) results.append(h('div', { class: 'ph-card done', text: q ? _t('没有找到。') : _t('这一章还没记下线索。点上方的章节名，可以翻看其他章节的笔记。') }));
      body.scrollTop = 0;
    };
    scope.onchange = () => { ui.clueScope = scope.value; show(ui.noteQuery); };
    controls.append(scope, phoneSearch(_t('搜索') + ' ' + _t('线索'), 'noteQuery', show)); body.append(results); show(ui.noteQuery);
  }
  function readingAvailable(r) {
    return test(r.requires) || !!(r.archiveOfMail && S.readingSeen?.[r.id]);
  }
  function renderReadings(body) {
    const readings = D.readings.filter(readingAvailable);
    if (ui.reading) {
      const r = readings.find(r => r.id === ui.reading);
      if (!r) { ui.reading = null; return; }
      S.readingSeen = S.readingSeen || {}; S.readingSeen[r.id] = true;
      const f = r.file && D.files.find(f => f.id === r.file && test(f.requires));
      const article = h('article', { class: 'ph-reading' },
        h('div', { class: 'ph-reading-source', text: r.date + ' · ' + r.source }),
        f ? h('div', { class: 'ph-reading-original', html: fmt(f.html || '<pre>' + esc(f.text || '') + '</pre>') }) : null,
        h('div', { html: fmt(r.html) }));
      body.append(article); bindImageZoom(article); save('auto'); return;
    }
    D.chapters.forEach(c => {
      const rows = readings.filter(r => r.chapter === c.id); if (!rows.length) return;
      body.append(h('div', { class: 'ph-sec', text: c.num + ' · ' + c.name }));
      rows.forEach(r => body.append(h('button', { class: 'ph-reading-tile', type: 'button', onclick: () => { ui.reading = r.id; renderPhone(); } },
        h('span', { text: r.title }), h('small', { text: (S.readingSeen || {})[r.id] ? _t('已读') : _t('未读') }),
        r.intro ? h('p', { text: r.intro }) : null)));
    });
    if (!readings.length) body.append(h('div', { class: 'ph-empty', text: _t('读过的信、看过的录像里，有些片段会收在这里，随时可以回来翻。') }));
  }

  function renderPhone() {
    const ph = $('#phone'); if (!ph || !S) return;
    const t = phoneNow();
    $('#phStatus').innerHTML = `<span><b>${t.hm}</b>　${t.date} ${t.wk}</span><span>4G　86%</span>`;
    if (ui.tab === 'msg' && ui.chat && (!narrow() || ui.phoneOpen)) S.unread[ui.chat] = 0;
    const unreadMsg = Object.values(S.unread).reduce((a, b) => a + b, 0);
    const unreadMail = S.mails.filter(m => !S.mailRead[m]).length;
    const newItems = S.items.filter(i => !S.itemSeen[i]).length;
    const waiting = new Set(Object.keys(S.wait).filter(needsReply));
    const replyDot = () => h('span', { class: 'badge dot', role: 'img', 'aria-label': _t('【等你回复】') });
    const badges = { msg: unreadMsg, mail: unreadMail, items: newItems, notes: S.newNotes, boards: S.newBoards, menu: 0 };
    const tabs = $('#phTabs'); tabs.innerHTML = '';
    const tabList = [['msg', _t('消息')], ['mail', _t('邮件')], ['items', _t('物品')], ['notes', _t('笔记')], ['boards', _t('推理')], ['menu', _t('菜单')]];
    if (hhOpen()) tabList.splice(4, 0, ['list', _t('名单')]);
    if (clipsOpen()) tabList.splice(tabList.findIndex(t => t[0] === 'boards'), 0, ['clips', _t('录像')]);
    badges.clips = newClips();
    badges.list = hhPending();
    tabs.style.gridTemplateColumns = 'repeat(' + tabList.length + ', 1fr)';
    tabList.forEach(([k, n]) => {
      const b = h('button', { class: ui.tab === k ? 'on' : '', html: phIcon(k) + `<span>${n}</span>`, onclick: () => { ui.tab = k; ui.chat = null; ui.mail = null; ui.item = null; ui.menuView = null; ui.reading = null; ui.clip = null; if (k === 'notes') S.newNotes = 0; if (k === 'boards') S.newBoards = 0; renderPhone(); } });
      if (badges[k]) b.append(h('span', { class: 'badge', text: badgeText(badges[k]) }));
      else if (k === 'msg' && waiting.size) b.append(replyDot());
      tabs.append(b);
    });
    const fab = $('#phoneFab');
    if (fab) {
      fab.hidden = narrow() && ui.phoneOpen;
      fab.innerHTML = phIcon('phone');
      const n = unreadMsg + unreadMail;
      if (n) fab.append(h('span', { class: 'badge', text: badgeText(n) }));
      else if (waiting.size) fab.append(replyDot());
    }
    const head = $('#phHead'), body = $('#phBody'), foot = $('#phFoot');
    rememberQuestionGroups(body);
    const viewKey = ui.tab + ':' + (ui.chat || ui.mail || ui.item || ui.menuView || ui.clip || (ui.tab === 'notes' ? ui.noteTab + ':' + (ui.reading || '') : ''));
    const sameView = ui._viewKey === viewKey;
    const keepBottom = body.scrollHeight - body.scrollTop - body.clientHeight < 40;
    const prevScroll = body.scrollTop;
    if (ui._viewKey) ui.scroll[ui._viewKey] = prevScroll;
    // 来消息时保留正在输入的存档码等表单；切换页面时照常刷新。
    if (sameView && body.contains(document.activeElement) && /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) return;
    // 新消息也不能打断正在录像字幕或笔记里拖选、长按复制的文字。
    const selection = window.getSelection();
    if (sameView && (ui.tab === 'clips' || ui.tab === 'notes') && selection && !selection.isCollapsed &&
        body.contains(selection.anchorNode) && body.contains(selection.focusNode)) return;
    body.onscroll = null;
    head.innerHTML = ''; body.innerHTML = ''; foot.innerHTML = ''; foot.hidden = true;
    const closeBtn = h('button', { class: 'ph-close', text: _t('收起'), onclick: () => togglePhone(false) });
    const title = (txt, sub, back) => { if (back) head.append(h('button', { class: 'ph-back', text: '‹', 'aria-label': _t('返回'), onclick: back })); head.append(h('h2', {}, txt, sub ? h('small', { text: sub }) : null), closeBtn); };
    let stick = false;
    if (ui.tab === 'msg') {
      if (ui.chat) {
        const c = ui.chat, info = contactInfo(c);
        title(info.name, typing[c] ? _t('对方正在输入…') : info.sub, () => { ui.chat = null; renderPhone(); });
        const box = h('div', { class: 'chat' });
        let previousAt = '';
        contactMessages(c).forEach(m => {
          const at = chatTimestamp(m);
          if (at && at !== previousAt) {
            const time = phoneTime(at);
            const newDay = at.slice(0, 10) !== previousAt.slice(0, 10);
            box.append(h('time', { class: 'chat-stamp', datetime: at.replace(' ', 'T') },
              h('span', { class: newDay ? 'chat-day' : 'chat-date', text: time.date }), ' ', h('span', { text: time.hm })));
            previousAt = at;
          }
          const b = h('div', { class: 'bub ' + m.from, title: m.at || '' });
          if (m.who) b.append(h('b', { class: 'who', text: m.who }));
          const mt = msgText(m), mh = msgHtml(m);
          if (mt) {
            const address = /^(?:https?:\/\/)?[\w-]+(?:\.[\w-]+)+\/\S*$/i.test(mt) && parseURL(mt);
            if (address && D.sites[address.host]) {
              const href = 'http://' + address.host + address.raw;
              const link = h('a', {class:'chat-link', href, text:mt});
              link.onclick = e => { e.preventDefault(); goEvidence({type:'url', value:href}); };
              b.append(link);
            } else b.append(h('span', { html: fmt(esc(mt)).replace(/&lt;br&gt;/g, '\n') }));
          }
          const attachments = m.ref && DLG[m.ref.d]?.steps[m.ref.i]?.attachments;
          if (attachments) {
            for (const source of attachments) b.append(sourceButton(source, source.label));
          }
          if (mh) {
            b.classList.add('media');
            const pic = h('div', { class: 'pic', html: fmt(mh), role: 'button', tabindex: 0, 'aria-label': _t('放大图片') });
            const open = () => viewImage(fmt(mh)); bindControl(pic, open);
            pic.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } };
            b.append(pic);
          }
          box.append(b);
        });
        if (typing[c]) box.append(h('div', { class: 'bub npc typing', html: '<i></i><i></i><i></i>' }));
        body.append(box);
        const w = waiting.has(c) ? S.wait[c] : null;
        if (w && (w.type === 'choice' || w.type === 'reply')) {
          const [d, st] = curDlg(c) || [];
          if (d) {
            const step = st.i;
            foot.hidden = false; foot.append(h('div', { class: 'ph-reply-label', text: _t('点击发送回复') }));
            if (w.type === 'reply') foot.append(h('button', { class: 'ph-btn', html: fmt(esc(d.steps[step].me)), onclick: () => sendReply(c, d.id, step) }));
            else d.steps[step].choice.forEach((o, i) => {
              if (test(o.requires)) foot.append(h('button', { class: 'ph-btn', html: fmt(esc(o.text)), onclick: () => choose(c, i, d.id, step) }));
            });
          }
        } else if (w && w.type === 'puzzle') {
          const p = D.puzzles[w.id];
          foot.hidden = false; foot.append(h('button', { class: 'ph-btn pri', text: _t('回答：') + (p ? p.title : ''), onclick: () => askPuzzle(w.id, null, true, c) }));
        }
        stick = true;
      } else {
        title(_t('消息'));
        const list = h('div', { class: 'ph-list' });
        Object.keys(D.contacts2018).filter(contactVisible).forEach(id => {
          const info = contactInfo(id); const log = contactMessages(id); const last = log[log.length - 1];
          const w = waiting.has(id);
          list.append(h('button', { class: 'ph-item', 'data-contact': id, onclick: () => { ui.chat = id; renderPhone(); } },
            h('div', { class: 'av', text: info.avatar || info.name[0] }),
            h('div', { class: 'mid' }, h('b', { text: info.name }), h('span', { class: w ? 'awaiting-reply' : null, text: w ? _t('【等你回复】') : typing[id] ? _t('对方正在输入…') : last ? (last.from === 'me' ? _t('我：') : last.who ? last.who + '：' : '') + playerText(msgText(last) || _t('[图片]')) : '' })),
            h('div', { class: 'rt' }, h('span', { text: chatListTime(last) }), S.unread[id] ? h('span', { class: 'cnt', text: String(S.unread[id]) }) : null)));
        });
        if (!list.children.length) list.append(h('div', { class: 'ph-empty', text: _t('暂无消息') }));
        body.append(list);
      }
    } else if (ui.tab === 'mail') {
      if (ui.mail) {
        const m = MAIL26[ui.mail]; S.mailRead[ui.mail] = 1; opened(m.id, m.onOpen);
        title(strip(fmt(m.subject)), '', () => { ui.mail = null; renderPhone(); });
        body.append(h('div', { class: 'ph-mail' }, h('div', { class: 'mh', html: `${_t('发件人：')}${esc(m.from)}<br>${_t('时间：')}${esc(m.date || '')}` }), h('div', { html: fmt(m.html) })));
        bindImageZoom(body.querySelector('.ph-mail'));
      } else {
        title(_t('邮件'), `${_t('收件箱')} ${S.mails.length}`);
        const list = h('div', { class: 'ph-list' });
        const inbox = S.mails.slice().reverse().map(id => MAIL26[id]).filter(Boolean);
        inbox.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
        inbox.forEach(m => {
          const id = m.id;
          list.append(h('button', { class: 'ph-item', onclick: () => { ui.mail = id; renderPhone(); } },
            h('div', { class: 'av', text: '✉' }),
            h('div', { class: 'mid' }, h('b', { text: strip(fmt(m.subject)), style: S.mailRead[id] ? { fontWeight: 400 } : null }), h('span', { text: m.from })),
            h('div', { class: 'rt' }, h('span', { text: (m.date || '').slice(5, 16) }), !S.mailRead[id] ? h('span', { class: 'cnt', text: _t('新') }) : null)));
        });
        if (!list.children.length) list.append(h('div', { class: 'ph-empty', text: _t('收件箱是空的') }));
        body.append(list);
      }
    } else if (ui.tab === 'items') {
      if (ui.item) {
        const it = ITEM[ui.item]; S.itemSeen[it.id] = 1; opened(it.id, it.onOpen);
        title(strip(fmt(it.name)), '', () => { ui.item = null; renderPhone(); });
        const v = h('div', { class: 'ph-view', html: fmt(it.html) });
        bindImageZoom(v);
        body.append(v);
        if (it.rub) body.append(rubPad(it));
      } else {
        title(_t('物品'), _t('手边的实物和照片'));
        const results = h('div', { class: 'ph-search-results' });
        const showItems = query => {
          results.innerHTML = ''; const g = h('div', { class: 'ph-grid' }), q = searchText(query).trim();
          S.items.forEach(id => { const it = ITEM[id]; if (!it || (q && !searchText(it.name + ' ' + it.html).includes(q))) return; g.append(h('button', { class: 'ph-tile' + (S.itemSeen[id] ? '' : ' new'), onclick: () => { ui.item = id; renderPhone(); } }, h('span', { html: fmt(it.name) }), h('small', { text: S.itemSeen[id] ? _t('已查看') : _t('未查看') }))); });
          results.append(g.children.length ? g : h('div', { class: 'ph-empty', text: S.items.length ? _t('没有找到。') : _t('还没有东西') }));
        };
        body.append(h('div', { class: 'ph-search-bar' }, phoneSearch(_t('搜索') + ' ' + _t('物品'), 'itemQuery', showItems)), results);
        showItems(ui.itemQuery);
      }
    } else if (ui.tab === 'notes') {
      const reading = D.readings.find(r => r.id === ui.reading && readingAvailable(r));
      title(reading ? reading.title : _t('笔记'), currentChapterLabel(), reading ? () => { ui.reading = null; renderPhone(); } : null);
      const asks = Object.entries(D.puzzles).filter(([id, p]) => p.ask && test(p.requires) && !solved(id));
      const pageTotal = photoTotal();
      if (ui.noteTab === 'poems') ui.noteTab = 'questions';
      const controls = h('div', { class: 'ph-note-controls' });
      const pages = h('div', { class: 'ph-note-tabs', 'aria-label': _t('笔记') });
      // 这一部没有写“旧事”，就不摆一个永远是 0 的标签。
      if (!D.readings.length && ui.noteTab === 'readings') ui.noteTab = 'questions';
      [['questions', _t('待解决的问题'), asks.length], ['clues', _t('线索'), S.notes.length], D.readings.length ? ['readings', _t('旧事'), D.readings.filter(readingAvailable).length] : null].filter(Boolean).forEach(([key, label, count]) => {
        pages.append(h('button', { type: 'button', class: key === ui.noteTab ? 'on' : '', 'aria-pressed': key === ui.noteTab ? 'true' : 'false', onclick: () => { ui.noteTab = key; ui.reading = null; renderPhone(); } }, h('span', { text: label }), count == null ? null : h('small', { text: count })));
      });
      if (pageTotal) pages.append(h('button', { type: 'button', 'aria-haspopup': 'dialog', onclick: openPhotoCollection },
        h('span', { text: D.collectLabel }), h('small', { text: photoCount() + '/' + pageTotal })));
      controls.append(pages); body.append(controls);
      if (ui.noteTab === 'questions') {
        renderJournal(body);
        if (!asks.length && !nextJournalStep()) body.append(h('div', { class: 'ph-card done', text: _t('暂无待核对的问题。') }));
        const addQuestions = (list, host) => list.forEach(([id, p]) => host.append(h('div', { class: 'ph-card q', role: 'button', tabindex: 0, onclick: () => askPuzzle(id, null, true), onkeydown: (e) => { if (confirmInput(e)) askPuzzle(id, null, true); } }, h('div', { class: 'k', text: _t('点击作答') }), h('div', { html: fmt(p.title) }))));
        const current = asks.filter(([id]) => noteChapter(id) === S.chapter);
        addQuestions(current.slice(0, 2), body);
        const addGroup = (list, name, label) => {
          if (!list.length) return;
          const key = S.chapter + ':' + name;
          const fold = h('details', { class: 'ph-facts', 'data-question-group': key, open: !!ui.questionGroups[key] },
            h('summary', { text: _t(label) + ' · ' + list.length }));
          addQuestions(list, fold); body.append(fold);
        };
        addGroup(current.slice(2), 'current', '本章其他待答问题');
        const old = asks.filter(([id]) => noteChapter(id) !== S.chapter);
        addGroup(old, 'previous', '之前未解的问题');
      } else if (ui.noteTab === 'clues') {
        renderClues(body, controls);
      } else if (ui.noteTab === 'readings') {
        renderReadings(body);
      }
    } else if (ui.tab === 'boards') {
      title(_t('推理'), _t('把线索拼成结论'));
      const current = D.journal[S.chapter]?.steps.find(step => step.source?.type === 'board')?.source.id;
      const list = Object.entries(D.boards).filter(([id]) => canOpenBoard(id) || id === current);
      if (!list.length) body.append(h('div', { class: 'ph-empty', text: _t('暂无记录。') }));
      list.reverse().forEach(([id, b]) => {
        if (!canOpenBoard(id)) { body.append(lockedBoardCard(id, b)); return; }
        const ok = S.flags['board_' + id];
        body.append(h('div', { class: 'ph-card q' + (ok ? ' done' : ''), role: 'button', tabindex: 0, style: ok ? { borderLeftColor: 'var(--ph-good)' } : null, onclick: () => openBoard(id), onkeydown: (e) => { if (confirmInput(e)) openBoard(id); } },
          h('div', { class: 'k', text: ok ? _t('已完成') : _t('进行中 · 点击打开') }), h('div', { style: { fontWeight: 600 }, text: b.title })));
      });
    } else if (ui.tab === 'clips' && clipsOpen()) {
      renderClips(title, body);
    } else if (ui.tab === 'list') {
      renderHouseholds(title, body);
    } else if (ui.tab === 'menu') {
      renderMenu(title, body);
    }
    if (ui.returnBoard && ['items', 'mail', 'clips'].includes(ui.tab)) {
      body.prepend(h('button', {class:'ph-source', type:'button', text:_t('返回推理'), onclick:() => {
        ui.returnBoard = null; ui.tab = 'boards'; renderPhone();
      }}));
    }
    if (stick) {
      if (sameView) body.scrollTop = keepBottom ? body.scrollHeight : prevScroll;
      else body.scrollTop = ui.scroll[viewKey] == null ? body.scrollHeight : ui.scroll[viewKey];
      const latest = h('button', { class: 'chat-latest', text: _t('最新 ↓'), onclick: () => { body.scrollTop = body.scrollHeight; } });
      head.append(latest);
      body.onscroll = () => { latest.hidden = body.scrollHeight - body.scrollTop - body.clientHeight < 40; ui.scroll[viewKey] = body.scrollTop; };
      body.onscroll();
    } else body.scrollTop = sameView ? prevScroll : (ui.scroll[viewKey] || 0);
    ui._viewKey = viewKey;
  }
  function currentChapterLabel() { const c = D.chapters.find(x => x.id === S.chapter); return c ? `${c.num} · ${c.name}` : ''; }
  function renderMenu(title, body) {
    title(_t('菜单'), currentChapterLabel());
    const sec = (t) => body.append(h('div', { class: 'ph-sec', html: `<span>${t}</span>` }));
    sec(_t('存档'));
    const auto = readSave('auto');
    body.append(h('div', { class: 'ph-card slot-card' }, h('div', {}, h('div', { class: 'k', text: _t('自动存档（每一步都会自动保存）') }), h('div', { text: describe(auto) }))));
    MANUAL_SLOTS.forEach((k, i) => {
      const s = readSave(k);
      const saveHere = () => {
        if (writeSave(k)) { toast(_t('已保存到存档位') + ' ' + (i + 1), 'good'); renderPhone(); }
      };
      const confirmSave = () => {
        const current = readSave(k);
        if (!current) return saveHere();
        const label = _t('存档位') + ' ' + (i + 1);
        msgBox(_t('覆盖存档'), esc(label + '　' + describe(current)) + '<br><br>' + _t('用当前进度覆盖这个存档吗？'), [
          { text: _t('取消') }, { text: _t('覆盖'), fn: saveHere }
        ]);
      };
      body.append(h('div', { class: 'ph-card slot-card' },
        h('div', { style: { minWidth: 0 } }, h('div', { class: 'k', text: `${_t('存档位')} ${i + 1}` }), h('div', { text: describe(s) })),
        h('div', { class: 'ph-row' },
          h('button', { class: 'ph-btn sm', text: _t('保存'), onclick: confirmSave }),
          s ? h('button', { class: 'ph-btn sm', text: _t('读取'), onclick: () => { const o = readSave(k); if (o) { loadState(o); toast(_t('已读取存档位 ') + (i + 1)); } } }) : null)));
    });
    body.append(h('div', { class: 'ph-row', style: { marginBottom: '8px' } },
      h('button', { class: 'ph-btn sm', text: _t('导出存档文件'), onclick: exportSave }),
      h('button', { class: 'ph-btn sm', text: _t('导入存档文件'), onclick: () => importFile() })));
    if (ui.menuView === 'code') {
      const ta = h('textarea', { class: 'ph-input', id: 'saveCode', rows: 4, readonly: true }); ta.value = b64e(JSON.stringify(portableSave()));
      const tb = h('textarea', { class: 'ph-input', id: 'loadCode', rows: 3, placeholder: _t('把存档码粘贴到这里') });
      body.append(h('div', { class: 'ph-card' }, h('div', { class: 'k', text: _t('当前存档码（复制保存到任何地方）') }), ta,
        h('div', { class: 'ph-row', style: { margin: '6px 0 10px' } }, h('button', { class: 'ph-btn sm', text: _t('复制'), onclick: () => { ta.select(); (navigator.clipboard ? navigator.clipboard.writeText(ta.value) : Promise.reject()).then(() => toast(_t('已复制')), () => { document.execCommand && document.execCommand('copy'); toast(_t('已选中，请手动复制')); }); } })),
        h('div', { class: 'k', text: _t('读取存档码') }), tb,
        h('div', { class: 'ph-row', style: { marginTop: '6px' } }, h('button', { class: 'ph-btn sm', text: _t('读取'), onclick: () => { try { const o = JSON.parse(b64d(tb.value)); if (o.v !== VER) throw 0; loadState(o); toast(_t('存档码已读取')); } catch (e) { toast(_t('存档码无效')); } } }))));
    } else body.append(h('button', { class: 'ph-btn sm', style: { width: '100%', marginBottom: '8px' }, text: _t('存档码（复制 / 粘贴）'), onclick: () => { ui.menuView = 'code'; renderPhone(); } }));
    sec(_t('设置'));
    const ap = audioPrefs();
    body.append(h('div', { class: 'ph-card slot-card' }, h('div', { text: _t('音乐') }), h('button', { class: 'ph-btn sm', text: ap.music ? _t('开') : _t('关'), onclick: () => { setAudioPref('music', !ap.music); renderPhone(); } })));
    body.append(h('div', { class: 'ph-card slot-card' }, h('div', { text: _t('音效') }), h('button', { class: 'ph-btn sm', text: ap.sfx ? _t('开') : _t('关'), onclick: () => { setAudioPref('sfx', !ap.sfx); S.sound = !ap.sfx; renderPhone(); save('auto'); } })));
    sec(_t('结局收集'));
    body.append(endingList());
    sec(_t('其他'));
    body.append(h('button', { class: 'ph-btn sm', style: { width: '100%', marginBottom: '8px' }, text: _t('帮助'), onclick: openHelp }));
    body.append(h('button', { class: 'ph-btn sm', style: { width: '100%' }, text: _t('返回标题画面'), onclick: () => { writeSave('auto'); showTitle(); } }));
  }
  // Out-of-story reference only: no story data, evidence links, tasks or answers.
  function openHelp(onPC = false) {
    const m = modalRoot(onPC === true); m.innerHTML = '';
    const dlg = h('div', { class: 'dlg98 out raised help-dialog', role: 'dialog', 'aria-label': _t('帮助') });
    const tabs = h('div', { class: 'help-tabs', role: 'tablist' });
    const body = h('div', { class: 'help-content', role: 'tabpanel', tabindex: 0 });
    let tab = 'controls';
    const paragraph = text => body.append(h('p', { html: fmt(text) }));
    function draw() {
      body.innerHTML = ''; body.scrollTop = 0;
      for (const button of tabs.children) { button.classList.toggle('on', button.dataset.tab === tab); button.setAttribute('aria-selected', button.dataset.tab === tab ? 'true' : 'false'); }
      if (tab === 'controls') {
        for (const [title, text] of [
          ['电脑与手机', '用鼠标双击图标打开程序，拖动标题栏移动窗口。想看文件属性，就右键点文件。用触屏时，轻点图标即可打开，长按文件可看属性。点右下角的手机按钮可以展开手机。表格太宽时，可以左右滑。'],
          ['材料与笔记', '手机里收着消息、邮件、物品和录像。读过原件，线索会记进“笔记”。忘了接下来要查什么，到手机“笔记”点“待解决的问题”。上方的“本章调查”能带你回到要看的原件。'],
          ['解题操作', '多选题会标出要选几项。看录像时一帧一帧点开，选中那一帧再提交。修复坏道时，从标出的起始簇开始，照“下一簇”的编号往后接；编号读不出来，就看哪两段文字接得上。'],
          ['上网与搜索', '读盘机能通过老K自己架的“旧网代理”打开存档网页。地址栏可以直接输入网址，“收藏”菜单里有常用站点。“旧网搜索”能搜人名、地名、日期，多个词用空格隔开。工具栏的“源文件”能看网页原来的代码。'],
          ['文件、比较与地图', '资源管理器“查看”菜单里勾上“显示所有文件”，才能看见隐藏文件。右键文件看属性，修改时间、作者、备注都可能是线索。先分别打开两份资料，再用“文件比较”。看平面图时，点地点再确认。'],
      ['推理板', '先点空格，再选词语。同一张词卡可以填进多个空格，电脑上也可以直接拖进去。右键点一格可以擦掉，点“清空”会清掉整张板。关掉推理板，下次打开还能接着填。'],
          ['提示与存档', '每道题和每张推理板旁边都有提示。每看一条新提示计一次，回头重看不计。最后一条会给出答案。进度会自动保存，也可以在手机菜单里手动存档。想换个浏览器接着玩，先导出存档，再到新浏览器里导入。'],
          ['作品说明', '这是虚构故事。电脑里的网页、论坛、聊天记录和系统操作都是剧情模拟，不连接真实网站，也不涉及真实人物。'],
        ]) { body.append(h('h3', { text: _t(title) })); paragraph(_t(text)); }
      } else {
        D.chapters.filter(c => S.flags[c.id] && D.helpCards && D.helpCards[c.id]).forEach(c => paragraph(D.helpCards[c.id]));
      }
    }
    [['controls', '操作说明'], ['technical', '背景知识']].forEach(([key, title]) => tabs.append(controlButton({ class: 'b98', role: 'tab', 'data-tab': key, text: _t(title) }, () => { tab = key; draw(); })));
    dlg.append(h('div', { class: 'titlebar' }, h('span', { class: 't', text: _t('帮助 · 画外说明') }), controlButton({ class: 'b98 tbb', 'aria-label': _t('关闭'), text: '×' }, closeModal)), tabs, body);
    m.append(h('div', { class: 'shade raised', onclick: closeModal }), dlg); draw();
    tabs.firstElementChild.focus();
  }
  function endingList() {
    const m = meta(); const got = (m && m.endings) || {};
    const g = h('div', { class: 'endgrid' });
    [['A', _t('结局 A')], ['B', _t('结局 B')], ['C', _t('结局 C')], ['H', _t('隐藏结局')]].forEach(([k, n]) => {
      const e = D.endings[k];
      const unlocked = !!(got[k] && e);
      if (k === 'H' && !unlocked) return;
      const row = unlocked ? controlButton({ class: 'ending-entry', 'data-ending': k }, event => replayEnding(k, event.currentTarget)) : h('div', { class: 'no' });
      row.append(h('span', { text: n }), h('span', { text: unlocked ? (LANG === 'en' ? '“' + e.title + '”' : '「' + e.title + '」') : _t('未达成') }));
      g.append(row);
    });
    return g;
  }
  function togglePhone(on) { ui.phoneOpen = on == null ? !ui.phoneOpen : on; $('#phone').classList.toggle('open', ui.phoneOpen); renderPhone(); }

  // ============================================================
  // 标题画面
  // ============================================================
  let titleOn = false;
  function showTitle() {
    if (S && !titleOn && lastTick) writeSave('auto');
    tickPlay(); playClockRunning = false;
    window.Y2KStats?.setPlaying(false);
    titleOn = true; sessionScreen('title'); closeOverlay(); closeModal();
    $('#fragmentNotices').replaceChildren();
    clearTimers(); running = {}; typing = {};
    clearTimeout(dirtyT); dirtyT = 0;
    clearTimeout(saveT); saveT = 0;
    const tl = $('#title'); tl.hidden = false; tl.innerHTML = ''; tl.classList.remove('panel-open');
    tl.style.backgroundImage = D.titleArt ? `linear-gradient(90deg, rgba(5,7,9,.76), rgba(5,7,9,.60)), url("${D.titleArt}")` : '';
    const titleStart = Date.parse('2026-12-20T21:30:00Z'), titleOpened = Date.now();
    const titleTime = () => new Date(titleStart + Date.now() - titleOpened).toISOString().slice(0, 19).replace('T', ' ');
    const clk = h('div', { class: 'clock', text: titleTime() });
    const iv = setInterval(() => { if (!titleOn || !clk.isConnected) return clearInterval(iv); clk.textContent = titleTime(); }, 1000);
    const auto = readSave('auto');
    const menu = h('div', { class: 'menu' });
    const panel = h('div', { class: 'title-panel-host' });
    menu.append(
      h('button', { class: 'tbtn', text: _t('继续调查'), disabled: !auto, onclick: () => { const o = readSave('auto'); if (o) loadState(o); } }),
      h('button', { class: 'tbtn', text: _t('新的调查'), onclick: e => newGamePanel(panel, !!auto, e.currentTarget) }),
      h('button', { class: 'tbtn', text: _t('读取存档'), onclick: e => loadPanel(panel, e.currentTarget) }),
      h('button', { class: 'tbtn', text: _t('结局收集'), onclick: e => titlePanel(panel, _t('结局收集'), e.currentTarget).append(endingList()) }));
    if (D.trialLimit && !D.trialLimit.standalone) menu.append(controlButton({ id: 'unlock-full', class: 'tbtn', text: window.QNC2Unlock.authorized ? '重新载入完整版' : '解锁完整版', 'aria-haspopup': 'dialog' }, () => openFullUnlock(false)));
    // 语言切换：存进 meta，然后重新载入（译文在启动时写回数据）
    const langs = h('div', { class: 'langs', role: 'group', 'aria-label': 'Language' });
    langs.hidden = READY.length < 2;
    Object.entries(LANGS).filter(([code]) => READY.includes(code)).forEach(([code, label]) => langs.append(h('button', { class: 'lbtn' + (code === LANG ? ' on' : ''), lang: code, 'aria-pressed': code === LANG ? 'true' : 'false', text: label, onclick: () => { if (code === LANG) return; const m = meta(); m.lang = code; setMeta(m); location.reload(); } })));
    const actions = h('div', { class: 'title-actions' });
    if (D.trialLimit?.standalone) {
      actions.append(controlButton({ class: 'tbtn author-note-entry', text: '匿名留言板', 'aria-haspopup': 'dialog' }, e => {
        window.QNC2TrialBoard.mount(titlePanel(panel, '匿名留言板', e.currentTarget));
      }));
    }
    const stats = window.Y2KStats;
    if (stats?.showOnTitle) {
      actions.append(controlButton({ class: 'tbtn leaderboard-entry', text: _t('排行榜'), 'aria-haspopup': 'dialog' }, event => {
        window.Y2KLeaderboard.mount(titlePanel(panel, _t('排行榜'), event.currentTarget), LANG, !!meta().endings?.H);
      }));
    }
    tl.append(h('div', { class: 'title-topbar' }, actions, langs), h('div', { class: 'title-content' }, clk, h('h1', { html: _t('千年<span>虫</span> 2') }), h('div', { class: 'sub', text: D.trialLimit?.standalone ? '未寄出的明天 · 试玩版（序章至第三章）' : _t('未寄出的明天 · 梧城少年宫 · 1999—2009') }), menu, panel, stats?.showOnTitle ? stats.mount(LANG) : null,
      h('div', { class: 'foot' }, h('div', { class: 'community', text: _t('QQ群') + '：1130040971' }), h('div', { text: _t('本作纯属虚构 · 建议用电脑上的 Chrome / Edge 打开 · 进度自动保存在本浏览器') }))));
    const collected = meta().endings || {};
    if (!D.trialLimit && window.openTimeMachine && ['A', 'B', 'C', 'H'].every(id => collected[id])) {
      tl.append(h('button', { class: 'tbtn time-machine-entry', text: '时光机', 'aria-haspopup': 'dialog', onclick: e => window.openTimeMachine(e.currentTarget) }));
    }
  }
  function openFullUnlock(continueTrial) {
    const host = $('#title .title-panel-host');
    const opener = $('#unlock-full');
    if (!host || !opener) return;
    const panel = titlePanel(host, '解锁完整版', opener);
    const authorized = window.QNC2Unlock.authorized;
    const input = h('input', { id: 'license', type: 'text', required: !authorized, autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', placeholder: 'QNC2.…', 'aria-describedby': 'license-help' });
    const status = h('p', { class: 'unlock-status', role: 'status', 'aria-live': 'polite', text: window.QNC2Unlock.message });
    const submit = h('button', { type: 'submit', class: 'tbtn', text: authorized ? '重新载入完整版' : '解锁完整版' });
    const form = h('form', { class: 'unlock-form' },
      continueTrial ? h('p', { text: D.trialLimit.lastFreeLabel + '已完成，进度已保存。解锁后从' + D.trialLimit.firstPaidLabel + '继续。' }) : null,
      authorized ? h('p', { text: '当前浏览器已激活，可重新载入完整版。' }) : h('label', { for: 'license', text: '输入激活密钥' }),
      authorized ? null : input,
      authorized ? null : h('p', { id: 'license-help', text: '一个密钥最多可以在 5 个浏览器上使用。' }),
      status, h('div', { class: 'row' }, submit));
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (submit.disabled) return;
      const key = input.value.trim();
      if (!key && !authorized) { status.textContent = '请输入激活密钥。'; input.focus(); return; }
      submit.disabled = true;
      status.textContent = authorized ? '正在载入完整版…' : '正在验证密钥…';
      try {
        await window.QNC2Unlock.activate(key, continueTrial);
      } catch (error) {
        status.textContent = error.message || '暂时无法解锁，请重试。';
        submit.disabled = false;
      }
    });
    panel.append(form);
    if (!touchKeyboard() && !authorized) input.focus();
  }
  function hideTitle() { titleOn = false; sessionScreen('game'); syncPlayClock(); const tl = $('#title'); tl.hidden = true; tl.innerHTML = ''; tl.classList.remove('panel-open'); window.Y2KStats?.setPlaying(true); showCards(); }
  function titlePanel(host, title, opener) {
    host.innerHTML = '';
    const tl = $('#title'); tl.classList.add('panel-open');
    const close = () => { host.innerHTML = ''; tl.classList.remove('panel-open'); if (opener?.isConnected) opener.focus(); };
    const closeBtn = controlButton({ class: 'tbtn title-panel-close', text: '×', 'aria-label': _t('关闭'), title: _t('关闭') }, close);
    const body = h('div', { class: 'title-panel-body' });
    const dlg = h('div', { class: 'panel title-panel', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'title-panel-heading' },
      h('div', { class: 'title-panel-head' }, h('h3', { id: 'title-panel-heading', text: title }), closeBtn), body);
    const layer = h('div', { class: 'title-panel-layer' }, dlg);
    layer.addEventListener('keydown', e => {
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); }
      if (e.key === 'Tab') {
        const stops = [...dlg.querySelectorAll('button:not(:disabled), input:not(:disabled), textarea:not(:disabled), select:not(:disabled), a[href], [tabindex="0"]')];
        const first = stops[0], last = stops[stops.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    host.append(layer); closeBtn.focus(); return body;
  }
  function newGamePanel(panel, hasSave, opener) {
    const inp = h('input', { type: 'text', id: 'nick', maxlength: 12, placeholder: _t('老K'), value: '' });
    const go = () => {
      const name = inp.value.trim() || _t('老K');
      LS.del(KEY.pre);
      loadState(fresh(name));
    };
    inp.onkeydown = (e) => { if (confirmInput(e)) go(); };
    titlePanel(panel, _t('你的昵称'), opener).append(
      h('div', { class: 'muted', text: _t('你在梧城开了家电脑维修铺，有时会把修老电脑的过程拍下来发到网上。自从发了七中那期视频，来找你修东西的人也多了。街坊平时怎么叫你？') }), h('div', { style: { height: '8px' } }), inp,
      ...(hasSave ? [h('div', { class: 'muted', style: { marginTop: '8px' }, text: _t('注意：开始新调查会覆盖自动存档（手动存档位不受影响）。') })] : []),
      h('div', { class: 'row' }, h('button', { class: 'tbtn', text: _t('开始'), onclick: go })));
    if (!touchKeyboard()) inp.focus();
  }
  function loadPanel(panel, opener) {
    const p = titlePanel(panel, _t('读取存档'), opener);
    [['auto', _t('自动存档')], ...MANUAL_SLOTS.map((key, i) => [key, _t('存档位') + ' ' + (i + 1)])].forEach(([k, n]) => {
      const s = readSave(k);
      p.append(h('div', { class: 'endgrid' }, h('div', { class: s ? '' : 'no' }, h('span', { text: n + '　' + describe(s) }), s ? h('button', { class: 'tbtn', style: { padding: '4px 10px' }, text: _t('读取'), onclick: () => loadState(readSave(k)) }) : null)));
    });
    const tb = h('textarea', { class: 'ph-input', rows: 3, placeholder: _t('或者粘贴存档码'), id: 'titleCode' });
    p.append(h('div', { class: 'row', style: { justifyContent: 'flex-start' } }, h('button', { class: 'tbtn', text: _t('导入存档文件'), onclick: () => importFile(null, () => loadPanel(panel, opener)) })), h('div', { style: { height: '8px' } }), tb,
      h('div', { class: 'row' }, h('button', { class: 'tbtn', text: _t('读取存档码'), onclick: () => { try { const o = JSON.parse(b64d(tb.value)); if (!o.v) throw 0; loadState(o); } catch (e) { toast(_t('存档码无效')); } } })));
  }

  // ============================================================
  // 读盘机：屏幕阶段
  // ============================================================
  function screen() { return $('#screen'); }
  function renderScreen() {
    const sc = screen(); sc.innerHTML = '';
    $('#led').classList.toggle('on', S.stage !== 'off');
    if (S.stage === 'off') {
      sc.append(h('div', { class: 'off' },
        controlButton({ class: 'power', 'aria-label': _t('开机'), html: '⏻' }, powerOn),
        h('div', { html: _t('工作台上那台装着 Windows 98 的老电脑还留着软驱，你平时就用它读软盘。') })));
    } else if (S.stage === 'win') {
      buildDesktop();
    } else {
      S.stage = 'off'; renderScreen();
    }
  }
  function powerOn() {
    if (D.boot.requires && !test(D.boot.requires)) return toast(fmt(D.boot.lockedText || _t('还不能开机。')));
    markInteraction();
    S.stage = 'boot'; renderPhone(); $('#led').classList.add('on');
    const sc = screen(); sc.innerHTML = '';
    const bios = h('div', { class: 'bios' }); sc.append(bios);
    const lines = [
      '<span class="hl">KITE Modular BIOS v4.51PG</span>', 'Copyright (C) 1999-2004, KITE Software, Inc.', '',
      'Main Processor : Pentium 4 2.40GHz', 'Memory Testing :  524288K OK', '',
      'Primary Master : ST380011A  (80GB)', 'Primary Slave  : None', 'Floppy Drive A : 1.44M, 3.5 in.', '',
      '<span class="hl">老K工作室 · 读盘机</span>', 'Real Time Clock : Sun Dec 20 2026  21:30', '',
    ];
    let i = 0;
    const tick = () => {
      if (i < lines.length) { bios.innerHTML += fmt(lines[i++]) + '\n'; later(tick, 180); return; }
      if (D.boot.biosLock && !solved(D.boot.biosLock)) showBiosPass(bios); else afterBios(bios);
    };
    tick();
  }
  function showBiosPass(bios) {
    const id = D.boot.biosLock;
    const box = h('div', { class: 'bios-pass' });
    const form = puzzleForm(id, { style: 'bios', hidePrompt: true, submitLabel: 'Enter', wrongText: _t('Password incorrect. 密码错误。'), onSolved: () => { box.remove(); afterBios(bios); } });
    box.append(h('div', { text: _t('══ Enter Password 开机密码 ══') }), form);
    screen().append(box); form.focusFirst();
  }
  function afterBios(bios) {
    bios.innerHTML += '\nVerifying DMI Pool Data ........\nBoot from Hard Disk...\nStarting Windows 98...\n';
    later(() => {
      const sc = screen(); sc.innerHTML = '';
      sc.append(h('div', {class:'splash'}, h('div', {class:'boot-mark', html:icon('win')}),
        h('div', {class:'logo'}, h('small', {text:'Microsoft'}), 'Windows', h('b', {text:'98'})),
        h('div', {class:'bar', html:'<i></i>'})));
      later(showLogin, 2200);
    }, 900);
  }
  function showLogin() {
    const id = D.boot.loginLock;
    if (!id || solved(id)) return enterDesktop();
    const sc = screen(); sc.innerHTML = '';
    const lg = h('div', { class: 'login98' });
    const dlg = h('div', { class: 'dlg98 out', style: { position: 'relative', left: 'auto', top: 'auto', transform: 'none', width: 'min(440px, 94%)' } });
    const form = puzzleForm(id, { hidePrompt: true, placeholder: _t('密码'), submitLabel: _t('确定'), wrongText: _t('密码不正确。'), onSolved: enterDesktop, onWrong: () => sfx('err') });
    dlg.append(h('div', { class: 'titlebar' }, h('span', { class: 't', text: _t('欢迎使用 Windows') })),
      h('div', { class: 'wbody' },
        h('div', { style: { display: 'flex', gap: '10px', alignItems: 'center' } }, h('span', { html: icon('computer'), style: { width: '32px' } }), h('div', { text: _t('键入用户名和密码以登录到 Windows。') })),
        h('div', { class: 'fields', style: { display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '6px 8px', alignItems: 'center' } }, h('label', { text: _t('用户名(U)：') }), h('input', { class: 'f98', value: D.boot.loginUser || 'user', readonly: true })),
        form));
    lg.append(dlg); sc.append(lg); form.focusFirst();
  }
  function enterDesktop() {
    S.stage = 'win';
    sfx('boot');
    dirty();
    renderScreen();
  }

  // ============================================================
  // 桌面与窗口
  // ============================================================
  let wins = [], zTop = 100, renderedFlagVer = -1;
  function desktop() { return $('#desktop'); }
  function buildDesktop() {
    closeCtx();
    const sc = screen(); sc.innerHTML = '';
    const dk = h('div', { id: 'desktop' }, h('div', { id: 'icons' }));
    const tb = h('div', { id: 'taskbar', class: 'out' },
      controlButton({ id: 'startbtn', class: 'b98', html: icon('win') + _t('<span>开始</span>') }, toggleStart),
      h('div', { id: 'tasks' }), h('div', { id: 'tray', class: 'in', style: { background: 'transparent' } }));
    sc.append(dk, tb);
    dk.addEventListener('pointerdown', (e) => { if (e.target === dk || e.target.id === 'icons') { selectIcon(null); closeStart(); closeCtx(); } });
    // 游戏桌面使用自己的菜单；输入框保留浏览器的复制、粘贴菜单。
    dk.addEventListener('contextmenu', e => {
      if (e.defaultPrevented || e.target.closest('input, textarea, select, [contenteditable="true"]')) return;
      e.preventDefault();
      const win = wins.find(w => w.el.contains(e.target));
      const items = win ? [[_t('刷新'), () => win.refresh(true)]] : [[_t('刷新'), () => { renderIcons(); refreshWins(true); }], [_t('显示 属性'), openDisplay]];
      showCtx(items, e.clientX, e.clientY);
    });
    wins = [];
    renderIcons(); renderTray(); renderTasks();
  }
  let selIcon = null;
  function selectIcon(el) { document.querySelectorAll('#icons .icon.sel').forEach(x => x.classList.remove('sel')); selIcon = el; if (el) el.classList.add('sel'); }
  function desktopEntries() {
    const out = [];
    const appNew = (id, a) => id === 'mycomputer' ? newUnder('C:') || newUnder('A:') : id === 'recycle' ? recycleHasNew() : a.path ? newUnder(a.path) : false;
    for (const [id, a] of Object.entries(D.apps)) if (test(a.requires)) out.push({ fresh: appNew(id, a), key: 'app_' + id, name: a.name, icon: id === 'recycle' ? (recycleItems().length ? 'recyclefull' : 'recycle') : a.icon, open: () => openApp(id), file: a.path ? D.files.find(f => f.path === a.path && f.type === 'folder') : null });
    D.files.filter(f => f.desktop && fileVisible(f)).forEach(f => out.push({ fresh: isNewFile(f), key: 'f_' + f.id, name: nameOf(f.path), icon: TYPEICON[f.type], locked: f.lock && !solved(f.lock), open: () => openFile(f), file: f }));
    return out;
  }
  function renderIcons() {
    const box = $('#icons'); if (!box) return;
    box.innerHTML = '';
    desktopEntries().forEach(en => {
      const el = h('div', { class: 'icon', tabindex: 0, html: icon(en.icon, en.locked) + (en.fresh ? NEWDOT : '') + `<span>${esc(en.name)}</span>` });
      bindControl(el, () => { selectIcon(el); if (coarse()) en.open(); });
      el.ondblclick = () => { if (!coarse()) en.open(); };
      el.onkeydown = (e) => { if (confirmInput(e)) en.open(); };
      bindCtx(el, () => [[_t('打开'), en.open], ...(en.file ? [[_t('属性'), () => showProps(en.file)]] : [])], () => selectIcon(el));
      box.append(el);
    });
  }
  function renderTray() {
    const t = $('#tray'); if (!t || !S) return;
    const m = machineNow();
    t.textContent = (S.snap && S.snap !== 'cur' ? S.snap + ' · ' : '') + m.hm; t.classList.toggle('snapmode', !!S.snap && S.snap !== 'cur'); t.title = LANG === 'en' ? `${m.y}-${pad(m.mo)}-${pad(m.d)}` : `${m.y}${_t('年')}${m.mo}${_t('月')}${m.d}${_t('日')}`;
  }
  function renderTasks() {
    const box = $('#tasks'); if (!box) return;
    box.innerHTML = '';
    const top = wins.filter(w => !w.min).sort((a, b) => b.z - a.z)[0];
    wins.forEach(w => w.el.classList.toggle('active', w === top));
    wins.forEach(w => box.append(controlButton({ class: 'b98 task' + (w === top ? ' on down' : ''), title: w.title, html: icon(w.o.icon || 'exe') + `<span>${esc(w.title)}</span>` }, () => { if (w === top && !w.min) { w.min = true; w.el.hidden = true; renderTasks(); } else focusWin(w); })));
  }
  // 后台状态更新不得替换手指或鼠标正在操作的内容；松手后留出兼容 click 的时间。
  function guardWinInteraction(win) {
    const el = win.el, pointers = new Set();
    let touches = 0, settling = false, timer = null;
    const active = () => pointers.size > 0 || touches > 0;
    win.isInteracting = () => active() || settling || !!win.selectPicker;
    const begin = () => { clearTimeout(timer); settling = false; };
    const release = () => {
      if (active()) return;
      clearTimeout(timer); settling = true;
      timer = setTimeout(() => {
        settling = false;
        if (el.isConnected && !active() && win.refreshPending) win.refresh();
      }, 400);
    };
    const pointerDown = e => { if (e.button === 0) { begin(); pointers.add(e.pointerId); } };
    const pointerEnd = e => { if (pointers.delete(e.pointerId)) release(); };
    const touchStart = e => { begin(); touches = e.touches.length; };
    const touchEnd = e => { if (touches) { touches = e.touches ? e.touches.length : 0; release(); } };
    // 主动翻页会移除原触摸目标，浏览器可能不再把 touchend 派发到 document。
    win.resetInteraction = () => { clearTimeout(timer); pointers.clear(); touches = 0; settling = false; };
    el.addEventListener('pointerdown', pointerDown, true);
    el.addEventListener('touchstart', touchStart, { capture: true, passive: true });
    document.addEventListener('pointerup', pointerEnd, true);
    document.addEventListener('pointercancel', pointerEnd, true);
    document.addEventListener('touchend', touchEnd, { capture: true, passive: true });
    document.addEventListener('touchcancel', touchEnd, { capture: true, passive: true });
    win.interactionCleanup = () => {
      win.selectPicker?.close();
      win.resetInteraction();
      el.removeEventListener('pointerdown', pointerDown, true);
      el.removeEventListener('touchstart', touchStart, true);
      document.removeEventListener('pointerup', pointerEnd, true);
      document.removeEventListener('pointercancel', pointerEnd, true);
      document.removeEventListener('touchend', touchEnd, true);
      document.removeEventListener('touchcancel', touchEnd, true);
    };
  }
  function openWin(o) {
    if (o.key && !o.multiple) { const ex = wins.find(w => w.key === o.key); if (ex) { if (o.state) Object.assign(ex.state, o.state); focusWin(ex); ex.refresh(true); return ex; } }
    const dk = desktop(); if (!dk) return null;
    const W = dk.clientWidth, H = dk.clientHeight;
    const w = Math.min(o.w || 560, W - 10), hh = Math.min(o.h || 400, H - 10);
    const n = wins.length;
    const x = Math.max(0, Math.min(W - w, 24 + (n % 6) * 22));
    const y = Math.max(0, Math.min(H - hh, 18 + (n % 6) * 22));
    const win = { key: o.key, o, title: o.title, state: Object.assign({}, o.state || {}), z: ++zTop, min: false };
    const el = h('div', { class: 'win out', id: 'win-' + win.z, 'data-window': o.key, role: 'dialog', 'aria-label': o.title, style: { left: x + 'px', top: y + 'px', width: w + 'px', height: hh + 'px', zIndex: win.z } });
    const tt = h('span', { class: 't', text: o.title });
    const symbol = kind => h('span', { class: 'window-symbol ' + kind, 'aria-hidden': 'true' });
    const maxSymbol = symbol('max');
    const maxBtn = controlButton({ class: 'b98 tbb', 'aria-label': _t('最大化'), title: _t('最大化') }, () => { focusWin(win); win.toggleMax(); }, maxSymbol);
    win.toggleMax = force => {
      const max = typeof force === 'boolean' ? force : !el.classList.contains('max');
      el.classList.toggle('max', max); maxSymbol.className = 'window-symbol ' + (max ? 'restore' : 'max');
      maxBtn.setAttribute('aria-label', _t(max ? '还原' : '最大化')); maxBtn.title = _t(max ? '还原' : '最大化');
    };
    const titleIcon = h('span', { class: 'title-icon', html: icon(o.icon || 'exe') });
    const bar = h('div', { class: 'titlebar' }, titleIcon, tt,
      controlButton({ class: 'b98 tbb', 'aria-label': _t('最小化'), title: _t('最小化') }, () => { win.min = true; el.hidden = true; renderTasks(); }, symbol('min')),
      maxBtn,
      controlButton({ class: 'b98 tbb', 'aria-label': _t('关闭'), title: _t('关闭') }, () => closeWin(win), symbol('close')));
    const menu = h('div', { class: 'menubar' });
    const top = h('div');
    const body = h('div', { class: 'wbody ' + (o.bodyClass || 'in') });
    if (o.file) bindCtx(body, () => [[_t('属性'), () => showProps(o.file)]]);
    const status = h('div', { class: 'status98' });
    el.append(bar, menu, top, body, status, h('div', { class: 'grip' }));
    win.el = el; win.body = body; win.menu = menu; win.top = top; win.status = status; win.tt = tt;
    guardWinInteraction(win);
    win.setTitle = t => { if (t === win.title) return; win.title = t; tt.textContent = t; el.setAttribute('aria-label', t); renderTasks(); };
    win.setIcon = name => { if (win.o.icon !== name) { win.o.icon = name; titleIcon.innerHTML = icon(name); renderTasks(); } };
    win.refresh = (force) => {
      if (body.querySelector('.pz[data-awaiting-ack]')) return;
      if (!force && win.isInteracting()) { win.refreshPending = true; return; }
      if (!force && el.contains(document.activeElement) && /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) return;
      if (force) win.resetInteraction();
      win.refreshPending = false;
      const st = body.scrollTop;
      const sl = body.scrollLeft;
      const scrollPane = o.scrollPane && body.querySelector(o.scrollPane);
      const panePosition = scrollPane && [scrollPane.scrollLeft, scrollPane.scrollTop];
      const focusedSpot = scrollPane?.contains(document.activeElement) && document.activeElement.dataset.spot;
      const active = document.activeElement;
      const keepTabFocus = win.key === 'ie' && !win.resetScroll && body.contains(active) && active.closest(sectionNav);
      menu.innerHTML = ''; top.innerHTML = ''; status.innerHTML = ''; body.innerHTML = '';
      o.render(win);
      menu.hidden = !menu.children.length; top.hidden = !top.children.length; status.hidden = !status.children.length;
      if (panePosition && !win.resetScroll) {
        const pane = body.querySelector(o.scrollPane);
        if (pane) {
          pane.scrollLeft = panePosition[0];
          pane.scrollTop = panePosition[1];
          if (focusedSpot) pane.querySelector('[data-spot="' + CSS.escape(focusedSpot) + '"]')?.focus({ preventScroll: true });
        }
      }
      if (keepTabFocus) {
        const nav = body.querySelector(sectionNav);
        const tab = nav && [...nav.querySelectorAll('a,b,strong')].find(n => n.textContent === active.textContent);
        if (tab) {
          if (!tab.matches('a[href]')) tab.tabIndex = -1;
          tab.focus({preventScroll:true});
        }
      }
      if (!win.resetScroll) { body.scrollTop = st; body.scrollLeft = sl; } else { body.scrollTop = 0; body.scrollLeft = 0; win.resetScroll = false; }
    };
    el.addEventListener('pointerdown', e => { if (!e.target.closest('.tbb')) focusWin(win); }, true);
    bar.addEventListener('dblclick', e => { if (!o.propertyPage && !e.target.closest('button')) win.toggleMax(); });
    resizify(el, el.querySelector('.grip'));
    if (o.propertyPage) {
      bar.querySelector('[aria-label="' + _t('最小化') + '"]').remove();
      maxBtn.remove();
      el.querySelector('.grip').remove();
      el.style.left = Math.max(0, (W - w) / 2) + 'px';
      el.style.top = Math.max(0, (H - hh) / 2) + 'px';
    }
    dk.append(el);
    wins.push(win);
    if ((narrow() && !o.propertyPage) || o.max) win.toggleMax(true);
    focusWin(win);
    win.refresh(true);
    return win;
  }
  function focusWin(w) {
    closeStart();
    if (!w.min && w.el.classList.contains('active')) return;
    w.z = ++zTop; w.el.style.zIndex = w.z; w.min = false; w.el.hidden = false;
    renderTasks();
  }
  function closeWin(w, force = false) { if (!force && w.requestClose) return w.requestClose(); if (w.body.querySelector('.pz[data-awaiting-ack]')) dirty(); w.interactionCleanup(); w.el.remove(); wins = wins.filter(x => x !== w); w.o.onClose && w.o.onClose(w); renderTasks(); }
  function closeAllWins() { wins.forEach(w => { w.interactionCleanup(); w.el.remove(); w.o.onClose && w.o.onClose(w); }); wins = []; }
  function windowLeft(x, width, desktopWidth) {
    // Keep enough of the title bar reachable even for a nearly desktop-wide window.
    const visible = Math.min(144, width, desktopWidth);
    return Math.max(visible - width, Math.min(desktopWidth - visible, x));
  }
  let draggingTitle = false;
  function startTitleDrag(e) {
    if (draggingTitle || !e.isPrimary || e.button !== 0) return;
    const handle = e.target.closest?.('.titlebar');
    if (!handle || e.target.closest('button')) return;
    const el = handle.parentElement;
    if (!el.matches('.win, .dlg98:not(.dlgph), .classic-viewer')) return;

    const win = wins.find(w => w.el === el);
    const container = el.closest('#desktop, #modal.pc-modal, .login98, .viewer') || document.documentElement;
    const bounds = container.getBoundingClientRect();
    const handleHeight = handle.getBoundingClientRect().height;
    let rect = el.getBoundingClientRect();
    let grabX = e.clientX - rect.left;
    const grabY = e.clientY - rect.top;
    // Centered dialogs keep their CSS transform and their offset from previous drags.
    const [priorX, priorY = 0] = el.style.translate.split(' ').map(value => parseFloat(value) || 0);
    let maximized = !!win && el.classList.contains('max'), moved = false;
    let left, top;

    e.preventDefault();
    handle.setPointerCapture(e.pointerId);
    draggingTitle = true;
    el.style.willChange = 'translate';
    function move(ev) {
      if (ev.pointerId !== e.pointerId) return;
      if (!moved && ev.clientX === e.clientX && ev.clientY === e.clientY) return;
      if (maximized) {
        if (Math.hypot(ev.clientX - e.clientX, ev.clientY - e.clientY) < 6) return;
        const fraction = grabX / rect.width;
        win.toggleMax(false);
        rect = el.getBoundingClientRect();
        grabX = fraction * rect.width;
        maximized = false;
      }
      left = windowLeft(ev.clientX - bounds.left - grabX, rect.width, bounds.width);
      top = Math.max(0, Math.min(bounds.height - handleHeight, ev.clientY - bounds.top - grabY));
      const dx = priorX + left - (rect.left - bounds.left);
      const dy = priorY + top - (rect.top - bounds.top);
      el.style.translate = `${dx}px ${dy}px`;
      moved = true;
    }
    const listeners = new AbortController();
    function finish(ev) {
      if (ev.type !== 'blur' && ev.pointerId !== e.pointerId) return;
      if (ev.type === 'lostpointercapture' && ev.target !== handle && handle.isConnected) return;
      if (ev.type === 'pointerup') move(ev);
      if (win && moved) {
        el.style.left = left + 'px';
        el.style.top = top + 'px';
        el.style.translate = '';
      }
      el.style.willChange = '';
      listeners.abort();
      draggingTitle = false;
      if (handle.hasPointerCapture(e.pointerId)) handle.releasePointerCapture(e.pointerId);
    }
    const options = { capture: true, signal: listeners.signal };
    document.addEventListener('pointermove', move, options);
    for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) document.addEventListener(type, finish, options);
    window.addEventListener('blur', finish, { signal: listeners.signal });
  }
  function resizify(el, grip) {
    grip.addEventListener('pointerdown', (e) => {
      e.stopPropagation(); const r = el.getBoundingClientRect(); const sx = e.clientX, sy = e.clientY;
      grip.setPointerCapture(e.pointerId);
      const dr = desktop().getBoundingClientRect();
      const mv = (ev) => { el.style.width = Math.max(220, Math.min(dr.right - r.left, r.width + ev.clientX - sx)) + 'px'; el.style.height = Math.max(140, Math.min(dr.bottom - r.top, r.height + ev.clientY - sy)) + 'px'; };
      const up = () => { grip.removeEventListener('pointermove', mv); grip.removeEventListener('pointerup', up); grip.removeEventListener('pointercancel', up); };
      grip.addEventListener('pointermove', mv); grip.addEventListener('pointerup', up); grip.addEventListener('pointercancel', up);
    });
  }
  function menus(win, defs) {
    // defs: [[label, [[itemLabel, fn, checked], ...]], ...]
    defs.forEach(([label, items]) => {
      const m = h('div', { text: label, role: 'button', tabindex: 0, 'aria-haspopup': 'menu' });
      const activate = e => { if (e.target === e.currentTarget && (confirmInput(e) || e.key === ' ')) { e.preventDefault(); e.currentTarget.click(); } };
      m.onkeydown = activate;
      bindControl(m, (e) => {
        e.stopPropagation();
        const was = m.classList.contains('open');
        win.menu.querySelectorAll('.open').forEach(x => { x.classList.remove('open'); x.querySelector('.dropdown') && x.querySelector('.dropdown').remove(); });
        if (was) return;
        m.classList.add('open');
        const dd = h('div', { class: 'dropdown out', role: 'menu' });
        items.forEach(it => { if (it === '-') return dd.append(h('div', { class: 'sep98', style: { padding: 0 } })); dd.append(bindControl(h('div', { class: it[2] ? 'chk' : '', text: it[0], role: 'menuitem', tabindex: 0, onkeydown: activate }), () => { m.classList.remove('open'); dd.remove(); document.removeEventListener('pointerdown', off, true); it[1](); })); });
        m.append(dd);
        const bounds = desktop().getBoundingClientRect();
        const rect = dd.getBoundingClientRect();
        if (rect.right > bounds.right) dd.style.left = Math.min(0, bounds.right - rect.right) + 'px';
        dd.style.maxHeight = Math.max(60, bounds.bottom - rect.top) + 'px';
        const off = (ev) => { if (!m.contains(ev.target)) { m.classList.remove('open'); dd.remove(); document.removeEventListener('pointerdown', off, true); } };
        document.addEventListener('pointerdown', off, true);
      }, e => e.target.closest('.dropdown') ? null : m);
      win.menu.append(m);
    });
  }
  // 右键菜单（触屏长按）
  let ctxEl = null, ctxOutside = null;
  function closeCtx() {
    if (ctxOutside) { document.removeEventListener('pointerdown', ctxOutside, true); ctxOutside = null; }
    if (ctxEl) { ctxEl.remove(); ctxEl = null; }
  }
  function showCtx(items, x, y, keyboard, host) {
    closeCtx(); const dk = host || desktop(); if (!dk || !items.length) return;
    const dr = dk.getBoundingClientRect();
    ctxEl = h('div', { class: 'ctx out', role: 'menu', style: { zIndex: Math.max(7100, zTop + 1) } });
    items.forEach(([t, fn]) => ctxEl.append(controlButton({ class: 'ctx-item', role: 'menuitem', text: t }, () => { closeCtx(); fn(); })));
    ctxEl.onkeydown = e => {
      if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) return;
      e.preventDefault(); const buttons = [...ctxEl.querySelectorAll('button')], i = buttons.indexOf(document.activeElement);
      const n = e.key === 'Home' ? 0 : e.key === 'End' ? buttons.length - 1 : (i + (e.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length;
      buttons[n].focus();
    };
    dk.append(ctxEl);
    ctxEl.style.left = Math.max(0, Math.min(x - dr.left, dr.width - ctxEl.offsetWidth)) + 'px';
    ctxEl.style.top = Math.max(0, Math.min(y - dr.top, dr.height - ctxEl.offsetHeight)) + 'px';
    ctxOutside = e => { if (ctxEl && !ctxEl.contains(e.target)) closeCtx(); };
    document.addEventListener('pointerdown', ctxOutside, true);
    if (keyboard) ctxEl.querySelector('button')?.focus();
  }
  function bindCtx(el, items, select, host) {
    const show = (x, y, keyboard) => {
      controlCancels.get(el)?.();
      el.querySelectorAll('.pressed-control').forEach(control => controlCancels.get(control)?.());
      if (select) select(); showCtx(items(), x, y, keyboard, host);
    };
    el.addEventListener('contextmenu', e => {
      if (e.target.closest('input, textarea, select, [contenteditable="true"]')) return;
      e.preventDefault(); e.stopPropagation();
      if (!touching && Date.now() < suppressContextUntil) return;
      if (touching) { cancel(); touchOpened = true; suppressContextUntil = Date.now() + 1000; }
      if (!ctxEl || !touchOpened) show(e.clientX, e.clientY);
    });
    el.addEventListener('keydown', e => {
      if (e.target.closest('input, textarea, select, [contenteditable="true"]')) return;
      if (e.key !== 'ContextMenu' && !(e.shiftKey && e.key === 'F10')) return;
      e.preventDefault(); e.stopPropagation(); const r = el.getBoundingClientRect(); show(r.left + r.width / 2, r.top + r.height / 2, true);
    });
    let lp = 0, touchOpened = false, touching = false, suppressContextUntil = 0;
    const cancel = () => { clearTimeout(lp); lp = 0; };
    el.addEventListener('touchstart', e => {
      cancel(); touchOpened = false; touching = e.touches.length === 1 && !e.target.closest('input, textarea, select, [contenteditable="true"]'); suppressContextUntil = 0; if (!touching) return;
      const { clientX, clientY } = e.touches[0];
      lp = setTimeout(() => { if (el.isConnected) { touchOpened = true; suppressContextUntil = Date.now() + 1000; show(clientX, clientY); } }, 550);
    }, { passive: true });
    // 子按钮会在松手时执行并停止冒泡；提前取消长按计时，避免稍后误弹属性菜单。
    el.addEventListener('pointerup', cancel, true);
    el.addEventListener('pointercancel', cancel, true);
    el.addEventListener('touchend', e => { cancel(); touching = false; if (touchOpened) { e.preventDefault(); touchOpened = false; } }, { capture: true, passive: false });
    el.addEventListener('touchmove', cancel, { passive: true });
    el.addEventListener('touchcancel', () => { cancel(); touching = false; touchOpened = false; }, { passive: true });
  }
  // 开始菜单
  function pcMessage(title, html, buttons, aboveOverlay) {
    msgBox(title, html, buttons, aboveOverlay, true);
  }
  function toggleStart() { if ($('#startmenu')) return closeStart(); openStart(); }
  function closeStart() { const m = $('#startmenu'); if (m) m.remove(); const b = $('#startbtn'); if (b) b.classList.remove('down'); }
  function openStart() {
    const dk = desktop(); if (!dk) return;
    const items = [];
    Object.entries(D.apps).forEach(([id, a]) => { if (test(a.requires) && id !== 'recycle' && id !== 'mydocs') items.push([a.icon, a.name, () => openApp(id)]); });
    items.push(['notepad', _t('记事本'), () => openNotepad({ id: null, path: _t('无标题'), text: '' })]);
    items.push(['display', _t('显示属性'), () => openDisplay()]);
    items.push(['help', _t('帮助'), () => openHelp(true)]);
    items.push(['shutdown', _t('关闭系统...'), () => pcMessage(_t('关闭 Windows'), _t('读盘机正在做镜像，先别关。<br><span style="color:#666">—— 你自己贴在机箱上的纸条</span>'), [{ text: _t('返回标题画面'), fn: () => { writeSave('auto'); showTitle(); } }, { text: _t('取消') }])]);
    const ul = h('ul', {role: 'menu'});
    items.forEach(([ic, n, fn]) => ul.append(bindControl(h('li', { tabindex: 0, role: 'menuitem', onkeydown: e => { if (confirmInput(e) || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }, html: icon(ic) + `<span>${esc(n)}</span>` }), () => { closeStart(); fn(); })));
    const m = h('div', { id: 'startmenu', class: 'out' }, h('div', { class: 'side', html: '<b>Windows</b>98' }), ul);
    dk.parentNode.append(m);
    $('#startbtn').classList.add('down');
    setTimeout(() => document.addEventListener('pointerdown', function off(e) { if (!m.contains(e.target) && e.target.id !== 'startbtn' && !e.target.closest('#startbtn')) closeStart(); document.removeEventListener('pointerdown', off, true); }, true), 0);
  }

  // ============================================================
  // 文件系统
  // ============================================================
  const normPath = (p) => p.replace(/\\/g, '/').replace(/\/+$/, '').replace(/^([AC]:)$/i, '$1');
  function parentOf(p) { const i = p.lastIndexOf('/'); return i < 0 ? '' : p.slice(0, i); }
  const dispName = (n) => SEG[n] || n;
  const nameOf = (p) => { const i = p.lastIndexOf('/'); return dispName(i < 0 ? p : p.slice(i + 1)); };
  const dispPath = (p) => String(p || '').split('/').map(dispName).join(String.fromCharCode(92));
  let FS = null;
  function buildFS() {
    FS = { nodes: {}, kids: {} };
    const ensure = (p) => {
      if (FS.nodes[p] || !p) return;
      FS.nodes[p] = { path: p, folder: true, files: [] };
      const par = parentOf(p);
      if (par) { ensure(par); (FS.kids[par] = FS.kids[par] || new Set()).add(p); }
    };
    D.files.forEach(f => {
      f.path = normPath(f.path);
      ensure(f.path);
      const n = FS.nodes[f.path];
      n.files.push(f);
      if (f.type !== 'folder') n.folder = false;
    });
    ['A:', 'C:'].forEach(ensure);
  }
  function fileVisible(f) { return test(f.requires) && snapOK(f) && (!f.deleted || S.flags['restored_' + f.id]) && (!f.hidden || S.showHidden); }
  function nodeFile(p) { const n = FS.nodes[p]; if (!n) return null; return n.files.find(f => f.type !== 'folder' && fileVisible(f)) || null; }
  function folderEntry(p) { const n = FS.nodes[p]; return n && n.files.find(f => f.type === 'folder'); }
  function folderVisible(p, depth = 0) {
    if (p === 'A:' || p === 'C:') return true;
    const fe = folderEntry(p);
    if (fe) return test(fe.requires) && (!fe.hidden || S.showHidden);
    if (depth > 20) return false;
    return [...(FS.kids[p] || [])].some(k => (FS.nodes[k].folder && !nodeFile(k)) ? folderVisible(k, depth + 1) : !!nodeFile(k));
  }
  function listDir(p) {
    const out = [];
    [...(FS.kids[p] || [])].forEach(k => {
      const f = nodeFile(k);
      if (f) out.push({ path: k, file: f });
      else if (FS.nodes[k].folder && folderVisible(k)) out.push({ path: k, folder: true, entry: folderEntry(k) });
    });
    out.sort((a, b) => (b.folder ? 1 : 0) - (a.folder ? 1 : 0) || nameOf(a.path).localeCompare(nameOf(b.path), 'zh'));
    return out;
  }
  // 新恢复、还没打开过的文件：图标上加小圆点，所在的文件夹、盘符和桌面图标也跟着标出
  function isNewFile(f) { return !!(f && f.id && f.requires && f.type !== 'folder' && !S.opened[f.id] && fileVisible(f)); }
  function reachablePath(path) {
    for (let q = parentOf(path); q && q !== 'A:' && q !== 'C:'; q = parentOf(q)) if (!folderVisible(q)) return false;
    return true;
  }
  function newUnder(prefix) { return D.files.some(f => (f.path === prefix || f.path.startsWith(prefix + '/')) && isNewFile(f) && reachablePath(f.path)); }
  function recycleHasNew() { return recycleItems().some(f => !S.opened[f.id]); }
  const NEWDOT = `<i class="newdot" aria-label="${esc(_t('新'))}"></i>`;
  function recycleItems() { return D.files.filter(f => f.deleted && !S.flags['restored_' + f.id] && test(f.requires) && snapOK(f)); }
  function fileTypeName(f) {
    if (f.type === 'img' && /\.jpe?g$/i.test(f.path)) return _t('JPEG 图像');
    return TYPENAME[f.type] || _t('文件');
  }
  function sizeOf(f) {
    if (f.size) return f.size;
    const n = (f.text || '').length * 2 + strip(f.html || '').length * 2 + 300;
    return Math.max(1, Math.round(n / 1024)) + ' KB';
  }

  // 打开文件
  function openFile(f) {
    if (!f || !test(f.requires)) return toast(_t('这份资料尚未恢复。'));
    if (!snapOK(f) && !S.opened[f.id]) return toast(_t('这份原件没有收在当前的备份里。换个系统还原点再找找。'));
    markInteraction();
    const firstOpen = !S.opened[f.id];
    const go = () => {
      opened(f.id, f.onOpen);
      if (firstOpen && f.id === 'f_ph_sms') window.Y2KAudio?.sfx('keypad');
      const t = f.type;
      if (t === 'folder') return openExplorer(f.path);
      if (['txt', 'log', 'ini', 'bas', 'bat', 'bak', 'dat', 'sys'].includes(t)) return f.text != null ? openNotepad(f) : pcMessage(nameOf(f.path), _t('无法打开此文件。<br>Windows 不知道用什么程序打开它。'));
      if (t === 'doc') return openWordpad(f);
      if (t === 'htm') return openIE(null, f);
      if (t === 'img') return openImage(f);
      if (t === 'audio') return openMedia(f);
      if (f.clip) { if (narrow()) togglePhone(true); return goEvidence({ type: 'clip', id: f.clip }); }
      if (t === 'zip') return openZip(f);
      if (t === 'lnk' || t === 'exe') { if (f.app) return openApp(f.app); if (f.messageWhen && test(f.messageWhen)) return pcMessage(nameOf(f.path), f.messageHtml); return pcMessage(nameOf(f.path), esc(f.text || _t('该程序无法在此系统上运行。')).replace(/\n/g, '<br>')); }
      if (f.text != null) return openNotepad(f);
      pcMessage(nameOf(f.path), _t('无法打开此类型的文件。'));
    };
    if (f.type === 'zip') return go();
    withLock(f.lock, go);
  }
  // 六号机没打千年虫补丁，过了2000年它的钟是19xx。FAT 目录项不能记录1980年以前的日期，这台机器存盘时的日期退回1980-01-01；
  // 许嘉装在六号机上的“病历”另记了一份机器自己以为的时间，读盘机把它补成“六号机记录”。剧情数据里这类文件的 date 直接写19xx。
  const recOf = f => f && /^19[0-2]\d-/.test(f.date || '') ? f.date : '';
  const fatOf = f => { const r = recOf(f); return r ? '1980-01-01' + r.slice(10) : (f && f.date) || ''; };
  function showProps(f, aboveOverlay) {
    if (f.id) { setFlag('props_' + f.id); if (!S.opened['props_' + f.id]) { S.opened['props_' + f.id] = 1; act(f.onProps); } dirty(); }
    const rows = [[_t('类型'), fileTypeName(f)], [_t('位置'), dispPath(parentOf(f.path)) || f.path], [_t('大小'), f.type === 'folder' ? '-' : sizeOf(f)], [_t('修改时间'), fatOf(f) || '-']];
    if (recOf(f)) rows.push([_t('六号机记录'), recOf(f) + _t('（病历）')]);
    if (f.created) rows.push([_t('创建时间'), f.created]);
    const attr = `<label><input type="checkbox" disabled checked> ${_t('只读')}</label> <label><input type="checkbox" disabled ${f.hidden ? 'checked' : ''}> ${_t('隐藏')}</label>`;
    const row = (label, value) => `<tr><td>${esc(label)}：</td><td>${value}</td></tr>`;
    const basic = rows.map(([k,v]) => row(k, esc(v))).join('');
    const extra = Object.entries(f.props || {}).map(([k,v]) => row(k, fmt(esc(v)))).join('');
    const html = `<div class="sheet-tab">常规</div><div class="property-sheet"><div class="property-name">${icon(TYPEICON[f.type] || 'txt')}<b>${esc(nameOf(f.path))}</b></div>
      <div class="sep98"></div><table>${basic}${row(_t('属性'), attr)}</table>
      ${extra ? '<div class="sep98"></div><table>' + extra + '</table>' : ''}</div>`;
    const pickup = fragmentPickup('properties', f.id);
    const buttons = pickup && !S.collected.includes(pickup[0]) ? [
      { text: pickup[1].pickup.label, fn: () => takeFragment(pickup[0]) }, { text: _t('确定') },
    ] : null;
    pcMessage(nameOf(f.path) + _t(' 属性'), html, buttons, aboveOverlay);
  }

  // ============================================================
  // 应用
  // ============================================================
  function openApp(id) {
    const a = D.apps[id] || {};
    if (!test(a.requires)) return toast(_t('这个程序尚未开放。'));
    const go = () => {
      if (id === 'fragments') return openPhotoCollection();
      if (id === 'mycomputer') return openExplorer('');
      if (id === 'mydocs') return openExplorer(a.path || 'C:/我的文档');
      if (id === 'recycle') return openRecycle();
      if (id === 'bbs') return openIE('/');
      if (id === 'gexun') return openGexun();
      if (id === 'internet') return openIE();
      if (id === 'explorer') return openExplorer('C:');
      if (id === 'display') return openDisplay();
      if (id === 'restore') return openRestore();
      if (id === 'compare') return openCompare();
      if (id === 'diskfix') return openDiskFix();
      if (a.path) return openExplorer(a.path);
      if (id === 'map') return openMap();
      pcMessage(a.name || id, _t('无法启动程序。'));
    };
    withLock(a.lock, go);
  }

  // ---- 资源管理器 ----
  function openExplorer(path) {
    const old = wins.find(w => w.key === 'explorer');
    if (old) { focusWin(old); old.navigate(path); return old; }
    return openWin({ key: 'explorer', title: _t('资源管理器'), icon: 'folder', w: 680, h: 440, live: true, state: { path, sel: null, history: [path], hi: 0 }, render: renderExplorer });
  }
  function renderExplorer(win) {
    const st = win.state; st.view = st.view || 'icons';
    const p = st.path;
    const title = p === '' ? _t('我的电脑') : p === 'A:' ? _t('3.5 软盘 (A:)') : p === 'C:' ? '(C:)' : nameOf(p);
    win.setTitle(title + snapTag());
    win.setIcon(p === '' ? 'computer' : p === 'A:' ? 'floppy' : p === 'C:' ? 'drive' : 'folder');
    st.history ||= [p]; st.hi ??= 0;
    const go = (np, back = false) => { if (!back && np !== st.path) { st.history = st.history.slice(0, st.hi + 1); st.history.push(np); st.hi = st.history.length - 1; } st.path = np; st.sel = null; win.resetScroll = true; win.refresh(true); };
    win.navigate = go;
    const travel = delta => { const next = st.hi + delta; if (next < 0 || next >= st.history.length) return; st.hi = next; go(st.history[next], true); };
    const address = h('input', { class: 'f98', 'aria-label': '资源管理器地址', value: p === '' ? _t('我的电脑') : dispPath(p) + (p.length === 2 ? '\\' : '') });
    const visit = () => {
      let raw = address.value.trim(); if (raw === _t('我的电脑')) return go('');
      raw = normPath(raw).replace(/^([ac]):/i, (_, d) => d.toUpperCase() + ':');
      if (!/^[AC]:/.test(raw)) raw = (p ? p + '/' : '') + raw;
      const parts = [];
      for (const part of raw.split('/')) {
        if (!part || part === '.') continue;
        if (part === '..') { if (parts.length > 1) parts.pop(); }
        else parts.push(part);
      }
      const wanted = parts.join('/').toLowerCase();
      raw = Object.keys(FS.nodes).find(key => key.toLowerCase() === wanted) || raw;
      const node = FS.nodes[raw], f = nodeFile(raw);
      if (!node || !reachablePath(raw) || (!f && (!node.folder || !folderVisible(raw)))) return pcMessage('资源管理器', '找不到指定的路径。请检查文件夹名称是否写对。');
      const locks = []; for (let q = raw; q && q !== 'A:' && q !== 'C:'; q = parentOf(q)) { const e = folderEntry(q); if (e?.lock && !solved(e.lock)) locks.unshift(e.lock); }
      const enter = () => { if (locks.length) return withLock(locks.shift(), enter); if (f) openFile(f); else go(raw); }; enter();
    };
    address.onkeydown = e => { if (confirmInput(e)) { e.preventDefault(); visit(); } }; address.onfocus = () => address.select();
    win.el.onkeydown = e => { if (e.altKey && ['ArrowLeft','ArrowRight','ArrowUp'].includes(e.key)) { e.preventDefault(); if(e.key==='ArrowUp')go(parentOf(st.path));else travel(e.key==='ArrowLeft'?-1:1); } else if(e.ctrlKey&&e.key.toLowerCase()==='l'){e.preventDefault();address.focus();} else if(e.key==='F5'){e.preventDefault();win.refresh(true);} };
    const sel = () => st.sel && items.find(x => x.path === st.sel);
    const props = item => {
      if (!item) return pcMessage('属性', '请先单击选中一个文件。');
      if (item.drive) {
        const type = item.path === 'A:' ? '3.5 英寸软盘' : item.path === 'C:' ? '本地磁盘' : '系统文件夹';
        const name = item.label || nameOf(item.path);
        const path = item.path === '#display' ? '我的电脑' : dispPath(item.path) + String.fromCharCode(92);
        return pcMessage(name + ' 属性', '<div class="sheet-tab">常规</div><div class="property-sheet"><div class="property-name">' +
          icon(item.drive) + '<b>' + esc(name) + '</b></div><div class="sep98"></div>' + type + '<br>' + esc(path) + '</div>');
      }
      showProps(item.file || item.entry || {path:item.path, type:'folder'});
    };
    menus(win, [
      [_t('文件(F)'), [[_t('打开'), () => { const s = sel(); if (s) openEntry(s); else pcMessage(_t('打开'), _t('请先单击选中一个文件。')); }], [_t('属性'), () => props(sel())], '-', [_t('关闭'), () => closeWin(win)]]],
      [_t('查看(V)'), [[_t('大图标'), () => { st.view = 'icons'; win.refresh(true); }, st.view === 'icons'], [_t('详细资料'), () => { st.view = 'details'; win.refresh(true); }, st.view === 'details'], '-',
        [_t('显示所有文件（含隐藏文件）'), () => { S.showHidden = !S.showHidden; flagVer++; refreshWins(true); renderIcons(); save('auto'); toast(S.showHidden ? _t('已显示隐藏文件') : _t('已不显示隐藏文件')); }, S.showHidden]]],
      [_t('帮助(H)'), [[_t('关于 Windows'), () => pcMessage(_t('关于 Windows'), fmt('Microsoft Windows 98<br>本机已授权给：老K工作室'))]]],
    ]);
    win.top.append(h('div', {class:'toolbar98 nav-band'},
      navButton('back', '后退', () => travel(-1), st.hi === 0, '← 后退'),
      navButton('forward', '前进', () => travel(1), st.hi >= st.history.length - 1, '前进 →'),
      navButton('up', '向上', () => go(parentOf(p)), !p, '↑ 向上'),
      navButton('refresh', '刷新', () => win.refresh(true)),
      navButton('props', '属性', () => props(sel()))),
      h('div', {class:'addr nav-address'}, h('label', {text:'地址(D)', for:'explorer-address'}),
        h('span', {class:'address-field in'}, h('span', {html:icon(win.o.icon)}), address),
        controlButton({class:'b98', text:'转到'}, visit)));
    address.id = 'explorer-address';
    const body = win.body;
    body.innerHTML = '';
    let items;
    if (p === '') {
      items = [{ path: 'A:', folder: true, drive: 'floppy', label: _t('3.5 软盘 (A:)') }, { path: 'C:', folder: true, drive: 'drive', label: '(C:)' }, { path: '#display', label: _t('控制面板'), drive: 'display' }];
    } else items = listDir(p);
    const openEntry = (it) => {
      if (it.path === '#display') return openControlPanel();
      if (it.folder) { const fe = it.entry; if (fe) { opened(fe.id, fe.onOpen); return withLock(fe.lock, () => go(it.path)); } return go(it.path); }
      openFile(it.file);
    };
    if (!items.length) { body.append(h('div', { class: 'empty98', text: _t('此文件夹为空。') })); }
    else if (st.view === 'icons') {
      const fl = h('div', { class: 'flist' });
      items.forEach(it => {
        const f = it.file; const locked = (f && f.lock && !solved(f.lock)) || (it.entry && it.entry.lock && !solved(it.entry.lock));
        const ic = it.drive || (it.folder ? 'folder' : TYPEICON[f.type]);
        const hid = (f && f.hidden) || (it.entry && it.entry.hidden);
        const el = h('div', { class: 'icon' + (st.sel === it.path ? ' sel' : '') + (hid ? ' hid' : ''), tabindex: 0, html: icon(ic, locked) + ((it.folder ? it.path !== '#display' && newUnder(it.path) : isNewFile(f)) ? NEWDOT : '') + `<span>${esc(it.label || nameOf(it.path))}</span>` });
        const select = () => { st.sel = it.path; fl.querySelectorAll('.sel').forEach(x => x.classList.remove('sel')); el.classList.add('sel'); win.status.firstChild && (win.status.firstChild.textContent = statusText(it)); };
        bindControl(el, () => { select(); if (coarse()) openEntry(it); });
        el.ondblclick = () => { if (!coarse()) openEntry(it); };
        el.onkeydown = (e) => { if (confirmInput(e)) openEntry(it); };
        bindCtx(el, () => [[_t('打开'), () => openEntry(it)], [_t('属性'), () => props(it)]], select);
        fl.append(el);
      });
      body.append(fl);
    } else {
      const tb = h('table', { class: 'det' });
      const recCol = items.some(it => recOf(it.file || it.entry));
      const columns = ['名称', '大小', '类型', '修改时间'];
      if (recCol) columns.push('六号机记录');
      const sortValue = (it, key) => {
        const file = it.file || it.entry;
        if (it.drive) return key === '大小' ? 0 : key === '名称' ? it.label : key === '类型' ? (it.folder ? '磁盘' : '系统文件夹') : '';
        if (key === '大小') {
          if (it.folder) return 0;
          const size = sizeOf(file).replace(/,/g, '');
          return parseFloat(size) * (/MB/i.test(size) ? 1048576 : /KB/i.test(size) ? 1024 : 1);
        }
        if (key === '类型') return it.folder ? _t('文件夹') : fileTypeName(file);
        if (key === '修改时间') return fatOf(file);
        if (key === '六号机记录') return recOf(file);
        return nameOf(it.path);
      };
      const order = columns.includes(st.sort) ? st.sort : '名称';
      items.sort((a, b) => {
        if (!!a.folder !== !!b.folder) return a.folder ? -1 : 1;
        const av = sortValue(a, order), bv = sortValue(b, order);
        const by = typeof av === 'number' ? av - bv : av.localeCompare(bv, 'zh-CN', { numeric: true });
        return (st.desc ? -by : by) || a.path.localeCompare(b.path, 'zh-CN');
      });
      tb.append(h('tr', {}, ...columns.map(key => h('th', { class: 'out', 'aria-sort': key === order ? (st.desc ? 'descending' : 'ascending') : 'none' },
        controlButton({ class: 'sort-header', text: _t(key) }, () => { st.desc = key === order && !st.desc; st.sort = key; win.refresh(true); })))));
      items.forEach(it => {
        const f = it.file; const locked = f && f.lock && !solved(f.lock);
        const tr = h('tr', { class: st.sel === it.path ? 'sel' : '' },
          h('td', { class: 'nm', html: icon(it.drive || (it.folder ? 'folder' : TYPEICON[f.type]), locked) + esc(it.label || nameOf(it.path)) + ((it.folder ? newUnder(it.path) : isNewFile(f)) ? `<span class="newtag">${_t('新')}</span>` : '') }),
          h('td', { text: it.folder || it.drive ? '' : sizeOf(f) }), h('td', { text: it.drive ? sortValue(it, '类型') : it.folder ? _t('文件夹') : fileTypeName(f) }), h('td', { text: fatOf(f || it.entry) }), recCol ? h('td', { text: recOf(f || it.entry) }) : null);
        const select = () => { st.sel = it.path; tb.querySelectorAll('.sel').forEach(x => x.classList.remove('sel')); tr.classList.add('sel'); win.status.firstChild && (win.status.firstChild.textContent = statusText(it)); };
        bindControl(tr, () => { select(); if (coarse()) openEntry(it); });
        tr.ondblclick = () => { if (!coarse()) openEntry(it); };
        tr.tabIndex = 0;
        tr.onkeydown = e => { if (confirmInput(e)) openEntry(it); };
        bindCtx(tr, () => [[_t('打开'), () => openEntry(it)], [_t('属性'), () => props(it)]], select);
        tb.append(tr);
      });
      body.append(tb);
    }
    const statusText = (it) => it ? (it.folder || it.drive ? it.label || nameOf(it.path) : `${nameOf(it.path)}　${sizeOf(it.file)}　${fatOf(it.file)}${recOf(it.file) ? _t('　六号机记录 ') + recOf(it.file) : ''}`) : `${items.length} ${_t('个对象')}` + (S.showHidden ? '' : _t('（隐藏文件未显示）'));
    win.status.append(h('div', { text: statusText(sel()) }));
  }

  // ---- 回收站 ----
  function openRecycle() { openWin({ key: 'recycle', title: _t('回收站'), icon: 'recycle', w: 520, h: 320, live: true, render: renderRecycle }); }
  function renderRecycle(win) {
    const items = recycleItems();
    win.setIcon(items.length ? 'recyclefull' : 'recycle');
    win.top.append(h('div', { class: 'toolbar98' }, h('span', { text: _t('选中文件后点"还原"，文件会回到原来的位置。') })));
    if (!items.length) { win.body.append(h('div', { class: 'empty98', text: _t('回收站是空的。') })); return; }
    const tb = h('table', { class: 'det recycle-table' });
    tb.append(h('tr', {}, ...[_t('名称'), _t('原位置'), _t('删除日期'), _t('大小'), ''].map(t => h('th', { class: 'out', text: t }))));
    items.forEach(f => {
      tb.append(h('tr', {}, h('td', { class: 'nm', html: icon(TYPEICON[f.type] || 'txt') + esc(nameOf(f.path)) + (S.opened[f.id] ? '' : `<span class="newtag">${_t('新')}</span>`) }), h('td', { text: dispPath(parentOf(f.path)) }), h('td', { text: f.deletedAt || f.date || '' }), h('td', { text: sizeOf(f) }),
        h('td', {}, controlButton({ class: 'b98', style: { minWidth: 0 }, text: _t('还原') }, () => { markInteraction(); setFlag('restored_' + f.id); toast(_t('已还原到 ') + dispPath(parentOf(f.path))); dirty(); win.refresh(true); }))));
    });
    win.body.append(tb);
    win.status.append(h('div', { text: `${items.length} ${_t('个对象')}` }));
  }

  // ---- 记事本 / 写字板 / 看图 ----
  function openNotepad(f, key = 'np_' + (f.id || Math.random()), source = false) {
    const editable = !f.id && !source;
    const text = source ? f.text : fmt(f.text || '').replace(/&amp;/g, '&');
    return openWin({ key, title: nameOf(f.path) + ' - 记事本', icon: 'notepad', file: f.id ? f : null,
      w: 660, h: 530, state: {text, wrap: !source, q: '', at: 0},
      onClose: () => { if (editable) save('auto'); }, render: win => {
      const st = win.state;
      const paper=editable?h('textarea',{class:'scratch-note','aria-label':'记事本文本',spellcheck:false}):h('pre',{class:'note',text:st.text,tabindex:0});
      const wrap=()=>{paper.style.whiteSpace=st.wrap?'pre-wrap':'pre';paper.style.overflowWrap=st.wrap?'anywhere':'normal';};wrap();
      if(editable){
        paper.value=st.text;
        win.setTitle((st.changed?'*':'')+nameOf(f.path)+' - 记事本');
        paper.oninput=()=>{st.text=paper.value;st.changed=true;win.setTitle('*'+nameOf(f.path)+' - 记事本');save('auto');};
      }
      const all=()=>{if(editable){paper.focus();paper.select();}else{const r=document.createRange();r.selectNodeContents(paper);const s=getSelection();s.removeAllRanges();s.addRange(r);}};
      const copy=async()=>{let text=editable?paper.value.slice(paper.selectionStart,paper.selectionEnd):String(getSelection());if(!text){all();text=st.text;}try{if(navigator.clipboard?.writeText)await navigator.clipboard.writeText(text);else if(!document.execCommand('copy'))throw Error();}catch{pcMessage('记事本','请选中文字后按 Ctrl+C 复制。');}};
      const findNext=()=>{
        if(!st.q)return find();const hay=st.text.toLowerCase(),q=st.q.toLowerCase();let pos=hay.indexOf(q,st.at);if(pos<0)pos=hay.indexOf(q);
        if(pos<0){pcMessage('记事本','找不到“'+esc(st.q)+'”。');return;}
        st.at=pos+q.length;
        if(editable){paper.focus();paper.setSelectionRange(pos,pos+q.length);}else{const node=paper.firstChild;if(!node)return;const range=document.createRange();range.setStart(node,pos);range.setEnd(node,pos+q.length);const sel=getSelection();sel.removeAllRanges();sel.addRange(range);const rect=range.getBoundingClientRect(),base=win.body.getBoundingClientRect();win.body.scrollTop+=rect.top-base.top-50;paper.focus({preventScroll:true});}
      };
      const find=()=>{const input=h('input',{class:'f98',id:'np-find','aria-label':'查找内容',value:st.q});const run=()=>{st.q=input.value;st.at=0;closeModal();if(st.q)findNext();};const m=modalRoot(true);m.innerHTML='';m.append(h('div',{class:'shade',onclick:closeModal}),h('div',{class:'dlg98 out'},h('div',{class:'titlebar'},h('span',{class:'t',text:'查找'}),controlButton({class:'b98 tbb',text:'×','aria-label':'关闭'},closeModal)),h('div',{class:'wbody'},h('label',{for:'np-find',text:'查找内容：'}),input,h('div',{class:'row'},controlButton({class:'b98',text:'查找下一个'},run),controlButton({class:'b98',text:'取消'},closeModal)))));input.onkeydown=e=>{if (confirmInput(e))run();};if(!touchKeyboard()){input.focus();input.select();}};
      const saveCopy=(onSaved)=>{const filename=h('input',{class:'f98',id:'np-filename','aria-label':'文件名',value:editable?'无标题.txt':nameOf(f.path)});const m=modalRoot(true);m.innerHTML='';const run=()=>{let name=filename.value.trim();if(!name){filename.focus();return;}name=name.replace(/[<>:"/\\|?*]/g,'_');if(!name.includes('.'))name+='.txt';const blob=new Blob(['\ufeff'+st.text],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),a=h('a',{href:url,download:name});document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);st.changed=false;if(editable){f.path=name;win.setTitle(name+' - 记事本');}closeModal();if(typeof onSaved==='function')onSaved();};m.append(h('div',{class:'shade',onclick:closeModal}),h('div',{class:'dlg98 out'},h('div',{class:'titlebar'},h('span',{class:'t',text:'另存为'}),controlButton({class:'b98 tbb',text:'×','aria-label':'关闭'},closeModal)),h('div',{class:'wbody'},h('label',{for:'np-filename',text:'文件名：'}),filename,h('div',{class:'row'},controlButton({class:'b98',text:'保存'},run),controlButton({class:'b98',text:'取消'},closeModal)))));filename.onkeydown=e=>{if (confirmInput(e))run();};if(!touchKeyboard()){filename.focus();filename.select();}};
      const close=()=>{if(st.changed)return pcMessage('记事本','是否保存对文档的修改？',[{text:'保存',fn:()=>saveCopy(()=>closeWin(win,true))},{text:'不保存',fn:()=>closeWin(win,true)},{text:'取消'}]);closeWin(win,true);};
      win.requestClose=close;
      menus(win, [
        ['文件(F)', [['新建', () => openNotepad({path:'无标题',text:''})], ['另存为…', saveCopy], ...(f.id ? [['属性', () => showProps(f)]] : []), '-', ['关闭', close]]],
        ['编辑(E)', [['复制', copy], ['全选', all], '-', ['自动换行', () => { st.wrap = !st.wrap; win.refresh(true); }, st.wrap]]],
        ['搜索(S)', [['查找…', find], ['查找下一个', findNext]]],
        ['帮助(H)', [['关于记事本', () => pcMessage('关于记事本', 'Microsoft Windows 98<br>记事本')]]],
      ]);
      win.el.onkeydown=e=>{if(e.ctrlKey&&['f','s','a'].includes(e.key.toLowerCase())){e.preventDefault();({f:find,s:saveCopy,a:all})[e.key.toLowerCase()]();}else if(e.key==='F3'){e.preventDefault();findNext();}};
      win.body.append(paper);
    }});
  }

  function openWordpad(f) {
    openWin({ key: 'wp_' + f.id, title: nameOf(f.path) + _t(' - 写字板'), icon: 'doc', file: f, w: 720, h: 620, bodyClass: '', render: (win) => {
      menus(win, [[_t('文件(F)'), [[_t('属性'), () => showProps(f)], [_t('关闭'), () => closeWin(win)]]]]);
      win.body.append(h('div', { class: 'wordpad' }, h('div', { class: 'page', html: fmt(f.html || '') })));
    } });
  }
  function openImage(f) {
    openWin({ key: 'img_' + f.id, title: nameOf(f.path) + _t(' - 图像查看器'), icon: 'img', file: f, w: 640, h: 500, bodyClass: 'in image-body', state: { z: null }, onClose: win => win.imageResize && win.imageResize.disconnect(), render: (win) => {
      menus(win, [[_t('文件(F)'), [[_t('属性'), () => showProps(f)], [_t('关闭'), () => closeWin(win)]]]]);
      const front = fmt(f.html || '');
      const fullScreen = () => viewImage(front, f, !!win.state.back);
      const canvas = h('div', { class: 'canvas', html: imageFace(f, front, win.state.back), tabindex: 0, role: 'button', 'aria-label': _t('全屏查看'), ondblclick: fullScreen, onkeydown: e => { if (confirmInput(e) || e.key === ' ') { e.preventDefault(); fullScreen(); } } });
      const size = imageSize(canvas);
      const value = h('span');
      let scale = 1;
      const zoom = delta => { win.state.z = Math.max(.05, Math.min(4, scale + delta)); win.updateImageSize(); };
      const plus = controlButton({ class: 'b98', text: _t('放大 +') }, () => zoom(.25));
      const minus = controlButton({ class: 'b98', text: _t('缩小 −') }, () => zoom(-.25));
      win.top.append(h('div', { class: 'toolbar98' }, plus, minus,
        controlButton({ class: 'b98', text: _t('适应窗口') }, () => { win.state.z = null; win.updateImageSize(); stage.scrollLeft = 0; stage.scrollTop = 0; }),
        controlButton({ class: 'b98', text: _t('原始大小') }, () => { win.state.z = 1; win.updateImageSize(); }),
        controlButton({ class: 'b98', text: _t('全屏查看') }, fullScreen),
        f.backHtml ? controlButton({ class: 'b98', text: win.state.back ? '看正面' : '看背面' }, () => { win.state.back = !win.state.back; win.refresh(true); }) : null,
        controlButton({ class: 'b98', text: _t('属性') }, () => showProps(f)),
        value));
      // The caption stays outside the zoom surface, so wrapping text cannot feed
      // back into image scaling or make scrollbars repeatedly appear/disappear.
      const stage = h('div', { class: 'image-stage', tabindex: 0, 'aria-label': _t('图片，可滚动查看') }, h('div', { class: 'imgview' }, canvas));
      win.body.append(stage);
      if (f.caption) {
        win.body.append(h('div', {class:'image-caption', html:fmt(f.caption)}));
      }
      win.updateImageSize = () => {
        scale = win.state.z == null ? Math.min(1,
          Math.max(1, stage.clientWidth - 24) / size.w,
          Math.max(1, stage.clientHeight - 24) / size.h) : win.state.z;
        canvas.style.width = Math.max(1, Math.floor(size.w * scale)) + 'px';
        value.textContent = Math.round(scale * 100) + '%';
        plus.disabled = scale >= 4; minus.disabled = scale <= .05;
      };
      win.updateImageSize();
      if (win.imageResize) win.imageResize.disconnect();
      win.imageResize = new ResizeObserver(() => win.updateImageSize());
      win.imageResize.observe(stage);
    } });
  }

  // ---- 磁带播放器 ----
  const SPEEDS = ['0.5', '0.75', '1', '1.25', '1.5', '2'];
  function openMedia(f) {
    openWin({ key: 'md_' + f.id, title: nameOf(f.path) + _t(' - 媒体播放器'), icon: 'audio', file: f, w: 520, h: 470, bodyClass: 'out', state: { si: 2, playing: false, shown: '' }, render: (win) => {
      const tape = f.tape || {}; const st = win.state;
      menus(win, [[_t('文件(F)'), [[_t('属性'), () => showProps(f)], [_t('关闭'), () => closeWin(win)]]]]);
      const spd = SPEEDS[st.si];
      const deck = h('div', { class: 'deck' });
      const cas = h('div', { class: 'cassette' + (st.playing ? ' playing' : ''), style: { '--spd': (1.6 / +spd) + 's' } }, h('div', { class: 'lbl', text: `${tape.side ? tape.side + _t(' 面　') : ''}${tape.label || nameOf(f.path)}` }), h('div', { class: 'reel' }), h('div', { class: 'reel' }));
      const range = h('input', { type: 'range', min: 0, max: SPEEDS.length - 1, step: 1, value: st.si, id: 'spd_' + f.id, 'aria-label': _t('转速') });
      const speedLabel = h('span', { class: 'spd', text: spd + '×' });
      range.oninput = () => {
        st.si = +range.value; st.playing = false; st.shown = '';
        cas.classList.remove('playing'); cas.style.setProperty('--spd', (1.6 / +SPEEDS[st.si]) + 's');
        speedLabel.textContent = SPEEDS[st.si] + '×'; tr.textContent = _t('（按"播放"开始）');
      };
      const tr = h('div', { class: 'tr in', text: st.shown || _t('（按"播放"开始）') });
      deck.append(cas,
        h('div', { class: 'ctrl' }, h('span', { text: _t('转速') }), range, speedLabel),
        h('div', { class: 'ticks', html: SPEEDS.map(s => `<span>${s}</span>`).join('') }),
        h('div', { class: 'ctrl' },
          controlButton({ class: 'b98', text: _t('▶ 播放') }, () => play()),
          controlButton({ class: 'b98', text: _t('■ 停止') }, () => { st.playing = false; win.refresh(true); })),
        h('div', { text: _t('听到的内容：') }), tr);
      win.body.append(deck);
      function textFor(s) {
        const sp = tape.speeds || {};
        if (sp[s] != null) return sp[s];
        const keys = Object.keys(sp).map(Number).sort((a, b) => Math.abs(a - +s) - Math.abs(b - +s));
        return keys.length ? sp[String(keys[0])] : _t('（一片沙沙声）');
      }
      function play() {
        markInteraction();
        const s = SPEEDS[st.si]; const full = fmt(textFor(s));
        st.playing = true; st.shown = '';
        setFlag(`speed_${f.id}_${s.replace('.', '_')}`);
        const onS = tape.onSpeed && tape.onSpeed[s];
        const once = 'spd_' + f.id + '_' + s;
        if (onS && !S.opened[once]) { S.opened[once] = 1; act(onS); }
        dirty();
        win.refresh(true);
        const box = win.body.querySelector('.tr'); let i = 0;
        const step = () => { if (!st.playing || !box.isConnected) return; i = Math.min(full.length, i + 2); st.shown = full.slice(0, i); box.textContent = st.shown; if (i < full.length) later(step, 45 / Math.max(.5, +s)); else { st.playing = false; win.body.querySelector('.cassette').classList.remove('playing'); } };
        step();
      }
    } });
  }

  // ---- 压缩包 ----
  function openZip(f) {
    openWin({ key: 'zip_' + f.id, title: nameOf(f.path) + _t(' - 解压缩'), icon: 'zip', file: f, w: 480, h: 300, bodyClass: 'out', live: true, render: (win) => {
      const z = f.zip || {}; const unlocked = !f.lock || solved(f.lock);
      const tb = h('table', { class: 'det in' });
      tb.append(h('tr', {}, h('th', { class: 'out', text: _t('名称') }), h('th', { class: 'out', text: _t('状态') })));
      (z.entries || []).forEach(n => tb.append(h('tr', {}, h('td', { class: 'nm', html: icon('txt') + esc(dispName(n)) + (unlocked ? '' : ' *') }), h('td', { text: unlocked ? _t('已解压') : _t('已加密') }))));
      win.body.append(h('div', { class: 'zipv' },
        h('div', { text: _t('压缩包注释：') }), h('div', { class: 'cmt in', html: fmt(esc(z.comment || _t('（无）'))).replace(/\n/g, '<br>') }),
        h('div', { class:'archive-entries in' }, tb),
        h('div', { class: 'row', style: { display: 'flex', gap: '6px', flexWrap: 'wrap' } },
          unlocked ? controlButton({ class: 'b98', text: _t('打开解压目录') }, () => z.extractTo && openExplorer(normPath(z.extractTo)))
            : controlButton({ class: 'b98', text: _t('解压…') }, () => (z.broken && test(z.broken)) ? pcMessage(_t('解压缩'), fmt(z.brokenText || 'CRC 错误：数据损坏，无法解压。')) : askPuzzle(f.lock, () => { toast(_t('已解压到 ') + dispPath(z.extractTo), 'good'); dirty(); })))));
      win.status.append(h('div', { text: unlocked ? _t('已解压到 ') + dispPath(z.extractTo) : _t('文件已加密，需要密码') }));
    } });
  }

  // ---- 显示属性 / 屏保 ----
  function openControlPanel() {
    return openWin({ key:'control-panel', title:_t('控制面板'), icon:'display', w:480, h:310, render:win => {
      menus(win, [[_t('文件(F)'), [[_t('关闭'), () => closeWin(win)]]]]);
      const display = controlButton({class:'icon', html:icon('display') + '<span>显示</span>'}, e => {
        if (coarse() || e.detail === 0) openDisplay();
        else display.classList.add('sel');
      });
      display.ondblclick = () => { if (!coarse()) openDisplay(); };
      win.body.append(h('div', {class:'flist'}, display));
      win.status.append(h('div', {text:'1 个对象'}));
    }});
  }
  const SCREENSAVER_WAIT_MINUTES = 3;
  function openDisplay() {
    openWin({key:'display', title:_t('显示 属性'), icon:'display', w:410, h:coarse() || narrow() ? 420 : 365, propertyPage:true, bodyClass:'display-body',
      render:win => {
        const preview = h('div', {class:'crt-preview', 'aria-hidden':'true'},
          h('div', {class:'crt-case'}, h('div', {class:'crt-glass'}, h('span', {text:strip(saverText())}))),
          h('div', {class:'crt-neck'}), h('div', {class:'crt-foot'}));
        const box = h('fieldset', {class:'saver-group'}, h('legend', {text:'屏幕保护程序'}),
          h('div', {class:'saver-options'},
            h('select', {class:'f98', id:'saverSel', 'aria-label':'屏幕保护程序'}, h('option', {text:'字幕'})),
            controlButton({class:'b98',text:'设置…'}, () => pcMessage('字幕设置', '文字：<div class="in saver-setting">' + esc(saverText()) + '</div>')),
            controlButton({class:'b98',text:'预览'}, showSaver)),
          h('div', {class:'saver-wait'}, h('label', {for:'saver-wait',text:'等待(W)：'}),
            h('input', {class:'f98', id:'saver-wait', type:'text', readonly:true, value:String(SCREENSAVER_WAIT_MINUTES)}), '分钟'));
        win.body.append(h('div', {class:'display-sheet'}, h('div', {class:'sheet-tab',text:'屏幕保护程序'}),
          h('div', {class:'property-sheet'}, preview, box),
          h('div', {class:'sheet-actions'}, controlButton({class:'b98',text:'确定'}, () => closeWin(win)))));
      }});
  }
  // 满足条件的屏保轮流播放：还没触发过 onShow 的优先，其次按顺序轮换
  let saverIdx = -1, saverPick = null;
  function saverEntry() {
    const list = D.screensaver.filter(x => test(x.requires));
    if (!list.length) return { text: _t('少年宫小站') };
    const fresh = list.find(x => x.onShow && !S.opened['saver_' + D.screensaver.indexOf(x)]);
    if (fresh) return fresh;
    return list[((saverIdx % list.length) + list.length) % list.length];
  }
  function saverText() { return fmt(saverEntry().text); }
  let idleT = 0, saverOn = false;
  function resetIdle() {
    if (saverOn) hideSaver();
    clearTimeout(idleT);
    idleT = setTimeout(() => { if (S && S.stage === 'win' && !titleOn && !overlay().classList.contains('on')) showSaver(); }, SCREENSAVER_WAIT_MINUTES * 60_000);
  }
  function showSaver() {
    if (!S || S.stage !== 'win') return;
    saverIdx++;
    const e = saverEntry();
    const sc = screen(); if (!sc || $('#saver')) return;
    saverOn = true;
    const el = h('div', { id: 'saver' }, h('div', { class: 'mq', text: strip(fmt(e.text)), style: { top: (20 + Math.random() * 60) + '%' } }));
    sc.append(el);
    if (e.onShow) { const k = 'saver_' + D.screensaver.indexOf(e); if (!S.opened[k]) { S.opened[k] = 1; later(() => act(e.onShow), 3000); } }
  }
  function hideSaver() { saverOn = false; const s = $('#saver'); if (s) s.remove(); }

  // ---- 鸽讯 ----
  function gxDisplayName(person, date) {
    if (date && person?.previousNick && date < person.nickSince) return person.previousNick;
    return person?.nick || person?.remark || '';
  }
  function gxAccount(id) { return D.gxAccounts[id]; }
  function gxCanRead(account) { const a = gxAccount(account); return !!(a && test(a.requires) && solved(a.puzzle)); }
  function openGexun(logId) {
    const existing = wins.find(win => win.key === 'gexun');
    if (existing && !logId) { focusWin(existing); return existing; }
    const log = logId && D.gxLogs.find(entry => entry.id === logId);
    const owner = log && (log.account || 'xiaochuan');
    const session = existing ? existing.state.account : S.gxSession;
    const account = gxCanRead(session) && (!owner || owner === session) ? session : null;
    const state = { account, c: null, d: null, pick: owner || null, pendingLog: null, filter: '' };
    if (log && test(gxAccount(owner)?.requires)) {
      if (account && test(log.requires)) { state.c = log.contact; state.d = log.id; }
      else state.pendingLog = log.id;
    }
    return openWin({ key: 'gexun', title: '鸽讯 2005 · 消息管理器', icon: 'pigeon', w: 720, h: 500, live: true, state, render: renderGexun });
  }
  function gxLogsFor(c, account) {
    if (!gxCanRead(account)) return [];
    return D.gxLogs.filter(l => (l.account || 'xiaochuan') === account && (!c || l.contact === c) && test(l.requires)).sort((a,b)=>(a.date+(a.lines[0]?.time||'')).localeCompare(b.date+(b.lines[0]?.time||'')));
  }
  function renderGexun(win) {
    const st=win.state, account=gxAccount(st.account);
    const logout = () => {
      st.pick = st.account; st.account = null; st.c = null; st.d = null; st.filter = '';
      S.gxSession = null;
      save('auto'); win.refresh(true);
    };
    if (!account || !gxCanRead(st.account)) {
      win.setTitle('鸽讯 2005 · 打开本地账号');
      menus(win,[['文件(F)',[['关闭',()=>closeWin(win)]]],['帮助(H)',[['关于鸽讯',()=>pcMessage('鸽讯 2005','本地消息管理器 5.0<br>打开已备份的用户资料和聊天记录。此窗口不连接消息服务器。')]]]]);
      const accounts=Object.entries(D.gxAccounts).filter(([,a])=>test(a.requires));
      const panel=h('div',{class:'gx-login'});
      panel.append(h('div',{class:'gx-brand',html:icon('pigeon')+'<b>鸽讯 2005</b><small>本地消息管理器</small>'}));
      const select=bindTouchSelect(h('select',{class:'f98',id:'gx-account','aria-label':'鸽讯账号'}),win);
      accounts.forEach(([id,a])=>select.append(h('option',{value:id,text:a.number+'  '+a.nick})));
      if(!accounts.length){select.append(h('option',{value:'',text:'尚未载入用户资料'}));select.disabled=true;}
      const preferred=st.pick || S.gxRememberedAccounts.at(-1);
      if(accounts.some(([id])=>id===preferred))select.value=preferred;
      const pass=h('input',{class:'f98',id:'gx-password',type:'password',autocomplete:'off','aria-label':'本地资料密码'});
      const remember=h('input',{type:'checkbox',id:'gx-remember'});
      pass.disabled=remember.disabled=!accounts.length;
      const savedMask='••••••';
      let showingSaved=false;
      const fillPassword=()=>{
        const draft=win.gxLoginDraft;
        showingSaved=draft.password===undefined && remember.checked && S.gxRememberedAccounts.includes(select.value) && gxCanRead(select.value);
        pass.value=showingSaved ? savedMask : (draft.password ?? '');
      };
      pass.onfocus=()=>{if(showingSaved)pass.select();};
      pass.oninput=()=>{showingSaved=false;win.gxLoginDraft.password=pass.value;};
      remember.onchange=()=>{
        win.gxLoginDraft.remember=remember.checked;
        if (pass.value && (!showingSaved || pass.value !== savedMask)) win.gxLoginDraft.password=pass.value;
        fillPassword();
      };
      const rememberLabel=bindChoice(h('label',{class:'gx-remember',for:'gx-remember'},remember,h('span',{text:'在这台电脑上记住密码'})),remember);
      const msg=h('div',{class:'gx-login-error',role:'status'}),source=h('p',{class:'gx-source'}),hintBox=h('div'),hintButton=h('span');
      const change=()=>{
        if(win.gxLoginDraft?.account!==select.value){
          win.gxLoginDraft={account:select.value,remember:S.gxRememberedAccounts.includes(select.value)};
        }
        remember.checked=win.gxLoginDraft.remember;
        st.pick=select.value;fillPassword();msg.textContent='';const a=gxAccount(select.value);
        source.textContent=a?.source||'本机还没有账号备份。收到备份后，就能在这里选账号、查聊天记录了。';
        hintBox.replaceChildren();hintButton.replaceChildren();
        if(a&&D.puzzles[a.puzzle]){const hints=puzzleHints(a.puzzle,D.puzzles[a.puzzle]);hintBox.append(hints.box);hintButton.append(hints.button);}
      };
      select.onchange=change;change();
      const login=()=>{
        const a=gxAccount(select.value);if(!a||!test(a.requires))return;
        const useSaved = showingSaved && remember.checked && win.gxLoginDraft.account === select.value && pass.value === savedMask;
        if (!useSaved && !checkPuzzle(D.puzzles[a.puzzle], pass.value)) {
          msg.textContent='密码不对。再看看备份里的线索。';pass.select();return;
        }
        delete win.gxLoginDraft;
        st.account = select.value; st.c = null; st.d = null; st.filter = '';
        S.gxRememberedAccounts = S.gxRememberedAccounts.filter(id => id !== st.account);
        if (remember.checked) S.gxRememberedAccounts.push(st.account);
        S.gxSession = remember.checked ? st.account : null;
        solvePuzzle(a.puzzle);
        const target = st.pendingLog && gxLogsFor(null, st.account).find(log => log.id === st.pendingLog);
        if (target) { st.c = target.contact; st.d = target.id; }
        st.pendingLog = null;
        save('auto');win.refresh(true);
      };
      pass.onkeydown=e=>{if (confirmInput(e)){e.preventDefault();login();}};
      panel.append(h('label',{for:'gx-account',text:'账号'}),select,h('label',{for:'gx-password',text:'本地资料密码'}),pass,
        rememberLabel,source,msg,hintBox,
        h('div',{class:'row'},hintButton,controlButton({class:'b98',text:'登录',id:'gx-login',disabled:!accounts.length},login),controlButton({class:'b98',text:'取消'},()=>closeWin(win))));
      win.body.append(panel);win.status.append(h('div',{text:'本地资料模式 · 未连接'}));return;
    }
    const accountName = account.nick;
    win.setTitle('鸽讯 — '+accountName+'（'+account.number+'）');
    menus(win,[['系统(S)',[['切换账号…',logout],['查找聊天记录…',()=>gxSearch(win)],'-',['关闭',()=>closeWin(win)]]],['帮助(H)',[['资料来源',()=>pcMessage('资料来源',esc(account.source))]]]]);
    win.top.append(h('div',{class:'toolbar98 gx-accountbar'},h('b',{text:accountName+'  '+account.number}),h('span',{text:'本地资料'}),controlButton({class:'b98',text:'切换账号'},logout),controlButton({class:'b98',text:'查找'},()=>gxSearch(win))));
    if(account.recoveryPending&&test(account.recoveryPending))win.top.append(h('div',{class:'gx-recovery-status',text:account.recoveryText}));
    const gx=h('div',{class:'gx'}),left=h('div',{class:'left'}),groups={};
    const contacts=D.gxContacts.filter(c=>(c.account||'xiaochuan')===st.account&&test(c.requires));
    const contactFilter=h('input',{class:'f98 gx-friend-filter',placeholder:'查找联系人','aria-label':'查找联系人',value:st.filter||''});
    const list=h('div');
    const draw=()=>{list.innerHTML='';const q=contactFilter.value.trim().toLowerCase();Object.keys(groups).forEach(k=>delete groups[k]);contacts.filter(c=>!q||[c.nick,c.remark,c.number].join(' ').toLowerCase().includes(q)).forEach(c=>(groups[c.group||'好友']??=[]).push(c));
      Object.entries(groups).forEach(([g,cs])=>{list.append(h('div',{class:'grp',text:g+'（'+cs.length+'）'}));cs.forEach(c=>{
        const name=gxDisplayName(c), n=gxLogsFor(c.id,st.account).length;
        list.append(bindControl(h('div',{class:'ct'+(st.c===c.id?' sel':'')+(n?'':' none'),tabindex:0,role:'button',onkeydown:e=>{if(confirmInput(e)||e.key===' '){e.preventDefault();e.currentTarget.click();}}},h('div',{class:'av',text:name[0]}),h('div',{},h('div',{text:name}),h('small',{text:c.number+'　'+n+' 段记录'}))),()=>{st.c=c.id;st.d=null;win.resetScroll=true;win.refresh(true);}));
      });});if(!list.children.length)list.append(h('div',{class:'empty98',text:'没有匹配的联系人。'}));};
    contactFilter.oninput=()=>{st.filter=contactFilter.value;draw();};left.append(contactFilter,list);draw();
    const right=h('div',{class:'right'}),c=contacts.find(x=>x.id===st.c);
    if(!c)right.append(h('div',{class:'gx-profile'},h('h3',{text:accountName}),h('p',{text:account.signature||''}),h('p',{text:'本地记录：'+account.period}),h('p',{class:'muted',text:'选择联系人查看消息。'})));
    else {
      const logs=gxLogsFor(c.id,st.account),dates=h('div',{class:'dates'});
      if(c.info)right.append(h('div',{class:'gx-cinfo',text:c.info}));
      logs.forEach(l=>dates.append(controlButton({class:'b98'+(st.d===l.id?' down':''),text:l.date+(S.opened[l.id]?'':' •'),'data-gx-log':l.id},()=>{st.d=l.id;win.resetScroll=true;win.refresh(true);})));right.append(dates);
      const log=h('div',{class:'log',tabindex:0}),L=logs.find(x=>x.id===st.d);
      if(!L)log.append(h('div',{class:'empty98',text:logs.length?'选择日期查看那一天的聊天记录。':'这份备份里还没有和这个人的聊天记录。'}));
      else {
        opened(L.id, L.onOpen);
        log.append(h('div', { class: 'gx-log-heading', text: L.date + '　与 ' + gxDisplayName(c, L.date) + '（' + c.number + '）的消息' }));
        for (const line of L.lines) {
          const stamp = [line.date, line.time].filter(Boolean).join(' ');
          if (line.who === 'system') {
            log.append(h('div', { class: 'gx-system', text: stamp + '　' + line.text }));
          } else {
            const speaker = line.who === 'me' ? gxDisplayName(account, line.date || L.date) : (line.name || gxDisplayName(c, line.date || L.date));
            const row = h('div', { class: 'ln ' + line.who + (line.fail ? ' fail' : '') },
              h('div', { class: 'h', text: speaker + '　' + stamp }),
              h('div', { class: 'x', text: fmt(line.text) }));
            // 没送达的消息：可以选择写进同一台机器上收信人的本地记录（不经过服务器）
            if (line.fail) {
              const rs = line.resend, done = rs && S.flags[rs.flag];
              const tag = h('div', { class: 'gx-fail', text: done ? rs.doneText + '。' : '这条消息没有送达。' });
              if (rs && !done) tag.append(bindControl(h('span', { class: 'gx-resend', role: 'link', tabindex: 0, text: '重新发送' }), () => pcMessage('重新发送', rs.confirm,
                [{ text: rs.yes || '确定', fn: () => { act(rs.action); save('auto'); win.refresh(true); } }, { text: rs.no || '取消' }])));
              row.append(tag);
            }
            log.append(row);
          }
        }
      }
      right.append(log);
    }
    gx.append(left,right);win.body.append(gx);win.status.append(h('div',{text:'消息服务器：未连接'}),h('div',{text:gxLogsFor(null,st.account).length+' 段本地记录'}));
  }
  function gxSearch(win) {
    if(!gxCanRead(win.state.account))return;
    const m=modalRoot(true);m.innerHTML='';
    const inp=h('input',{class:'f98',id:'gxq','aria-label':'查找内容',style:{width:'100%'}}),from=h('input',{class:'f98',type:'date','aria-label':'起始日期'}),to=h('input',{class:'f98',type:'date','aria-label':'结束日期'});
    const res=h('div',{class:'in gx-search-results',role:'status'});
    const run=()=>{res.innerHTML='';const q=inp.value.trim();if(!q){res.textContent='请输入查找内容。';return;}
      if(from.value&&to.value&&from.value>to.value){res.textContent='起始日期不能晚于结束日期。';return;}
      for (const record of gxLogsFor(null, win.state.account)) {
        const contact = D.gxContacts.find(c => c.id === record.contact);
        for (const line of record.lines) {
          const day = line.date || record.date;
          if ((from.value && day < from.value) || (to.value && day > to.value)) continue;
          if (!line.text.toLowerCase().includes(q.toLowerCase())) continue;
          const text = gxDisplayName(contact, day) + '　' + day + ' ' + (line.time || '') + '\n' + line.text;
          res.append(controlButton({ class: 'gx-search-result', text }, () => {
            closeModal();
            Object.assign(win.state, { c: record.contact, d: record.id, filter: '' });
            win.resetScroll = true; win.refresh(true);
          }));
        }
      }
      if(!res.children.length)res.textContent='没有找到。';
    };
    inp.onkeydown=e=>{if (confirmInput(e))run();};
    const dlg=h('div',{class:'dlg98 out'},h('div',{class:'titlebar'},h('span',{class:'t',text:'查找聊天记录 — '+gxAccount(win.state.account).nick}),controlButton({class:'b98 tbb',text:'×','aria-label':'关闭'},closeModal)),h('div',{class:'wbody'},h('label',{for:'gxq',text:'查找内容'}),inp,h('div',{class:'row'},from,h('span',{text:'至'}),to),h('div',{class:'row'},controlButton({class:'b98',text:'查找'},run)),res));
    m.append(h('div',{class:'shade',onclick:closeModal}),dlg);if (!touchKeyboard()) inp.focus();
  }

  // ---- IE + 少年宫小站 ----
  function recentIE() {
    return wins.filter(w => w.key === 'ie').sort((a, b) => Number(a.min) - Number(b.min) || b.z - a.z)[0];
  }
  function ieHome() {
    return D.webHome || 'http://' + (D.bbsMeta.host || '192.168.1.103') + '/';
  }
  function createIE(state = {}) {
    return openWin({ key: 'ie', multiple: true, title: 'Microsoft Internet Explorer', icon: 'ie', w: 960, h: 680,
      bodyClass: 'in ie-body', scrollPane: '.bbs .wrap', live: true, state: { hist: [ieHome()], hi: 0, ...state },
      onClose: w => w.returnObserver?.disconnect(), render: renderIE });
  }
  function openIE(url, localFile) {
    if (!url && !localFile) return createIE();
    const host = D.bbsMeta.host || '192.168.1.103';
    const start = localFile ? 'file:///' + localFile.path : /^https?:\/\//i.test(url) ? url : 'http://' + host + url;
    const win = recentIE();
    if (!win) return createIE({ hist: [start], local: localFile || null });
    if (localFile) win.state.local = localFile;
    focusWin(win);
    ieGo(win, start);
    return win;
  }
  function ieGo(win, url) {
    const st = win.state;
    url = parseURL(url).canonical || url;
    if (url === st.hist[st.hi]) { st.missingTopic = null; win.refresh(true); return; }
    const next = st.hi + 1;
    st.hist.splice(next, st.hist.length, url);
    st.historyScroll?.splice(next);
    ieVisit(win, next);
  }
  function ieSiteKey(address) {
    if (address.startsWith('file:')) return address;
    const u = parseURL(address);
    const original = webPageFor(u)?.orig?.url;
    if (!original) return u.host;
    // The archive hosts several sites, and each personal space is a separate site.
    const parts = original.split('/');
    return u.host + '|' + (parts[0] === 'space.gexun.cn' ? parts.slice(0, 2).join('/') : parts[0]);
  }
  function ieSwitchSection(win, target, site) {
    const st = win.state;
    let root = st.hi;
    while (root > 0 && ieSiteKey(st.hist[root - 1]) === site) root--;
    const count = st.hi - root + 1;
    st.hist.splice(root, count, target);
    st.historyScroll?.splice(root, count, null);
    st.hi = root;
    win.resetScroll = true;
    win.refresh(true);
  }
  function ieVisit(win, index) {
    const st = win.state;
    if (index < 0 || index >= st.hist.length) return;
    const positions = st.historyScroll ||= [];
    const wrap = win.body.querySelector('.bbs .wrap');
    positions[st.hi] = { top: win.body.scrollTop, left: win.body.scrollLeft, wrapLeft: wrap?.scrollLeft || 0 };
    st.hi = index;
    win.resetScroll = true;
    win.refresh(true);
    const saved = positions[index];
    if (saved) {
      if (saved.top && win.body.querySelector(sectionNav)) reserveSectionScroll(win, saved.top);
      win.body.scrollTop = saved.top;
      win.body.scrollLeft = saved.left;
      const restoredWrap = win.body.querySelector('.bbs .wrap');
      if (restoredWrap) restoredWrap.scrollLeft = saved.wrapLeft;
    } else if (st.hist[index].split('#')[1]) {
      const id = st.hist[index].split('#')[1];
      const post = win.body.querySelector('#' + CSS.escape(id));
      if (post) win.body.scrollTop += post.getBoundingClientRect().top - win.body.getBoundingClientRect().top - 8;
    }
  }
  function parseURL(u) {
    u = String(u || '').trim();
    const bbsHost = (D.bbsMeta.host || '192.168.1.103').toLowerCase();
    let s = u.replace(/^https?:\/\//i, ''), host = bbsHost;
    const m = /^([a-z0-9-]+(?:\.[a-z0-9-]+)+)(?::\d+)?([/?#].*)?$/i.exec(s);
    if (m && (/[a-z]/i.test(m[1]) || /^\d+\.\d+\.\d+\.\d+$/.test(m[1]))) { host = m[1].toLowerCase(); s = m[2] || '/'; }
    if (!D.sites?.[host] && D.sites?.['www.' + host]) host = 'www.' + host;
    if (!s.startsWith('/')) s = '/' + s;
    s = s.split('#')[0];
    const [path, q] = s.split('?');
    const params = {}; (q || '').split('&').filter(Boolean).forEach(kv => { const [k, v] = kv.split('='); try { params[decodeURIComponent(k).toLowerCase()] = decodeURIComponent((v || '').replace(/\+/g, ' ')); } catch (e) { params[k.toLowerCase()] = v || ''; } });
    const out = { host, path: path.toLowerCase().replace(/\/index\.(asp|htm|html)$/, '/').replace(/\/+$/, '') || '/', params, raw: s };
    const alias = D.sites?.[host]?.aliases?.[out.path];
    if (alias) {
      const canonical = 'http://' + alias + (q ? '?' + q : '') + (u.includes('#') ? u.slice(u.indexOf('#')) : '');
      return { ...parseURL(canonical), canonical };
    }
    out.external = host !== bbsHost && !(D.sites && D.sites[host]);
    return out;
  }
  // ---- 剧情层面的“联网”：D.sites 记站点外观，D.web 记每一页。网址都是虚构的，内容全在本地。----
  function webURL(p) { return 'http://' + p.url; }
  const webAvailable = page => test(page.requires) && (!page.publishedAt || page.publishedAt <= sceneTime());
  function webPageFor(u) {
    return (D.web || []).find(p => {
      if (!webAvailable(p)) return false;
      const pu = parseURL('http://' + p.url);
      if (pu.host !== u.host || pu.path !== u.path) return false;
      return Object.entries(pu.params).every(([k, v]) => (u.params[k] || '') === v);
    });
  }
  function siteFrame(site, inner) {
    const tabs = (site.nav || []).filter(n => test(n.requires));
    const nav = tabs.map(n => `<a href="${esc(n.href)}">${esc(n.label)}</a>`).join('');
    const logo = site.logo || esc(site.name);
    const brand = tabs.some(n => n.href === '/') ? `<span class="web-logo">${logo}</span>` : `<a class="web-logo" href="/">${logo}</a>`;
    return `<div class="web-site${site.skin ? ' skin-' + site.skin : ''}" style="${site.style || ''}"><div class="web-head" style="${site.headStyle || ''}">${brand}${site.tagline ? `<small>${esc(site.tagline)}</small>` : ''}${nav ? `<nav class="web-nav" aria-label="本站栏目">${nav}</nav>` : ''}</div><main class="web-body">${inner}</main><div class="web-foot">${site.foot || ''}</div></div>`;
  }
  // 网页时光机的快照：顶上一条时光机工具条，下面按原站当年的样子显示（皮肤见 win98.css 的 .old-*）。
  const archiveEdition = site => site?.editions?.findLast(edition => test(edition.requires));
  function archiveFrame(site, o, inner) {
    const directory = site.archiveHost ? 'http://' + site.archiveHost + '/' : '/';
    const archiveName = site.archiveHost ? D.sites[site.archiveHost].name : site.name;
    const edition = archiveEdition(site);
    let stamp = '快照 ' + o.when, batch = '';
    if (edition) {
      const captured = o.fixedSnapshot ? o.when : edition.date;
      const date = new Date(captured + 'T00:00:00Z');
      const day = date.getUTCFullYear() + '年' + (date.getUTCMonth() + 1) + '月' + date.getUTCDate() + '日　星期' + '日一二三四五六'[date.getUTCDay()];
      const capturedEdition = o.fixedSnapshot ? site.editions.find(item => item.date === captured) : edition;
      const banner = capturedEdition?.banner || '欢迎访问' + site.name + '网站';
      inner = inner.replace('<!--site-date-->', day).replace('<!--site-banner-->', '★　' + esc(banner) + '　★');
      stamp = '快照 ' + captured;
      if (!o.fixedSnapshot) batch = '<span class="wb-batch">补录于 ' + esc(edition.restored) + '</span>';
    }
    return `<div class="web-site wb-site"><div class="wb-bar"><a href="${directory}">${esc(archiveName)}</a><span class="wb-url">http://${esc(o.url)}</span><span class="wb-when">${esc(stamp)}</span>${batch}</div>` +
      `${o.remark ? `<aside class="wb-note">${esc(o.remark)}</aside>` : ''}<div class="old-page old-${esc(o.skin)}">${inner}</div></div>`;
  }
  function archiveDirectory(u, win, site, page) {
    const query = (u.params.url || '').trim();
    const original = value => value.trim().replace(/^https?:\/\//i, '').replace(/#.*$/, '').toLowerCase()
      .replace(/^(?:www\.)?wcsng\.gov\.cn(?=\/|$)/, 'www.wcsng.gov.cn').replace(/\/index\.html?$/, '/').replace(/\/$/, '');
    const matches = query && D.web.filter(p => p.orig && webAvailable(p) && original(p.orig.url) === original(query))
      .sort((a, b) => a.orig.when.localeCompare(b.orig.when));
    const list = !query ? page.html.replace('{{LIST}}', webList(page.list)) :
      '<h1>快照查询</h1>' + (matches.length ? '<ul class="wl">' + matches.map(p =>
        `<li><a href="${esc(webURL(p))}">${esc((p.list && archiveEdition(D.sites[parseURL(webURL(p)).host])?.date) || p.orig.when)}　${esc(p.title)}</a></li>`).join('') + '</ul>' :
        '<p>这个网址暂时没有收录快照。</p>') + '<p><a href="/">全部快照</a></p>';
    const node = h('div', {html: siteFrame(site, fmt(webGate(list)))}).firstElementChild;
    const field = h('input', {class:'f98', id: win.el.id + '-archive-url', value:query, placeholder:'http://', spellcheck:'false'});
    const form = h('form', {class:'archive-lookup'}, h('label', {for: field.id, text:'原网址'}), field,
      h('button', {class:'b98', type:'submit', text:'查快照'}));
    form.onsubmit = e => {
      e.preventDefault();
      const value = field.value.trim();
      ieGo(win, webURL(page) + (value ? '?url=' + encodeURIComponent(value) : ''));
    };
    node.querySelector('.web-body').prepend(form);
    return {title: page.title, node};
  }

  function customForumPage(u) {
    return D.pages.find(page => {
      const route = parseURL(page.url);
      return route.path === u.path && (!route.params.id || route.params.id === u.params.id) && test(page.requires);
    });
  }
  function prepareWebLinks(body, page, current) {
    const base = 'http://' + current.host + current.raw;
    for (const link of body.querySelectorAll('a[href]')) {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || /^(?!https?:)[a-z][a-z0-9+.-]*:/i.test(href)) continue;
      const target = parseURL(new URL(href, base).href);
      let unread;
      if (target.host === D.bbsMeta.host) {
        if (target.path === '/thread.asp') {
          const thread = readableThread(THREAD[target.params.id], forumChapter());
          if (thread && !hasReadThread(thread)) unread = '未读帖子';
        } else {
          const custom = customForumPage(target);
          if (custom && !S.opened[custom.id]) unread = '未读网页';
        }
      } else if (!D.sites[target.host]?.search) {
        const dest = webPageFor(target);
        if (page && !dest) {
          link.replaceWith(h('span', {class:'web-unavailable', title:'该页未收录', text:link.textContent}));
        } else if (page && dest === page && link.closest('.web-nav, .ws-nav')) {
          link.replaceWith(h('strong', {'aria-current':'page', text:link.textContent}));
        } else if (dest && test(D.sites[target.host]?.requires) && !S.opened[dest.id]) {
          unread = '未读网页';
        }
      }
      if (unread) {
        link.dataset.unread = 'new';
        link.setAttribute('aria-description', unread);
      }
    }
  }
  function searchablePageText(page) {
    const template = document.createElement('template');
    template.innerHTML = fmt(webGate(page.html)).replace(/<img\b[^>]*>/gi, '');
    const root = template.content;
    // 空间首页的最近访客也是原始记录。分栏页只收录各自正文，避免同一条访客记录反复占据结果。
    const spaceSection = /^space\.gexun\.cn\/\d+\/?$/.test(page.orig?.url) ? '.sp-main' : '.sp-feed';
    const article = root.querySelector('.sng-art,.bl-post,.ws-body,.hp-site main,.xr-paper,.pl-body,.np,' + spaceSection) || root;
    article.querySelectorAll('nav,.sng-path,.sng-return,.blog-return,.hp-crumb,.xr-crumb,.bbs-path').forEach(node => node.remove());
    article.querySelectorAll('p,div,li,tr,th,td,h1,h2,h3,br').forEach(node => node.after(' '));
    return article.textContent.replace(/\s+/g, ' ').trim();
  }
  function webSearchPage(u, win, site) {
    const q = (u.params.q || '').trim();
    const node = h('div', { html: siteFrame(site, '') }).firstElementChild;
    const body = node.querySelector('.web-body');
    const inp = h('input', { class: 'f98', id: win.el.id + '-webq', value: q, style: { width: '320px' }, 'aria-label': '搜索词' });
    const go = () => ieGo(win, 'http://' + u.host + '/?q=' + encodeURIComponent(inp.value.trim()));
    inp.onkeydown = e => { if (confirmInput(e)) go(); };
    body.append(h('div', { class: 'web-search' }, inp, ' ', controlButton({ class: 'b98', text: '搜索' }, go)));
    if (q) {
      const words = q.split(/\s+/).filter(Boolean);
      // 中文连写（如“少年宫火灾”）拆成已出现的词再找：每段至少两个字，避免单字乱配。返回拆出来的几段（高亮用），找不到返回 null。
      const parts = (t, w, memo = new Map()) => {
        if (memo.has(w)) return memo.get(w);
        let r = t.includes(w) ? [w] : null;
        if (!r && /[\u4e00-\u9fff]/.test(w)) for (let i = 2; !r && i <= w.length - 2; i++) {
          if (!t.includes(w.slice(0, i))) continue;
          const rest = parts(t, w.slice(i), memo); if (rest) r = [w.slice(0, i), ...rest];
        }
        memo.set(w, r); return r;
      };
      const termsIn = t => { const lt = t.toLowerCase(), out = []; for (const w of words) { const p = parts(lt, w.toLowerCase()); if (!p) return null; out.push(...p); } return out; };
      const res = [];
      (D.web || []).filter(p => webAvailable(p) && !p.noIndex && D.sites[parseURL('http://' + p.url).host] && test(D.sites[parseURL('http://' + p.url).host].requires)).forEach(p => {
        const title = strip(fmt(p.title)), copy = searchablePageText(p);
        const terms = termsIn(title + ' ' + copy + ' ' + (p.keywords || ''));
        if (terms) res.push({ href: webURL(p), title, site: D.sites[parseURL(webURL(p)).host].name, snip: copy, terms });
      });
      if (site.searchForum !== false) visibleThreads().forEach(t => {
        const posts = t.posts.map(x => strip(fmt(x.html))), title = strip(fmt(t.title));
        const terms = termsIn(title + ' ' + posts.join(' '));
        if (!terms) return;
        const floor = posts.findIndex(post => termsIn(post));
        const anchor = floor > 0 && !termsIn(title) ? '#floor-' + floor : '';
        res.push({ href: 'http://' + D.bbsMeta.host + '/thread.asp?id=' + t.id + anchor, title,
          site: D.bbsMeta.name, snip: floor >= 0 ? posts[floor] : posts.join(' '), terms });
      });
      // 高亮：长的词先配，不分大小写；先切开再转义，不会弄坏 &amp; 之类
      const reEsc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const mark = (s, terms) => {
        const list = [...new Set(terms)].filter(Boolean).sort((a, b) => b.length - a.length);
        if (!list.length) return esc(s);
        return s.split(new RegExp('(' + list.map(reEsc).join('|') + ')', 'gi')).map((part, i) => i % 2 ? `<em class="q-hit">${esc(part)}</em>` : esc(part)).join('');
      };
      // 摘要从第一个命中的地方往前一点开始截
      const snip = (s, terms) => { const ls = s.toLowerCase(), at = terms.map(t => ls.indexOf(t)).filter(i => i >= 0), i = Math.max(0, (at.length ? Math.min(...at) : 0) - 24); return mark(s.slice(i, i + 80), terms); };
      body.append(h('div', { html: `<p class="web-count">找到 ${res.length} 条结果</p>` + res.map(r => `<div class="web-hit"><a href="${esc(r.href)}">${mark(r.title, r.terms)}</a><div class="web-src">${esc(r.site)} · ${esc(r.href.replace(/^http:\/\//, ''))}</div><div>…${snip(r.snip, r.terms)}…</div></div>`).join('') + (res.length ? '' : '<p>换个词试试。人名、地名、日期都可以。</p>') }));
    } else {
      body.append(h('div', {class:'web-tip', html:fmt(site.searchTip || '输入关键词，搜索已收录的旧网页和论坛存档。')}));
      body.prepend(h('label', {class:'search-prompt', for: inp.id, text:'搜索关键词'}));
    }
    return { title: site.name + (q ? ' - ' + q : ''), node };
  }
  function webRoute(u, win) {
    const site = D.sites && D.sites[u.host];
    if (!site || !test(site.requires)) return { title: '找不到服务器', html: `<div class="err"><h1>找不到服务器</h1><p>Internet Explorer 找不到服务器 ${esc(u.host || '')}。</p><p>请检查地址是否拼写正确，或者这个网站早已关闭。</p><p style="color:#888">旧网代理 · DNS 查询失败</p></div>` };
    if (site.search && u.path === '/') return webSearchPage(u, win, site);
    const p = webPageFor(u);
    if (!p) return { title: '无法找到网页', html: siteFrame(site, site.missing ? fmt(site.missing) : `<div class="err"><h1>404 - 页面不存在</h1><p>这个地址没有找到网页，或者存档里没收这一页。</p><p><a href="/">回到 ${esc(site.name)} 首页</a></p></div>`) };
    if (p.lock && !solved(p.lock)) return lockPage(p.lock, win, p.title);
    opened(p.id, p.onOpen);
    if (p.id === 'w_ar_home') return archiveDirectory(u, win, site, p);
    let body = webGate(p.list ? p.html.replace('{{LIST}}', webList(p.list)) : p.html);
    if (p.inlinePage) {
      const inset = D.web.find(item => item.id === p.inlinePage);
      if (inset && webAvailable(inset) && (!inset.lock || solved(inset.lock))) {
        const section = webGate(inset.html).replace(/^<h1>(.*?)<\/h1>/, '<h2>$1</h2>');
        body += '<section class="web-inset">' + section + '</section>';
        opened(inset.id, inset.onOpen);
      }
    }
    return { title: p.title, webPage: p, html: p.orig ? archiveFrame(site, p.orig, fmt(body)) : siteFrame(site, fmt(body)), source: p.source, srcFlag: 'source_' + p.id, onSource: p.onSource, after: p.after };
  }
  // 网页里 [[?条件]]……[[/?]] 包住的内容，条件满足才显示（随剧情补录的更新记录、目录里的链接）。
  function webGate(s) {
    return String(s).replace(/\[\[\?([^\]]+)\]\]([\s\S]*?)\[\[\/\?\]\]/g, (_, condition, inner) => {
      const rule = condition.trim();
      const visible = rule.startsWith('after ') ? sceneTime() >= rule.slice(6) : test(rule);
      return visible ? inner : '';
    });
  }
  // 站点首页的目录：只列已经补录 / 收录的页面，没看过的标“新”。{ h } 是小标题，只在下面有页面时出现。
  function webList(list) {
    let out = '<ul class="wl">', head = null;
    for (const it of list) {
      if (it.h) { head = it.h; continue; }
      const tp = (D.web || []).find(w => w.id === it.page);
      if (!tp || !webAvailable(tp)) continue;
      if (head) { out += `</ul><h3 class="wl-h">${esc(head)}</h3><ul class="wl">`; head = null; }
      out += `<li><a href="${esc(webURL(tp))}">${esc(it.label || strip(tp.title))}</a>${it.meta ? ` <span class="meta">${esc(it.meta)}</span>` : ''}</li>`;
    }
    return out + '</ul>';
  }
  function postAvatar(name) {
    const colors = ['#665673','#3e6475','#846042','#4e715c','#536489','#85525e'];
    const hash = Array.from(name).reduce((n, c) => n + c.codePointAt(0), 0);
    return h('span', {class:'post-avatar', 'aria-hidden':'true', style:{background:colors[hash % colors.length]}, text:Array.from(name.trim())[0] || '客'});
  }
  function renderCommunityReplies(board) {
    const comments = board.querySelectorAll('.cmt');
    comments.forEach((row,i) => {
      const author = row.querySelector('b')?.textContent || '网友';
      const copy = h('div', {class:'reply-copy'});
      copy.append(...row.childNodes);
      copy.querySelector('br')?.before(h('small',{class:'post-floor',text:(i+2)+'楼'}));
      row.append(postAvatar(author),copy);
    });
    board.querySelector('h3').textContent = '跟帖讨论（' + comments.length + '）';
  }
  function communityPage(panel, page) {
    if (page.id === 'w_quan_home') return;
    const meta = panel.querySelector(':scope > .meta'), title = panel.querySelector('h1');
    if (!title) return;
    const thread=h('article',{class:'quan-topic'});
    const comments=[...panel.querySelectorAll('.cmt')];
    const board=h('section',{class:'quan-replies'},h('h3',{text:'跟帖讨论'}),...comments);
    thread.append(...panel.childNodes);
    panel.append(h('div',{class:'quan-path',text:'梧城圈　/　本地话题'}),thread,board);
    if (meta) {
      // 作者署名本身可能含有间隔号；以发布日期前的间隔号作为边界。
      const [author,details]=meta.textContent.trim().split(/\s*·\s*(?=\d{4}-\d{2}-\d{2}\b)/, 2);
      const data = details ? details.split(/\s*·\s*/) : [];
      meta.replaceChildren(postAvatar(author),h('div',{},h('b',{text:author}),h('small',{text:['楼主',...data].join('　·　')})));
    }
    renderCommunityReplies(board);
  }
  const sectionNav = '.sp-tabs,.bl-menu,.ws-nav,.sng-nav,.hp-nav,.xr-nav,.pl-nav,.web-nav,.top > .nav';
  function reserveSectionScroll(win, position) {
    const panel = win.body.querySelector('.bbs');
    if (panel && position > 0) {
      panel.style.minHeight = Math.ceil(win.body.clientHeight + position) + 'px';
      win.state.sectionFloor = {url: win.state.hist[win.state.hi], position};
    }
  }
  function renderIE(win) {
    const st = win.state;
    const url = st.hist[st.hi] = parseURL(st.hist[st.hi]).canonical || st.hist[st.hi];
    if (win.resetScroll) st.missingTopic = null;
    const reload = () => { st.missingTopic = null; win.refresh(true); };
    let page;
    if (url.startsWith('file:///')) {
      const f = st.local && ('file:///' + st.local.path) === url ? st.local : D.files.find(x => 'file:///' + x.path === url);
      page = f && test(f.requires) && snapOK(f) && (!f.lock || solved(f.lock)) ? { title: nameOf(f.path), html: `<div style="padding:12px">${fmt(f.html || '')}</div>`, source: f.source || '' } : errPage(_t('无法找到文件'));
    } else {
      const u = parseURL(url);
      page = u.host === (D.bbsMeta.host || '192.168.1.103').toLowerCase() ? bbsRoute(u, win) : webRoute(u, win);
    }
    const bookmarks = [...Object.entries(D.sites || {}).filter(([, s]) => s.fav && test(s.requires)).map(([host, site]) => {
      const home = 'http://' + host + '/';
      const dest = webPageFor(parseURL(home));
      return [site.name + (dest && !S.opened[dest.id] ? '　new' : ''), () => ieGo(win, home)];
    }), [(D.bbsMeta.name || _t('少年宫小站')) + _t(' 首页'), () => ieGo(win, 'http://' + (D.bbsMeta.host || '192.168.1.103') + '/')], ...(bbsArchiveReady() ? [[_t('站务管理'), () => ieGo(win, 'http://' + (D.bbsMeta.host || '192.168.1.103') + '/admin/')]] : [])];
    menus(win, [
      [_t('文件(F)'), [[_t('新建窗口'), () => createIE()], [_t('关闭'), () => closeWin(win)]]],
      [_t('查看(V)'), [[_t('源文件'), () => viewSource(win)], [_t('刷新'), reload]]],
      [_t('收藏(A)'), bookmarks],
      [_t('帮助(H)'), [[_t('关于'), () => pcMessage(_t('关于 Internet Explorer'), 'Microsoft Internet Explorer 6.0')]]],
    ]);
    const addr = h('input', { class: 'f98', id: win.el.id + '-ieaddr', 'aria-label':'Internet Explorer 地址', value: url, spellcheck: 'false', autocomplete: 'off' });
    addr.onkeydown = (e) => { if (confirmInput(e)) { markInteraction(); ieGo(win, addr.value); } };
    addr.onfocus = () => addr.select();
    const visit = () => { markInteraction(); ieGo(win, addr.value); };
    const goHome = () => ieGo(win, ieHome());
    const searchSite = Object.entries(D.sites || {}).find(([,site]) => site.search && test(site.requires));
    win.top.append(h('div', {class:'toolbar98 nav-band'},
      navButton('back', '后退', () => ieVisit(win, st.hi - 1), st.hi === 0, '← 后退'),
      navButton('forward', '前进', () => ieVisit(win, st.hi + 1), st.hi >= st.hist.length - 1, '前进 →'),
      navButton('refresh', '刷新', reload), navButton('home', '主页', goHome),
      searchSite ? navButton('search', '搜索', () => ieGo(win, 'http://' + searchSite[0] + '/')) : null,
      navButton('favorite', '收藏夹', e => {
        const r = e.currentTarget.getBoundingClientRect();
        showCtx(bookmarks, r.left, r.bottom, e.detail === 0);
      }),
      navButton('source', '源文件', () => viewSource(win))),
      h('div', {class:'addr nav-address'}, h('label', {text:'地址(D)', for: addr.id}),
        h('span', {class:'address-field in'}, h('span', {html:icon('htm')}), addr),
        controlButton({class:'b98', text:'转到'}, visit)));
    win.el.onkeydown = e => {
      if (e.ctrlKey && e.key.toLowerCase() === 'l') { e.preventDefault(); addr.focus(); }
      else if (e.key === 'F5') { e.preventDefault(); reload(); }
      else if (e.altKey && ['ArrowLeft','ArrowRight'].includes(e.key)) {
        e.preventDefault(); ieVisit(win, st.hi + (e.key === 'ArrowLeft' ? -1 : 1));
      }
    };
    win.page = page;
    win.setTitle((page.title ? strip(page.title) + ' - ' : '') + 'Microsoft Internet Explorer');
    const body = h('div', { class: 'bbs' });
    if (page.node) body.append(page.node); else body.innerHTML = page.html;
    if (page.webPage) {
      const pickup = fragmentPickup('album', page.webPage.id);
      if (pickup) {
        const [id, piece] = pickup;
        const album = body.querySelector('.sp-feed');
        const button = h('button', { type: 'button', class: 'fragment-album-link',
          text: S.collected.includes(id) ? '已收入照片碎片' : piece.pickup.label,
          disabled: S.collected.includes(id), onclick: () => {
            takeFragment(id); button.disabled = true; button.textContent = '已收入照片碎片';
          } });
        album?.append(button);
      }
      const community = body.querySelector('.skin-quan .web-body');
      if (community) communityPage(community, page.webPage);
    }
    bindControl(body, (e, a) => {
      e.preventDefault(); markInteraction();
      const href = a.getAttribute('href') || '';
      if (href.startsWith('clip:')) { if (narrow()) togglePhone(true); return goEvidence({ type: 'clip', id: href.slice(5) }); }
      if (href === '#' || (href.startsWith('#') && !body.querySelector('#' + CSS.escape(href.slice(1))))) return;
      const cur = url.startsWith('file:///') ? { host: (D.bbsMeta.host || '192.168.1.103') } : parseURL(url);
      const target = new URL(href, 'http://' + cur.host + (cur.raw || '/')).href;
      if (a.dataset.memberSort) {
        st.hist[st.hi] = target;
        win.refresh(true);
        win.body.querySelector(`[data-member-sort="${CSS.escape(a.dataset.memberSort)}"]`)?.focus({preventScroll:true});
        return;
      }
      const tab = a.closest(sectionNav);
      if (tab || a.closest('a.web-logo')) {
        const site = ieSiteKey(url);
        if (site === ieSiteKey(target)) {
          const navY = tab?.getBoundingClientRect().top;
          ieSwitchSection(win, parseURL(target).canonical || target, site);
          const nextTab = win.body.querySelector(sectionNav);
          if (nextTab && e.type === 'click' && e.detail === 0) {
            const current = nextTab.querySelector('[aria-current]') || [...nextTab.querySelectorAll('a,b,strong')].find(n => n.textContent === a.textContent) || nextTab;
            if (!current.matches('a[href]')) current.tabIndex = -1;
            current.focus({preventScroll:true});
          }
          if (navY != null && nextTab) {
            const pos = Math.max(0, win.body.scrollTop + nextTab.getBoundingClientRect().top - navY);
            reserveSectionScroll(win, pos);
            win.body.scrollTop = pos;
          }
          return;
        }
      }
      if (a.closest('.blog-return,.sng-return,.crumb') && st.hist[st.hi - 1] === target) {
        ieVisit(win, st.hi - 1);
        return;
      }
      ieGo(win, target);
    }, e => e.target.closest && e.target.closest('a[href]'));
    const banner = body.querySelector('.old-mq > span');
    if (banner) {
      const now = performance.now();
      if (win.marquee?.text !== banner.textContent) win.marquee = {text:banner.textContent, start:now};
      banner.style.setProperty('--marquee-elapsed', (now - win.marquee.start) + 'ms');
    } else {
      delete win.marquee;
    }
    win.body.append(body);
    win.returnObserver?.disconnect();
    const returnLink = body.querySelector('.sng-return a,.blog-return a');
    if (returnLink) {
      const parentLink = [...body.querySelectorAll('.sng-nav a,.bl-menu a,.crumb a')]
        .find(a => a.getAttribute('href') === returnLink.getAttribute('href'));
      if (parentLink) {
        const footer = returnLink.parentElement;
        footer.hidden = true;
        win.returnObserver = new IntersectionObserver(([entry]) => { footer.hidden = entry.isIntersecting; }, {root:win.body});
        win.returnObserver.observe(parentLink);
      }
    }
    if (st.sectionFloor?.url === url) reserveSectionScroll(win, st.sectionFloor.position);
    else delete st.sectionFloor;
    body.querySelectorAll('.evidence-photo').forEach(photo => bindImageZoom(photo));
    const onWeb = !url.startsWith('file:///') && parseURL(url).host !== (D.bbsMeta.host || '192.168.1.103').toLowerCase();
    win.status.append(h('div', { text: _t('完成') }), h('div', { style: { flex: 'none', maxWidth: '62%', paddingRight: '16px' }, text: onWeb ? 'Internet · 旧网代理' : _t('本地 Intranet') }));
    if (page.after) page.after(body);
    prepareWebLinks(body, page.webPage, parseURL(url.startsWith('file:///') ? '/' : url));
  }
  function viewSource(win) {
    const p = win.page || {};
    if (p.srcFlag) { setFlag(p.srcFlag); if (!S.opened[p.srcFlag]) { S.opened[p.srcFlag] = 1; act(p.onSource); } dirty(); }
    const archive = !!p.webPage?.orig;
    // 源文件里显示旧网址时，在惰性文档里改写图片地址，避免浏览器去请求那些文件。
    const inertDocument = document.createElement('template').content.ownerDocument;
    const original = inertDocument.importNode(win.body.querySelector(archive ? '.old-page' : '.bbs'), true);
    original.querySelectorAll('a[data-unread]').forEach(link => {
      delete link.dataset.unread;
      link.removeAttribute('aria-description');
    });
    // The offline build embeds image bytes. The simulated website served image files.
    original.querySelectorAll('img[src^="data:"], img[src^="./trial-photo-"], img[src="./cover.webp"]').forEach((img, i) => {
      const name = img.closest('[data-photo]')?.getAttribute('data-photo') || 'pic' + (i + 1);
      img.setAttribute('src', 'images/' + name + '.jpg');
    });
    const url = win.state.hist[win.state.hi];
    const forum = !url.startsWith('file:') && parseURL(url).host === D.bbsMeta.host;
    const charset = archive || forum ? 'gb2312' : 'utf-8';
    const title = esc(strip(p.title || D.bbsMeta.name || _t('少年宫小站')));
    const content = original.innerHTML.replace(/></g, '>\n<');
    const src = `<html>\n<head>\n<meta http-equiv="Content-Type" content="text/html; charset=${charset}">\n<title>${title}</title>\n</head>\n<body>\n${p.source ? fmt(p.source) + '\n' : ''}${forum ? D.bbsMeta.homeSource || '' : ''}\n${content}\n</body>\n</html>`;
    openNotepad({ path: _t('源文件'), text: src }, 'src_' + Math.random(), true);
  }
  function errPage(msg) {
    return { title: _t('无法找到网页'), html: `<div class="err"><h1>${_t('无法找到该网页')}</h1><p>${msg || _t('您要查找的网页可能已被删除、已更名或暂时不可用。')}</p><hr><p>${_t('请尝试以下操作：')}<br>${_t('· 检查地址栏中的网址拼写是否正确。')}<br>${_t('· 打开')} <a href="/">${_t('少年宫小站首页')}</a>${_t('，然后查找需要的链接。')}</p><p style="color:#888">${_t('HTTP 404 - 文件未找到')}<br>Internet Explorer</p></div>` };
  }
  const uName = (id) => { const u = USER[id]; return u && test(u.requires) ? u : null; };
  const uLink = (id) => { const u = uName(id); return u ? `<a href="/user.asp?id=${encodeURIComponent(id)}">${esc(u.nick)}</a>` : esc(id); };
  function forumChapter() {
    return Number(S.chapter?.replace(/^ch/, '')) || 0;
  }
  function hasReadThread(t) {
    return !!(S.opened['t' + t.id] || S.forumReadCounts?.[t.id]);
  }
  function readableThread(t, chapter) {
    if (!t || !snapOK(t)) return null;
    if (!hasReadThread(t) && (!test(t.requires) || (t.forumChapter || 0) > chapter)) return null;
    return t;
  }
  function visibleThreads() {
    const chapter = forumChapter();
    return D.threads.filter(t => !isDel(t)).map(t => readableThread(t, chapter)).filter(Boolean);
  }
  // 每批旧帖读出时提示一次。第一批由米乐交光盘那段对话自己提示；旧存档首次载入时只记下当前批次。
  function forumBatchNotice() {
    const meta = D.bbsMeta;
    if (!meta?.recoveryChapters || !meta.batchToast) return;
    const now = forumChapter(), before = S.forumBatch;
    if (before == null || now < before) { S.forumBatch = now; return; }
    if (now === before) return;
    S.forumBatch = now;
    if (!before) return;
    const n = D.threads.filter(t => !t.deleted && t.forumChapter > before && t.forumChapter <= now).length;
    if (n) toast(meta.batchToast.replace('{n}', n));
  }
  const bbsArchiveReady = () => !D.bbsMeta.archiveRequires || test(D.bbsMeta.archiveRequires);
  const topBar = (crumb) => `<div class="top"><div class="logo">${(D.bbsMeta.name || _t('少年宫小站'))}<small>${(!bbsArchiveReady() && D.bbsMeta.publicSub) || D.bbsMeta.sub || _t('梧城少年宫计算机班 · 1999')}</small></div><div class="nav"><a href="/">${_t('首页')}</a><a href="/users.asp">${_t('成员列表')}</a><a href="/search.asp">${_t('搜索')}</a>${bbsArchiveReady() ? `<a href="/admin/">${_t('站务管理')}</a>` : ''}</div></div>${crumb ? `<div class="crumb">${crumb}</div>` : ''}`;
  function bbsRoute(u, win) {
    if(D.bbsMeta.accessRequires&&!test(D.bbsMeta.accessRequires))return {title:'Internet Explorer · 工作脱机',html:'<div class="err"><h1>工作脱机</h1><p>未连接到互联网，本机尚未载入离线网页备份。</p><p>已有文件仍可从“我的电脑”打开。</p></div>'};
    if (u.external) return { title: _t('无法显示网页'), html: `<div class="err"><h1>${_t('无法显示网页')}</h1><p>${_t('本机没有连接外网（拨号连接已断开）。')}<br>${_t('只能访问校园网内的服务器')} ${esc(D.bbsMeta.host || '')}。</p></div>` };
    const path = u.path, P = u.params;
    // 自定义页面
    const custom = customForumPage(u);
    if (custom) {
      if (custom.lock && !solved(custom.lock)) return lockPage(custom.lock, win, custom.title);
      opened(custom.id, custom.onOpen);
      return { title: custom.title, html: topBar(esc(custom.title || '')) + `<div class="wrap">${fmt(custom.html)}</div>`, source: custom.source, srcFlag: 'source_' + custom.id, onSource: custom.onSource };
    }
    if (path === '/' || path === '/index.asp' || path === '') {
      const vt = visibleThreads();
      let rows = '';
      D.bbsBoards.filter(b => test(b.requires)).forEach(b => {
        const ts = vt.filter(t => t.board === b.id);
        if (b.opensWithFirstTopic && !ts.length) return;
        const last = ts.slice().sort((a,b)=>b.date.localeCompare(a.date))[0];
        rows += `<tr><td><a href="/board.asp?id=${b.id}"><b>${esc(b.name)}</b></a><br><span style="color:#666">${esc(b.desc || '')}</span></td><td>${uLink(b.mod)}</td><td style="text-align:center">${ts.length}</td><td>${last ? `<a href="/thread.asp?id=${last.id}">${esc(strip(last.title)).slice(0, 18)}</a><br><span style="color:#888">${esc(last.date)}</span>` : '-'}</td></tr>`;
      });
      const notice = (!bbsArchiveReady() && D.bbsMeta.publicHomeNotice) || D.bbsMeta.homeNotice || '';
      const recent = vt.map(t => ({t, last: t.posts.at(-1)}))
        .sort((a, b) => b.last.date.localeCompare(a.last.date) || b.t.id - a.t.id).slice(0, 8);
      const latest = recent.map(({t, last}) => `<li><a href="/thread.asp?id=${t.id}">${esc(strip(t.title))}</a> <span style="color:#888">— ${uLink(last.author)} ${esc(last.date)}</span></li>`).join('');
      return { title: D.bbsMeta.name || _t('少年宫小站'), html: topBar('') + `<div class="notice">${fmt(notice)}</div><div class="wrap"><table class="t"><tr><th>${_t('版面')}</th><th>${_t('版主')}</th><th>${_t('主题数')}</th><th>${_t('最新主题')}</th></tr>${rows}</table><p style="color:#666">${_t('注册用户')} ${D.users.filter(x => test(x.requires)).length} ${_t('人　|　帖子')} ${vt.length} ${_t('篇')}</p><h2>${_t('最新帖子')}</h2>${latest ? '<ul class="bbs-latest" style="padding-left:18px;margin:0">' + latest + '</ul>' : '<p>目前还没有收录主题。</p>'}</div>`, source: '' };
    }
    if (path === '/board.asp') {
      const b = D.bbsBoards.find(x => x.id === P.id && test(x.requires));
      if (!b) return errPage(_t('版面不存在。'));
      const ts = visibleThreads().filter(t => t.board === b.id).sort((x, y) => (y.sticky ? 1 : 0) - (x.sticky ? 1 : 0) || y.date.localeCompare(x.date));
      if (b.opensWithFirstTopic && !ts.length) return errPage(_t('版面不存在。'));

      let rows = ts.map(t => `<tr><td>${t.sticky ? _t('<b style="color:#c00">[置顶]</b> ') : ''}<a href="/thread.asp?id=${t.id}">${esc(strip(t.title))}</a></td><td>${uLink(t.author)}</td><td style="text-align:center">${(t.posts || []).length - 1}</td><td style="text-align:center">${t.views || (37 + (t.id * 7) % 300)}</td><td>${esc(t.date)}</td></tr>`).join('');
      if (!rows) rows = _t('<tr><td colspan="5">本版暂无主题。</td></tr>');
      return { title: b.name, html: topBar(`${_t('首页')} » ${esc(b.name)}　<span style="color:#666">${_t('版主：')}${uLink(b.mod)}</span>`) + `<div class="wrap"><table class="t"><tr><th>${_t('主题')}</th><th>${_t('作者')}</th><th>${_t('回复')}</th><th>${_t('人气')}</th><th>${_t('发表时间')}</th></tr>${rows}</table></div>`, source: b.source || '' };
    }
    if (path === '/thread.asp') {
      const id = parseInt(P.id, 10);
      const found = readableThread(THREAD[id], forumChapter());
      // 打开时还没读出的帖子，这次访问里一直显示“不存在”：后台重绘不能把新读出的整篇悄悄记成已读。刷新或重新进入才显示。
      const t = win.state.missingTopic === id ? null : found;
      if (!t) {
        win.state.missingTopic = id;
        return { title: _t('帖子不存在'), html: topBar(`${_t('首页')}`) + `<div class="err"><h1>${_t('错误：帖子不存在')}</h1><p>${_t('编号为')} ${esc(P.id || '')} ${_t('的帖子不存在。')}</p><p style="color:#888">WTBBS Error 1032</p></div>` };
      }
      if (isDel(t) && D.bbsMeta.adminPuzzle && !solved(D.bbsMeta.adminPuzzle)) {
        return { title: _t('站务回收站'), html: topBar('') + '<div class="err">请先<a href="/admin/">登录站务管理</a>查看回收站里的原帖。</div>' };
      }
      if (t.lock && !solved(t.lock)) return lockPage(t.lock, win, t.title);
      opened('t' + t.id, t.onOpen);
      const b = D.bbsBoards.find(x => x.id === t.board);
      const posts = t.posts.map((p, i) => {
        const au = USER[p.author] || { nick: p.author };
        return `<div class="post" id="floor-${i}"><div class="who"><b>${uLink(p.author)}</b><br><span style="color:#666">${esc(p.author)}</span>${au.title ? `<br><span class="tt">${esc(au.title)}</span>` : ''}<br><span>${_t('帖子：')}${au.posts || 0}</span><br><span>${_t('注册：')}${esc((au.reg || '').slice(0, 10))}</span></div><div class="body"><div class="meta"><span>${i === 0 ? _t('<b>楼主</b>') : i + _t(' 楼')}　${_t('发表于')} ${esc(p.date || t.date)}</span>${i === 0 && t.ip ? `<span>IP：${esc(t.ip)}</span>` : ''}</div><div class="content">${fmt(p.html)}</div>${au.sig ? `<div class="sig">${esc(au.sig)}</div>` : ''}</div></div>`;
      }).join('');
      return { title: t.title, html: topBar(`${_t('首页')} » <a href="/board.asp?id=${t.board}">${esc(b ? b.name : t.board)}</a> ${_t('» 帖子 #')}${t.id}`) + `<div class="wrap">${isDel(t) ? ('<div class="delbar">' + _t('【该帖已被站务删除，仅管理员可见】') + (t.deletedAt ? '　删除记录：' + esc(t.deletedAt) : '') + '</div>') : ''}<h2>${esc(strip(t.title))}</h2>${posts}</div>`, source: t.source || '', srcFlag: 'source_t' + t.id, onSource: t.onSource };
    }
    if (path === '/user.asp') {
      const us = uName(P.id);
      if (!us) return errPage(_t('用户不存在。'));
      const publicThreads = visibleThreads();
      const ts = publicThreads.filter(t => t.author === us.id).sort((a, b) => b.date.localeCompare(a.date));

      const node = h('div', { html: topBar(`${_t('首页')} » ${_t('成员列表')} » ${esc(us.nick)}`) + `<div class="wrap"><table class="t"><tr><th colspan="2">${_t('用户资料：')}${esc(us.nick)}（${esc(us.id)}）</th></tr><tr><td width="90">${_t('昵称')}</td><td>${esc(us.nick)}</td></tr><tr><td>${_t('性别')}</td><td>${esc(us.gender || '-')}</td></tr><tr><td>${_t('头衔')}</td><td>${esc(us.title || '-')}</td></tr><tr><td>${_t('注册时间')}</td><td>${esc(us.reg || '')}</td></tr><tr><td>${_t('最后登录')}</td><td>${esc(us.lastLogin || '')}</td></tr><tr><td>${_t('发帖数')}</td><td>${us.posts || 0}</td></tr><tr><td>${_t('个人介绍')}</td><td>${esc(us.intro || '')}</td></tr><tr><td>${_t('签名档')}</td><td>${esc(us.sig || '')}</td></tr></table><h2>${_t('TA 的帖子（')} ${ts.length} ${_t('篇）')}</h2><ul style="padding-left:18px;margin:0">${ts.map(t => `<li><a href="/thread.asp?id=${t.id}">${esc(strip(t.title))}</a> <span style="color:#888">${esc(t.date)}</span></li>`).join('') || _t('<li>无</li>')}</ul></div>` });
      const replies = [];
      for (const thread of publicThreads) {
        if (thread.author === us.id || (thread.lock && !solved(thread.lock))) continue;
        const floor = thread.posts.findLastIndex(post => post.author === us.id);
        if (floor > 0) replies.push({ thread, floor, date: thread.posts[floor].date });
      }
      if (replies.length) {
        replies.sort((a, b) => b.date.localeCompare(a.date));
        const list = h('ul', { class: 'bbs-replies', style: { paddingLeft: '18px', margin: '0' } });
        for (const { thread, floor, date } of replies) {
          list.append(h('li', {}, h('a', { href: '/thread.asp?id=' + thread.id + '#floor-' + floor, text: strip(thread.title) }),
            h('span', { text: '　' + floor + ' 楼 · ' + date, style: { color: '#666' } })));
        }
        node.querySelector('.wrap').append(h('h2', { text: '回过的主题（' + replies.length + ' 篇）' }), list);
      }
      const extras = D.userExtras.filter(x => x.user === us.id && test(x.requires));
      if (extras.length) {
        const ux = h('div', { class: 'ux' }); const out = h('div');
        extras.forEach(x => ux.append(controlButton({ class: 'b98', text: x.label }, () => markInteraction() || withLock(x.lock, () => { opened(x.id, x.onOpen); out.innerHTML = ''; out.append(h('div', { class: 'uxbox', html: fmt(x.html) })); }))));
        node.querySelector('.wrap').append(ux, out);
      }
      return { title: _t('用户资料 - ') + us.nick, node };
    }
    if (path === '/users.asp') {
      const columns = [['nick', '昵称'], ['id', 'ID'], [null, '头衔'], ['posts', '发帖'], ['reg', '注册'], ['lastLogin', '最后登录']];
      const order = columns.find(([key]) => key && key === P.sort)?.[0];
      const defaultDesc = key => key === 'posts' || key === 'lastLogin';
      const desc = P.dir === 'asc' ? false : P.dir === 'desc' || defaultDesc(order);
      const members = D.users.filter(user => test(user.requires));
      if (order) {
        const collator = new Intl.Collator('zh-CN', { numeric: true });
        members.sort((a, b) => {
          const comparison = order === 'posts' ? (a.posts || 0) - (b.posts || 0)
            : collator.compare(a[order] || '', b[order] || '');
          return (desc ? -comparison : comparison) || collator.compare(a.id, b.id);
        });
      }
      const headings = columns.map(([key, label]) => {
        if (!key) return `<th scope="col">${_t(label)}</th>`;
        const active = key === order;
        const next = (active ? !desc : defaultDesc(key)) ? 'desc' : 'asc';
        const aria = active ? ` aria-sort="${desc ? 'descending' : 'ascending'}"` : '';
        return `<th scope="col"${aria}><a data-member-sort="${key}" href="/users.asp?sort=${key}&amp;dir=${next}">${_t(label)}</a></th>`;
      }).join('');
      const rows = members.map(x => `<tr><td>${uLink(x.id)}</td><td>${esc(x.id)}</td><td>${esc(x.title || '')}</td><td>${x.posts || 0}</td><td>${esc((x.reg || '').slice(0, 10))}</td><td>${esc(x.lastLogin || '')}</td></tr>`).join('');
      return { title: _t('成员列表'), html: topBar(`${_t('首页')} ${_t('» 成员列表')}`) + `<div class="wrap"><table class="t member-list"><thead><tr>${headings}</tr></thead><tbody>${rows}</tbody></table></div>` };
    }
    if (path === '/search.asp') {
      const q = (P.q || '').trim();
      const node = h('div', { html: topBar(`${_t('首页')} ${_t('» 搜索')}`) });
      const wrap = h('div', { class: 'wrap' });
      const inp = h('input', { id: win.el.id + '-bbsq', value: q, class:'f98', enterkeyhint:'search' });
      const go = () => ieGo(win, 'http://' + (D.bbsMeta.host || '192.168.1.103') + '/search.asp?q=' + encodeURIComponent(inp.value.trim()));
      inp.onkeydown = (e) => { if (confirmInput(e)) go(); };
      wrap.append(h('div', {class:'bbs-search-fields'}, h('label', {for: inp.id, text:'搜索帖子标题和内容'}), inp, controlButton({ class:'b98', text:_t('搜索') }, go)));
      if (q) {
        const res = [], query = q.toLowerCase();
        visibleThreads().forEach(t => {
          const title = strip(fmt(t.title)), posts = t.posts.map(x => strip(fmt(x.html)));
          const hitTitle = title.toLowerCase().includes(query);
          const floor = posts.findIndex(post => post.toLowerCase().includes(query));
          if (hitTitle || floor >= 0) res.push({ t, title, floor:hitTitle ? 0 : floor, snip:posts[floor] || title });
        });

        const highlight = value => {
          const pos = value.toLowerCase().indexOf(query);
          if (pos < 0) return esc(value);
          return esc(value.slice(0, pos)) + '<mark class="hl">' + esc(value.slice(pos, pos + q.length)) + '</mark>' + esc(value.slice(pos + q.length));
        };
        wrap.append(h('p', {role:'status', text: res.length ? '找到 ' + res.length + ' 个主题' : '没有找到“' + q + '”。试试标题或正文里的短词。'}));
        for (const {t, title, floor, snip} of res) {
          const start = Math.max(0, snip.toLowerCase().indexOf(query) - 20);
          const excerpt = (start ? '…' : '') + highlight(snip.slice(start, start + 70)) + (start + 70 < snip.length ? '…' : '');
          const anchor = floor > 0 ? '#floor-' + floor : '';
          const result = h('p', {}, h('a', {href:'/thread.asp?id=' + t.id + anchor, html:highlight(title)}),
            h('small', {text:'　' + t.date + ' · ' + (USER[t.author]?.nick || t.author)}),
            h('br'), h('span', {html:excerpt}));
          wrap.append(result);
        }
      }
      node.append(wrap);
      return { title: _t('搜索'), node };
    }
    if (path.startsWith('/admin')) return adminRoute(path, P, win);
    return errPage();
  }
  function lockPage(lock, win, title) {
    const node = h('div', { html: topBar('') });
    const f = h('div', { class: 'form' }, h('b', { text: _t('此页面需要密码') }), puzzleForm(lock, { onSolved: () => win.refresh(true) }));
    node.append(f);
    return { title: title || _t('需要密码'), node };
  }
  function adminRoute(path, P, win) {
    if(!bbsArchiveReady())return {title:'未收录站务管理文件',html:topBar('')+'<div class="err"><h1>此副本未收录站务管理文件</h1><p>当前载入的是公开网页光盘。没有可运行的后台程序，也没有站内信或登录日志。</p><p><a href="/">返回公开首页</a></p></div>'};
    const id = D.bbsMeta.adminPuzzle || 'c1_admin';
    const host = D.bbsMeta.host || '192.168.1.103';
    if (!D.puzzles[id] || !solved(id)) {
      const node = h('div', { html: topBar(`${_t('首页')} ${_t('» 站务管理')}`) });
      node.append(h('div', { class: 'form' }, D.puzzles[id] ? puzzleForm(id, { submitLabel: _t('登录'), wrongText: _t('密码错误。'), onSolved: () => win.refresh(true) }) : h('div', { text: _t('（暂不可用）') })));
      return { title: _t('站务管理登录'), node };
    }
    const sec = D.adminSections;
    const nav = `<div class="crumb admin"><b>${_t('站务管理')}</b>　${test(sec.recycle) ? _t('<a href="/admin/recycle.asp">回收站</a>　') : ''}${test(sec.logs) ? _t('<a href="/admin/log.asp">登录日志</a>　') : ''}${test(sec.users) ? _t('<a href="/admin/users.asp">用户管理</a>　') : ''}${test(sec.mails) ? _t('<a href="/admin/mail.asp">站内信</a>　') : ''}<span style="color:#888">${_t('已登录：sysop')}</span></div>`;
    const head = topBar('') + nav;
    if (path === '/admin' || path === '/admin/' || path === '/admin/index.asp') return { title: _t('站务管理'), html: head + `<div class="wrap"><p>${_t('欢迎回来，站长。')}</p><p style="color:#666">${(D.bbsMeta.software || 'NTBBS 2.0') + _t(' 管理后台。请从上方选择功能。')}</p></div>` };
    if (path === '/admin/recycle.asp' && test(sec.recycle)) {
      const ts = D.threads.filter(t => t.deleted && test(t.requires));
      const rows = ts.map(t => `<tr><td>${t.id}</td><td><a href="/thread.asp?id=${t.id}">${esc(strip(t.title))}</a></td><td>${esc(t.author)}</td><td>${esc(t.date)}</td><td>${esc(t.ip || '')}</td><td>${esc(t.deletedAt || '')}</td></tr>`).join('') || _t('<tr><td colspan="6">回收站为空。</td></tr>');
      return { title: _t('回收站'), html: head + `<div class="wrap"><table class="t"><tr><th>${_t('编号')}</th><th>${_t('标题')}</th><th>${_t('作者')}</th><th>${_t('发表时间')}</th><th>${_t('发帖 IP')}</th><th>${_t('删除时间')}</th></tr>${rows}</table></div>` };
    }
    if (path === '/admin/log.asp' && test(sec.logs)) {
      const all = D.loginLog.filter(l => test(l.requires));
      const fu = (P.user || '').trim(), fd = (P.date || '').trim(), order = P.order === 'asc' ? 'asc' : 'desc';
      let rows = all.filter(l => (!fu || l.user.toLowerCase() === fu.toLowerCase()) && (!fd || l.time.startsWith(fd)));
      rows.sort((a, b) => order === 'asc' ? a.time.localeCompare(b.time) : b.time.localeCompare(a.time));
      for (const row of rows.slice(0, 400)) if (row.receipt) opened(row.receipt);
      const node = h('div', { html: head });
      const wrap = h('div', { class: 'wrap' });
      const iu = h('input', { value: fu, placeholder: _t('用户 ID'), style: { width: '100px', font: 'inherit' } });
      const id2 = h('input', { value: fd, placeholder: _t('日期，如 2000-01-01'), style: { width: '150px', font: 'inherit' } });
      const go = (o) => ieGo(win, `http://${host}/admin/log.asp?user=${encodeURIComponent(iu.value.trim())}&date=${encodeURIComponent(id2.value.trim())}&order=${o || order}`);
      iu.onkeydown = id2.onkeydown = (e) => { if (confirmInput(e)) go(); };
      wrap.append(h('div', { style: { margin: '4px 0 8px', display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' } }, _t('筛选：'), iu, id2, controlButton({ class: 'b98', text: _t('筛选') }, () => go()), controlButton({ class: 'b98', text: order === 'desc' ? _t('改为从旧到新') : _t('改为从新到旧') }, () => go(order === 'desc' ? 'asc' : 'desc')), h('span', { style: { color: '#666' }, text: `${_t('共')} ${rows.length} ${_t('条（时间为服务器时间）')}` })));
      wrap.append(h('div', { html: `<table class="t"><tr><th>${_t('时间')}</th><th>${_t('用户')}</th><th>IP</th><th>${_t('机器名')}</th></tr>${rows.slice(0, 400).map(l => `<tr><td>${esc(l.time)}</td><td>${esc(l.user)}</td><td>${esc(l.ip || '')}</td><td>${esc(l.host || '')}</td></tr>`).join('') || _t('<tr><td colspan="4">没有记录。</td></tr>')}</table>` }));
      node.append(wrap);
      return { title: _t('登录日志'), node };
    }
    if (path === '/admin/users.asp' && test(sec.users)) {
      const rows = D.users.filter(x => test(x.requires)).map(x => `<tr><td>${esc(x.id)}</td><td>${esc(x.nick)}</td><td>******</td><td>${esc(x.reg || '')}</td><td>${esc(x.lastLogin || '')}</td><td>${x.posts || 0}</td></tr>`).join('');
      return { title: _t('用户管理'), html: head + `<div class="wrap"><p style="color:#666">${(D.bbsMeta.software || 'NTBBS 2.0') + _t(' 起密码加密存储，后台不再显示明文。')}</p><table class="t"><tr><th>ID</th><th>${_t('昵称')}</th><th>${_t('密码')}</th><th>${_t('注册时间')}</th><th>${_t('最后登录')}</th><th>${_t('发帖')}</th></tr>${rows}</table></div>` };
    }
    if (path === '/admin/mail.asp' && test(sec.mails)) {
      const all = D.mails.filter(m => test(m.requires));
      if (P.id) {
        const m = all.find(x => x.id === P.id);
        if (!m) return errPage(_t('信件不存在。'));
        opened(m.id, m.onOpen);
        return { title: _t('站内信'), html: head + `<div class="wrap"><p><a href="/admin/mail.asp?sort=${esc(P.sort || '')}${_t('">« 返回站内信列表')}</a></p><table class="t"><tr><th colspan="2">${esc(strip(m.subject || _t('（无主题）')))}</th></tr><tr><td width="80">${_t('发信人')}</td><td>${esc(m.from)}（${esc(USER[m.from] ? USER[m.from].nick : '')}）</td></tr><tr><td>${_t('收信人')}</td><td>${esc(m.to)}（${esc(USER[m.to] ? USER[m.to].nick : '')}）</td></tr><tr><td>${_t('发信时间')}</td><td>${esc(m.date)}</td></tr><tr><td colspan="2" style="padding:12px;font-size:13px;line-height:1.9">${fmt(m.body)}</td></tr></table></div>` };
      }
      const sort = P.sort || 'date_desc';
      const [k, dir] = sort.split('_');
      const key = { date: (m) => m.date, from: (m) => m.from.toLowerCase(), to: (m) => m.to.toLowerCase() }[k] || ((m) => m.date);
      const rows = all.slice().sort((a, b) => { const r = key(a).localeCompare(key(b)) || a.date.localeCompare(b.date); return dir === 'asc' ? r : -r; });
      const th = (kk, label) => { const cur = k === kk; const nd = cur && dir === 'desc' ? 'asc' : 'desc'; return `<th class="s"><a style="color:#fff" href="/admin/mail.asp?sort=${kk}_${nd}">${label}${cur ? (dir === 'desc' ? ' ▼' : ' ▲') : ''}</a></th>`; };
      return { title: _t('站内信'), html: head + `<div class="wrap"><p style="color:#666">${_t('全站站内信')} ${rows.length} ${_t('封。点击表头可以排序。')}</p><table class="t"><tr>${th('from', _t('发信人'))}${th('to', _t('收信人'))}<th>${_t('主题')}</th>${th('date', _t('发信时间'))}</tr>${rows.map(m => `<tr><td>${esc(m.from)}</td><td>${esc(m.to)}</td><td><a href="/admin/mail.asp?id=${encodeURIComponent(m.id)}&sort=${sort}">${esc(strip(m.subject || _t('（无主题）')))}</a>${S.opened[m.id] ? '' : ' <span style="color:#c00">•</span>'}</td><td>${esc(m.date)}</td></tr>`).join('')}</table></div>` };
    }
    return errPage();
  }

  // ============================================================
  // 渲染总入口
  // ============================================================
  function refreshWins(force) { wins.forEach(w => { if (w.o.live || force) w.refresh(); }); }
  function renderAll() {
    if (!S || awaitingPuzzleFeedback()) return;
    const brand = $('.brand');
    if (brand) brand.textContent = playerText(_t('老K工作室 · 读盘机'));
    renderPhone();
    if (S.stage === 'win' && $('#desktop')) {
      if (renderedFlagVer !== flagVer) { renderedFlagVer = flagVer; renderIcons(); refreshWins(); }
      renderTray();
    }
  }

  // ============================================================
  // 启动
  // ============================================================
  // ============================================================
  // 二代：还原点时间轴、文件比较、十七户名单、寄出
  // ============================================================
  // 还原点：D.snapshots = [{ id, label, date, cut, requires, desc }]，cut 之后的文件和帖子在该时间点不存在。
  // 文件或帖子写 snaps: ['RP101'] 时只在这些时间点出现；同一路径可以放几个版本。
  function snapList() { return (D.snapshots && D.snapshots.length) ? D.snapshots : [{ id: 'cur', label: _t('当前'), date: '' }]; }
  function curSnap() { const id = (S && S.snap) || 'cur'; return snapList().find(x => x.id === id) || snapList()[0]; }
  function snapOK(o) {
    const id = (S && S.snap) || 'cur';
    if (o.snaps) return o.snaps.includes(id);
    const c = curSnap();
    return !c.cut || !o.date || String(o.date) <= c.cut;
  }
  function isDel(t) { return !!t.deleted && !(t.listedIn || []).includes((S && S.snap) || 'cur'); }
  function snapTag() { const c = curSnap(); return c.id === 'cur' ? '' : `　[${c.id} · ${c.date}]`; }
  function setSnap(id) {
    const c = snapList().find(x => x.id === id); if (!c) return;
    S.snap = id; setFlag('visited_' + id);
    flagVer++; refreshWins(true); renderIcons(); renderTray(); renderSnapBanner();
    toast(id === 'cur' ? _t('已回到当前状态。') : `${_t('已挂载只读快照')} ${c.id}（${c.date}）`, 'good');
    dirty();
  }
  function renderSnapBanner() {
    const dk = $('#desktop'); if (!dk) return;
    let b = dk.querySelector('.snapbanner');
    const c = curSnap();
    if (c.id === 'cur') { if (b) b.remove(); dk.classList.remove('snapmode'); return; }
    dk.classList.add('snapmode');
    if (!b) { b = h('button', { class: 'snapbanner', type: 'button', onclick: () => openRestore() }); dk.append(b); }
    b.innerHTML = `<b>${esc(c.id)}</b> · ${esc(c.date)} · ${esc(_t('只读快照'))}<span>${esc(_t('点此切换'))}</span>`;
  }
  function openRestore() {
    openWin({ key: 'restore', title: _t('系统还原'), icon: 'restore', w: 560, h: 440, bodyClass: 'out', live: true, render: (win) => {
      const list = snapList().filter(x => test(x.requires));
      const box = h('div', { class: 'restore' },
        h('div', { class: 'restore-head' }, h('b', { text: _t('还原点') }), h('p', { text: _t('挂载方式：只读') })));
      const ul = h('div', { class: 'restore-list' });
      list.forEach(x => {
        const on = ((S.snap || 'cur') === x.id);
        ul.append(h('button', { class: 'restore-row' + (on ? ' on' : ''), type: 'button', onclick: () => { setSnap(x.id); win.refresh(true); } },
          h('span', { class: 'rd', text: on ? '◉' : '○' }),
          h('span', { class: 'rdate', text: x.date || '' }),
          h('span', { class: 'rid', text: x.id === 'cur' ? _t('当前') : x.id }),
          h('span', { class: 'rdesc', text: x.desc || '' }),
          S.flags['visited_' + x.id] || x.id === 'cur' ? null : h('span', { class: 'newtag', text: _t('新') })));
      });
      box.append(ul);
      win.body.append(box);
      win.status.append(h('div', { text: `${_t('当前挂载：')}${curSnap().id === 'cur' ? _t('当前') : curSnap().id}` }));
    } });
  }

  // 文件比较：任选两份已经读过的文本资料（各个时间点的版本各算一份），按行对照差异
  function cmpText(f) {
    if (f.cmpText != null) return String(f.cmpText);
    if (f.text != null) return String(f.text);
    if (f.html != null) return strip(String(f.html).replace(/<br\s*\/?>/gi, '\n').replace(/<\/(p|div|tr|li|h\d)>/gi, '\n'));
    if (f.tape) return String((f.tape.speeds || {})['1'] || '');
    return '';
  }
  function cmpLabel(f) {
    const snap = f.snaps ? f.snaps.join('/') : (f.ver || _t('当前'));
    return `${nameOf(f.path)}　[${snap}]`;
  }
  function cmpDocs() { return D.files.filter(f => f.id && S.opened[f.id] && f.type !== 'folder' && f.type !== 'zip' && f.type !== 'exe' && cmpText(f).trim()); }
  function diffLines(a, b, sourceA = a, sourceB = b) {
    const A = a.split('\n'), B = b.split('\n'), n = A.length, m = B.length;
    const rawA = sourceA.split('\n'), rawB = sourceB.split('\n');
    const L = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
    for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) L[i][j] = A[i] === B[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
    const rows = []; let i = 0, j = 0, hunk = null, hid = 0;
    const flush = () => { if (hunk) { rows.push(hunk); hunk = null; } };
    while (i < n || j < m) {
      if (i < n && j < m && A[i] === B[j]) { flush(); rows.push({ eq: true, l: A[i], r: B[j] }); i++; j++; }
      else {
        hunk = hunk || { id: hid++, l: [], r: [], source: [] };
        if (j < m && (i >= n || L[i][j + 1] >= L[i + 1][j])) { hunk.r.push(B[j]); hunk.source.push(rawB[j] || ''); j++; } else { hunk.l.push(A[i]); hunk.source.push(rawA[i] || ''); i++; }
      }
    }
    flush();
    return rows;
  }
  function markPuzzlesFor(lid, rid) {
    return Object.entries(D.puzzles).filter(([id, p]) => p.kind === 'mark' && !solved(id) && test(p.requires) && p.pair && p.pair.includes(lid) && p.pair.includes(rid) && lid !== rid);
  }
  function renderCallComparison(win, left, right, fileLabel, active) {
    const st = win.state, minutes = new Map();
    for (const [side, file] of [[0, left], [1, right]]) {
      for (const line of cmpText(file).split('\n')) {
        const match = /^(\d{4}-\d{2}-\d{2} \d{2}:\d{2})\s+(.+)$/.exec(line);
        if (!match) continue;
        if (!minutes.has(match[1])) minutes.set(match[1], [[], []]);
        minutes.get(match[1])[side].push(match[2]);
      }
    }
    const selected = new Set(st.callSelections || []);
    const table = h('table', { class: 'cmp call-compare', role: active ? 'grid' : null, 'aria-multiselectable': active ? 'true' : null });
    table.append(h('thead', {}, h('tr', {}, h('th', { scope: 'col', class: 'call-time', text: '时间' }),
      h('th', { scope: 'col', text: nameOf(parentOf(left.path)), title: fileLabel(left) }),
      h('th', { scope: 'col', text: nameOf(parentOf(right.path)), title: fileLabel(right) }))));
    const rows = [];
    const status = h('div', { role: 'status' }), body = h('tbody');
    let submit, day;
    function updateSelection() {
      for (const { key, row } of rows) {
        row.classList.toggle('sel', selected.has(key));
        if (active) row.setAttribute('aria-selected', String(selected.has(key)));
      }
      if (submit) submit.disabled = !selected.size;
      status.textContent = active ? '已选 ' + selected.size + ' 条通话记录' : '已按两部手机的记录时间排列';
    }
    for (const time of [...minutes.keys()].sort()) {
      const [a, b] = minutes.get(time), date = time.slice(0, 10);
      if (date !== day) {
        day = date;
        body.append(h('tr', {}, h('th', { colspan: 3, class: 'call-day', text: date })));
      }
      // 一部手机可能在同一分钟拨了两通电话，分别保留两行。
      for (let i = 0; i < Math.max(a.length, b.length); i++) {
        const key = time + '/' + i;
        const source = [a[i], b[i]].filter(Boolean).map(entry => time + '　' + entry).join('\n');
        const row = h('tr', { class: active ? 'hunk' : '', tabindex: active ? 0 : null, 'data-time': time, 'data-h': rows.length, 'data-source': source },
          h('td', { class: 'call-time', text: time.slice(11) }), h('td', { text: a[i] || '' }), h('td', { text: b[i] || '' }));
        if (active) {
          const select = () => {
            if (selected.has(key)) selected.delete(key); else selected.add(key);
            st.callSelections = [...selected]; st.msg = ''; win.top.querySelector('.cmp-msg')?.remove();
            updateSelection();
          };
          bindControl(row, select);
          row.onkeydown = e => { if (confirmInput(e) || e.key === ' ') { e.preventDefault(); select(); } };
        }
        rows.push({ key, time, row }); body.append(row);
      }
    }
    if (active) {
      const [id, puzzle] = active, hints = puzzleHints(id, puzzle);
      submit = controlButton({ class: 'b98', type: 'button', text: '核对所选记录' }, () => {
        markInteraction();
        const times = rows.filter(row => selected.has(row.key)).map(row => row.time);
        if (times.length === puzzle.callLogMarks.length && puzzle.callLogMarks.every(t => times.includes(t))) {
          st.msg = puzzle.solvedText; st.puzzle = null; solvePuzzle(id);
        } else {
          sfx('err'); st.msg = '再看米乐最后一次回拨的时间和她打给一鸣的时间。把这中间孟凡拨出的每一通都选上。';
        }
        win.refresh(true);
      });
      win.top.append(h('div', { class: 'cmp-task' }, h('b', { text: puzzle.title }), h('div', { html: fmt(puzzle.prompt) }),
        hints.box, h('div', { class: 'row' }, hints.button, submit)));
    }
    if (st.msg) win.top.append(h('div', { class: 'cmp-msg', role: 'status', html: fmt(st.msg) }));
    table.append(body); win.body.append(h('div', { class: 'cmp-wrap' }, table));
    win.status.append(status); updateSelection();
  }
  function openCompare(opts = {}) {
    const ex = wins.find(w => w.key === 'compare');
    const task = D.puzzles[opts.puzzle];
    const pair = task?.callLogMarks && test(task.requires) ? task.pair : null;
    if (ex) {
      if (opts.puzzle) {
        ex.state.puzzle = opts.puzzle;
        if (pair && !(pair.includes(ex.state.l) && pair.includes(ex.state.r) && ex.state.l !== ex.state.r)) {
          [ex.state.l, ex.state.r] = pair;
          ex.state.sel = null;
          ex.state.callSelections = [];
          ex.state.msg = '';
        }
      }
      if (opts.left && opts.left !== ex.state.l) {
        ex.state.l = opts.left;
        ex.state.sel = null;
        ex.state.callSelections = [];
        ex.state.msg = '';
      }
      focusWin(ex); ex.refresh(true); return;
    }
    openWin({ key: 'compare', title: _t('文件比较'), icon: 'compare', w: 980, h: 660, bodyClass: 'out', live: true, state: { l: opts.left || pair?.[0] || '', r: pair?.[1] || '', sel: null, callSelections: [], puzzle: opts.puzzle || null, msg: '' }, render: renderCompare });
  }
  function renderCompare(win) {
    const st = win.state, docs = cmpDocs();
    const fileLabel = file => {
      const label = cmpLabel(file);
      const sameName = docs.some(other => other.id !== file.id && nameOf(other.path) === nameOf(file.path));
      return file.evidenceOwner || sameName ? nameOf(parentOf(file.path)) + ' · ' + label : label;
    };
    docs.sort((a, b) => fileLabel(a).localeCompare(fileLabel(b), 'zh-CN', { numeric: true, sensitivity: 'base' }));
    const pick = (key) => {
      const s = h('select', { class: 'f98 cmp-sel', id: 'cmp_' + key, 'aria-label': key === 'l' ? _t('左侧文件') : _t('右侧文件') }, h('option', { value: '', text: _t('— 选择一份已读过的资料 —') }));
      docs.forEach(f => s.append(h('option', { value: f.id, text: fileLabel(f), selected: st[key] === f.id })));
      s.onchange = () => { st[key] = s.value; st.sel = null; st.callSelections = []; st.msg = ''; win.refresh(true); };
      return bindTouchSelect(s, win);
    };
    win.top.append(h('div', { class: 'cmp-pick' }, h('label', { text: _t('左：') }), pick('l'), h('label', { text: _t('右：') }), pick('r')));
    const P = st.puzzle && D.puzzles[st.puzzle] && !solved(st.puzzle) && test(D.puzzles[st.puzzle].requires) ? [st.puzzle, D.puzzles[st.puzzle]] : null;
    const L = D.files.find(f => f.id === st.l), R = D.files.find(f => f.id === st.r);
    const body = win.body;
    const active = P || (L && R ? markPuzzlesFor(L.id, R.id)[0] : null);
    const matches = active && L && R && L.id !== R.id && active[1].pair.includes(L.id) && active[1].pair.includes(R.id);
    const callPair = L && R && L.id !== R.id && Object.values(D.puzzles).find(p =>
      p.callLogMarks && test(p.requires) && p.pair.includes(L.id) && p.pair.includes(R.id));
    if (callPair && (!active || matches)) return renderCallComparison(win, L, R, fileLabel, active);
    let submit;
    if (active) {
      const [pid, p] = active;
      const hints = puzzleHints(pid, p);
      submit = h('button', { class: 'b98', type: 'button', text: _t(p.callLogMarks ? '核对所选记录' : '提交选中的差异'), disabled: !(matches && st.sel != null), onclick: () => {
        const rows = diffLines(cmpText(L), cmpText(R), L.sourceText, R.sourceText), hk = rows.find(x => !x.eq && x.id === st.sel);
        const text = hk ? hk.source.join('\n') : '';
        const want = [].concat(p.mark);
        markInteraction();
        if (want.some(w => text.includes(w))) { st.msg = p.solvedText || _t('就是这一处。'); solvePuzzle(pid); st.puzzle = null; }
        else { sfx('err'); st.msg = (p.near && Object.entries(p.near).find(([k]) => text.includes(k)) || [0, _t('这处改动跟要查的事无关，再看看别的行。')])[1]; }
        win.refresh(true);
      } });
      const ban = h('div', { class: 'cmp-task' },
        h('div', { class: 'k', text: _t('待核对') }), h('b', { text: p.title }), h('div', { html: fmt(p.prompt || '') }), hints.box,
        h('div', { class: 'row' }, hints.button, submit),
        st.msg ? h('div', { class: 'cmp-msg', html: fmt(st.msg) }) : null);
      win.top.append(ban);
    } else if (st.msg) win.top.append(h('div', { class: 'cmp-msg', html: fmt(st.msg) }));
    if (!L || !R) {
      const panes = h('div', {class:'cmp-preview'});
      for (const [label, file] of [['左侧文件', L], ['右侧文件', R]]) {
        panes.append(h('section', {}, h('div', {class:'out cmp-preview-heading', text:file ? fileLabel(file) : label}),
          file ? h('pre', {class:'note', text:cmpText(file)}) : h('div', {class:'empty98', text:'尚未选择文件'})));
      }
      body.append(panes);
      win.status.append(h('div', { text:docs.length + ' 份可比较的资料' }));
      return;
    }
    const rows = diffLines(cmpText(L), cmpText(R), L.sourceText, R.sourceText);
    const hunks = rows.filter(x => !x.eq);
    const tb = h('table', { class: 'cmp' });
    const status = h('div', { role: 'status' });
    function updateSelection() {
      for (const row of tb.querySelectorAll('.hunk')) {
        const selected = Number(row.dataset.h) === st.sel;
        row.classList.toggle('sel', selected);
        if (row.tabIndex === 0) row.setAttribute('aria-current', String(selected));
      }
      if (submit) submit.disabled = !(matches && st.sel != null);
      const selected = hunks.find(x => x.id === st.sel);
      if (selected) {
        const kind = selected.l.length && selected.r.length ? '改动' : selected.l.length ? '只在左侧' : '只在右侧';
        status.textContent = `${_t('已选中')} ${hunks.indexOf(selected) + 1} / ${hunks.length}　${_t(kind)}`;
      } else {
        status.textContent = hunks.length ? `${_t('差异')} ${hunks.length} ${_t('处')}　${_t('黄色：改动　红色：只在左侧　绿色：只在右侧　单击选中一处')}` : _t('两份资料内容相同。');
      }
    }
    tb.append(h('tr', {}, h('th', { text: fileLabel(L) }), h('th', { text: fileLabel(R) })));
    rows.forEach(x => {
      if (x.eq) { tb.append(h('tr', {}, h('td', { text: x.l }), h('td', { text: x.r }))); return; }
      const n = Math.max(x.l.length, x.r.length), cls = x.l.length && x.r.length ? 'chg' : x.l.length ? 'del' : 'add';
      for (let k = 0; k < n; k++) {
        const tr = h('tr', { class: 'hunk ' + cls, tabindex: k === 0 ? 0 : null, 'data-h': x.id, 'data-source': x.source.join('\n') },
          h('td', { text: x.l[k] != null ? x.l[k] : '' }), h('td', { text: x.r[k] != null ? x.r[k] : '' }));
        const selectDifference = () => {
          st.sel = x.id;
          st.msg = '';
          win.top.querySelector('.cmp-msg')?.remove();
          updateSelection();
        };
        bindControl(tr, selectDifference);
        tr.onkeydown = e => {
          if (confirmInput(e) || e.key === ' ') { e.preventDefault(); selectDifference(); }
        };
        tb.append(tr);
      }
    });
    body.append(h('div', { class: 'cmp-wrap' }, tb));
    win.status.append(status);
    updateSelection();
  }

  // 十七户名单：每户要挂上两份能对得上的原件才算确认
  const hhOpen = () => !!(D.households && D.households.length && test(D.hhRequires || 'ch2'));
  const hhVisible = () => (D.households || []).filter(x => test(x.requires));
  const hhState = (id) => (S.hh[id] = S.hh[id] || { ok: false, tries: 0, called: false });
  function hhPending() { return hhOpen() ? hhVisible().filter(x => !hhState(x.id).ok && x.sources.filter(s => S.flags['seen_' + s]).length >= 2).length : 0; }
  function hhPool() {
    const ids = new Set(); (D.households || []).forEach(x => x.sources.forEach(s => ids.add(s))); (D.hhDistractors || []).forEach(s => ids.add(s));
    return [...ids].filter(id => S.flags['seen_' + id]).map(id => ({ id, label: hhSourceLabel(id) }));
  }
  function hhSourceLabel(id) {
    const clip = ((D.footage || {}).clips || []).find(c => c.id === id); if (clip) return `${_t('录像')} ${clip.date}《${clip.title}》`;
    const f = D.files.find(x => x.id === id); if (f) return cmpLabel(f);
    if (/^t\d+$/.test(id)) { const t = THREAD[+id.slice(1)]; return t ? `${_t('论坛帖')} #${t.id}《${strip(t.title)}》` : id; }
    const it = ITEM[id]; if (it) return `${_t('物品')}：${strip(it.name)}`;
    const m = MAIL26[id]; if (m) return `${_t('邮件')}：${strip(m.subject)}`;
    const w = (D.web || []).find(p => p.id === id); if (w) return `网页：${strip(fmt(w.title))}`;
    const g = D.gxLogs.find(l => l.id === id); if (g) return `鸽讯 ${g.date}（${gxDisplayName(D.gxContacts.find(c => c.id === g.contact))}）`;
    return id;
  }
  function renderHouseholds(title, body) {
    const list = hhVisible(), ok = list.filter(x => hhState(x.id).ok).length;
    title(_t('名单'), `B17 · ${ok} / ${(D.households || []).length} ${_t('户已确认')}`);
    body.append(h('div', { class: 'ph-card done', html: _t('每一户都要两份互相独立、能对得上的原件才算确认。点开一户，挂上你认为说的是同一户的两份资料。') }));
    if (S.flags.c6_sendout && !S.flags.sent_done) body.append(h('button', { class: 'ph-btn pri', style: { width: '100%', margin: '6px 0 10px' }, text: _t('打开「寄出」'), onclick: openSendOut }));
    list.forEach(x => {
      const s = hhState(x.id);
      const card = h('div', { class: 'ph-card hh' + (s.ok ? ' ok' : '') });
      card.append(h('div', { class: 'k', text: x.id + (s.ok ? '' : ' · ' + _t('未确认')) }));
      if (!s.ok) {
        card.append(h('div', { html: fmt(x.clue || _t('名册上只剩一个编号。')) }), h('button', { class: 'ph-btn sm', text: _t('挂上原件核对'), onclick: () => hhAttach(x) }));
      } else {
        card.append(h('div', { style: { fontWeight: 600 }, html: fmt(x.name + (x.addr ? '　<span class="faded">' + x.addr + '</span>' : '')) }));
        (x.facts || []).filter(fc => test(fc.requires)).forEach(fc => card.append(h('div', { class: 'hh-fact', html: fmt(fc.text) })));
        const consent = s.called ? x.call.consent : null;
        if (x.call && test(x.call.requires) && !s.called) card.append(h('button', { class: 'ph-btn sm', text: _t('2026 年回访'), onclick: () => hhCall(x) }));
        if (s.called) card.append(h('div', { class: 'hh-fact', html: fmt(x.call.result || '') }), h('div', { class: 'hh-tag ' + (consent ? 'yes' : 'no'), text: consent ? _t('同意公开姓名') : _t('不同意公开姓名') }));
        else if (!x.call) card.append(h('div', { class: 'hh-tag', text: _t('无法回访：没有本人意见') }));
      }
      body.append(card);
    });
  }
  function hhAttach(x) {
    const pool = hhPool(), m = modalRoot(); m.innerHTML = '';
    const chosen = new Set();
    const msg = h('div', { class: 'msg' });
    const listBox = h('div', { class: 'opts' });
    if (!pool.length) listBox.append(h('div', { class: 'faded', text: _t('还没有读过能用来核对名单的原件。') }));
    pool.forEach(o => {
      const cb = h('input', { type: 'checkbox', id: 'hh_' + o.id });
      cb.onchange = () => { if (cb.checked) chosen.add(o.id); else chosen.delete(o.id); };
      listBox.append(h('label', {}, cb, h('span', { text: o.label })));
    });
    const dlg = h('div', { class: 'dlg98 dlgph', role: 'dialog' },
      h('div', { class: 'titlebar' }, h('span', { class: 't', text: `${x.id} · ${_t('挂上原件')}` }), controlButton({ class: 'b98 tbb', 'aria-label': _t('关闭'), text: '×' }, closeModal)),
      h('div', { class: 'wbody' }, h('div', { class: 'prompt', html: fmt(x.clue || '') + '<br>' + _t('选出两份说的是同一户的原件。') }), listBox, msg,
        h('div', { class: 'row' }, controlButton({ class: 'b98', text: _t('取消') }, closeModal), controlButton({ class: 'b98', text: _t('核对') }, () => {
          markInteraction();
          const s = hhState(x.id);
          if (chosen.size !== 2) { msg.textContent = _t('请正好选两份。'); return; }
          if ([...chosen].every(id => x.sources.includes(id))) {
            s.ok = true; setFlag('hh_' + x.id.replace('-', '_')); setFlag('hhcount_' + (D.households.filter(y => hhState(y.id).ok).length));
            closeModal(); sfx('ok'); toast(`${x.id} ${_t('已确认：')}${x.name}`, 'good'); act(x.onConfirm); dirty();
          } else {
            s.tries++; sfx('err');
            const one = [...chosen].some(id => x.sources.includes(id));
            msg.textContent = one ? _t('其中一份对得上，另一份说的是别的人家。') : _t('这两份原件说的都不是这一户。');
            dirty();
          }
        }))));
    m.append(h('div', { class: 'shade', onclick: closeModal }), dlg);
  }
  function hhCall(x) {
    const s = hhState(x.id);
    const m = modalRoot(); m.innerHTML = '';
    const lines = h('div', { class: 'hh-call' });
    const dlg = h('div', { class: 'dlg98 dlgph', role: 'dialog' },
      h('div', { class: 'titlebar' }, h('span', { class: 't', text: `${_t('回访')} · ${x.name}` }), controlButton({ class: 'b98 tbb', 'aria-label': _t('关闭'), text: '×' }, closeModal)),
      h('div', { class: 'wbody' }, lines, h('div', { class: 'row' }, controlButton({ class: 'b98', text: _t('挂断') }, closeModal))));
    m.append(h('div', { class: 'shade', onclick: closeModal }), dlg);
    let i = 0;
    const step = () => { if (i >= x.call.lines.length) { s.called = true; setFlag('called_' + x.id.replace('-', '_')); dirty(); renderPhone(); return; } const [who, t] = x.call.lines[i++]; lines.append(h('p', { class: who === 'me' ? 'me' : 'them', html: fmt(t) })); lines.scrollTop = lines.scrollHeight; later(step, FAST ? 10 : 700); };
    step();
  }

  // 寄出：终章的选择。结局由寄送方式、确认户数和是否尊重每户的公开意愿共同决定。
  function openSendOut() {
    if (S.flags.sent_done || !D.sendOut) return;
    const cfg = D.sendOut, ok = (D.households || []).filter(x => hhState(x.id).ok);
    const wrap = h('div', { class: 'board' }), sheet = h('div', { class: 'sheet sendout' });
    wrap.append(sheet);
    let mode = null;
    const inc = new Set(ok.map(x => x.id));
    const draw = () => {
      sheet.innerHTML = '';
      sheet.append(h('h2', { text: cfg.title }), h('div', { class: 'intro', html: fmt(cfg.intro) }));
      const modes = h('div', { class: 'send-modes' });
      cfg.modes.forEach(md => modes.append(h('label', { class: 'send-mode' + (mode === md.id ? ' on' : '') }, h('input', { type: 'radio', name: 'sendmode', id: 'send_' + md.id, checked: mode === md.id, onchange: () => { mode = md.id; draw(); } }), h('span', {}, h('b', { text: md.label }), h('small', { html: fmt(md.desc) })))));
      sheet.append(modes);
      sheet.append(h('div', { class: 'send-sec', text: `${_t('随信附上的名字')}（${_t('已确认')} ${ok.length} / ${(D.households || []).length}）` }));
      const hl = h('div', { class: 'send-hh' });
      if (!ok.length) hl.append(h('div', { class: 'faded', text: _t('名单上还没有确认的户。') }));
      ok.forEach(x => {
        const s = hhState(x.id), consent = s.called ? x.call.consent : null;
        hl.append(h('label', {}, h('input', { type: 'checkbox', checked: inc.has(x.id), disabled: mode !== 'public', onchange: (e) => { e.target.checked ? inc.add(x.id) : inc.delete(x.id); } }),
          h('span', { text: `${x.id} ${x.name}` }), h('small', { class: 'hh-tag ' + (consent === true ? 'yes' : 'no'), text: consent === true ? _t('同意公开') : consent === false ? _t('不同意公开') : _t('未征得意见') })));
      });
      sheet.append(hl, h('div', { class: 'faded', style: { margin: '6px 0 12px' }, text: _t('只有「公开到论坛」时才需要逐户决定附不附名字；其他方式只交给有权核查的人和本人。') }));
      sheet.append(h('div', { class: 'bar' }, h('button', { class: 'bbtn', text: _t('稍后再决定'), onclick: () => { closeOverlay(); renderAll(); } }), h('button', { class: 'bbtn pri', text: _t('寄出'), disabled: !mode, onclick: send })));
    };
    const send = () => {
      markInteraction();
      const md = cfg.modes.find(x => x.id === mode); if (!md) return;
      const missing = (D.households || []).length - ok.length;
      const exposed = ok.filter(x => inc.has(x.id) && !(hhState(x.id).called && x.call.consent === true));
      const end = D.endings[md.ending];
      const extra = md.extra ? md.extra({ missing, confirmed: ok.length, exposed: exposed.map(x => x.name), public: mode === 'public' }) : '';
      if (end) { end.baseHtml = end.baseHtml || end.html; end.html = end.baseHtml + (extra || ''); }
      setFlag('sent_done'); setFlag('sent_' + mode);
      closeOverlay();
      act({ ending: md.ending });
    };
    draw();
    openOverlay(wrap);
  }

  // 街区地图：D.map.orig 列出的还原点里显示原图，其他时间点显示公示版。
  // spots 是可点的地点（看说明、核对名单、回答地图题），pins 是读过的资料在图上的位置。
  function mapVer() { return ((D.map || {}).orig || []).includes((S && S.snap) || 'cur') ? 'orig' : 'pub'; }
  const mapShow = (x, ver) => (!x.ver || x.ver === ver) && test(x.requires);
  const mapPinSeen = (p) => !!S.flags['seen_' + p.id];
  function mapPuzzles() { return Object.entries(D.puzzles).filter(([id, p]) => p.kind === 'map' && !solved(id) && test(p.requires)); }
  function openMap(opts = {}) {
    const ex = wins.find(w => w.key === 'map');
    if (ex) { if (opts.puzzle) { ex.state.puzzle = opts.puzzle; ex.state.msg = ''; } focusWin(ex); ex.refresh(true); return; }
    openWin({ key: 'map', title: (D.map && D.map.name) || _t('街区地图'), icon: 'map', w: 960, h: 660, bodyClass: 'out', scrollPane: '.map-svg', live: true, state: { sel: null, puzzle: opts.puzzle || null, msg: '' }, render: renderMap });
  }
  function mapHouse(sp) { return sp.hh ? (D.households || []).find(x => x.id === sp.hh && test(x.requires)) : null; }
  function mapZoomControls(mapBox, st) {
    const scales = [1, 1.5, 2, 3];
    let level = Math.max(0, scales.indexOf(st.zoom));
    const display = h('output', { 'aria-label': '图纸缩放比例' });
    const smaller = h('button', { class: 'b98', type: 'button', text: '−', title: '缩小图纸', 'aria-label': '缩小图纸', onclick: () => zoom(level - 1) });
    const larger = h('button', { class: 'b98', type: 'button', text: '+', title: '放大图纸', 'aria-label': '放大图纸', onclick: () => zoom(level + 1) });
    const fit = h('button', { class: 'b98', type: 'button', text: '适宽', title: '按窗口宽度显示', onclick: () => zoom(0) });
    function update() {
      const percent = scales[level] * 100 + '%';
      mapBox.style.setProperty('--plan-width', percent);
      mapBox.classList.toggle('enlarged', level > 0);
      smaller.disabled = level === 0;
      larger.disabled = level === scales.length - 1;
      display.textContent = percent;
    }
    function zoom(next) {
      const oldScale = scales[level];
      const drawing = mapBox.firstElementChild.getBoundingClientRect();
      const anchorX = Math.min(drawing.width, mapBox.clientWidth) / 2;
      const anchorY = Math.min(drawing.height, mapBox.clientHeight) / 2;
      const centerX = mapBox.scrollLeft + anchorX;
      const centerY = mapBox.scrollTop + anchorY;
      level = next;
      st.zoom = scales[level];
      update();
      const ratio = st.zoom / oldScale;
      mapBox.scrollLeft = level ? centerX * ratio - anchorX : 0;
      mapBox.scrollTop = level ? centerY * ratio - anchorY : 0;
    }
    // 触屏沿用原生滚动。鼠标可以从房间内起拖，松手时不选中房间。
    let press = null, dragged = false;
    mapBox.addEventListener('pointerdown', e => {
      dragged = false;
      if (level && e.pointerType === 'mouse' && e.button === 0 && e.target.closest('svg')) {
        press = { x: e.clientX, y: e.clientY, left: mapBox.scrollLeft, top: mapBox.scrollTop };
      }
    });
    mapBox.addEventListener('pointermove', e => {
      if (!press || e.pointerType !== 'mouse') return;
      if (e.buttons !== 1) { press = null; return; }
      const dx = e.clientX - press.x, dy = e.clientY - press.y;
      if (!dragged && Math.hypot(dx, dy) < 6) return;
      if (!dragged) {
        dragged = true;
        mapBox.setPointerCapture(e.pointerId);
        mapBox.classList.add('panning');
      }
      mapBox.scrollLeft = press.left - dx;
      mapBox.scrollTop = press.top - dy;
    });
    const release = () => { press = null; mapBox.classList.remove('panning'); };
    mapBox.addEventListener('pointerup', release);
    mapBox.addEventListener('pointercancel', release);
    mapBox.addEventListener('click', e => {
      if (dragged && e.detail > 0) { e.preventDefault(); e.stopImmediatePropagation(); }
    }, true);
    update();
    return h('div', { class: 'map-zoom', role: 'group', 'aria-label': '图纸缩放' }, smaller, display, larger, fit);
  }
  function renderMap(win) {
    const M = D.map, st = win.state, ver = mapVer(), V = M.versions[ver];
    win.top.append(h('div', { class: 'map-head' }, h('b', { text: V.title }), h('span', { text: V.sub || '' }),
      snapList().filter(s => test(s.requires)).length > 1 ? h('button', { class: 'b98', type: 'button', text: _t('切换还原点…'), onclick: () => openRestore() }) : null));
    const P = st.puzzle && D.puzzles[st.puzzle] && test(D.puzzles[st.puzzle].requires) && !solved(st.puzzle) ? [st.puzzle, D.puzzles[st.puzzle]] : mapPuzzles()[0];
    const floors = M.floors || [];
    if (P && st.floorTask !== P[0]) {
      st.floorTask = P[0];
      st.floor = P[1].initialFloor || M.spots[[].concat(P[1].spot)[0]]?.floor;
      st.sel = null;
      st.zoom = 1;
      win.resetScroll = true;
    }
    const floor = floors.find(f => f.id === st.floor) || floors[0];
    const onFloor = item => !floor || item.floor === floor.id;
    const controls = floor && h('div', { class: 'map-controls' });
    if (floor) {
      controls.append(h('div', { class: 'map-floors', role: 'group', 'aria-label': '选择楼层' },
        ...floors.map(f => h('button', { class: 'b98', type: 'button', text: f.label, 'aria-pressed': String(f.id === floor.id), onclick: () => {
          if (floor.id === f.id) return;
          st.floor = f.id; st.sel = null; st.msg = ''; win.resetScroll = true; win.refresh(true);
          win.top.querySelector('.map-floors [aria-pressed="true"]').focus({ preventScroll: true });
        } }))));
      win.top.append(controls);
    }
    const areas = Object.entries(M.spots).flatMap(([id, s]) =>
      [s, ...(s.areas || []).map(area => ({ ...s, ...area }))].filter(a => onFloor(a) && mapShow(a, ver)).map(a => [id, a]));
    const sp = areas.some(([id]) => id === st.sel) ? M.spots[st.sel] : null;
    if (P) {
      const [pid, p] = P;
      const hints = puzzleHints(pid, p);
      win.top.append(h('div', { class: 'cmp-task' },
        h('div', { class: 'k', text: _t('待核对') }), h('b', { text: p.title }), h('div', { html: fmt(p.prompt || '') }), hints.box,
        h('div', { class: 'row' }, hints.button,
          h('button', { class: 'b98', type: 'button', text: sp ? `${_t('就是这里')}：${sp.label}` : _t('先在图上点一个地点'), disabled: !sp, onclick: () => {
            markInteraction();
            if ([].concat(p.spot).includes(st.sel)) { st.msg = p.solvedText || _t('就是这里。'); st.puzzle = null; solvePuzzle(pid); }
            else { sfx('err'); st.msg = (p.near || {})[st.sel] || _t('地点不符。'); }
            win.refresh(true);
          } })),
        st.msg ? h('div', { class: 'cmp-msg', html: fmt(st.msg) }) : null));
    } else if (st.msg) win.top.append(h('div', { class: 'cmp-msg', html: fmt(st.msg) }));

    const svg = [`<svg class="mapsvg"${M.minWidth ? ` style="min-width:${Number(M.minWidth)}px"` : ''} viewBox="${floor ? floor.viewBox : `0 0 ${M.w} ${M.h}`}" xmlns="http://www.w3.org/2000/svg" role="group" aria-label="${esc(floor ? V.title + ' · ' + floor.label : V.title)}"><defs><pattern id="mhatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="8" height="8" fill="#cfe3b8"/><line x1="0" y1="0" x2="0" y2="8" stroke="#9fc184" stroke-width="2"/></pattern></defs>`];
    M.draw.filter(x => onFloor(x) && mapShow(x, ver)).forEach(x => svg.push(x.svg));
    areas.forEach(([id, s], index) => {
      const x = mapHouse(s), ok = x && hhState(x.id).ok;
      svg.push(`<rect class="spot${s.cls ? ' ' + s.cls : ''}${ok ? ' ok' : ''}${st.sel === id ? ' sel' : ''}" data-spot="${esc(id)}" data-map-area="${index}" role="button" aria-pressed="${st.sel === id}" aria-label="${esc(s.label)}" tabindex="0" x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}"><title>${esc(s.label)}</title></rect>`);
      if (s.tag) svg.push(`<text class="m-tag" x="${s.x + 6}" y="${s.y + s.h / 2 + 4}">${esc(s.tag)}${ok ? '　' + esc(x.name) : ''}</text>`);
    });
    const pins = (M.pins || []).filter(p => mapPinSeen(p) && onFloor(p) && mapShow(p, ver));
    pins.forEach(p => svg.push(`<g class="pin" data-pin="${esc(p.id)}" tabindex="0"><circle cx="${p.at[0]}" cy="${p.at[1]}" r="7"/><text x="${p.at[0]}" y="${p.at[1] + 3.5}">${esc(p.mark || '•')}</text><title>${esc(p.label)}</title></g>`));
    svg.push('</svg>');
    const mapBox = h('div', { class: 'map-svg' + (floor ? ' floor-map' : ''), html: svg.join('') });
    if (floor) {
      const [, , width, height] = floor.viewBox.split(/\s+/);
      mapBox.style.setProperty('--plan-ratio', width + ' / ' + height);
      controls.append(mapZoomControls(mapBox, st));
    }
    const pick = (el) => {
      const pin = el.closest('[data-pin]');
      if (pin) { const p = M.pins.find(x => x.id === pin.dataset.pin); if (p) goEvidence(p.ev || { type: 'file', id: p.id }); return; }
      const s = el.closest('[data-spot]');
      if (s) {
        const hadFocus = document.activeElement === s;
        st.sel = s.dataset.spot; st.msg = ''; win.refresh(true);
        if (hadFocus) win.body.querySelector('[data-map-area="' + s.dataset.mapArea + '"]')?.focus({ preventScroll: true });
      }
    };
    bindControl(mapBox, (e, target) => pick(target), e => e.target.closest('[data-pin], [data-spot]'));
    mapBox.onkeydown = (e) => { if (confirmInput(e) || e.key === ' ') { e.preventDefault(); pick(e.target); } };

    const side = h('div', { class: 'map-side' });
    if (!sp) side.append(h('div', { class: 'faded', text: _t('尚未选择地点。') }));
    else {
      side.append(h('b', { text: sp.label }));
      const x = mapHouse(sp);
      if (x) {
        const s = hhState(x.id);
        side.append(h('div', { class: 'k', text: `${x.id} · ${s.ok ? _t('已确认') : _t('未确认')}` }));
        if (s.ok) {
          side.append(h('div', { html: fmt(x.name) }));
          (x.facts || []).filter(fc => test(fc.requires)).forEach(fc => side.append(h('div', { class: 'hh-fact', html: fmt(fc.text) })));
          if (s.called) side.append(h('div', { class: 'hh-tag ' + (x.call.consent ? 'yes' : 'no'), text: x.call.consent ? _t('同意公开姓名') : _t('不同意公开姓名') }));
        } else side.append(h('div', { html: fmt(x.clue || '') }), h('button', { class: 'b98', type: 'button', text: _t('挂上原件核对'), onclick: () => hhAttach(x) }));
      } else if (sp.info) side.append(h('div', { html: fmt(sp.info) }));
      (sp.more || []).filter(m => test(m.requires)).forEach(m => side.append(h('div', { class: 'hh-fact', html: fmt(m.text) })));
      const near = pins.filter(p => p.spot === st.sel);
      if (near.length) side.append(h('div', { class: 'k', text: _t('这里的资料') }), ...near.map(p => h('button', { class: 'b98 map-doc', type: 'button', text: p.label, onclick: () => goEvidence(p.ev || { type: 'file', id: p.id }) })));
    }
    if (M.legend) side.append(h('div', { class: 'map-legend', html: fmt(M.legend[ver] || '') }));
    win.body.append(h('div', { class: floor ? 'map plan-view' : 'map' }, mapBox, side));
    win.status.append(h('div', { text: floor ? floor.label + '　·　' + M.name : `${pins.length} ${_t('份资料已标在图上')}　${ver === 'orig' ? _t('原图') : _t('公示版')}` }));
  }

  // 推理板依据：b.srcPool 里玩家读过的原件会作为「原件」词条出现，空格写成 'src:<文件id>'
  function boardWords(b) {
    const w = Object.assign({}, b.words);
    (b.srcPool || []).forEach(id => {
      if (!S.flags['seen_' + id]) return;
      const file = D.files.find(f => f.id === id);
      const title = '《' + hhSourceLabel(id).replace(/　\[.*\]$/, '').replaceAll('《', '〈').replaceAll('》', '〉') + '》';
      w['src:' + id] = b.sourceLabels?.[id] || (file && file.evidenceOwner ? file.evidenceOwner + '的' + title : title);
    });
    return w;
  }

  // ---- 录像：仪式录像带与老K自己的素材（逐帧看画面描述和口播）----
  const clipsOpen = () => !!(D.footage && test(D.footage.requires));
  const clipList = () => ((D.footage || {}).clips || [])
    .filter(c => test(c.requires))
    .sort((a, b) => b.date.localeCompare(a.date)
      || (b.frames?.[0]?.t || '').localeCompare(a.frames?.[0]?.t || ''));
  const newClips = () => clipsOpen() ? clipList().filter(c => !S.flags['seen_' + c.id]).length : 0;
  const activePick = (kind, key, owner) => {
    const ok = ([id, p]) => !!p && p.kind === kind && !solved(id) && test(p.requires) && (kind !== 'frame' || p.clip === owner);
    const cur = ui[key] ? [ui[key], D.puzzles[ui[key]]] : null;
    return cur && ok(cur) ? cur : (Object.entries(D.puzzles).find(ok) || null);
  };
  function pickBanner(body, pz, selLabel, onSubmit, message) {
    const [pid, p] = pz;
    const hints = puzzleHints(pid, p, 'ph-btn sm');
    body.append(h('div', { class: 'ph-card pick-task' },
      h('div', { class: 'k', text: _t('待核对') }), h('b', { text: p.title }), h('div', { html: fmt(p.prompt || '') }), hints.box,
      h('div', { class: 'row' }, hints.button,
        h('button', { class: 'ph-btn sm pri', text: selLabel ? _t('提交：') + selLabel : _t('先选一帧画面'), disabled: !selLabel, onclick: onSubmit })),
      message ? h('div', { class: 'pick-msg', html: fmt(message) }) : null));
  }
  function renderClips(title, body) {
    const clip = ui.clip && clipList().find(c => c.id === ui.clip);
    if (!clip) {
      title(_t('录像'), (D.footage.sub || ''));
      if (D.footage.intro) body.append(h('div', { class: 'ph-card done', html: fmt(D.footage.intro) }));
      clipList().forEach(c => {
        const recorded = c.date || '';
        const b = h('button', { class: 'ph-card clipcard' + (S.flags['seen_' + c.id] ? '' : ' new'), type: 'button', onclick: () => { ui.clip = c.id; ui.frameSel = null; ui.frameMsg = ''; renderPhone(); } },
          h('div', { class: 'k', text: c.dur ? `${recorded}　${_t('时长')} ${c.dur}` : recorded }), h('b', { text: c.title }), c.sub ? h('div', { class: 'faded', text: c.sub }) : null);
        body.append(b);
      });
      return;
    }
    if (!S.flags['seen_' + clip.id]) { setFlag('seen_' + clip.id); act(clip.onOpen); }
    title(clip.title, clip.date, () => { ui.clip = null; ui.frameSel = null; ui.frameMsg = ''; renderPhone(); });
    const frames = clip.frames.map((fr, i) => [fr, i]).filter(([fr]) => test(fr.requires));
    const pz = activePick('frame', 'framePuzzle', clip.id);
    const previous = ui.frameMsg?.solved;
    if (previous) body.append(h('div', { class: 'pick-msg', html: fmt(previous) }));
    if (pz) {
      const sel = ui.frameSel != null && clip.frames[ui.frameSel];
      pickBanner(body, pz, sel ? sel.t : '', () => {
        const [pid, p] = pz; markInteraction();
        if ([].concat(p.frame).includes(sel.t)) { ui.frameMsg = {solved: p.solvedText || _t('就是这一帧。')}; ui.framePuzzle = null; ui.frameSel = null; solvePuzzle(pid); }
        else { sfx('err'); ui.frameMsg = (p.near || {})[sel.t] || _t('再看看别的画面。这一帧里找不到要核对的细节。'); }
        renderPhone();
      }, previous ? '' : ui.frameMsg);
    } else if (ui.frameMsg && !previous) body.append(h('div', { class: 'pick-msg', html: fmt(ui.frameMsg) }));
    if (clip.sub) body.append(h('div', { class: 'faded', style: { margin: '0 2px 8px' }, text: clip.sub }));
    frames.forEach(([fr, i]) => {
      const card = h('div', { class: 'frame' + (ui.frameSel === i ? ' sel' : ''), tabindex: 0, role: 'button', 'aria-pressed': ui.frameSel === i ? 'true' : 'false' },
        h('div', { class: 'tc', text: fr.date ? fr.date + ' ' + fr.t : fr.t }),
        fr.photo ? photoPreview(fr.photo, _t('放大画面')) : null,
        h('div', { class: 'shot', html: fmt(fr.desc || '') }),
        fr.say ? h('div', { class: 'say', html: fmt(fr.say) }) : null);
      const pick = () => {
        const selection = window.getSelection();
        if (selection && !selection.isCollapsed && body.contains(selection.anchorNode)) selection.removeAllRanges();
        ui.frameSel = i; ui.frameMsg = ''; if (fr.onView) act(fr.onView); renderPhone();
      };
      // 字幕保留浏览器原生选区和触屏复制菜单，点时间码或画面仍可选帧。
      bindControl(card, pick, e => e.target.closest('.say, button') ? null : card);
      card.onkeydown = e => { if (e.target === card && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); pick(); } };
      body.append(card);
    });
  }

  function photoPreview(html, label) {
    const button = controlButton({ class: 'photo-zoom', text: label, 'aria-label': label }, e => {
      e.stopPropagation(); viewImage(html);
    });
    // 看大图不会代替“选中此帧”，也不会触发素材里的收集事件。
    button.addEventListener('keydown', e => e.stopPropagation());
    return h('div', { class: 'media-photo' }, h('div', { class: 'media-photo-image', html }), button);
  }

  // ---- 坏道修复：沿着 FAT 簇链把文件碎片拼回去 ----
  // 谜题 kind:'chain'：p.start 起始簇号，p.frags 碎片 [{c:簇号, next:下一簇或'??'或null(结尾), text}]，p.order 正确顺序（簇号数组）。
  function chainPuzzles() { return Object.entries(D.puzzles).filter(([id, p]) => p.kind === 'chain' && test(p.requires)); }
  function openDiskFix(opts = {}) {
    const ex = wins.find(w => w.key === 'diskfix');
    if (ex) { if (opts.puzzle) { ex.state.pid = opts.puzzle; ex.state.seq = []; ex.state.msg = ''; } focusWin(ex); ex.refresh(true); return ex; }
    return openWin({ key: 'diskfix', title: _t('坏道修复 - 第六张盘'), icon: 'diskfix', w: 860, h: 600, bodyClass: 'out', live: true, state: { pid: opts.puzzle || null, seq: [], msg: '' }, render: renderDiskFix });
  }
  function renderDiskFix(win) {
    const st = win.state, list = chainPuzzles();
    if (!st.pid || !D.puzzles[st.pid] || !test(D.puzzles[st.pid].requires)) st.pid = (list.find(([id]) => !solved(id)) || list[0] || [null])[0];
    const side = h('div', { class: 'fx-list' }, h('div', { class: 'k', text: _t('受损文件') }));
    if (!list.length) side.append(h('div', { class: 'faded', text: _t('还没有扫描出可以修复的文件。') }));
    list.forEach(([id, p]) => side.append(controlButton({ class: 'fx-file' + (st.pid === id ? ' on' : '') + (solved(id) ? ' ok' : '') }, () => { st.pid = id; st.seq = []; st.msg = ''; win.refresh(true); },
      h('b', { text: p.file }), h('span', { text: solved(id) ? _t('已修复') : `${_t('起始簇')} #${p.start}　${p.frags.length} ${_t('块')}` }))));
    const main = h('div', { class: 'fx-main' });
    const cur = st.pid && D.puzzles[st.pid];
    if (cur) {
      const pid = st.pid, p = cur;
      const hints = puzzleHints(pid, p);
      const feedback = h('div', { class: 'cmp-msg', hidden: !st.msg, html: fmt(st.msg || ''), role: 'status' });
      const cards = new Map();
      let drawSelection = () => {};
      main.append(h('div', { class: 'cmp-task' }, h('div', { class: 'k', text: solved(pid) ? _t('已修复') : _t('待恢复') }), h('b', { text: p.title }), h('div', { html: fmt(p.prompt || '') }), hints.box,
        solved(pid) ? feedback : null));
      main.append(h('div', { class: 'fx-dir', text: `${_t('目录项')}：${p.file}　${_t('起始簇')} #${p.start}　${p.size || ''}` }));
      if (!solved(pid)) {
        const strip = h('div', { class: 'fx-strip', role: 'status', 'aria-label': _t('待校验簇链') });
        const undo = controlButton({ class: 'b98', text: _t('退一块') }, () => { st.seq.pop(); st.msg = ''; drawSelection(); });
        const clear = controlButton({ class: 'b98', text: _t('清空') }, () => { st.seq = []; st.msg = ''; drawSelection(); });
        const verify = controlButton({ class: 'b98', text: _t('拼接并校验') }, () => {
          if (st.seq.length !== p.frags.length) return;
          markInteraction();
          const bad = p.order.findIndex((c, i) => st.seq[i] !== c);
          if (bad < 0) { st.msg = p.solvedText || _t('文件已修复。'); st.seq = []; solvePuzzle(pid); win.refresh(true); }
          else { sfx('err'); st.msg = bad === 0 ? _t('校验失败：起始簇不符。') : `${_t('校验失败：第')} ${bad + 1} ${_t('块不连续。')}`; drawSelection(); }
        });
        main.append(h('div', { class: 'fx-selection' }, strip, h('div', { class: 'row fx-row' }, hints.button, undo, clear, verify), feedback));
        // Keep fragment nodes and their scroll position while a finger selects them.
        drawSelection = () => {
          strip.replaceChildren();
          if (!st.seq.length) strip.append(h('span', { class: 'faded', text: _t('待校验簇链：空') }));
          st.seq.forEach((c, i) => strip.append(h('span', { class: 'fx-chip', text: '#' + c + (i < st.seq.length - 1 ? ' →' : '') })));
          undo.disabled = clear.disabled = !st.seq.length;
          verify.disabled = st.seq.length !== p.frags.length;
          feedback.hidden = !st.msg; feedback.innerHTML = fmt(st.msg || '');
          for (const [c, { card, picked }] of cards) {
            const index = st.seq.indexOf(c), used = index >= 0;
            card.disabled = used; card.classList.toggle('used', used); card.setAttribute('aria-pressed', String(used));
            picked.hidden = !used; picked.textContent = used ? `${_t('已选')} · ${_t('第')}${index + 1}${_t('块')}` : '';
          }
        };
      }
      const grid = h('div', { class: 'fx-grid' });
      const shown = solved(pid) ? p.order.map(c => p.frags.find(f => f.c === c)) : p.frags;
      shown.forEach(f => {
        const picked = h('span', { class: 'fx-picked', hidden: true });
        const card = controlButton({ class: 'fx-frag', disabled: solved(pid), 'aria-pressed': 'false' }, () => {
          if (solved(pid) || st.seq.includes(f.c)) return;
          st.seq.push(f.c); st.msg = ''; drawSelection();
        },
          h('span', { class: 'fx-head' }, h('b', { text: '#' + f.c }), picked, h('span', { text: f.next === null ? _t('文件结尾') : f.next === '??' ? _t('下一簇：??（坏道）') : `${_t('下一簇')}：#${f.next}` })),
          h('span', { class: 'fx-text', text: f.text }));
        cards.set(f.c, { card, picked });
        grid.append(card);
      });
      main.append(grid);
      drawSelection();
    } else main.append(h('div', { class: 'empty98', text: _t('还没有可以修复的文件。') }));
    win.body.append(h('div', { class: 'fx' }, side, main));
    win.status.append(h('div', { text: `${list.filter(([id]) => solved(id)).length} / ${list.length} ${_t('个受损文件已修复')}` }));
  }

  const PATCHES = [];
  function patch(fn) { PATCHES.push(fn); }

  // 声音：每 0.4 秒告诉 Y2KAudio 现在是什么场景（标题、结局、哪一章几点、手机里在看哪段录像、IE 里开着哪个页面）
  function audioSync() {
    const A = window.Y2KAudio; if (!A || FAST) return;
    const endEl = document.querySelector('.ending[data-ending]');
    let page = null;
    if (S && !titleOn) {
      const w = recentIE();
      if (w && !w.min && /\/2002\/wangshu\/|wangshu\.home/.test(w.state.hist[w.state.hi])) page = 'wangshu';
    }
    A.scene({ title: titleOn && !endEl, ending: endEl ? endEl.dataset.ending : null, endingPhoto: !!endEl?.hasAttribute('data-photo-reached'), inGame: !!S && !titleOn, chapter: S?.chapter, clock: S?.clock, page });
  }
  function audioPrefs() { const a = meta().audio || {}; return { music: a.music !== false, sfx: a.sfx !== false }; }
  function setAudioPref(key, on) { const m = meta(); m.audio = Object.assign(audioPrefs(), { [key]: on }); setMeta(m); window.Y2KAudio?.setPrefs(m.audio); }
  function boot() {
    bindTextInputs();
    window.Y2KAudio?.setPrefs(audioPrefs());
    setInterval(audioSync, 400);
    guardControlClicks();
    document.addEventListener('pointerdown', startTitleDrag);
    PATCHES.forEach(fn => fn(D));
    cleanStoredSaveData();
    const collection = meta();
    if (collection.story !== 'sixth-disk' || collection.endingLayout !== 'abc-h') {
      const old = collection.story === 'sixth-disk' ? collection.endings || {} : {};
      const allRead = [old.D, !collection.revisedBroadcast && old.B].filter(Boolean);
      collection.endings = Object.fromEntries(Object.entries({
        A: allRead.length ? Math.min(...allRead) : null, B: old.A, C: old.C, H: old.H
      }).filter(([, date]) => date));
      collection.story = 'sixth-disk';
      collection.endingLayout = 'abc-h';
      delete collection.revisedBroadcast;
      setMeta(collection);
    }
    prepAnswers();
    if (LANG !== 'zh') applyLang(LANGMAP[LANG]);
    if (window.Y2K2Locale) window.Y2K2Locale.apply(D, LANG, cmpText, SEG);
    applyPhotos();
    document.documentElement.lang = { zh: 'zh-CN', en: 'en', ja: 'ja' }[LANG];
    document.title = _t('千年虫 2：未寄出的明天');
    index(); buildFS();
    document.body.innerHTML = '';
    document.body.append(
      h('div', { id: 'app' },
        h('div', { id: 'deskwrap' }, h('div', { id: 'monitor' }, h('div', { id: 'screen' }), h('div', { class: 'brand', text: _t('老K工作室 · 读盘机') }), h('div', { class: 'led', id: 'led' }))),
        h('div', { id: 'phone' }, h('div', { class: 'ph-status', id: 'phStatus' }), h('div', { class: 'ph-main' }, h('div', { class: 'ph-head', id: 'phHead' }), h('div', { class: 'ph-body', id: 'phBody' }), h('div', { class: 'ph-choices', id: 'phFoot', hidden: true })), h('div', { class: 'ph-tabs', id: 'phTabs' }))),
      controlButton({ id: 'phoneFab', 'aria-label': _t('手机') }, () => togglePhone()),
      h('div', { id: 'modal' }), h('div', { id: 'overlay' }), h('div', { id: 'title', class: 'title', hidden: true }),
      h('div', { id: 'noticeStack' }, h('div', { id: 'toast' }),
        h('div', { id: 'fragmentNotices', role: 'log', 'aria-label': '照片碎片', 'aria-live': 'polite', 'aria-relevant': 'additions' })));
    ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach(ev => document.addEventListener(ev, resetIdle, { passive: true }));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { if ($('#startmenu')) { closeStart(); $('#startbtn').focus(); } else if (ctxEl) closeCtx(); else if ($('#modal').children.length) closeModal(); else if (overlay().classList.contains('on') && overlay().querySelector('.board, .viewer, .fragment-dialog')) { closeOverlay(); showCards(); renderAll(); } }
    });
    setInterval(() => { if (!S) return; renderTray(); const st = $('#phStatus'); if (st) { const t = phoneNow(); st.querySelector('b') && (st.querySelector('b').textContent = t.hm); } }, 15000);
    setInterval(() => { if (S && !titleOn) { tickPlay(); writeSave('auto'); } }, 30000);
    document.addEventListener('visibilitychange', () => { syncPlayClock(); if (S && !titleOn) writeSave('auto'); });
    window.addEventListener('pagehide', () => { if (S && !titleOn) writeSave('auto'); playClockRunning = false; });
    window.addEventListener('pageshow', syncPlayClock);
    window.addEventListener('beforeunload', () => { if (S && !titleOn) writeSave('auto'); });
    window.addEventListener('resize', () => {
      // Recenter dragged dialogs when the screen rotates or the browser changes size.
      document.querySelectorAll('.dlg98, .classic-viewer').forEach(el => { if (el.style.translate) el.style.translate = ''; });
      const dialog = $('#modal.pc-modal'); if (dialog) positionPCDialog(dialog);
      if (!narrow() && ui.phoneOpen) togglePhone(false);
      const dk = desktop(); if (!dk) return;
      wins.forEach(w => {
        if (w.el.classList.contains('max')) return;
        w.el.style.left = windowLeft(parseFloat(w.el.style.left) || 0, w.el.offsetWidth, dk.clientWidth) + 'px';
        w.el.style.top = Math.max(0, Math.min(parseFloat(w.el.style.top) || 0, dk.clientHeight - w.el.offsetHeight)) + 'px';
      });
    });
    S = fresh(_t('老K'));
    const reload = performance.getEntriesByType('navigation')[0]?.type === 'reload';
    const unlockRequest = D.trialLimit && !D.trialLimit.standalone && new URLSearchParams(location.search).has('unlock');
    const resume = !unlockRequest && (window.QNC2ResumeTrial || (reload && sessionScreen() === 'game')) && location.hash !== '#leaderboard' && readSave('auto');
    if (resume && !needsFullGame(resume)) loadState(resume); else showTitle();
    if (unlockRequest) openFullUnlock(new URLSearchParams(location.search).get('unlock') === 'continue');
    else if (location.hash === '#leaderboard') window.Y2KLeaderboard?.mount(titlePanel($('#title .title-panel-host'), _t('排行榜'), $('#title .leaderboard-entry') || $('#title .menu button:not(:disabled)')), LANG, !!meta().endings?.H);
    window.Y2KStats?.start();
  }

  // 测试与调试用（浏览器控制台）
  const debug = { get state() { return S; }, journalNext: () => { const n = nextJournalStep(); return n ? n.until : null; }, get pre() { return preEndSnap; }, D, test, act, setFlag: (f) => { setFlag(f); dirty(); }, solve: (id) => { solvePuzzle(id); dirty(); }, board: (id) => { if (!canOpenBoard(id)) return; setFlag('board_' + id); act(D.boards[id].onSolve); dirty(); }, openBoard, openFile: (id) => openFile(D.files.find(f => f.id === id)), openIE, ieGo: (u) => { const w = recentIE(); w ? ieGo(w, u) : openIE(u); }, choose, flush: () => { clearTimers(); running = {}; typing = {}; }, fast: (on) => { FAST = on !== false; if (FAST) window.Y2KAudio?.disable(); }, update: () => update(), ui, checkPuzzle, norm, showProps, closeModal, closeAllWins, openGexun, openApp, renderPhone, wins: () => wins, closeOverlay, showCards };
  return { add, boot, lang, patch };
})();

Y2K.patch(data => Object.assign(data, {"chapters":[{"id":"ch0","num":"序章","name":"第六张","date":"2026-12-20","time":"21:30","trigger":"start","intro":"2026年12月20日，夜。\u003cbr>\u003cbr>七中那期视频上线十来天，找你修旧电脑的人已经排到了明年。\u003cbr>\u003cbr>快递柜的取件短信响了：一个没写寄件人的包裹，寄件地址只有三个字\u003cspan style=\"white-space:nowrap\">——少年宫。\u003c/span>"},{"id":"ch1","num":"第一章","name":"邀请","date":"2026-12-21","time":"09:00","trigger":"dlg_c0_end","intro":"你一夜没睡踏实。\u003cbr>\u003cbr>盘上的日期是1909年。悬赏帖说，这只铁盒2009年就不见了。\u003cbr>\u003cbr>早上，你给悬赏帖的主人发了一条私信。"},{"id":"ch2","num":"第二章","name":"楼顶见","date":"2026-12-22","time":"10:00","trigger":"dlg_c1_end","intro":"一鸣那条“胶囊找到了”转了三千次。\u003cbr>\u003cbr>灰盘原来是许嘉的，孟凡却在上面留了2009年的文件。这些年里，盘是怎么到他手上的？\u003cbr>\u003cbr>早上，一个你不认识的号码加了你。"}],"trialLimit":{"standalone":false,"trigger":"dlg_c2_end","starts":"2026-12-23 09:30","firstPaidChapter":"ch3","firstPaidLabel":"第三章","lastFreeLabel":"第二章","totalNotebookPages":6},"boot":{"loginUser":"laok"},"storyRevision":25,"titleArt":"./cover.webp","screensaver":[{"text":"老K工作室 · 先做镜像，再修副本"}],"collectLabel":"照片碎片","journal":{"ch0":{"question":"胶囊里有什么？","steps":[{"until":"c0_parcel","text":"梧桐路驿站发来了取件消息。","source":{"type":"chat","id":"yizhan"}},{"until":"seen_c0_box","text":"翻翻刚拍的开箱照片。","source":{"type":"item","id":"c0_box"}},{"until":"solved_c0_count","text":"清单上写了几张盘？盒子里又有几张？","source":{"type":"item","id":"c0_box"}},{"until":"seen_f6_invite","text":"灰盘没贴标签。它的镜像在电脑桌面的“胶囊软盘”里。","source":{"type":"app","id":"caps"}},{"until":"solved_c0_year","text":"六号机给灰盘上的《邀请.txt》记下了哪一年的日期？","source":{"type":"file","id":"f6_invite"}},{"until":"solved_c0_keeper","text":"盒底贴着一截白胶布，上头写的是谁的名字？","source":{"type":"item","id":"c0_box"}},{"until":"seen_w_quan_post","text":"清单抬头写着“梧城少年宫 千禧时间胶囊”。拿这几个字上旧网搜一搜。","source":{"type":"url","value":"http://www.wuchengquan.cn/p/1201"}}],"facts":[{"requires":"solved_c0_count","text":"清单写着五张，盒里有六张；多出来的是一张没贴标签的灰盘。"},{"requires":"solved_c0_year","text":"六号机给《邀请.txt》记下的日期是1909年12月20日。"},{"requires":"solved_c0_keeper","text":"盒底的胶布写着“2004.3 孟凡代管”：从2004年3月起，胶囊在孟凡手里。"}]},"ch1":{"question":"灰盘上的邀请是谁写的，写于哪一年？这张盘最早又是谁的？","steps":[{"until":"dlg_c1_yiming","text":"悬赏帖的主人陈一鸣回了私信。","source":{"type":"chat","id":"yiming"}},{"until":"seen_v1999","text":"一鸣让你看1999年的封盒录像，链接在鸣远影像官网。","source":{"type":"url","value":"http://www.mingyuan.tv/1999.html"}},{"until":"solved_c1_xiaoliu","text":"一鸣说“五个人五张”。在录像里一帧一帧数，桌边到底有几个孩子？","source":{"type":"clip","id":"v1999"}},{"until":"dlg_c1_xiaoliu","text":"录像里那个最小的孩子是谁？有个男孩冲她喊过一声。问问一鸣。","source":{"type":"chat","id":"yiming"}},{"until":"c1_mirror","text":"一鸣说，小六是许嘉的妹妹。问问许宁。","source":{"type":"chat","id":"xuning"}},{"until":"seen_f_xj_l1","text":"打开“七中3号机镜像”，读许嘉的第一课。他讲过少年宫那台没打补丁的机器。","source":{"type":"app","id":"mirror"}},{"until":"solved_c1_year","text":"六号机给《邀请.txt》记的是1909年。按许嘉讲的规矩，再对照邀请里写的星期，它到底写于哪一年？","source":{"type":"file","id":"f6_invite"}},{"until":"solved_c1_writer","text":"《邀请.txt》没有落款。五封1999年的信里，谁打字时也犯过同样的错？","source":{"type":"app","id":"caps"}},{"until":"solved_c1_back","text":"封盒录像里的人，你只能按声音记作男孩1、男孩2……对照开箱时的清单、五封信和录像里各人说的话，他们各是谁？","source":{"type":"clip","id":"v1999"}},{"until":"solved_c1_owner","text":"灰盘里还有隐藏文件。找到压缩包，查看它的属性，核对最早的主人。","source":{"type":"app","id":"caps"}},{"until":"seen_w_wb_000413","requires":"solved_c1_owner","text":"压缩包存于2000年4月2日。那年四月的晚报上，还能查到许嘉最后的消息。","source":{"type":"url","value":"http://epaper.wcwb.cn/2000/0413.htm"}},{"until":"seen_t3104","text":"写邀请的人后来怎么样了？王磊把梧城热线的存档放到了网上。","source":{"type":"url","value":"http://wcrx.jiuwang.org/thread.asp?id=3104"}},{"until":"dlg_c1_call","text":"王小刚后来在寻人帖下更新了电话。打给孟凡家里问问。","source":{"type":"chat","id":"mfcall"}},{"until":"solved_c1_since","text":"按家属在寻人帖里核实的消息，孟凡是哪天晚上去赵记提的豆浆？","source":{"type":"url","value":"http://wcrx.jiuwang.org/thread.asp?id=3104"}},{"until":"board_c1_board","text":"去推理页填出灰盘最早的主人，以及后来写邀请的人。","source":{"type":"board","id":"c1_board"}}],"facts":[{"requires":"solved_c1_year","text":"《邀请.txt》写于2009年12月20日，礼拜天。六号机把年份少算了一百年。"},{"requires":"solved_c1_writer","text":"写邀请的是孟凡：他把“说”打成“所”，十三岁的信里就这样。"},{"requires":"solved_c1_back","text":"封盒那晚，孟凡打不出“说”字，小川凑过去告诉他加个h。十年后的邀请里也有这个错字。"},{"requires":"solved_c1_owner","text":"灰盘里藏着许嘉的压缩包，做于2000年4月2日，不是在六号机上做的。"},{"requires":"solved_c1_since","text":"2009年12月31日晚，孟凡出门以后就再没回来。那正是邀请里约的那一夜。"}]},"ch2":{"question":"五个人后来怎么样了？许嘉的灰盘到孟凡手里以前，还有谁用过？","steps":[{"until":"dlg_c2_mile","text":"一个陌生号码加了你。","source":{"type":"chat","id":"mile"}},{"until":"dlg_c2_squad","text":"米乐把你拉进了群。","source":{"type":"chat","id":"squad"}},{"until":"solved_c2_undel","text":"打开“坏道修复”，接回灰盘上被删文件的残片。","source":{"type":"app","id":"diskfix"}},{"until":"seen_f6_del_letter","requires":"solved_c2_undel","text":"灰盘上那封被删的信找回了一部分。末尾还能读出什么？","source":{"type":"file","id":"f6_del_letter"}},{"until":"solved_c2_owner2","requires":"seen_f6_del_letter","text":"找回来的信只剩一个字的落款，跟1999年的哪封信一样？","source":{"type":"file","id":"f_d2_letter"}},{"until":"solved_c2_handoff","text":"许嘉把灰盘交给了谁？他在3号机上记过。","source":{"type":"app","id":"mirror"}},{"until":"solved_c2_phrase","text":"许嘉下雪天在少年宫门口说过一句话，后来成了他们碰头的老规矩。去他第三课的备课笔记里找找，后半句是什么？","source":{"type":"file","id":"f_xj_l3"}},{"until":"seen_w_wb_040102","text":"查查那次跨年后的第一篇火灾报道。晚报是怎么写遇难少年的？","source":{"type":"url","value":"http://epaper.wcwb.cn/2004/0102.htm"}},{"until":"solved_c2_fire","text":"晚报只写了“七中高二学生赵某”。当年的同学或少年宫有没有提到他的名字？","source":{"type":"url","value":"http://www.wcsng.gov.cn/notice/0103.htm"}},{"until":"solved_c2_hero","text":"1月10日的晚报说，是谁组织孩子们撤离的？","source":{"type":"url","value":"http://epaper.wcwb.cn/2004/0110.htm"}},{"until":"seen_f_xj_photo_img","text":"七中3号机的镜像里有一张许嘉拍的楼顶合影。","source":{"type":"file","id":"f_xj_photo_img"}},{"until":"solved_c2_photo","text":"许嘉给这张合影写过一份说明，就在同一个目录里。照片上从左到右，五个人各是谁？","source":{"type":"file","id":"f_xj_photo"}},{"until":"solved_c2_last","text":"王小刚提到孟凡那晚去拿过一壶豆浆。赵记的老板娘和小川是什么关系？","source":{"type":"url","value":"http://wcrx.jiuwang.org/thread.asp?id=2560"}},{"until":"dlg_c2_squad2","text":"孟凡约他们2009年跨年去楼顶。可以在群里问问，那晚他们见着他了吗？","source":{"type":"chat","id":"squad"}},{"until":"seen_w_ar_sng_2004a","text":"晚报说材料是少年宫报送的。去网页时光机翻翻，元旦以后，少年宫自己发过什么？","source":{"type":"url","value":"http://www.wcsng.gov.cn/notice/0103.htm"}},{"until":"board_c2_board","text":"晚报记下了火灾后的说法。再对照灰盘和寻人帖，去推理页理一理这几年的事。","source":{"type":"board","id":"c2_board"}}],"facts":[{"requires":"solved_c2_handoff","text":"2000年4月2日，许嘉把灰盘交给小川，约好下周日还。两天后，许嘉去世了。"},{"requires":"solved_c2_fire","text":"小川死于2003年跨年夜少年宫的那场火。"},{"requires":"seen_w_wb_040102 & solved_c2_hero","text":"两篇晚报引用了少年宫的说法。一篇怀疑火与一名孟姓少年放烟花有关，另一篇表彰李静把冬令营的孩子带下了楼。"},{"requires":"solved_c2_last","text":"据寻人帖，孟凡那晚从赵记提走了一壶豆浆。开早点摊的是小川的妈妈。"}]}},"helpCards":{"ch0":"\u003cb>软盘与只读镜像\u003c/b>：原盘拨写保护，修复只在镜像上进行。","ch1":"\u003cb>千年虫\u003c/b>：两位年份会混淆世纪。六号机的具体错法见许嘉《第一课》。","ch2":"\u003cb>删除与簇\u003c/b>：被删文件的数据还能保留，直到被新文件覆盖。"},"readings":[{"id":"r1_door","chapter":"ch1","title":"门口的哥哥","date":"2026-12-21","requires":"ch1 & seen_f_xj_names & dlg_c1_xuning","source":"许宁看完《名单》以后发来的消息","intro":"她跟哥哥来旁听时记住的事。","html":"\u003cp>我哥骑车带我去少年宫，我就坐在后座上，替他抱着书包，里头装着软盘和胶布。\u003c/p>\u003cp>少年宫门口总蹲着一个男孩，比谁都到得早，手背上贴着创可贴。看见我哥，他先站起来，再把手背到身后去。\u003c/p>\u003cp>回家路上，我问门口那个哥哥手疼不疼。我哥说，你别问，他不爱说。\u003c/p>\u003cp style=\"text-align:right\">许宁\u003c/p>"},{"id":"r2_prints","chapter":"ch2","title":"多冲五张","date":"1999-12-19","requires":"ch2 & solved_c2_photo","source":"许宁拍来的：家里那张楼顶合影的背面","html":"\u003cdiv class=\"paper hand\">\u003cp>12.19　少年宫楼顶。\u003c/p>\u003cp>多冲五张，下礼拜带去。\u003c/p>\u003c/div>\u003cp>相框后面还夹着冲印店的取件单，“加印五张”那一栏打了个钩。\u003c/p>"}],"puzzles":{"c0_count":{"kind":"text","ask":true,"title":"一共几张","requires":"seen_c0_box","prompt":"清单写着“共五张”。看看开箱照片，盒子里实际有几张软盘？","answers":["6","六","6张","六张","6张软盘","六张软盘"],"hints":["开箱照片的最后一条。","五张彩色的，再加一张没贴标签的。","答案：6。"],"solvedText":"六张。读到最底下那张灰盘时，软驱咔哒咔哒响了好一阵。六张盘的镜像都存在“胶囊软盘”里了。","onSolve":{"clock":"2026-12-20 22:20","set":["c0_imaged"],"note":"n_count","toast":"“胶囊软盘”已出现在桌面"}},"c0_year":{"kind":"text","ask":true,"title":"第六张的日期","requires":"seen_f6_invite","prompt":"在灰盘上找到《邀请.txt》。写这份文件时，六号机的时钟显示的是哪一年？","answers":["1909","1909年"],"near":{"1980":"这是“修改时间”。看旁边的“六号机记录”。","1980年":"这是“修改时间”。看旁边的“六号机记录”。"},"hints":["在资源管理器里切到“详细资料”，或者右键看文件属性。","看“六号机记录”那一栏。","答案：1909。"],"solvedText":"1909年12月20日 21:14。六号机记下的是这个日期。","onSolve":{"note":"n_1909"}},"c0_keeper":{"kind":"text","ask":true,"title":"代管","requires":"seen_c0_box","prompt":"盒底那截白胶布上写着谁的名字？从2004年3月起，就是他在代管这只铁盒。","answers":["孟凡"],"hints":["在“物品”里打开开箱照片，看你记下的细节。","盒底的白胶布：“2004.3 ____代管”。","答案：孟凡。"],"solvedText":"孟凡，绿盘的主人。2004年3月起，这只铁盒在他手里。","onSolve":{"note":"n_keeper"}},"c1_xiaoliu":{"kind":"frame","ask":true,"title":"五个人五张","requires":"seen_v1999","clip":"v1999","frame":["21:41:20"],"answers":["21:41:20"],"prompt":"一鸣说“五个人五张”。把录像从头数一遍人头，哪一帧和这个数对不上？","near":{"21:38:05":"这里只拍到桌上的软盘和伸过来的手。","22:05:30":"这时候孩子们已经分开写信了。","23:30:40":"封盒的时候只有五个孩子站在桌前。"},"hints":["录像开头那几帧，大家还围着电脑。","数人头，最小的那个扎着羊角辫。","答案：21:41:20 那一帧。"],"solvedText":"21:41:20，六个孩子挤在电脑桌边。最小的那个扎着羊角辫，坐在一个男孩腿上。另一个男孩从画面边上探进头来，冲她喊：“小六，看镜头！”","onSolve":{"note":"n_xiaoliu"}},"c1_year":{"kind":"text","ask":true,"title":"哪一年","requires":"seen_f_xj_l1 & seen_f6_invite","prompt":"六号机给《邀请.txt》记的是1909年。它实际写于哪一年？","answers":["2009","2009年"],"near":{"1909":"1909是六号机自己以为的年份。许嘉说过，这台机器过了2000年以后差多少？","1980":"看“六号机记录”，再对照许嘉的第一课。","1998":"1998年胶囊还没封。","1999":"1999年12月20日胶囊还没封，“十年了”说不通。而且1999年12月31日是礼拜五。","2015":"2015年的12月31日确实是礼拜四，可“十年了”从1999年算起，到哪一年？","2020":"2020年的12月31日也是礼拜四，可离1999年已经二十一年了。"},"hints":["许嘉第一课：六号机过了零点，屏幕跳到1900年，“年份差一百”。","把六号机少算的年份加回去，再对照邀请里的星期：那一年的12月31日得是礼拜四。","答案：2009。"],"solvedText":"2009年12月20日，礼拜天。十一天以后，就是邀请里约的那一夜。","onSolve":{"note":"n_2009"}},"c1_writer":{"kind":"text","ask":true,"title":"没有落款","requires":"solved_c1_year & seen_f6_invite & seen_f_d4_letter","prompt":"《邀请.txt》没有落款。对照五封1999年的信，写邀请的人最可能是谁？","answers":["孟凡","凡凡"],"near":{"陈一鸣":"一鸣的信满是感叹号，没有这种错字。","赵小川":"小川的信一句一行，句号结尾，落款“川”。","白露":"白露的信里没出现这个错字。","米乐":"米乐的信爱用“！！”和“^_^”。"},"hints":["把邀请和五封信放在一起，留意邀请里的错字。","邀请里有个字读音对、字不对。五封信里，谁也这么打？","答案：孟凡（绿盘那封信）。"],"solvedText":"孟凡。十三岁那年，他在绿盘上把“说”打成了“所”。十年后的邀请里也有这个错字。","onSolve":{"note":"n_writer"}},"c1_back":{"kind":"multi","ask":true,"title":"录像里的声音","requires":"solved_c1_writer & seen_v1999","prompt":"封盒录像里的人，你只能先按声音记：男孩1、男孩2、男孩3、女孩1、女孩2。他们各是谁？","fields":[{"label":"男孩1","answers":["陈一鸣","一鸣"]},{"label":"男孩2","answers":["赵小川","小川","铅笔"]},{"label":"男孩3","answers":["孟凡","凡凡"]},{"label":"女孩1","answers":["米乐","米老鼠"]},{"label":"女孩2","answers":["白露","露露"]}],"hints":["两个女孩好认：21:38那一帧，她们各要了什么颜色的盘？对照开箱照片里的清单。22:05，男孩1在镜头后头。谁在信里写过要把大家拍进去？","剩下两个男孩看22:05那一帧：教人加h的是男孩2，打不出“说”的是男孩3。五封信的文件属性里有保存时间，22:05谁已经写完了？谁的信里把“说”打成了“所”？","答案：男孩1一鸣，男孩2小川，男孩3孟凡，女孩1米乐，女孩2白露。"],"solvedText":"男孩1是一鸣，那晚大半是他拍的。女孩1抢的是粉盘，是米乐；女孩2要的是白盘，是白露。男孩2是小川，22:04他已经存好了信，凑过去教男孩3打“说”。男孩3是孟凡，十分钟后存下来的那封信里，写的还是“所”。","onSolve":{"note":"n_back"}},"c1_owner":{"kind":"text","ask":true,"title":"最早的主人","requires":"seen_f_xj_l1 & props_f6_zip","prompt":"灰盘的隐藏文件夹里有一个压缩包。这张灰盘最早是谁的？","answers":["许嘉"],"hints":["右键点压缩包，看看属性里记了谁的用户名。","属性里还有写入设备。把用户名和七中3号机上的备课笔记对起来。","答案：许嘉。"],"solvedText":"许嘉。压缩包的作者是 xujia，创建时间是2000年4月2日傍晚。","onSolve":{"note":"n_owner"}},"c1_since":{"kind":"text","ask":true,"title":"那一夜","requires":"seen_t3104","prompt":"家属的寻人帖提到，孟凡是在什么日子从赵记提走那壶豆浆的？（年-月-日）","answers":["2009-12-31","2009年12月31日","2009-12-31晚"],"hints":["读寻人帖的正文。","找他从赵记提走豆浆的那一天。","答案：2009-12-31。"],"solvedText":"2009年12月31日，跨年夜，就是他在邀请里约大家上楼顶的那一夜。","onSolve":{"note":"n_since"}},"c2_undel":{"kind":"chain","ask":true,"title":"被删的信","requires":"ch2","file":"给四个人.txt（已删除）","start":12,"prompt":"灰盘上还认得出一封信的文件名：《给四个人.txt》。首簇是 #12。试着把还能读的几块接起来。","frags":[{"c":21,"next":null,"text":"川　03.12.31"},{"c":12,"next":13,"text":"一鸣，白露，凡凡，米乐："},{"c":13,"next":"??","text":"今晚想念给你们听，怕念不出来，先写下。"}],"order":[12,13,21],"answers":["12-13-21"],"hints":["从首簇 #12 开始。","#13 后面那几簇被覆盖了，指针读不出来。剩下那一簇是文件的末尾。","顺序：#12 → #13 → #21。"],"solvedText":"“今晚想念给你们听，怕念不出来，先写下。”\u003cbr>信的中间缺了，末尾还剩一个“川”字和日期。扫描时，旁边另一个文件也找回了开头。","onSolve":{"clock":"2026-12-22 11:00","note":"n_undel"}},"c2_owner2":{"kind":"text","ask":true,"title":"落款“川”","requires":"seen_f6_del_letter & seen_f_d2_letter","prompt":"被删的信落款只有一个“川”字，日期写成“03.12.31”。写信的是谁？","answers":["赵小川","小川","铅笔"],"hints":["五封1999年的信里，谁的落款也是一个字？","黑盘那封信，落款“川　99.12.31”，日期也是这么写的。","答案：赵小川。"],"solvedText":"赵小川。2003年12月31日下午五点二十，他在这张灰盘上给四个人写了一封信。","onSolve":{"note":"n_owner2"}},"c2_handoff":{"kind":"multi","ask":true,"fieldFeedback":true,"title":"交给谁","requires":"ch2 & seen_f_xj_last","prompt":"许嘉在最后一课上把灰盘交给了谁？他们约好什么时候还？","fields":[{"label":"先交给谁保管","answers":["赵小川","小川","铅笔"]},{"label":"约好哪天归还","answers":["下周日","下周天","下星期日","下星期天","下礼拜日","下礼拜天","下个周日","下个周天","下个星期日","下个星期天","下个礼拜日","下个礼拜天","4月9日","4月9号","四月九日","四月九号","2000年4月9号","0409","2000-04-09","2000年04月09日","2000-04-9","2000年04月9日","2000-4-09","2000年4月09日","2000-4-9","2000年4月9日"]}],"hints":["翻到《最后一课 0402.txt》的末尾，许嘉记下了收盘的人和下次开盒的安排。","最后一课是4月2日，星期日。可以照原话填，也可以填约好的日期。","答案：赵小川，下周日（4月9日）。"],"solvedText":"交给了小川，约好“下周日”还。约好的那天是4月9日，许嘉4月4日就去世了。","onSolve":{"note":"n_handoff"}},"c2_phrase":{"kind":"text","ask":true,"title":"门口那句话","requires":"ch2 & seen_f_xj_l3","prompt":"下雪那天，许嘉在少年宫门口说：“先到的等一等，后到的______。”","answers":["慢慢来","慢慢来，路上滑","慢慢来，路上滑，别跑","后到的慢慢来","先到的等一等，后到的慢慢来","先到的等一等，后到的慢慢来，路上滑，别跑"],"hints":["读许嘉的《第三课》。","米乐说要拿它当队歌。","答案：慢慢来。"],"solvedText":"“先到的等一等，后到的慢慢来，路上滑，别跑。”十年后孟凡写邀请，还留着前半句：先到的等一下。","onSolve":{"note":"n_phrase"}},"c2_fire":{"kind":"text","ask":true,"title":"那一夜","requires":"seen_w_wb_040102 & (seen_t2215 | seen_t2210 | seen_w_ar_sng_2004a | seen_w_ar_sng_daonian)","prompt":"小川死在哪一夜？","placeholder":"日期，或带年份的节日","answers":["2003年跨年夜","2003跨年夜","2003年跨年那晚","2003年12月31日晚","2003年12月31日夜里","2004年元旦","2004年元旦凌晨","2004元旦凌晨","2004年1月1日凌晨","2003-12-31","2003年12月31日","2004-01-01","2004年01月01日","2004-01-1","2004年01月1日","2004-1-01","2004年1月01日","2004-1-1","2004年1月1日"],"hints":["搜“少年宫 火灾”，找最早报道火情的那期晚报。","少年宫的通报和同学的悼念帖都提到了小川。再核对报纸上“昨日凌晨”指哪一天。","那一夜从2003年12月31日晚到2004年1月1日凌晨，两个日期都可以。"],"solvedText":"2003年12月31日夜到2004年元旦凌晨。小川没能从少年宫出来。","onSolve":{"note":"n_fire"}},"c2_hero":{"kind":"text","ask":true,"title":"冬令营的孩子","requires":"seen_w_wb_040110","prompt":"1月10日的晚报说，三楼冬令营的孩子是谁组织撤下楼的？","answers":["李静"],"hints":["搜“见义勇为”或“冬令营”。","2004年1月10日的晚报头版。","答案：李静。"],"solvedText":"李静，少年宫的朗诵老师。\u003cbr>这个名字你见过：七中广播站。2000年3月21日早上，第一个推开广播站门的，就是她。","onSolve":{"note":"n_hero"}},"c2_photo":{"kind":"multi","ask":true,"title":"合影","fieldFeedback":true,"requires":"ch2 & seen_f_xj_photo_img & seen_f_xj_photo","prompt":"1999年12月19日的楼顶合影里，从左到右分别是谁？","fields":[{"label":"左一","answers":["米乐","米老鼠"]},{"label":"左二","answers":["陈一鸣","一鸣"]},{"label":"左三","answers":["孟凡","凡凡"]},{"label":"左四","answers":["白露","露露"]},{"label":"左五","answers":["赵小川","小川","铅笔"]}],"hints":["许嘉把名字按学校列在《合影说明 1219.txt》里。拿名单上的人和照片对一对。","说明写了谁站在最左边。再看照片，谁抱着镜筒？谁挨着他？","从左到右：米乐、陈一鸣、孟凡、白露、赵小川。"],"solvedText":"米乐、一鸣、孟凡、白露、小川。一鸣踮着脚尖比了个V，他旁边那个穿灰绿外套、两手垂在身边的瘦高男孩就是孟凡。","onSolve":{"note":"n_photo"}},"c2_last":{"kind":"text","ask":true,"title":"赵记早点的摊主","requires":"seen_t3104 & seen_t2560","prompt":"寻人帖里说孟凡从赵记提走过一壶豆浆。这家摊子的老板娘和小川是什么关系？","answers":["母子","母子关系","母子俩","亲母子","他们是母子","他们是母子关系","两人是母子","两人是母子关系","母亲和儿子","妈妈和儿子","母亲与儿子","妈妈与儿子","母亲跟儿子","妈妈跟儿子","母亲儿子","妈妈儿子","老板娘是小川的妈妈","老板娘是小川的母亲","小川是老板娘的儿子","小川的妈妈","小川的母亲","母亲","妈妈","他妈妈","小川妈妈","小川妈","赵小川的妈妈","赵小川妈妈","周桂芝是小川的妈妈","周桂芝是小川的母亲","周桂芝是赵小川的母亲","小川是她儿子","她是小川的妈妈"],"near":{"周桂芝":"老板娘的名字对了。她和小川是什么关系？"},"hints":["寻人帖：他在赵记早点提走了一壶豆浆。","豆浆帖里，街坊说赵记老板娘的儿子“去年这天没的”。","答案：母子。老板娘是小川的妈妈。"],"solvedText":"他们是母子。每年元旦往老少年宫台阶上放一碗豆浆的，就是小川的妈妈。","onSolve":{"note":"n_last"}}},"boards":{"c1_board":{"title":"邀请","requires":"(solved_c1_year & solved_c1_writer & solved_c1_owner & solved_c1_since & seen_w_wb_000413)","intro":"先点空格，再选词语。全部正确才能通过。","text":"这张灰盘最早是{owner}的。压缩包的属性写着，2000年4月2日，他在少年宫一号机上把文件存进了这张盘。这台机器{why}，所以压缩包上记的是当时的日期。4月13日的《梧城晚报》记着，许嘉是4月4日夜里去世的。\u003cbr>\u003cbr>后来，有人用那台{machine}写了一份《邀请.txt》。这台电脑没打千年虫补丁，跨进2000年以后，机内年份就{shift}。文件属性里的“六号机记录”写着1909年12月20日。邀请开头写着“十年了”，约的是12月31号礼拜四。和机内年份对起来，那年是 {year} 年。\u003cbr>\u003cbr>邀请没有署名。写信的人把“说”打成了“{typo}”，绿盘上那封十三岁时写的信里也有这个错字。写邀请的人是{writer}。盒底那张胶布上写着，他从 {since} 年起代管这个铁盒。他约大家 12 月 31 日晚上十一点在{place}见面，可就在那天夜里，{who}出了门，再也没有回来。\u003cbr>\u003cbr>十七年后，有人把铁盒匿名寄给了老K。清单上写着五张软盘，盒子里却有六张，多出来的，正是这张灰盘。","slots":{"machine":"w_m6","shift":"w_100","year":"w_2009","typo":"w_suo","writer":"w_mf","since":"w_2004","why":"w_patched","owner":"w_xj","place":"w_roof","who":"w_mf"},"words":{"w_m6":"六号机","w_m1":"一号机","w_jf03":"七中3号机","w_reader":"老K的读盘机","w_100":"差了一百年","w_10":"差了十年","w_reset":"回到出厂那天","w_2009":"2009","w_1999":"1999","w_2015":"2015","w_2020":"2020","w_2004":"2004","w_2003":"2003","w_suo":"所","w_zao":"早","w_zai":"在","w_mf":"孟凡","w_ym":"陈一鸣","w_xc":"赵小川","w_bl":"白露","w_ml":"米乐","w_xj":"许嘉","w_xn":"许宁","w_patched":"打过千年虫补丁","w_battery":"刚换过主板电池","w_net":"联网对过时间","w_roof":"老少年宫楼顶","w_store":"少年宫储藏室","w_lake":"东湖北岸"},"hints":["许嘉在第一课里记过，六号机过了2000年会把年份少算多少。算出年份后，再核对邀请里的“礼拜四”和“十年了”。","把邀请里的错字跟1999年的信对一对。代管人的名字在盒底，压缩包的作者和日期可以右键点“属性”看。至于孟凡最后一次出门的日期，家属在寻人帖里写过。","依次为：许嘉 → 打过千年虫补丁 → 六号机 → 差了一百年 → 2009 → 所 → 孟凡 → 2004 → 老少年宫楼顶 → 孟凡。"],"solvedText":"灰盘最早属于许嘉，最后到了孟凡手里。许嘉死于2000年4月4日；孟凡在他约朋友见面的那一夜失踪。中间那几年，这张盘在谁手里？","onSolve":{"note":"n_board1"},"sourceLabels":{},"investigationRequires":"solved_c1_year & solved_c1_writer & solved_c1_owner & solved_c1_since & seen_w_wb_000413","requiredSources":[]},"c2_board":{"title":"楼顶见","requires":"(solved_c2_undel & solved_c2_owner2 & solved_c2_handoff & solved_c2_phrase & solved_c2_fire & seen_w_wb_040102 & solved_c2_hero & solved_c2_photo & solved_c2_last & dlg_c2_squad2 & seen_w_ar_sng_2004a)","intro":"先点空格，再选词语。全部正确才能通过。","text":"2000 年 4 月 2 日，最后一课结束之后，{xc}留下来帮{xj}收拾教室。许嘉把灰盘交给他，说好{when}再还。两天后许嘉去世，没能回来取盘。\u003cbr>\u003cbr>2003 年 12 月 31 日下午，小川还用这张盘给另外四个人写了一封信。那晚五个人上了少年宫楼顶。1月2日的晚报只写遇难者是七中高二学生赵某。少年宫随后在通报里写出了小川的名字。至于起火原因，报上转述的是少年宫的初步判断，提到楼顶放过烟花的一名孟姓少年。1月10日，晚报登出了少年宫报送的事迹，说{hero}组织了疏散，三楼参加冬令营的 {kids} 个孩子全部撤到了院子。到了2010年，竟还有人追到寻人帖里，问{blamed}是不是当年那个“放火”的孩子。\u003cbr>\u003cbr>那件事以后，四个人就散了。许嘉在少年宫门口说过一句话，后来成了他们见面的老规矩：“先到的等一等，后到的{phrase}。”2009 年底，孟凡约大家回楼顶见面，邀请里还留着前半句。问起那天晚上，一鸣说自己{yiming}，白露说自己{bailu}，米乐说自己{mile}。三个人都说没去楼顶。\u003cbr>\u003cbr>王小刚在寻人帖里提到的那壶豆浆，是孟凡那晚十点半在{stall}提走的。摊主是{owner}。","wordAliases":{"w_bjj":"w_mml"},"slots":{"xj":"w_xj","xc":"w_xc","when":"w_nextsun","blamed":"w_mf","hero":"w_lj","kids":"w_18","phrase":"w_mml","yiming":"w_party","bailu":"w_shift","mile":"w_grandma","stall":"w_zhaoji","owner":"w_xcmom"},"words":{"w_xj":"许嘉","w_xc":"赵小川","w_mf":"孟凡","w_ym":"陈一鸣","w_bl":"白露","w_ml":"米乐","w_xn":"许宁","w_lj":"李静","w_zzb":"冯振邦","w_hm":"何蔓","w_nextsun":"下周日","w_tomorrow":"明天","w_forty":"四十岁那天","w_18":"18","w_5":"5","w_12":"12","w_mml":"慢慢来","w_dd":"等一等","w_party":"在省城参加公司年会","w_shift":"在医院值班","w_grandma":"在外婆家吃饭","w_roof":"老少年宫楼顶","w_zhaoji":"赵记早点","w_store":"少年宫储藏室","w_xcmom":"小川的妈妈","w_mfmom":"孟凡的妈妈","w_mlmom":"米乐的妈妈"},"hints":["灰盘的交接看许嘉的《最后一课》（隐藏文件）和灰盘上找回的残信。","对照1月2日的火情报道、1月10日的表彰报道和寻人帖的跟帖。三个人各自在哪儿，是他们在群里说的。豆浆摊的主人，街坊们也提起过。","依次为：赵小川 → 许嘉 → 下周日 → 李静 → 18 → 孟凡 → 慢慢来 → 在省城参加公司年会 → 在医院值班 → 在外婆家吃饭 → 赵记早点 → 小川的妈妈。"],"solvedText":"许嘉把灰盘交给了小川。到了2009年，写邀请的人已经是孟凡。\u003cbr>三个人都说自己那晚没去楼顶。孟凡是怎么过的那个跨年夜？","onSolve":{"note":"n_board2"},"sourceLabels":{},"investigationRequires":"solved_c2_undel & solved_c2_owner2 & solved_c2_handoff & solved_c2_phrase & solved_c2_fire & seen_w_wb_040102 & solved_c2_hero & solved_c2_photo & solved_c2_last & dlg_c2_squad2 & seen_w_ar_sng_2004a","requiredSources":[]}},"dialogues":[{"id":"c0_parcel","contact":"yizhan","trigger":"ch0","steps":[{"npc":"老K，你们工作室有个包裹。给你放梧桐路的柜子了，12号格，取件码0619。没留寄件人，地址就写了个“少年宫”。","previousText":"【梧桐路驿站】您的包裹已存入梧桐路便民快递柜12号格，取件码0619。寄件人：未填写。寄件地址：少年宫。"},{"me":"好，我这就过去拿。","previousText":"（少年宫？）"},{"action":{"set":["c0_parcel"],"clock":"2026-12-20 21:50","toast":"你把包裹抱回了工作室"}}]},{"id":"c0_kelan","contact":"kelan","trigger":"c0_parcel","steps":[{"npc":"睡了没？","previousText":"睡了没。"},{"npc":"复查约在下周三上午，别又跟我说忘了。","previousText":"复查约的下周三上午，别又跟我说忘了。"},{"me":"知道了。刚刚收了个怪包裹，看完就睡。","previousText":"知道了。收了个怪包裹，看完就睡。"},{"npc":"看完就睡啊。你忘了上回熬夜，心慌了好几天？","previousText":["你那个心跳，熬一次夜乱三天。","别熬夜。你那个心跳，熬一次夜乱三天。"]}]},{"id":"c0_end","contact":"kelan","trigger":"dlg_c0_kelan & solved_c0_count & solved_c0_year & solved_c0_keeper & seen_w_quan_post","steps":[{"action":{"clock":"2026-12-21 00:40"}},{"me":"姐，问你个事。你听说过梧城少年宫有个时间胶囊吗？"},{"npc":"少年宫？早搬了。老楼不是说元旦后要拆？"},{"npc":"你这回又接了个什么活儿？","previousText":"你又接了什么活。"},{"me":"我收到了一个匿名包裹，里面就是那个胶囊。我刚看见有人发帖找它，准备先问问。","previousText":["包裹里就是那个胶囊，没写谁寄的。我刚看见有人发帖找它。","让我帮忙读几张老软盘，连个回电话都没留。我明天问问网上找盒子的那个人。","寄盒子的人想找以前保管它的人，连名字都没留。我明天先问问网上找盒子的那位。","我问过驿站了。包裹是从柜子投的，他们没见过寄件人。明天我问问网上找盒子的人。","我也想知道是谁找我，包裹上连个名字都没留。","没人委托，东西自己送上门的。","没人委托。东西自己送上门的。"]},{"npc":"都快一点了，有事明天再说。","previousText":"……睡觉。"},{"action":{"set":["c0_done"]}}]},{"id":"c1_yiming","contact":"yiming","trigger":"ch1","steps":[{"me":"陈先生你好，我是老K，开电脑修理店的。我看见你月初找胶囊的帖子了。你找的那只铁盒，我昨晚收到了。","previousText":"陈先生你好，我是修旧电脑的老K。看到你12月1号找胶囊的帖子。那只铁盒，昨晚被人寄到了我这儿。"},{"npc":"？？？"},{"npc":"真的假的！！谁寄的？？"},{"me":"没写寄件人。盒底写着“2004.3 孟凡代管”。","previousText":"没写寄件人。盒子缠着电工胶布，盒底贴着一截白胶布：2004.3 孟凡代管。"},{"npc":"孟凡？？","previousText":"……孟凡。"},{"npc":"对，04年少年宫旧楼封了，他就跟老主任说，盒子他替我们收着。09年跨完年，我们就联系不上他了。警察说他去南方打工了。","previousText":"对，04年少年宫旧楼封了，他跟老主任说他替大家收着。09年跨年以后，人就没了。警察说他去南方打工了。"},{"npc":"这些年我问过好些人，谁也说不清盒子在哪儿。你真收到了？","previousText":["这些年我问过好些人，谁也说不清盒子在哪儿。","胶囊跟着他一起没的！！我找了好几年！","后来再问盒子的事，也没人知道。我找了好几年了。"]},{"npc":"K哥，你下午在店里吗？我想过去看看。31号晚上楼顶那场直播都约好了，我还跟人家说，到时候要念念我们当年写的信呢。","previousText":["K哥，你下午在店里吗？我过来拿！31号晚上我在老少年宫楼顶直播，就指着这盒子当主角了哈哈哈","K哥你在工作室吗？我下午就过来拿！31号晚上我在老少年宫楼顶直播，这个盒子是主角哈哈哈"]},{"me":"下午我在，你来吧。盘我都备好了。清单上只写了五张，多出来那张灰的，你见过吗？","previousText":["软盘我都做了镜像，盒子先放我这儿吧。我得把盘读完，再问问当年写信的几个人。对了，我数着有六张，怎么那张灰的没写在清单上？","盘我已经做了镜像。原物先放我这儿，等我读完、问过本人再说。另外，里面有六张盘，有一张灰的，不在清单上。","盘我已经做了镜像。原物先放我这儿，等我读完、问过本人再说。另外，里面有六张盘。有一张灰的，不在清单上。"]},{"npc":"不可能。","previousText":"……不可能。"},{"npc":"那天我在！五个人五张，我拍的！"},{"npc":"封盒那晚的录像在我们官网上，去年公司翻录的。你自己看，一张一张数。"},{"action":{"set":["c1_clips"],"toast":"一鸣发来了鸣远影像官网的链接"}},{"npc":"http://www.mingyuan.tv/1999.html","previousText":"mingyuan.tv/1999.html"},{"npc":"K哥，盒子在你那儿的事，你先别跟别人说。"},{"npc":"算了，我自己说。"},{"action":{"clock":"2026-12-21 10:12","set":["c1_found_post"],"toast":"陈一鸣在梧城圈发帖：“胶囊找到了！”"}}]},{"id":"c1_wanglei","contact":"wanglei","trigger":"dlg_c1_yiming","steps":[{"npc":"K哥，你看一鸣刚发的没？前几天还在满城找铁盒子，今天就说找着了。","previousText":["K哥！七中那期我看了八遍。我就是视频里那个灌水大王“磊磊”，哈哈。"]},{"npc":"他也没说在哪儿找着的，底下已经猜开了。","previousText":["我捣鼓了个“梧城旧网”，把梧城热线那些老帖子捞回来，谁都能上去看。你那期视频一发，好家伙，流量涨了十倍！","我现在弄了个“梧城旧网”，把梧城热线那些老论坛的存档捞回来放网上，免费看。你那期视频之后，流量蹭蹭地涨了十倍。"]},{"me":"我刚跟他说盒子在我店里。磊磊，你手里还有少年宫那几年的老帖子、旧报纸吗？我想看看当年有没有人提过封盒的事。","previousText":["我也看见了。磊磊，你手里还有梧城少年宫那几年的老帖子、旧报纸吗？我想看看当年有没有人提过封盒的事。","在我这儿，昨晚寄到店里的。里头有六张软盘，铅封上印着梧城少年宫。磊磊，能帮我翻翻那地方以前的帖子、老报纸吗？我想弄清这盒子是怎么来的。","正想跟你打听老少年宫的事。孟凡这个名字，你有印象吗？","正好要查东西：老少年宫，还有一个叫孟凡的人。"]},{"npc":"成啊，我家以前就在梧桐路，那会儿我也常泡热线。","previousText":["成啊，我家以前就住少年宫对面，那会儿我也常泡热线。","少年宫我熟，我当年就住它对面那条街。一鸣他们那一拨，就是站长礼拜天带的小孩，天天往楼顶跑。","成。那会儿我家就住对面那条街，路名改了我也认得。"]},{"npc":"我先翻翻手头那几张盘，找着了我给你发过来。","previousText":["我先翻翻手头那几张盘。要是少了哪一页，我再找当年的版主问问。","孟凡……热线上好像有个寻人帖。你直接去存档里搜，wcrx.jiuwang.org，右上角有搜索。全站搜也行：search.jiuwang.org。","你先忙店里的，我手头正好有几份备份。碰上缺页的，我再问问以前的版主。"],"mergedFollowup":["找着了我给你发过来。","讲个笑话：千年虫那年我爸把家里电脑的电源拔了，说“断电它就不知道过年了”。","翻到东西我就在这儿给你留个话。"]}]},{"id":"c1_xiaoliu","contact":"yiming","trigger":"solved_c1_xiaoliu & dlg_c1_yiming","steps":[{"me":"录像里有个扎羊角辫的小姑娘，有个男孩冲她喊“小六”。她也是你们班的？","previousText":["你看录像里扎羊角辫的那个，你喊她“小六”。她也是你们班的？","录像21:41:20那一帧，桌边是六个孩子。最小的扎羊角辫，坐在小川腿上。你冲她喊“小六，看镜头”。她是谁？"]},{"npc":"小六！！","previousText":"……小六！！"},{"npc":"哎哟，你不提我真想不起来了。","previousText":"我把她忘得干干净净。"},{"npc":"许嘉哥礼拜天有时候带他妹妹来，我们都叫她小六。她跟着凑热闹，不算我们班的。"},{"npc":"封盒那晚她也在？我光顾着数盘了。"},{"me":"你说的是许宁啊？我认识她，还真没听她提过这个小名。","previousText":"许嘉的妹妹叫许宁。我认识她。"},{"npc":"你认识她啊，那正好，你问问她记不记得那天的事！","previousText":"那你问问她！"}]},{"id":"c1_xuning","contact":"xuning","trigger":"dlg_c1_xiaoliu","steps":[{"me":"许宁，我收到个铁皮饼干盒，是梧城少年宫那年跨年封的。录像里有人喊“小六”，一鸣说是你。你还记得吗？","previousText":"许宁，又要打扰你。有人给我寄了一只铁皮饼干盒，是1999年跨年夜封的时间胶囊。问你个奇怪的事：那天晚上，你去过梧城少年宫吗？"},{"npc":"饼干盒？","previousText":"……饼干盒。"},{"npc":"我哥以前也用饼干盒藏东西。","previousText":"我哥藏东西，也用饼干盒。"},{"npc":"一鸣还留着那段录像啊。","previousText":"少年宫……你怎么知道？"},{"npc":"小六是我。我哥礼拜天下午去教电脑，带我去过两回。他们说我最小，得排第六。","previousText":"去过。那年冬天，我哥每个礼拜天下午去那儿教一帮小孩电脑，带我去过两回。那帮小孩叫我“小六”，说我最小，排第六。"},{"npc":"跨年那晚我哥在学校机房值班，是我妈带我去的。我在少年宫睡着了，没看见他们封盒。","previousText":["跨年那晚我哥在学校机房值班，是我妈带我去的。我在少年宫睡着了，醒来已经在教育局我爸的办公室。盒子怎么封的，我没看见。","跨年那晚我哥在学校机房守着，是我妈带我去的。盒子怎么封的我一点印象也没有。十点多她就抱我去教育局找我爸了。","跨年那晚我哥要在学校机房守机器，让我妈带我去看封盒。十点多我就困了，我妈把我抱走，送到我爸值班的地方——那晚他在教育局值班，怕电脑一过零点就出毛病。我在值班室的折叠椅上睡的。我没写盘，我那时候拼音都打不利索。","跨年那晚我哥要在学校机房守机器，让我妈带我去看封盒。十点多我就困了，我妈把我抱走，送到我爸值班的地方——那天晚上他在教育局值千年虫的班。我在值班室的折叠椅上睡的。我没写盘，我那时候拼音都打不利索。","跨年那晚我哥在学校机房守着，是我妈带我去的。盒子怎么封的我一点印象也没有。十点多她就抱我去教育局找我爸了，倒是记得他值班室那把折叠椅，睡得我脖子疼。"]},{"me":"灰盘没写在清单上。你走以前见过那张盘吗？","previousText":["除了清单上的五张，盒里还有一张灰色的。你那晚也带软盘去了吗？","盒子里多了一张灰色的盘。","我数来数去，盒子里都多出一张盘。灰色的，是你的吗？"]},{"npc":"桌上那几张花花绿绿的，我还有点印象。灰的我记不清了，有可能是我哥的。","previousText":["桌上那几张花花绿绿的，我还有点印象。灰的我记不清了。","我只记得桌上那几张花花绿绿的。不过你说的灰盘，我哥也有。","我没写过呀，那时候我找个字母都得盯着键盘找半天。不过灰色的我倒是见过。","灰的？","我可没写过，那时候找个拼音都要半天。灰的倒是见过。"]},{"npc":"我哥有一盒3M的灰色软盘，七中机房发的，他用得很省。"},{"me":"七中拆了以后，我又从3号机上救回来点东西。有个文件夹就叫“少年宫”，我一直没打开。你看我能翻翻吗？","previousText":"3号机最后那3%的扇区，七中拆了以后我又跑了半个月才补完。补出来一个“少年宫”文件夹。你说过，你哥的私事先问你，我就没打开。"},{"npc":"那是他备课用的，你打开吧。","previousText":["那是他备课用的。你打开吧，就开那一个。","那是他备课用的。你打开吧。"]},{"action":{"set":["c1_mirror"],"toast":"许宁同意你打开“少年宫”文件夹"}},{"npc":"看完跟我说说。","previousText":"看完跟我说说，他那时候教得怎么样。"}]},{"id":"c1_call","contact":"mfcall","trigger":"c1_dial","startsAt":"2026-12-21 14:06","steps":[{"me":"（拨号：139 0457 0312）"},{"sys":"嘟——嘟——嘟——","sound":"ringback"},{"npc":"我是孟凡。有事留言，没事——楼顶见。"},{"sys":"（语音信箱的提示音。你没有留言，挂了电话。）","sound":"voicemail"},{"action":{"toast":"通话记录已保存"}}]},{"id":"c1_wang","contact":"wangxy","trigger":"dlg_c1_call","steps":[{"npc":"［语音 0:04］你是谁？"},{"npc":"［语音 0:06］刚才是你打的？我看见未接来电了。","previousText":"［语音 0:06］刚才是你打的那个号？"},{"me":"您好，刚才是我打的。我是老K，开电脑修理店的。请问您认识孟凡吗？","previousText":"阿姨您好，我叫老K，修电脑的。我在找孟凡。"},{"npc":"［语音 0:03］他是我儿子。"},{"npc":"［语音 0:03］你在哪儿见过他？","previousText":"［语音 0:05］你找他干啥？他欠你钱？"},{"me":"阿姨，我没见过他。有人给我寄了个铁盒，盒底写着“孟凡代管”。盒里有张软盘，约人12月31号去少年宫楼顶，没署名。","previousText":["不是，阿姨。有人给我寄了个铁盒子，盒底写着“孟凡代管”。里面有张软盘，上头约人12月31号晚上去少年宫楼顶见面，没写名字。","不是，阿姨。有人给我寄了个铁盒子，盒底写着“孟凡代管”。里面有张软盘，上头约人十二月三十一号晚上去少年宫楼顶见面，没写名字。","不是。有人给我寄了一个铁盒子，盒底贴着胶布，写着“孟凡代管”。"]},{"npc":"［语音 0:12］凡凡约他们上楼顶，那条短信我见过。那个饼干盒子，他出门时背着走的。他没回来，盒子也没了。","previousText":"［语音 0:09］……那个饼干盒子？那年他出门背着走的。他没回来，盒子也没了。"},{"npc":"［语音 0:04］谁寄给你的？"},{"me":"没留名字。我这就把东西拍给您。阿姨，刚才电话里那句“楼顶见”，是孟凡自己录的吗？","previousText":["没留名字。我这就把面单、盒底和邀请拍给您。阿姨，刚才电话里那句“楼顶见”，是孟凡自己录的吗？","没留名字。我把面单、盒底和那封邀请拍给您。原件我收好，民警要看，随时来店里拿。","没写寄件人。"]},{"sys":"（你把照片发了过去。）","previousText":["（过了好几分钟，她才又发来一条。）","（对方很久没有说话。）"]},{"npc":"［语音 0:12］是他录的。这是凡凡原来的号。头一年我天天打，后来才补了张卡。小刚新印的寻人启事，留的就是这个号。","previousText":["［语音 0:12］这是凡凡原来的号。头一年我天天打，后来才补了张卡。小刚新印的寻人启事，留的就是这个号。","［语音 0:07］他没回来，我就去补了张卡。号我一直留着，万一他打回来呢。","［语音 0:07］号我一直留着。万一他想打回来呢。","［语音 0:07］号我一直交着。万一他想打回来呢。"]},{"npc":"［语音 0:08］照片收到了。我明早带去派出所。再有他的消息，你就打这个号。多晚都行。","previousText":["［语音 0:08］你发来吧，我明早带去派出所。再有他的消息，你就打这个号。多晚都行。","［语音 0:12］你发来吧，我明早带去派出所。你要是找着凡凡，也告诉我一声。我这病不知道还能拖几年。","［语音 0:10］你要是再翻着什么，跟我说一声啊。我这病也不知道还能拖几年。","［语音 0:10］你要是找着他啥东西，告诉我一声。我这病，等不了几年了。"]}]},{"id":"c1_end","contact":"yiming","trigger":"board_c1_board & dlg_c1_wang","steps":[{"npc":"K哥，我那条帖子底下，有人说盒子是孟凡自己寄回来的。","previousText":"K哥，我那条帖子底下，有人问孟凡是不是早死了。"},{"npc":"也有人说得很难听，我删评论删到手软。","previousText":"我删评论删到手软。"},{"npc":"他要真在南边过得好好的，干吗不自己来找我们？","previousText":"他要是还活着，胶囊怎么会在别人手里？"},{"me":"我也想知道。那张灰盘的来历我倒是查到了，最早是许嘉的。","previousText":"我也想知道。还有一件事：那张灰盘，最早是许嘉的。"},{"npc":"许嘉哥……"},{"npc":"他是2000年走的。"},{"action":{"set":["c1_done"]}}]},{"id":"c2_mile","contact":"mile","trigger":"ch2","steps":[{"npc":"K老师好呀，我叫米乐，跟一鸣要的你的号。你拆出来的粉色软盘是我的！刚看到一鸣发的帖子，吓我一跳。","previousText":["K老师好呀，我叫米乐。你拆出来的粉色软盘是我的！刚看到一鸣发的帖子，吓我一跳。","K老师好~我是米乐，粉色那张！一鸣的帖子我看到了，吓我一跳。"]},{"npc":"一鸣说你把盘读出来了？","previousText":"胶囊……真的在你那儿？"},{"me":"嗯，做了备份。一共六张。","previousText":["在我这儿，里面六张盘我都做过镜像了。","在。六张盘，我都做了镜像。"]},{"npc":"六张？","previousText":"六张……"},{"npc":"我那封信也读出来了吗？","previousText":["那我那张粉的呢？里面的字还能看清吗？","盒子还是当年那个吗？锈得厉害吗？","盒子呢？路上磕坏了没有？","那个盒子，是怎么寄到你那儿的呀？有寄件人吗？"]},{"me":"读出来了。我发给你。","attachments":[{"type":"file","id":"f_d5_letter","label":"亲爱的四十岁的米乐.txt"}],"previousText":["能。你要的话，我单独发给你。","锈了点，盒盖上的名字还看得清。寄的人挺仔细，四周塞满了纸条。","没磕坏，寄的人怕它在路上晃，盒子四周塞的都是纸条。","没事，里头垫了纸。面单上没留名字。","没写寄件人，从梧桐路的快递柜投的。","盒子没磕着。四周塞得挺严实，我拆了半天。"]},{"npc":"收到啦，谢谢K老师。","previousText":["好呀，谢谢K老师。","那就好。","哦……"]},{"npc":"［表情：捂脸］先不聊啦，我们班的小孩趴办公室门口等我呢。","previousText":["［表情：捂脸］K老师，我得回班上啦。我们三（2）班那帮小家伙，皮得很。","［表情：捂脸］不好意思K老师，要上课了。我带三（2）班，皮得很。"]},{"npc":"对了，我先拉你进群。一鸣和白露都在。","previousText":["我拉你进群吧，一鸣和白露也在。","我拉你进个群，我们几个都在。群名还是当年那个~"]},{"action":{"set":["c2_squad"],"toast":"米乐邀请你加入群聊“除虫小队”"}}]},{"id":"c2_squad","contact":"squad","trigger":"c2_squad","steps":[{"sys":"米乐邀请你加入了群聊“除虫小队”"},{"who":"米乐","npc":"K老师进来啦！就是他帮咱们把软盘读出来的。","previousText":"欢迎K老师！！就是他帮我们读盘的~"},{"who":"陈一鸣","npc":"K哥来啦！31号晚上十一点开播，零点开盒。差十分钟我先念我那封。K哥，我那封也发我一份啊。","previousText":["K哥来啦！31号晚上十一点开播，零点开盒。差十分钟我先念我那封。K哥，你读出来发我一份啊。","K哥来了！！直播流程我发一下：23:00楼顶开播，23:50读信，零点开盒！！"]},{"who":"陈一鸣","npc":"对了！K哥说盒子里多了一张灰盘，清单上没有！谁塞的？？"},{"who":"米乐","npc":"……"},{"who":"白露","npc":"谁同意直播了？"},{"who":"陈一鸣","npc":"白露！你31号排夜班吗？楼顶给你留个位置啊。","previousText":["白露！你三十一号排夜班吗？楼顶给你留个位置啊。","白露你在啊！好多年没见了哈哈哈"]},{"who":"白露","npc":"一鸣，我是问谁答应让你播了？","previousText":"我问的是，谁同意了。"},{"who":"米乐","npc":"好啦好啦，先让K老师读完嘛~［表情：抱抱］"},{"who":"白露","npc":"老K，读出来的东西，先私下发给本人，不要发群里。","previousText":"老K，读出来的东西，先私下发给本人。不要发群里。"},{"me":"好。各人的信我私下发。灰盘上还有几个文件没读全。","previousText":["行，读出来我单独找你们，群里就不贴了。","好，我单独发。","好，先私下发给本人。","我也是这个规矩。"]},{"who":"陈一鸣","npc":"行行行。"}]},{"id":"c2_bailu","contact":"bailu","trigger":"dlg_c2_squad","steps":[{"npc":"我是白露。"},{"npc":"他要是有写给我的，你单独发我一份。","previousText":["灰盘里要是有他写的东西，先给我看一眼。","那张灰盘里，如果有他写的东西，先给我看。"]},{"me":"哪个他？"},{"sys":"（对方正在输入……）"},{"npc":"孟凡。写给别人的就算了。","previousText":"都行。"},{"npc":"我在急诊，晚点说。","previousText":"我在急诊。晚点说。"}]},{"id":"c2_squad2","contact":"squad","trigger":"solved_c2_last & solved_c2_hero & dlg_c2_squad","steps":[{"me":"我想跟你们打听个事。2009年跨年那会儿，孟凡是不是约过你们去老少年宫楼顶？","previousText":"问大家一件事：2009年，孟凡是不是约过你们，跨年夜去老少年宫楼顶？"},{"who":"陈一鸣","npc":"……你怎么知道？"},{"me":"灰盘上的邀请是他写的，约在晚上十一点。你们谁那晚见过他？","previousText":["灰盘上有他写的邀请，约的是晚上十一点。他那天见着你们谁了吗？","我在灰盘上找到了他的邀请。把六号机记错的年份换回来，是2009年12月20日。","灰盘上有他的邀请，写于2009年12月20日。"]},{"who":"米乐","npc":"嗯……他那年给我们发过短信。十年了，楼顶见。"},{"who":"米乐","npc":"那天……你们谁去了？","previousText":["一鸣，你那晚也没见着他吧？","我们……都没去。"]},{"who":"陈一鸣","npc":"那天我在省城参加公司年会，哪走得开啊。","previousText":"我在省城公司年会，走不开。"},{"who":"白露","npc":"我在医院值班。"},{"who":"米乐","npc":"我也没赶过去。那天在外婆家吃饭，吃到很晚。","previousText":"我在外婆家吃饭，吃到很晚。"},{"who":"陈一鸣","npc":"后来就联系不上他了，警察说他去南方了。","previousText":"后来他就没了。警察说去南方了。"},{"who":"白露","npc":"他03年跨年就说过，过完年要去东莞。","previousText":["是警察告诉你的？","警察说的。"]},{"sys":"（没人接话。）","previousText":"（群里安静了很久。）"}]},{"id":"c2_end","contact":"wangxy","trigger":"board_c2_board & dlg_c2_squad2","steps":[{"npc":"［语音 0:06］你在店里吗？"},{"npc":"［语音 0:11］我到你门口了。东西沉，你出来帮我抬一下。"},{"action":{"clock":"2026-12-22 17:30","toast":"你帮王秀英把旧电脑抬进店里。她把手上的黑灰擦了擦，没坐就走了。"}},{"npc":"［语音 0:18］凡凡刚不见那阵，小刚从硬盘里找着了他约朋友上楼的短信，给我印了一份。我拿去给民警了。别的文件一点开就卡死。这回你帮我看看，他还留过什么。","previousText":["［语音 0:18］他刚不见那阵，小刚把硬盘接到他自己的电脑上，找着一份短信，印出来给了民警。别的文件一点开就卡死。这回你帮我看看，他还留过什么。","［语音 0:15］凡凡走了以后，这电脑我就没让人动过。你昨天跟我说他约人去楼顶，我回去想了半宿。他走之前会不会还写过别的？你帮我找找吧。","［语音 0:15］他房里的东西，我十七年都没让人碰过。这台电脑，你看吧。","［语音 0:15］他房里的东西，我十七年没让人碰。这个电脑，你看吧。","［语音 0:15］他走以后，这台电脑我谁也没让碰过。昨晚想了半宿，你连盘里约人见面的话都读出来了，能不能帮我看看，他走之前还写过些啥？"]},{"npc":"［语音 0:09］他那几年天天晚上坐那儿，一个字一个字地敲。我问他敲啥，他说找东西。","previousText":"［语音 0:09］他那几年天天晚上坐那儿，一个字一个字地敲。我问他敲啥，他说早东西。"},{"me":"阿姨，我在机箱侧面看见张标签，写着“梧城少年宫 微机室 6号”。孟凡怎么把它弄回家的？","previousText":["侧面这张标签还在，写着“梧城少年宫 微机室 6号”。","机箱侧面贴着标签：梧城少年宫 微机室 6号。"]},{"npc":"［语音 0:12］他花五十块钱买回来的，少年宫着火那年。面板都烧化了，他拆了修，修了大半年才开得了机。他说这机器还能用，扔了可惜。","previousText":"［语音 0:12］他花五十块钱买回来的，少年宫着火那年。面板都烧化了，他拆了修，修了大半年才开得了机。他说这台机器跟他一样，有病，可还能用。"},{"action":{"set":["c2_pc"]}}]},{"id":"c1_wlbbs","contact":"wanglei","trigger":"dlg_c1_wanglei","steps":[{"npc":"K哥，热线刚找回来几页，有几帖还是99年年底发的。你要找什么，进去搜搜看。","previousText":["K哥，热线刚找回来几页，有几帖还是99年年底发的。还翻到一张找孟凡的启事，就在“寻人寻物”那一栏。","K哥，1999年年底的热线又找回几页。我还翻到一条后来登的寻人帖，也放回原来的版里了。","对了K哥，热线的存档是从一块老服务器硬盘里捞出来的，坏道多。1999年最早那几页先修好了。你问的寻人帖，我也翻出来了。剩下的我每天修一点，修好一段放一段。"]},{"me":"晚报那些老报纸，也是你扫的？","previousText":["晚报那些老报纸，也是你弄上去的？"]},{"npc":"嗯，给报社资料室搭把手。年底那本已经扫完了，按日子往下翻就行。","previousText":["晚报社资料室有一屋子合订本，我在帮他们扫，扫一批上一批。少年宫老官网也能打开了，上回那张招生简章还在。我刚把封盒那篇放进活动剪影，你从原来那个网址进去就行。","晚报社资料室有一屋子合订本，我在帮他们扫，扫一批上一批。少年宫老官网也接起来了，上回那张招生简章还在。我刚把封盒那篇放进活动剪影，你从原来那个网址进去就行。"],"mergedFollowup":["拍的歪的那几张凑合看啊，合订本太厚，一撒手就合上了。","拍得歪的那几张凑合看啊，合订本太厚，一撒手就合上了。","站长的事你给查清了，帮你干点活，应该的。"]}]},{"id":"c2_wlbbs","contact":"wanglei","trigger":"ch0 & !ch0","retired":true,"steps":[{"npc":"你上回问的那几年，我翻到元旦前后的晚报了。热线也多读出来几页。","previousText":["K哥，热线又修好一段：早年的旧帖多了几页，火灾和寻人那几页我先单挑出来了。","K哥，热线又修好一段：早年的旧帖多了几页，火灾和寻人那几页，我先挑出来了。"]},{"npc":"那年元旦我在家，半夜听见消防车过，一拉窗帘，看见对面好几家都亮着灯。","previousText":["少年宫着火那几天的帖子都在里头。那年元旦我放假在家，就住少年宫对面那条街，消防车一辆接一辆，我趴窗户上看了半宿。"]},{"npc":"旧官网还留着当时办公室发的通报，我把那一页也放回去了。","previousText":["晚报也扫到了2003年底、2004年初。少年宫老官网那几天的页面，我在时光机里也找着了。"]},{"me":"当年你也看过那份通报？","previousText":["那几天少年宫官网发过什么？"]},{"npc":"我爸给我念过报纸。网上这份，我也是这两天才看见。","previousText":["你自己看吧。我看完不太想说话。"]}]}],"files":[{"id":"d_caps","path":"C:/胶囊软盘","type":"folder","date":"2026-12-20 22:20","requires":"c0_imaged"},{"id":"d_d1","path":"C:/胶囊软盘/盘1（蓝·陈一鸣）","type":"folder","date":"1999-12-31 21:52","requires":"c0_imaged"},{"id":"d_d2","path":"C:/胶囊软盘/盘2（黑·赵小川）","type":"folder","date":"1999-12-31 22:04","requires":"c0_imaged"},{"id":"d_d3","path":"C:/胶囊软盘/盘3（白·白露）","type":"folder","date":"1999-12-31 22:10","requires":"c0_imaged"},{"id":"d_d4","path":"C:/胶囊软盘/盘4（绿·孟凡）","type":"folder","date":"1999-12-31 22:15","requires":"c0_imaged"},{"id":"d_d5","path":"C:/胶囊软盘/盘5（粉·米乐）","type":"folder","date":"1999-12-31 22:21","requires":"c0_imaged"},{"id":"d_d6","path":"C:/胶囊软盘/盘6（灰·无标签）","type":"folder","date":"1909-12-28 23:40","requires":"c0_imaged"},{"id":"f_d1_letter","evidenceOwner":"陈一鸣","path":"C:/胶囊软盘/盘1（蓝·陈一鸣）/给2026年的我.txt","type":"txt","date":"1999-12-31 21:52","requires":"c0_imaged","onOpen":{"note":"n_d1"},"text":"2026年的陈一鸣：\n\n我是除虫小队队长陈一鸣！今天是1999年12月31日，现在快十点了，再过两个钟头就2000年了！！\n\n我想你肯定已经是大导演了。我今天把每个人都拍进去了。许嘉哥今晚不来，我就拍了他坐过的那把椅子，算他也在。等四十岁我把这些带子剪成一部电影，片名就叫《除虫小队》。\n\n今晚零点我在楼顶拍倒计时，那是全梧城最好的机位。\n\n队长 陈一鸣"},{"id":"f_d2_letter","evidenceOwner":"赵小川","path":"C:/胶囊软盘/盘2（黑·赵小川）/给四十岁的我.txt","type":"txt","date":"1999-12-31 22:04","requires":"c0_imaged","onOpen":{"note":"n_d2"},"text":"四十岁的我：\n\n我在做一台望远镜，叫望舒号。望舒是给月亮赶车的人。现在只有一截镜筒，镜片还在磨，一块要磨好几个礼拜。等我做好了先给凡凡看，我答应过他。\n\n今晚零点我们要上楼顶。许嘉哥在七中机房守着，过不来。我们商量好了，零点拿手电朝七中那边晃，看他看不看得见。\n\n等你看到这封信，望舒号早就做好了吧。\n\n川　99.12.31"},{"id":"f_d3_letter","evidenceOwner":"白露","path":"C:/胶囊软盘/盘3（白·白露）/给2026年的白露.txt","type":"txt","date":"1999-12-31 22:10","requires":"c0_imaged","onOpen":{"note":"n_d3"},"props":{"作者":"白露"},"text":"2026年的白露：\n\n你当上医生了吗？\n\n今天孟凡的手受伤了，是我给他涂的药。他说不疼，可我知道他疼。我手有点抖，没让他看出来。\n\n许嘉哥说，零点以后有的机器会以为是1900年。我问他为什么不一开始就存四位，他说那时候能省两个字节也是好的。我又看了一遍这封信的开头，四个数字我都写了。\n\n白露"},{"id":"f_d4_letter","evidenceOwner":"孟凡","path":"C:/胶囊软盘/盘4（绿·孟凡）/四十岁的孟凡.txt","type":"txt","date":"1999-12-31 22:15","requires":"c0_imaged","onOpen":{"note":"n_d4"},"text":"四十岁的孟凡：\n\n我爸又喝酒了，我不想回家。少年宫比家暖和，我每个礼拜都是第一个到，许嘉哥所先到的等一等。\n\n在这儿没人嫌我。一鸣说我是副队长。小川说他的望远镜第一个给我看。\n\n四十岁我要有自己的家，门口不放酒瓶子了。\n\n孟凡"},{"id":"f_d5_letter","evidenceOwner":"米乐","path":"C:/胶囊软盘/盘5（粉·米乐）/亲爱的四十岁的米乐.txt","type":"txt","date":"1999-12-31 22:21","requires":"c0_imaged","onOpen":{"note":"n_d5"},"text":"亲爱的四十岁的米乐：\n\n我的盘是粉色的！！是我抢来的，一鸣想要我都没给 ^_^\n\n你当上老师了吗~ 上课记得往后排看啊。我有一回手都举酸了，老师还以为没人会做呢！\n\n今天我把瓜子分给了大家。许嘉哥今晚在七中守机房，来不了，我给他留了一把，下礼拜上课带给他。\n\n我们五个说好了，四十岁一起打开这个盒子。一个都不能少！谁少了我就去他家把他拽出来！\n\n米乐 ^_^"},{"id":"f6_invite","path":"C:/胶囊软盘/盘6（灰·无标签）/邀请.txt","type":"txt","date":"1909-12-20 21:14","requires":"c0_imaged","onOpen":{"note":"n_invite"},"props":{"记录来源":"BINGLI.LOG"},"text":"十年了。\n12月31号礼拜四晚上十一点，老少年宫楼顶。胶囊我带着，有话跟你们所。\n大家路上慢点，先到的等一下。"},{"id":"f6_bingli","path":"C:/胶囊软盘/盘6（灰·无标签）/BINGLI.LOG","type":"log","date":"1909-12-28 23:40","requires":"c0_imaged","hidden":true,"text":"病历　BINGLI　六号机写盘记录\n许嘉　1999.10\n\n1903-12-26 19:50　写　望舒号.TXT\n1903-12-28 21:05　写　望舒号.TXT\n1903-12-31 17:20　写　给四个人.TXT\n1903-12-31 18:40　写　望舒号.TXT\n1909-12-20 21:14　写　邀请.TXT\n1909-12-28 23:31　删　给四个人.TXT\n1909-12-28 23:31　删　望舒号.TXT\n1909-12-28 23:40　写　十年.TXT"},{"id":"f6_ten0","path":"C:/胶囊软盘/盘6（灰·无标签）/十年.txt","type":"txt","date":"1909-12-28 23:40","requires":"c0_imaged & !solved_c3_ten1","size":"5,212 字节","props":{"状态":"有坏道。","来源":"灰盘只读镜像"},"text":"十年.txt　5,212 字节\n\n［读取错误］文件的簇落在坏道上。\n已读出：0 字节。"},{"id":"d_d6_rec","path":"C:/胶囊软盘/盘6（灰·无标签）/已恢复（残）","type":"folder","date":"2026-12-22 11:00","requires":"solved_c2_undel"},{"id":"f6_del_letter","evidenceOwner":"赵小川","path":"C:/胶囊软盘/盘6（灰·无标签）/已恢复（残）/给四个人.txt","type":"txt","date":"1903-12-31 17:20","requires":"solved_c2_undel","onOpen":{"note":"n_del_letter"},"props":{"原文件名":"给四个人.txt（已删除）","恢复情况":"首簇和末簇完好，中间各簇已被《十年.txt》覆盖。"},"text":"一鸣，白露，凡凡，米乐：\n\n今晚想念给你们听，怕念不出来，先写下。\n\n▒▒▒▒▒▒▒▒（这几簇已被新文件覆盖）▒▒▒▒▒▒▒▒\n\n川　03.12.31"},{"id":"f6_del_log","evidenceOwner":"赵小川","path":"C:/胶囊软盘/盘6（灰·无标签）/已恢复（残）/望舒号.txt","type":"txt","date":"1903-12-31 18:40","requires":"solved_c2_undel","onOpen":{"note":"n_del_log"},"props":{"原文件名":"望舒号.txt（已删除）","恢复情况":"只读出前两簇。"},"text":"望舒号 日志（六号机）\n03.12.26 把赤道仪重新装了一遍，通电后电机还是抖。\n03.12.28 控制板第二版。六号机的钟又是1903年，懒得改。\n\n▒▒▒▒▒▒▒▒（这几簇已被新文件覆盖）▒▒▒▒▒▒▒▒"},{"id":"d_d6_xj","path":"C:/胶囊软盘/盘6（灰·无标签）/.许嘉","type":"folder","date":"2000-04-02 17:30","requires":"c0_imaged","hidden":true},{"id":"f6_zip","path":"C:/胶囊软盘/盘6（灰·无标签）/.许嘉/给四十岁的你们.zip","type":"zip","date":"2000-04-02 17:30","requires":"c0_imaged","hidden":true,"lock":"c7_zip","props":{"作者":"xujia","创建时间":"2000-04-02 17:30","说明":"在已打补丁的一号机上写入。"},"zip":{"comment":"楼顶那张合影还留着吧？","entries":["给四十岁的除虫小队.txt"],"extractTo":"C:/胶囊软盘/盘6（灰·无标签）/.许嘉/解压","broken":"!solved_c7_ten3","brokenText":"CRC 错误：压缩包的数据区落在坏道上，无法解压。\u003cbr>\u003cbr>目录项完好：作者 xujia，创建于 2000-04-02 17:30。"}},{"id":"d_work","path":"C:/工作","type":"folder","date":"2026-12-20 20:40","requires":"ch0"},{"id":"d_mirror","path":"C:/七中3号机镜像（只读）","type":"folder","date":"2026-10-27 23:40","requires":"c1_mirror"},{"id":"d_mirror_snk","path":"C:/七中3号机镜像（只读）/少年宫","type":"folder","date":"2000-04-02 21:40","requires":"c1_mirror"},{"id":"f_xj_l1","path":"C:/七中3号机镜像（只读）/少年宫/第一课 1017.txt","type":"txt","date":"1999-10-17 18:20","requires":"c1_mirror","onOpen":{"note":"n_xj_l1"},"props":{"作者":"xujia","来源":"七中3号机只读镜像 · 许宁同意查看"},"text":"10.17　第一课　六号机BIOS跨年测试\n\n演示前把钟拨到1999-12-31 23:59，等一分钟。\n实测：屏幕跳到1900-01-01。年份差一百，月日时分都对。\n存个文件试试，目录里的日期成了1980-01-01。写了个小程序叫BINGLI，每次写盘都把机器当时的日期和时间另记一行。\n\n六号机留作病号机，别打补丁。\n黑板上写：千年虫不是虫。"},{"id":"f_xj_names","path":"C:/七中3号机镜像（只读）/少年宫/名单.txt","type":"txt","date":"1999-12-26 20:00","requires":"c1_mirror","onOpen":{"note":"n_xj_names"},"text":"兴趣班（除虫小队）　报名八人，现到五人\n\n一中初一　陈一鸣、白露\n二中初一　孟凡\n七中初一　赵小川、米乐（同班）\n\n孟凡：手上老有伤，不让问。"},{"id":"f_xj_l3","path":"C:/七中3号机镜像（只读）/少年宫/第三课 1107.txt","type":"txt","date":"1999-11-07 18:40","requires":"c1_mirror","onOpen":{"note":"n_xj_l3"},"text":"11.7　第三课　CMOS电池\n\n拔掉电源，卸电池，再装回去。开机先看日期。\n\n下雪。孟凡一点就到了，在大门口站着。后面几个踩着雪往这边跑，我在门口喊：先到的等一等，后到的慢慢来，路上滑，别跑。\n米乐要拿这句编成队歌，让我写下来给她。\n\n下回再下雪，我早点到。"},{"id":"f_xj_photo","path":"C:/七中3号机镜像（只读）/少年宫/合影说明 1219.txt","type":"txt","date":"1999-12-19 20:10","requires":"c1_mirror","onOpen":{"note":"n_xj_photo"},"text":"12.19　少年宫楼顶，天文台底座前\n\n给橱窗里的合影配字，名字按学校排：\n一中　陈一鸣（比V的）、白露（挨着小川）\n二中　孟凡（灰绿外套，两手垂着）\n七中　米乐（最左边）、赵小川（抱镜筒）"},{"id":"f_xj_photo_img","path":"C:/七中3号机镜像（只读）/少年宫/合影 1219.jpg","type":"img","date":"1999-12-19 20:05","requires":"c1_mirror","html":"\u003cfigure class=\"evidence-photo\" data-photo=\"rooftop-1999\">\u003cimg src=\"./cover.webp\" width=\"1448\" height=\"1086\" alt=\"1999年12月19日，五个孩子站在少年宫楼顶合影。左起第二个男孩踮脚比了个V，中间的男孩穿灰绿外套，双手垂在身边，最右边的男孩抱着镜筒。\" decoding=\"async\">\u003c/figure>","backHtml":"\u003csvg class=\"photo-reverse\" viewBox=\"0 0 1448 1086\" role=\"img\" aria-label=\"合影背面的铅笔题字\">\u003crect width=\"1448\" height=\"1086\" fill=\"#eee9da\"/>\u003ctext x=\"160\" y=\"782\" transform=\"rotate(-2 160 782)\">除虫小队　99.12.19\u003c/text>\u003c/svg>"},{"id":"f_xj_last","path":"C:/七中3号机镜像（只读）/少年宫/最后一课 0402.txt","type":"txt","date":"2000-04-02 21:40","requires":"c1_mirror","hidden":true,"onOpen":{"note":"n_xj_last"},"text":"4.2　周日\n\n六号机拆装完，通电正常。\n两人一组拆：一个拧螺丝，一个记哪颗放哪儿。装回去一颗没少。\n\n《给四十岁的除虫小队》在一号机上压好，存进灰盘。小川先收着，说下周日原样还我。\n跟冯主任己经说好了，下周日找他开柜取盒。等五个人到齐，把盘放进去，再封好。"},{"id":"d_work_video","path":"C:/工作/七中那期","type":"folder","date":"2026-12-06 23:40","requires":"ch0"},{"id":"f_work_todo","path":"C:/工作/待修清单.txt","type":"txt","date":"2026-12-20 20:40","requires":"ch0","text":"待修（按来的先后）\n\n1. 李师傅　　486，开机报 CMOS 错误。等纽扣电池到货。他说不急，过完年也行。\n2. 张女士　　两盘 VHS，1988年她爸妈结婚时拍的。盒子上有霉斑，先检查带况。\n3. 解放路照相馆　扫描仪接 Win98，驱动找不着了。\n4. 一个高三学生　MP3 进过水，开不了机。\n5. 刘大爷　　诺基亚 3310，只要通讯录。\n\n还有九十多条私信没回。再有人来问，得先说好要排到明年。"},{"id":"f_work_memo","path":"C:/工作/备忘.txt","type":"txt","date":"2026-12-19 23:10","requires":"ch0","text":"12月23日（周三）上午九点　心内科复查。姐帮我约的，叫我自己设个闹钟。\n\n药：早一片，晚一片。\n\n店门口灯箱上那个“修”字不亮了，找人换。"},{"id":"f_work_stats","path":"C:/工作/七中那期/后台数据.txt","type":"txt","date":"2026-12-20 18:00","requires":"ch0","text":"七中那期（6分12秒）　2026-12-06 发布\n\n播放　312.4万\n点赞　41.7万\n评论　3.9万\n私信　1,206\n\n私信里大半是问能不能修电脑的，还有人直接把家里的旧硬盘寄了过来。\n\n置顶评论：我是七中2000届的。那年我们都信了。"}],"items2018":[{"id":"c0_box","replaces":"c0_list","name":"开箱照片（你自己拍的）","requires":"c0_parcel","onOpen":{"note":"n_box"},"html":"\u003cfigure class=\"evidence-photo inscribed\" data-photo=\"unbox-tin\">\u003cdiv class=\"evidence-surface\" style=\"aspect-ratio:562.5/750\">\u003cimg src=\"./trial-photo-99724dd6a21089ce.webp\" width=\"1086\" height=\"1448\" alt=\"打开的铁皮盒，盒盖内侧贴着清单，六张软盘叠在盒里。\" decoding=\"async\">\u003csvg viewBox=\"0 0 562.5 750\">\u003cg class=\"tin-list\" transform=\"translate(179 99) rotate(-3 100 88)\">\u003cpath fill=\"#d5c7a5\" stroke=\"#87795d\" stroke-width=\".8\" d=\"M1 2 L205 0 206 174 142 176 138 175 2 177 Z\"/>\u003cpath fill=\"#b9aa80\" opacity=\".65\" d=\"M-4 12 l25 -18 5 7 -25 18 Z M181 164 l26 -14 4 8 -26 14 Z\"/>\u003ctext x=\"13\" y=\"16\">梧城少年宫 千禧时间胶囊\u003c/text>\u003ctext x=\"13\" y=\"28.5\">封存：1999年12月31日 23:30\u003c/text>\u003ctext x=\"13\" y=\"41\">开启：2027年1月1日 0:00（我们四十岁！）\u003c/text>\u003ctext x=\"13\" y=\"53.5\">\u003c/text>\u003ctext x=\"13\" y=\"66\">内装：\u003c/text>\u003ctext x=\"13\" y=\"78.5\">1. 陈一鸣　软盘　蓝\u003c/text>\u003ctext x=\"13\" y=\"91\">2. 赵小川　软盘　黑\u003c/text>\u003ctext x=\"13\" y=\"103.5\">3. 白露　　软盘　白\u003c/text>\u003ctext x=\"13\" y=\"116\">4. 孟凡　　软盘　绿\u003c/text>\u003ctext x=\"13\" y=\"128.5\">5. 米乐　　软盘　粉\u003c/text>\u003ctext x=\"13\" y=\"141\">\u003c/text>\u003ctext x=\"13\" y=\"153.5\">共五张。\u003c/text>\u003ctext x=\"13\" y=\"166\">除虫小队\u003c/text>\u003c/g>\u003c/svg>\u003c/div>\u003c/figure>\u003cdiv class=\"paper\">梧城少年宫 千禧时间胶囊\u003cbr>封存：1999年12月31日 23:30\u003cbr>开启：2027年1月1日 0:00（我们四十岁！）\u003cbr>\u003cbr>内装：\u003cbr>1. 陈一鸣　软盘　蓝\u003cbr>2. 赵小川　软盘　黑\u003cbr>3. 白露　　软盘　白\u003cbr>4. 孟凡　　软盘　绿\u003cbr>5. 米乐　　软盘　粉\u003cbr>\u003cbr>共五张。\u003cbr>除虫小队\u003c/div>\u003cdiv class=\"paper\">拆盒时记下的细节：\u003cul class=\"unbox-details\">\u003cli>铁皮饼干盒，盒盖上印着褪色的“向阳饼干”。\u003c/li>\u003cli>盒子外面缠了好几圈黑色电工胶布，胶布发脆，带着一股机油味。盒盖上贴着一张纸签，圆珠笔写着：“给你们。等你们一起开。”落款被水洇开了，看不出名字。\u003c/li>\u003cli>一截剪断的旧铅封挂在盒扣上，上面印着“梧城少年宫 1999.12.31”。\u003c/li>\u003cli>把盒子翻过来，盒底贴着一截发黄的白胶布，圆珠笔写着：“2004.3　孟凡代管”。胶布翘起了一角，露出底下的锈斑。\u003c/li>\u003cli>盒子四周塞满了撕成条的彩纸，有几条上还看得出小孩用蜡笔画的画。\u003c/li>\u003cli>盒里：五张彩色软盘，还有一张灰色的，没贴标签，压在最底下。\u003c/li>\u003c/ul>\u003c/div>"},{"id":"c0_waybill","name":"快递面单（照片）","requires":"c0_parcel","html":"\u003cdiv class=\"paper\">梧桐路便民快递柜 · 同城件\u003cbr>\u003cbr>寄件人：（未填写）\u003cbr>寄件地址：少年宫\u003cbr>寄件人电话：（未填写）\u003cbr>收件人：老K工作室\u003cbr>\u003cbr>投柜时间：2026-12-19（周六）15:42\u003cbr>取件时间：2026-12-20（周日）21:46\u003cbr>\u003cbr>备注栏用铅笔写着：易碎，旧东西。\u003c/div>"},{"id":"c1_voicemail","name":"通话记录：139 0457 0312","requires":"dlg_c1_call","html":"\u003cdiv class=\"paper\">呼出　139 0457 0312　2026-12-21 14:06　00:19\u003cbr>\u003cbr>嘟——嘟——嘟——\u003cbr>“我是孟凡。有事留言，没事——楼顶见。”\u003cbr>（语音信箱提示音）\u003c/div>"}],"mails2018":[{"id":"m_amb_zhang","from":"张女士 \u003cxiaozhang@wc169.net>","date":"2026-12-21 14:30","subject":"录像带的事","requires":"ch1","html":"\u003cp>老K师傅：\u003c/p>\u003cp>昨天送去的两盘带子，我回家问过我妈了。\u003c/p>\u003cp>两盘都是我爸妈1988年结婚时拍的。我爸前年走了，我妈想再看看他年轻时候的样子。她记得第二盘快放完的时候，我爸对着镜头说了几句话。要是还能听清，麻烦您给留着。\u003c/p>\u003cp>我跟我妈说了，师傅得慢慢修。您什么时候修好，打我电话就行，谢谢您。\u003c/p>\u003cp>张女士\u003c/p>"}],"gxAccounts":{},"gxLogs":[],"apps":{"mycomputer":{"name":"我的电脑","icon":"computer","requires":"ch0"},"fragments":{"name":"照片碎片","icon":"img","requires":"ch0"},"caps":{"name":"胶囊软盘","icon":"floppy","path":"C:/胶囊软盘","requires":"c0_imaged"},"internet":{"name":"Internet Explorer","icon":"ie","requires":"ch0"},"mirror":{"name":"七中3号机镜像","icon":"computer","path":"C:/七中3号机镜像（只读）/少年宫","requires":"c1_mirror"},"diskfix":{"name":"坏道修复","icon":"diskfix","requires":"ch2"},"work":{"name":"工作","icon":"folder","path":"C:/工作","requires":"ch0"}},"contacts2018":{"kelan":{"name":"柯岚","sub":"姐姐","avatar":"岚","requires":"ch0"},"yizhan":{"name":"梧桐路驿站","sub":"快递柜通知","avatar":"递","requires":"ch0"},"yiming":{"name":"陈一鸣","sub":"鸣远影像 · 蓝盘","avatar":"鸣","requires":"ch1"},"xuning":{"name":"许宁","sub":"许嘉的妹妹","avatar":"宁","requires":"ch1"},"mfcall":{"name":"139 0457 0312","sub":"孟凡（手机）","avatar":"凡","requires":"c1_dial"},"wangxy":{"name":"王秀英","sub":"孟凡的妈妈","avatar":"王","requires":"dlg_c1_call"},"mile":{"name":"米乐","sub":"小学老师 · 粉盘","avatar":"乐","requires":"ch2"},"squad":{"name":"除虫小队（4）","sub":"陈一鸣、白露、米乐、你","avatar":"群","requires":"c2_squad","afterMessages":{"米乐退出了群聊":{"name":"除虫小队（3）","sub":"陈一鸣、白露、你"},"一鸣邀请米乐加入了群聊":{"name":"除虫小队（4）","sub":"陈一鸣、白露、米乐、你"}}},"bailu":{"name":"白露","sub":"急诊科 · 白盘","avatar":"露","requires":"c2_squad"},"wanglei":{"name":"王磊","sub":"磊磊 · 梧城旧网","avatar":"磊","requires":"ch0","history":[{"from":"npc","sceneAt":"2026-12-07 20:16","text":"K哥，我是磊磊。七中那期我发同学群了，昨晚一群人没睡，都在认以前的网名。"},{"from":"me","sceneAt":"2026-12-07 20:19","text":"哈哈，你那个最好认。一页帖子拉到底，隔几楼就有你。"},{"from":"npc","sceneAt":"2026-12-07 20:20","text":"那可不，有个月电话费单子一来，我妈都气笑了，拿块胶布就给我贴墙上了。"},{"from":"me","sceneAt":"2026-12-13 18:42","text":"你上回说有几张刻录盘，还能读吗？店里有台老光驱，要用就给你留着。"},{"from":"npc","sceneAt":"2026-12-13 19:07","text":"替我留两天吧。我这台挑盘，同一张有时候得进进出出好几遍。"},{"from":"me","sceneAt":"2026-12-13 19:11","text":"行，给你搁柜台底下了。"}]}},"footage":{"requires":"c1_clips","sub":"录像与素材：1999年的封盒录像、2003年的跨年录像、你自己拍的几段","clips":[{"id":"v1999","title":"1999年千禧夜：封盒录像（鸣远影像翻录）","date":"1999-12-31","dur":"42:10","requires":"c1_clips","onOpen":{"note":"n_v1999"},"sub":"一鸣家那台松山摄像机的带子。胡老师帮忙拍了几段，中间停过机。时间是当晚叠在画面上的。","frames":[{"t":"21:30:15","desc":"三楼微机室，五台电脑亮着。一个穿中山装的老师站在门口拍手。","say":"（门口的老师）写给四十岁的自己！写完存盘，一人一张！"},{"t":"21:38:05","desc":"桌上摊着五张软盘，蓝、黑、白、绿、粉。几只手伸进画面，有只手一把拿走了粉色的。","say":"（女孩1）粉的是我的！（女孩2）那我要白的。"},{"t":"21:41:20","desc":"六个孩子挤在一号机前。最小的女孩扎着羊角辫，坐在一个男孩腿上，看他敲键盘。一个男孩从画面边上探进头来，在她头顶比了个V。镜头跟着晃了两下。","say":"（男孩1）小六，看镜头！（胡老师，在镜头后笑）你也看这儿。（男孩2）坐好，别碰键盘。"},{"t":"22:05:30","desc":"各自对着电脑写信。镜头从孩子们身后扫过。一个男孩弓着背，一个字一个字地敲，旁边的男孩凑过去看他的屏幕。两个人都背对着镜头。","say":"（男孩1，镜头后）哎，给我留条缝。（男孩3）“说”字怎么老打不出来？（男孩2）s后面加个h。（男孩3）我加了啊。"},{"t":"22:31:10","desc":"一个阿姨抱起睡着的小女孩往外走，小女孩手里攥着一把瓜子。","say":"（女孩1）小六拜拜——"},{"t":"23:30:40","desc":"一楼礼堂。五个孩子站在桌前，桌上放着一只印有“向阳饼干”的铁盒。穿中山装的老师用钳子压紧铅封，封上能看清“梧城少年宫 1999.12.31”。","say":"（男孩1）冯主任，封严点！（中山装的老师）二十七年以后，你们自己来开！"},{"t":"23:59:52","desc":"楼顶，五个人挤在女儿墙边。一个短头发的女孩刚数了两声，旁边几个人也跟着数起来。","say":"（女孩1）十、九……（几个人一起）八、七、六——"},{"t":"00:01:10","desc":"五道手电光一齐朝街对面的七中实验楼晃。三楼一个窗口亮起一束光，回晃了三下。","say":"（男孩2）许嘉哥看见了！"}]}]},"webHome":"http://www.jiuwang.org/","sites":{"www.jiuwang.org":{"skin":"portal","name":"梧城旧网","tagline":"把梧城的老网页捞回来 · 王磊维护","fav":true,"requires":"ch0","foot":"梧城旧网 · 公益存档 · 有老网页请发给磊磊"},"search.jiuwang.org":{"skin":"find","name":"旧网搜索","tagline":"搜梧城的老网页、老帖子、新闻","search":true,"fav":true,"requires":"ch0","headStyle":"background:#2f5d2f","searchTip":"输入关键词，搜索已经捞回来的旧网页、帖子和报纸。多个词用空格隔开。","foot":"只收录已经捞回来的页面。"},"archive.jiuwang.org":{"skin":"archive-index","name":"网页时光机","tagline":"梧城老网站的快照","fav":true,"requires":"ch0","headStyle":"background:#5a3d1e","foot":"快照按原样保存，图片可能缺失。","missing":"\u003cdiv class=\"err\">\u003ch1>这一页还没有快照\u003c/h1>\u003cp>网页时光机里还没有收录这个网址。磊磊每天往里放新找到的快照，过一阵再来看看。\u003c/p>\u003cp>\u003ca href=\"/\">回到网页时光机首页\u003c/a>\u003c/p>\u003c/div>","aliases":{"/2004/shaoniangong":"www.wcsng.gov.cn/","/2000/shaoniangong/jianjie.htm":"www.wcsng.gov.cn/jianjie.htm","/2002/shaoniangong/xingqu.htm":"www.wcsng.gov.cn/xingqu/","/2004/shaoniangong/tongzhi.htm":"www.wcsng.gov.cn/notice/","/2003/shaoniangong/huodong.htm":"www.wcsng.gov.cn/huodong/","/2000/shaoniangong/lianxi.htm":"www.wcsng.gov.cn/lianxi.htm","/1999/shaoniangong/xingqu.htm":"www.wcsng.gov.cn/xingqu.htm","/2001/shaoniangong/guiding.htm":"www.wcsng.gov.cn/notice/0911.htm","/2003/shaoniangong/dongling.htm":"www.wcsng.gov.cn/dongling.htm","/2004/shaoniangong/fengcun.htm":"www.wcsng.gov.cn/notice/0318.htm","/1999/shaoniangong/jiaonang.htm":"www.wcsng.gov.cn/huodong/jiaonang.htm","/1999/shaoniangong/chuchong.htm":"www.wcsng.gov.cn/huodong/chuchong.htm","/2004/shaoniangong/tongbao.htm":"www.wcsng.gov.cn/notice/0103.htm","/2003/shaoniangong/tianwen.htm":"www.wcsng.gov.cn/xingqu/tianwen.htm","/2000/shaoniangong/qiannianchong.htm":"www.wcsng.gov.cn/notice/0102.htm","/2001/shaoniangong/liuxingyu.htm":"www.wcsng.gov.cn/huodong/liuxingyu.htm","/2004/shaoniangong/chuzhi.htm":"www.wcsng.gov.cn/notice/0318b.htm","/2003/shaoniangong/yingxian.htm":"www.wcsng.gov.cn/huodong/yingxian.htm","/2000/shaoniangong/hanjia.htm":"www.wcsng.gov.cn/notice/hanjia.htm","/2002/shaoniangong/shuhua.htm":"www.wcsng.gov.cn/huodong/shuhua.htm","/2003/shaoniangong/langsong.htm":"www.wcsng.gov.cn/huodong/langsong.htm","/2004/shaoniangong/zanting.htm":"www.wcsng.gov.cn/notice/zanting.htm","/2004/shaoniangong/jieying.htm":"www.wcsng.gov.cn/notice/jieying.htm","/2003/shaoniangong/guoqing.htm":"www.wcsng.gov.cn/notice/guoqing.htm","/2000/shaoniangong/xinxiang.htm":"www.wcsng.gov.cn/xinxiang.htm","/2000/shaoniangong":"www.wcsng.gov.cn/","/2003/shaoniangong":"www.wcsng.gov.cn/"}},"www.wuchengquan.cn":{"name":"梧城圈","tagline":"梧城人自己的朋友圈","skin":"quan","fav":true,"requires":"ch0","headStyle":"background:#c0392b","foot":"梧城圈 © 2026"},"epaper.wcwb.cn":{"name":"梧城晚报 · 数字版","tagline":"1998年至今","fav":true,"requires":"ch0","headStyle":"background:#1d1d1d","nav":[{"href":"/","label":"按日期"}],"foot":"梧城晚报社 版权所有"},"www.mingyuan.tv":{"skin":"studio","name":"鸣远影像","tagline":"MINGYUAN · 用影像记住梧城","fav":true,"requires":"ch0","headStyle":"background:#111;border-bottom-color:#e74c3c","nav":[{"href":"/","label":"首页"},{"href":"/live.html","label":"直播","requires":"ch1"},{"href":"/works.html","label":"作品","requires":"ch2"},{"href":"/about.html","label":"关于"}],"foot":"梧城鸣远影像传媒有限公司"},"www.wcradio.cn":{"skin":"radio","name":"梧城广播电台","tagline":"FM 96.6","requires":"ch0","headStyle":"background:#6a1b9a","nav":[{"href":"/","label":"节目表"},{"href":"/yehua.htm","label":"往期节目","requires":"ch5"}],"foot":"梧城人民广播电台"},"www.wcsy.edu.cn":{"skin":"school","name":"梧城实验小学","tagline":"校园网","requires":"ch0","headStyle":"background:#0b7a75","foot":"梧城实验小学　信息中心"},"www.wcsng.gov.cn":{"name":"梧城少年宫","editions":[{"requires":"ch0","restored":"2026-12-09","date":"1999-11-15","banner":"迎接新千年，争做跨世纪的好少年！　★　秋季兴趣班每周日下午开课"},{"requires":"ch1","restored":"2026-12-21","date":"2000-01-05","banner":"千禧年快乐！　★　寒假兴趣班开始报名　★　天文组招收新组员"},{"requires":"ch2","restored":"2026-12-22","date":"2004-01-04","banner":"沉痛悼念遇难学员赵小川同学"},{"requires":"ch3","restored":"2026-12-23","date":"2004-03-20","banner":"本单位办公地点已迁至解放路　★　梧桐路旧址停止开放"},{"requires":"ch4","restored":"2026-12-25","date":"2004-03-20","banner":"本单位办公地点已迁至解放路　★　梧桐路旧址停止开放"},{"requires":"ch5","restored":"2026-12-27","date":"2004-03-20","banner":"本单位办公地点已迁至解放路　★　梧桐路旧址停止开放"},{"requires":"ch6","restored":"2026-12-29","date":"2004-03-20","banner":"本单位办公地点已迁至解放路　★　梧桐路旧址停止开放"}],"archiveHost":"archive.jiuwang.org","requires":"ch0"}},"web":[{"id":"w_portal","url":"www.jiuwang.org/","title":"梧城旧网 · 首页","requires":"ch0","noIndex":true,"html":"\u003ch1>梧城旧网\u003c/h1>\u003cp>我们小时候在网吧、在家拨号上过的那些梧城网站，大多已经关了。这里把能捞回来的都捞回来了。\u003c/p>\u003ctable class=\"wt\">\u003ctr>\u003cth>网站\u003c/th>\u003cth>说明\u003c/th>\u003c/tr>\u003ctr>\u003ctd>\u003ca href=\"http://search.jiuwang.org/\">旧网搜索\u003c/a>\u003c/td>\u003ctd>搜全部存档、新闻和论坛帖子\u003c/td>\u003c/tr>\u003ctr>\u003ctd>\u003ca href=\"http://wcrx.jiuwang.org/\">梧城热线（1999—2026）\u003c/a>\u003c/td>\u003ctd>梧城最老的论坛，街坊、校园、寻人都在这儿；2012年以后只剩几个老街坊还在回帖\u003c/td>\u003c/tr>\u003ctr>\u003ctd>\u003ca href=\"http://archive.jiuwang.org/\">网页时光机\u003c/a>\u003c/td>\u003ctd>本地单位、商家和个人主页留下的旧网页\u003c/td>\u003c/tr>\u003ctr>\u003ctd>\u003ca href=\"http://epaper.wcwb.cn/\">梧城晚报数字版\u003c/a>\u003c/td>\u003ctd>晚报社自己的网站，1998年至今\u003c/td>\u003c/tr>\u003ctr>\u003ctd>\u003ca href=\"http://www.wuchengquan.cn/\">梧城圈\u003c/a>\u003c/td>\u003ctd>现在大家都在这儿发东西\u003c/td>\u003c/tr>\u003c/table>\u003cp class=\"meta\">——磊磊（当年七中灌水大王，现在给梧城捞网页）\u003c/p>"},{"id":"w_quan_home","url":"www.wuchengquan.cn/","title":"梧城圈 · 首页","requires":"ch0","noIndex":true,"html":"\u003ch1>本地热门\u003c/h1>{{LIST}}","list":[{"page":"w_quan_1222","meta":"一鸣惊人 · 12-22"},{"page":"w_quan_found","label":"胶囊找到了！！","meta":"一鸣惊人 · 12-21"},{"page":"w_quan_1217","meta":"小羊不吃葱 · 12-17"},{"page":"w_quan_1213","meta":"老梧城 · 12-13"},{"page":"w_quan_1209","meta":"磊磊 · 12-09"},{"page":"w_quan_1207","meta":"梧城发布 · 12-07"},{"page":"w_quan_1204","meta":"阿栋 · 12-04"},{"page":"w_quan_post","label":"【悬赏】寻找1999年梧城少年宫千禧时间胶囊","meta":"一鸣惊人 · 12-01"},{"page":"w_quan_demolish","label":"梧桐路20号旧楼拆除施工公告","meta":"梧城发布 · 11-20"}]},{"id":"w_quan_post","url":"www.wuchengquan.cn/p/1201","title":"【悬赏】寻找1999年梧城少年宫千禧时间胶囊","requires":"ch0","onOpen":{"note":"n_quan_post"},"keywords":"少年宫 胶囊 悬赏 陈一鸣 楼顶见","html":"\u003ch1>【悬赏】寻找1999年梧城少年宫千禧时间胶囊\u003c/h1>\u003cdiv class=\"meta\">一鸣惊人（陈一鸣 · 鸣远影像）· 2026-12-01 20:14 · 转发 1,204\u003c/div>\u003cp>1999年跨年，我们五个十三岁的小孩在少年宫封了一只铁皮饼干盒，盒盖上印着“向阳饼干”，说好四十岁那年元旦一起打开。\u003c/p>\u003cp>2004年旧楼封了以后，盒子一直是我们当中的一个朋友替大家收着。从2009年底起，我们就不知道盒子在哪儿了。\u003c/p>\u003cp>今年我们都四十了，老少年宫明年元月也要拆了。12月31日晚上，我们会回老楼楼顶做直播，因此我们想先找回这只盒子。\u003c/p>\u003cp>要是您见过这只铁盒，或者知道它的下落，请私信我，必有重谢。\u003c/p>\u003cfigure class=\"evidence-photo\" data-photo=\"quan-tin\">\u003cimg src=\"./trial-photo-53fdf77e47df6bb9.webp\" width=\"1448\" height=\"1086\" alt=\"从封盒那晚的录像里截的，有点糊。\" decoding=\"async\">\u003cfigcaption>从封盒那晚的录像里截的，有点糊。\u003c/figcaption>\u003c/figure>\u003cdiv class=\"cmt\">\u003cb>梧桐路老街坊\u003c/b> \u003cspan class=\"meta\">12-01\u003c/span>\u003cbr>向阳饼干！我家以前也有一只，是拿来装针线的。\u003c/div>\u003cdiv class=\"cmt\">\u003cb>鸽子飞了\u003c/b> \u003cspan class=\"meta\">12-02\u003c/span>\u003cbr>怎么不先问问当年收盒子的那位？\u003c/div>\u003cdiv class=\"cmt\">\u003cb>一鸣惊人\u003c/b> \u003cspan class=\"meta\">12-02\u003c/span>\u003cbr>联系不上了。\u003c/div>\u003cdiv class=\"cmt\">\u003cb>东湖钓叟\u003c/b> \u003cspan class=\"meta\">12-03\u003c/span>\u003cbr>照片里那盒扣上还穿着铅封呢。\u003c/div>"},{"id":"w_quan_found","url":"www.wuchengquan.cn/p/1221","title":"胶囊找到了！！","requires":"c1_found_post","onOpen":{"note":"n_quan_found"},"keywords":"胶囊 找到 陈一鸣 直播","html":"\u003ch1>胶囊找到了！！\u003c/h1>\u003cdiv class=\"meta\">一鸣惊人 · 2026-12-21 10:12[[?after 2026-12-21 21:00]] · 转发 3,077[[/?]]\u003c/div>\u003cp>找着了，真的是我们当年封的那一盒！！先卖个关子，12月31日晚我在楼顶开直播，到时候给你们看！！\u003c/p>[[?after 2026-12-21 10:15]]\u003cdiv class=\"cmt\">\u003cb>小鹿乱撞\u003c/b> \u003cspan class=\"meta\">12-21 10:15\u003c/span>\u003cbr>找着啦！盒子现在是啥样了？\u003c/div>[[/?]][[?after 2026-12-21 10:26]]\u003cdiv class=\"cmt\">\u003cb>梧城老司机\u003c/b> \u003cspan class=\"meta\">12-21 10:26\u003c/span>\u003cbr>软盘用现在的电脑还能读吗？\u003c/div>[[/?]][[?after 2026-12-21 10:43]]\u003cdiv class=\"cmt\">\u003cb>鸽子飞了\u003c/b> \u003cspan class=\"meta\">12-21 10:43\u003c/span>\u003cbr>是谁找着的？悬赏给人家了没？\u003c/div>[[/?]][[?after 2026-12-21 11:08]]\u003cdiv class=\"cmt\">\u003cb>吃瓜群众\u003c/b> \u003cspan class=\"meta\">12-21 11:08\u003c/span>\u003cbr>追了二十天，还要等到31号？？\u003c/div>[[/?]][[?after 2026-12-22 08:41]]\u003cdiv class=\"cmt\">\u003cb>老同学\u003c/b> \u003cspan class=\"meta\">12-22 08:41\u003c/span>\u003cbr>二十七年了，你们几个还都联系着吗？\u003c/div>[[/?]]"},{"id":"w_quan_demolish","url":"www.wuchengquan.cn/p/1120","title":"梧桐路20号旧楼拆除施工公告","requires":"ch0","keywords":"拆除 少年宫 梧桐路 建国建工 1月2日","html":"\u003ch1>梧桐路20号旧楼拆除施工公告\u003c/h1>\u003cdiv class=\"meta\">梧城发布 · 2026-11-20\u003c/div>\u003cp>根据梧桐路片区改造安排，我公司承担梧桐路20号原少年宫旧楼的拆除工程。现将有关事项公告如下：\u003c/p>\u003cp>一、施工范围：原少年宫主楼及院内附属用房。\u003c/p>\u003cp>二、施工期限：2027年1月2日至3月31日。开工前，将沿旧楼临街一侧设置施工围挡。\u003c/p>\u003cp>三、作业时间：每日7时至12时、14时至20时，夜间不进行拆除作业。\u003c/p>\u003cp>四、施工期间，梧桐路沿街人行道照常通行。请勿进入围挡内的施工区域。\u003c/p>\u003cp>施工给周边居民和过往行人带来不便，敬请谅解。咨询电话：2289017。\u003c/p>\u003cp>特此公告。\u003c/p>\u003cp style=\"text-align:right\">建国建工集团有限公司\u003cbr>2026年11月20日\u003c/p>\u003cdiv class=\"cmt\">\u003cb>老梧城\u003c/b> \u003cspan class=\"meta\">11-20\u003c/span>\u003cbr>院门口也贴了这张。\u003c/div>"},{"id":"w_wb_home","url":"epaper.wcwb.cn/","title":"梧城晚报数字版 · 按日期","requires":"ch0","noIndex":true,"html":"\u003cdiv class=\"np np-index\">\u003cdiv class=\"np-mast\">\u003cb>梧城晚报\u003c/b>\u003cspan>数字报馆　·　按日期浏览\u003c/span>\u003c/div>\u003ch1>往期报刊与即时新闻\u003c/h1>{{LIST}}\u003c/div>\u003cp class=\"meta\">查找往期报道可使用\u003ca href=\"http://search.jiuwang.org/\">旧网搜索\u003c/a>。\u003c/p>","list":[{"h":"2026年"},{"page":"w_wb_261208","label":"12-08　七中旧案重查　许嘉的作案嫌疑已排除"},{"page":"w_wb_261205","label":"12-05　寒潮明起来袭　最低气温将降至零下12℃"},{"page":"w_wb_261120","label":"11-20　原少年宫旧楼明年元月开拆"},{"h":"2010年"},{"page":"w_wb_100108","label":"01-08　寻人"},{"h":"2004年"},{"page":"w_wb_040216","label":"02-16　开学前　全市学校和校外活动场所查消防"},{"page":"w_wb_040110","label":"01-10　21岁女教师关门救下18名儿童"},{"page":"w_wb_040102","label":"01-02　少年宫凌晨失火 一少年身亡"},{"h":"2003年"},{"page":"w_wb_031228","label":"12-28　冬令营扎堆开营　家长先问清吃住"},{"page":"w_wb_031016","label":"10-16　神舟五号返回　我国首次载人航天飞行成功"},{"h":"2002年"},{"h":"2001年"},{"h":"2000年"},{"page":"w_wb_000926","label":"09-26　孔令辉夺得悉尼奥运会乒乓球男单金牌"},{"page":"w_wb_000413","label":"04-13　七中系列学生死亡事件调查结束"},{"page":"w_wb_000101","label":"01-01　千年虫没有来　梧城平安跨进2000年"},{"h":"1999年"},{"page":"w_wb_991227","label":"12-27　千禧夜人民广场倒计时　周边道路晚8时起管制"},{"page":"w_wb_991220","label":"12-20　澳门回归祖国　澳门特别行政区政府成立"},{"page":"w_wb_991018","label":"10-18　离2000年还有75天　全市电脑排查“千年虫”进入冲刺"}]},{"id":"w_wb_040102","url":"epaper.wcwb.cn/2004/0102.htm","title":"梧城晚报 2004-01-02 · 少年宫凌晨失火 一少年身亡","requires":"ch2","onOpen":{"note":"n_wb_fire"},"keywords":"少年宫 火灾 2003 跨年 赵某 孟某 烟花 2004","html":"\u003cdiv class=\"np\">\u003cdiv class=\"np-mast\">\u003cb>梧城晚报\u003c/b>\u003cspan>2004年1月2日　星期五　第三版 · 社会新闻\u003c/span>\u003c/div>\u003ch1>少年宫凌晨失火　一少年身亡\u003c/h1>\u003cdiv class=\"np-by\">本报讯\u003c/div>\u003cdiv class=\"np-cols\">\u003cp>昨日凌晨，市少年宫二楼电子制作工作间发生火灾，一名17岁少年遇难。消防部门于零时许接警，约0时40分将明火扑灭。\u003c/p>\u003cp>搜救人员在工作间门内找到遇难少年。经警方核实，死者为市七中高二学生赵某。据少年宫介绍，当晚在三楼住宿的18名冬令营学员沿东侧楼梯撤至院内，经点名确认全部到齐。\u003c/p>\u003cp>据少年宫方面初步判断，火灾可能与一名孟姓少年在楼顶燃放烟花有关。起火原因仍在调查中。\u003c/p>\u003c/div>\u003c/div>\u003cp class=\"meta\">数字版 · 据原版录入\u003c/p>"},{"id":"w_wb_040110","url":"epaper.wcwb.cn/2004/0110.htm","title":"梧城晚报 2004-01-10 · 21岁女教师关门救下18名儿童","requires":"ch2","onOpen":{"note":"n_wb_hero"},"keywords":"李静 见义勇为 关门 铁门 少年宫 英雄 冬令营 疏散","html":"\u003cdiv class=\"np\">\u003cdiv class=\"np-mast\">\u003cb>梧城晚报\u003c/b>\u003cspan>2004年1月10日　星期六　第一版 · 要闻\u003c/span>\u003c/div>\u003ch1>21岁女教师关门救下18名儿童\u003c/h1>\u003cdiv class=\"np-by\">本报讯\u003c/div>\u003cdiv class=\"np-cols\">\u003cp>日前，团市委授予市少年宫朗诵教师李静“梧城见义勇为青年”称号。元旦凌晨少年宫失火时，21岁的李静正在冬令营值夜班，她组织学员撤离了现场。\u003c/p>\u003cp>据少年宫报送的事迹材料，李静闻讯后叫醒三楼的学员，组织大家从东梯下楼。李静在二楼平台关紧了起火工作间的铁门，护送18名学员从门前安全通过。\u003c/p>\u003c/div>\u003cfigure class=\"evidence-photo\" data-photo=\"hero-2004\">\u003cimg src=\"./trial-photo-e052b25038a4ca63.webp\" width=\"1448\" height=\"1086\" alt=\"李静手持荣誉证书，与市少年宫主任冯振邦合影。（本报记者　周蔚　摄）\" decoding=\"async\">\u003cfigcaption>李静手持荣誉证书，与市少年宫主任冯振邦合影。（本报记者　周蔚　摄）\u003c/figcaption>\u003c/figure>\u003c/div>\u003cp class=\"meta\">数字版 · 据原版录入\u003c/p>"},{"id":"w_wb_100108","url":"epaper.wcwb.cn/2010/0108.htm","title":"梧城晚报 2010-01-08 · 寻人","requires":"ch1","keywords":"寻人 孟凡 2010","html":"\u003cdiv class=\"np\">\u003cdiv class=\"np-mast\">\u003cb>梧城晚报\u003c/b>\u003cspan>2010年1月8日　星期五　第十五版 · 分类信息\u003c/span>\u003c/div>\u003cdiv class=\"np-ad\">\u003ch1>寻　人\u003c/h1>\u003cp>孟凡，男，23岁，身高一米七八，偏瘦，左手虎口有烫伤疤。2009年12月31日晚离家未归，穿黑色棉袄，背灰色双肩包。最后见于梧桐路赵记早点。望知情者联系家属。\u003c/p>\u003cp class=\"np-contact\">联系人：王女士（母亲）\u003cbr>家庭电话：2356017\u003c/p>\u003c/div>\u003c/div>\u003cp class=\"meta\">数字版 · 据原版录入\u003c/p>"},{"id":"w_wb_261120","url":"epaper.wcwb.cn/2026/1120.htm","title":"梧城晚报 2026-11-20 · 原少年宫旧楼明年元月开拆","requires":"ch0","keywords":"拆除 梧桐路 少年宫 建国建工","html":"\u003cdiv class=\"np\">\u003cdiv class=\"np-mast\">\u003cb>梧城晚报\u003c/b>\u003cspan>2026年11月20日　星期五　第四版 · 城事\u003c/span>\u003c/div>\u003ch1>原少年宫旧楼明年元月开拆\u003c/h1>\u003cdiv class=\"np-by\">本报讯\u003c/div>\u003cdiv class=\"np-cols\">\u003cp>建国建工集团今日发布施工公告，梧桐路20号原少年宫主楼将于明年1月2日开始拆除。据公告，施工期间梧桐路沿街人行道照常通行。\u003c/p>\u003cp>2004年3月，市少年宫迁出梧桐路旧址，旧楼此后一直封存。\u003c/p>\u003c/div>\u003c/div>\u003cp class=\"meta\">数字版 · 据原版录入\u003c/p>"},{"id":"w_my_home","url":"www.mingyuan.tv/","title":"鸣远影像","requires":"ch0","noIndex":true,"html":"\u003cdiv class=\"my-intro\">\u003cdiv class=\"my-cover\">[[?ch1]]\u003cimg class=\"my-still\" src=\"./trial-photo-920495150ed77f65.webp\" alt=\"梧桐路20号旧楼航拍\">\u003cspan>梧桐路20号　／　2026.12.10 航拍\u003c/span>[[/?]][[?!ch1]]\u003cimg class=\"my-mark\" src=\"./trial-photo-debd739d036b104a.webp\" alt=\"陈一鸣工作室的胶片飞鸟标志\">[[/?]]\u003c/div>\u003cdiv class=\"my-copy\">\u003ch1>用影像记住梧城\u003c/h1>\u003cp>鸣远影像由陈一鸣于2011年在梧城创办。他十三岁时，就开始用父亲的摄像机拍身边的人。\u003c/p>\u003c/div>\u003c/div>{{LIST}}","list":[{"page":"w_my_live","label":"12月31日跨年直播：四十岁，楼顶见"},{"page":"w_my_1999","label":"1999 · 我们封了一个胶囊"}]},{"id":"w_my_1999","url":"www.mingyuan.tv/1999.html","title":"鸣远影像 · 1999","requires":"c1_clips","keywords":"1999 封盒 录像 胶囊 少年宫","html":"\u003ch1>1999 · 我们封了一个胶囊\u003c/h1>\u003cp>1999年我爸买了台摄像机，装进去的第一盘带子，拍的就是我们封盒子那晚。去年我们把它转成了数字版。\u003c/p>\u003cp>▶ \u003ca href=\"clip:v1999\">播放：1999年千禧夜封盒录像（42分10秒）\u003c/a>\u003c/p>"},{"id":"w_my_live","inlinePage":"w_my_plan","url":"www.mingyuan.tv/live.html","title":"跨年直播：四十岁，楼顶见","requires":"ch1","onOpen":{"note":"n_my_live"},"keywords":"直播 楼顶 航拍 无人机 少年宫 墙头","html":"\u003ch1>四十岁，楼顶见\u003c/h1>\u003cdiv class=\"meta\">2026年12月31日 23:00　[[?!ch7]]老少年宫楼顶[[/?]]　鸣远影像出品\u003c/div>\u003cp>1999年的最后一晚，我们五个封完铁盒跑上楼顶，刚好赶上倒数。[[?!ch7]]今年12月31日，我们还约在楼顶。[[/?]]\u003c/p>\u003cfigure class=\"evidence-photo\" data-photo=\"drone-roof\">\u003cimg src=\"./trial-photo-920495150ed77f65.webp\" width=\"1448\" height=\"1086\" alt=\"老少年宫航拍：主楼、东头的天文台圆顶和前院。\" decoding=\"async\">\u003c/figure>\u003cp class=\"meta\">梧桐路20号，摄于2026年12月10日。鸣远影像\u003c/p>"},{"id":"w_ar_home","url":"archive.jiuwang.org/","title":"网页时光机","requires":"ch0","noIndex":true,"html":"{{LIST}}\u003cp class=\"meta\">也可以用\u003ca href=\"http://search.jiuwang.org/\">旧网搜索\u003c/a>按关键词查。\u003c/p>","list":[{"h":"旧站存档"},{"page":"w_ar_sng_home00","label":"梧城少年宫","meta":"www.wcsng.gov.cn"},{"h":"个人主页、空间"},{"h":"其他"}]},{"id":"w_radio_home","inlinePage":"w_radio_list","url":"www.wcradio.cn/","title":"梧城广播电台","requires":"ch0","noIndex":true,"html":"\u003ch1>FM 96.6 主要节目播出时间\u003c/h1>\u003ctable class=\"wt\">\u003cthead>\u003ctr>\u003cth scope=\"col\">时间\u003c/th>\u003cth scope=\"col\">节目\u003c/th>\u003c/tr>\u003c/thead>\u003ctbody>\u003ctr>\u003ctd>06:30—08:00\u003c/td>\u003ctd>早安梧城\u003c/td>\u003c/tr>\u003ctr>\u003ctd>12:00—12:30\u003c/td>\u003ctd>午间新闻\u003c/td>\u003c/tr>\u003ctr>\u003ctd>17:00—18:30\u003c/td>\u003ctd>回家路上 · 路况\u003c/td>\u003c/tr>\u003ctr>\u003ctd>22:00—24:00\u003c/td>\u003ctd>\u003cb>梧城夜话\u003c/b>（主持：[[?!ch2]]李静[[/?]][[?ch2]]\u003ca href=\"/lijing.htm\">李静\u003c/a>[[/?]]）\u003c/td>\u003c/tr>\u003c/tbody>\u003c/table>[[?!c8_begin]]\u003ch2>节目预告\u003c/h2>\u003cp>2026年12月31日晚，《梧城夜话》照常于22:00开播。23:00起是跨年特别节目，李静陪您一起迎接新年。\u003c/p>[[/?]]\u003cp>夜话热线：2216966　短信平台：106966\u003c/p>"},{"id":"w_radio_lj","url":"www.wcradio.cn/lijing.htm","title":"主持人 · 李静","requires":"ch2","onOpen":{"note":"n_radio_lj"},"keywords":"李静 主持人 梧城夜话 见义勇为 七中","html":"\u003ch1>李静\u003c/h1>\u003cp>《梧城夜话》主持人。七中2000届毕业生，中学时在七中广播站主持过《点歌台》。毕业后在梧城少年宫教朗诵，2004年获“梧城见义勇为青年”称号，2010年进入梧城广播电台。\u003c/p>"},{"id":"w_school","url":"www.wcsy.edu.cn/","title":"梧城实验小学","requires":"ch0","noIndex":true,"html":"\u003ch1>校园公告\u003c/h1>\u003cul class=\"school-notices\">[[?after 2026-12-15]]\u003cli>\u003ctime>2026-12-15\u003c/time>\u003ca href=\"/news/review.htm\">期末复习与考试须知\u003c/a>\u003c/li>[[/?]][[?after 2026-12-01]]\u003cli>\u003ctime>2026-12-01\u003c/time>\u003ca href=\"/news/winter.htm\">冬季作息时间调整\u003c/a>\u003c/li>[[/?]]\u003c/ul>[[?ch2]]\u003ch3>班级主页\u003c/h3>\u003cp>\u003ca href=\"/class/3-2.htm\">三年级（2）班 · 向日葵中队\u003c/a>\u003c/p>[[/?]]"},{"id":"w_school_c32","url":"www.wcsy.edu.cn/class/3-2.htm","title":"三（2）班 · 班级主页","requires":"ch2","keywords":"三（2）班 米乐 班主任 实验小学 班报","html":"\u003ch1>三（2）班 · 向日葵中队\u003c/h1>\u003cp>班主任：\u003cb>米乐老师\u003c/b>（语文）\u003c/p>\u003cp>\u003cb>同学来稿 · 我们班的新鲜事\u003c/b>\u003cbr>今天我在最后一排举手，只敢举到耳朵那么高。米老师也看见啦！\u003c/p>\u003ch3>班级动态\u003c/h3>\u003cul>\u003cli>12-18　\u003ca href=\"/class/3-2/banbao.htm\">班报《向日葵》第13期 · 元旦特刊\u003c/a>\u003c/li>\u003cli>12-11　元旦特刊收稿啦，图画、小故事都收，请交给本组的小编辑。\u003c/li>\u003cli>11-27　向日葵中队获评“优秀中队”。\u003c/li>\u003c/ul>"},{"id":"w_school_paper","url":"www.wcsy.edu.cn/class/3-2/banbao.htm","title":"三（2）班 · 班报《向日葵》","requires":"ch2","publishedAt":"2026-12-18","onOpen":{"note":"n_school_paper"},"keywords":"班报 向日葵 第13期 发放 印好","html":"\u003ch1>班报《向日葵》\u003c/h1>\u003cp>三（2）班小编辑部　隔周一期\u003c/p>\u003ch3>第13期　元旦特刊\u003c/h3>\u003cp class=\"meta\">12月18日　星期五\u003c/p>\u003cp>今天下午，米老师从文印室抱回一大摞班报，抽了一张给我们看。翻到最后一版，猜猜哪张新年画是你同桌画的？这回印的是彩色的！\u003c/p>\u003cp>领报时间：12月21日（星期一）早读，请各组组长到讲台上领。\u003c/p>\u003ch3>往期班报\u003c/h3>\u003cp>第12期　操场上的冬天　（12月4日）\u003c/p>\u003cp>\u003ca href=\"/class/3-2.htm\">返回三（2）班主页\u003c/a>\u003c/p>"},{"id":"w_wb_000101","url":"epaper.wcwb.cn/2000/0101.htm","title":"梧城晚报 2000-01-01 · 千年虫没有来　梧城平安跨进2000年","requires":"ch1","keywords":"千禧 1999 2000 跨年 千年虫 人民广场","html":"\u003cdiv class=\"np\">\u003cdiv class=\"np-mast\">\u003cb>梧城晚报\u003c/b>\u003cspan>2000年1月1日　星期六　第一版 · 要闻\u003c/span>\u003c/div>\u003ch1>千年虫没有来　梧城平安跨进2000年\u003c/h1>\u003cdiv class=\"np-by\">本报记者　周蔚　郑凯\u003c/div>\u003cdiv class=\"np-cols\">\u003cp>昨夜到今晨，全市银行、电力、供水、电信和医院等单位通宵值守。记者从市计算机2000年问题办公室获悉，截至今晨6时，各重点系统均平稳跨过2000年零点，没有接到因“千年虫”引起的故障报告。\u003c/p>\u003cp>零点前，数万市民聚在人民广场。钟声响起，礼花升空，不少人低头看手表和传呼机，等着日期跳成“2000”。\u003c/p>\u003c/div>\u003c/div>\u003cp class=\"meta\">数字版 · 据原版录入\u003c/p>"},{"id":"w_wb_991018","url":"epaper.wcwb.cn/1999/1018.htm","title":"梧城晚报 1999-10-18 · 离2000年还有75天　全市电脑排查“千年虫”进入冲刺","requires":"ch1","onOpen":{"note":"n_wb_991018"},"keywords":"计算机 千年虫 1999 整改 2000年问题","html":"\u003cdiv class=\"np\">\u003cdiv class=\"np-mast\">\u003cb>梧城晚报\u003c/b>\u003cspan>1999年10月18日　星期一　第一版 · 要闻\u003c/span>\u003c/div>\u003ch1>离2000年还有75天　全市电脑排查“千年虫”进入冲刺\u003c/h1>\u003cdiv class=\"np-by\">本报讯\u003c/div>\u003cdiv class=\"np-cols\">\u003cp>离2000年还有75天。记者昨日从市计算机2000年问题办公室获悉，全市银行、电力、供水、电信和医院等重点单位的电脑已基本完成“千年虫”检测，正在做跨年模拟测试。市里要求各单位12月20日前全部整改完毕，并制定元旦前后的应急预案。\u003c/p>\u003cp>所谓“千年虫”，是早年一些电脑程序只用两位数记年份，到了2000年，可能把“00”当成1900年，造成计算和排序出错。据介绍，全市中小学的电脑由市教育局信息中心统一部署检测。\u003c/p>\u003c/div>\u003c/div>\u003cp class=\"meta\">数字版 · 据原版录入\u003c/p>"},{"id":"w_wb_000413","url":"epaper.wcwb.cn/2000/0413.htm","title":"梧城晚报 2000-04-13 · 七中系列学生死亡事件调查结束","requires":"ch1","onOpen":{"note":"n_wb_000413"},"keywords":"七中 许嘉 千年虫 结案 2000","html":"\u003cdiv class=\"np\">\u003cdiv class=\"np-mast\">\u003cb>梧城晚报\u003c/b>\u003cspan>2000年4月13日　星期四　第三版 · 社会新闻\u003c/span>\u003c/div>\u003ch1>七中系列学生死亡事件调查结束\u003c/h1>\u003cdiv class=\"np-by\">本报讯\u003c/div>\u003cdiv class=\"np-cols\">\u003cp>市公安局昨日通报梧城七中三名学生死亡案调查结果，认定三起案件均系该校高三学生许某所为。许某已于4月4日夜在校内服药自杀。通报称，许某曾以“千年虫”为名在校内网上发帖，并于3月21日通过校内广播播出一段异常录音。市公安局已宣布结案。\u003c/p>\u003cp>学校相关负责人表示，将加强学生心理健康教育和校园网络管理。\u003c/p>\u003c/div>\u003c/div>\u003cp class=\"meta\">数字版 · 据原版录入\u003c/p>"},{"id":"w_wb_031228","url":"epaper.wcwb.cn/2003/1228.htm","title":"梧城晚报 2003-12-28 · 冬令营扎堆开营　家长先问清吃住","requires":"ch2","onOpen":{"note":"n_wb_031228"},"keywords":"冬令营 少年宫 2003 郊县 朗诵 书法 食宿 收费 消费者协会","html":"\u003cdiv class=\"np\">\u003cdiv class=\"np-mast\">\u003cb>梧城晚报\u003c/b>\u003cspan>2003年12月28日　星期日　第五版 · 教育\u003c/span>\u003c/div>\u003ch1>冬令营扎堆开营　家长先问清吃住\u003c/h1>\u003cdiv class=\"np-by\">本报讯\u003c/div>\u003cdiv class=\"np-cols\">\u003cp>元旦临近，本市各类冬令营陆续开营。记者昨日走访了解到，今冬全市有十余家单位和培训机构开办冬令营，有英语营、军事营，也有书画、天文等兴趣营，收费从每人几百元到一千多元不等。\u003c/p>\u003cp>市少年宫冬令营昨日开营，来自郊县的18名小学生将在城里过元旦。据主办方介绍，本期冬令营为期8天，学员统一食宿，开设朗诵、书法等课程；天气晴好时，天文组教师还将带学员观测冬季星空。冬令营定于明年1月3日结营。\u003c/p>\u003cp>市消费者协会提醒家长，给孩子报冬令营，要看清主办单位，问清孩子住在哪里、夜里有没有老师值班，最好签订书面协议，写明收费和退费办法。\u003c/p>\u003c/div>\u003c/div>\u003cp class=\"meta\">数字版 · 据原版录入\u003c/p>"},{"id":"w_wb_261208","url":"epaper.wcwb.cn/2026/1208.htm","title":"梧城晚报 2026-12-08 · 七中旧案重查　许嘉的作案嫌疑已排除","requires":"ch0","onOpen":{"note":"n_wb_261208"},"keywords":"七中 旧案 重新侦查 许嘉 2026 千年虫","html":"\u003cdiv class=\"np\">\u003cdiv class=\"np-mast\">\u003cb>梧城晚报\u003c/b>\u003cspan>2026年12月8日　星期二　第四版 · 城事\u003c/span>\u003c/div>\u003ch1>七中旧案重查　许嘉的作案嫌疑已排除\u003c/h1>\u003cdiv class=\"np-by\">本报讯\u003c/div>\u003cdiv class=\"np-cols\">\u003cp>记者昨日从市检察院获悉，2000年被认定为梧城七中三起学生死亡案作案人的许嘉，经复查已排除作案嫌疑。另一名犯罪嫌疑人已归案，相关情况仍在核实。\u003c/p>\u003cp>2000年4月13日，本报曾以《七中系列学生死亡事件调查结束》为题，刊发当时警方的结案通报。\u003c/p>\u003c/div>\u003c/div>\u003cp class=\"meta\">数字版 · 据原版录入\u003c/p>"},{"id":"w_wb_991220","url":"epaper.wcwb.cn/1999/1220.htm","title":"梧城晚报 1999-12-20 · 澳门回归祖国　澳门特别行政区政府成立","requires":"ch1","keywords":"澳门 回归 交接仪式 何厚铧","html":"\u003cdiv class=\"np\">\u003cdiv class=\"np-mast\">\u003cb>梧城晚报\u003c/b>\u003cspan>1999年12月20日　星期一　第一版 · 要闻\u003c/span>\u003c/div>\u003ch1>澳门回归祖国　澳门特别行政区政府成立\u003c/h1>\u003cdiv class=\"np-by\">本报综合消息\u003c/div>\u003cdiv class=\"np-cols\">\u003cp>昨夜，中葡两国政府在澳门举行澳门政权交接仪式。今日零时，五星红旗和澳门特别行政区区旗在会场升起，中国政府恢复对澳门行使主权。\u003c/p>\u003cp>随后举行了澳门特别行政区成立暨特区政府宣誓就职仪式。何厚铧宣誓就任澳门特别行政区第一任行政长官。\u003c/p>\u003c/div>\u003c/div>\u003cp class=\"meta\">数字版 · 据原版录入\u003c/p>"},{"id":"w_wb_000926","url":"epaper.wcwb.cn/2000/0926.htm","title":"梧城晚报 2000-09-26 · 孔令辉夺得悉尼奥运会乒乓球男单金牌","requires":"ch1","keywords":"悉尼 奥运会 孔令辉 乒乓球 男单 瓦尔德内尔","html":"\u003cdiv class=\"np\">\u003cdiv class=\"np-mast\">\u003cb>梧城晚报\u003c/b>\u003cspan>2000年9月26日　星期二　第七版 · 体育\u003c/span>\u003c/div>\u003ch1>孔令辉夺得悉尼奥运会乒乓球男单金牌\u003c/h1>\u003cdiv class=\"np-by\">本报综合消息\u003c/div>\u003cdiv class=\"np-cols\">\u003cp>悉尼奥运会乒乓球男单决赛昨日打满五局。中国选手孔令辉以3∶2战胜瑞典老将瓦尔德内尔，获得冠军。\u003c/p>\u003cp>孔令辉先下两局，瓦尔德内尔连扳两局。决胜局孔令辉重新占据主动，拿下中国队在本届奥运会乒乓球比赛的第四枚金牌。\u003c/p>\u003c/div>\u003c/div>\u003cp class=\"meta\">数字版 · 据原版录入\u003c/p>"},{"id":"w_wb_031016","url":"epaper.wcwb.cn/2003/1016.htm","title":"梧城晚报 2003-10-16 · 神舟五号返回　我国首次载人航天飞行成功","requires":"ch2","keywords":"神舟五号 杨利伟 载人航天 飞船 返回","html":"\u003cdiv class=\"np\">\u003cdiv class=\"np-mast\">\u003cb>梧城晚报\u003c/b>\u003cspan>2003年10月16日　星期四　第一版 · 要闻\u003c/span>\u003c/div>\u003ch1>神舟五号返回　我国首次载人航天飞行成功\u003c/h1>\u003cdiv class=\"np-by\">本报综合消息\u003c/div>\u003cdiv class=\"np-cols\">\u003cp>今晨，神舟五号飞船返回舱在内蒙古中部着陆，航天员杨利伟顺利出舱。我国首次载人航天飞行取得成功。\u003c/p>\u003cp>飞船于昨日上午从酒泉卫星发射中心升空，杨利伟在太空中度过了21个多小时。飞船共绕地球飞行14圈，完成了预定任务。\u003c/p>\u003c/div>\u003c/div>\u003cp class=\"meta\">数字版 · 据原版录入\u003c/p>"},{"id":"w_wb_991227","url":"epaper.wcwb.cn/1999/1227.htm","title":"梧城晚报 1999-12-27 · 千禧夜人民广场倒计时　周边道路晚8时起管制","requires":"ch1","keywords":"千禧 跨年 人民广场 倒计时 交通管制 公交 礼花 1999","html":"\u003cdiv class=\"np\">\u003cdiv class=\"np-mast\">\u003cb>梧城晚报\u003c/b>\u003cspan>1999年12月27日　星期一　第一版 · 要闻\u003c/span>\u003c/div>\u003ch1>千禧夜人民广场倒计时　周边道路晚8时起管制\u003c/h1>\u003cdiv class=\"np-by\">本报讯\u003c/div>\u003cdiv class=\"np-cols\">\u003cp>记者昨日从市迎接新世纪活动筹备组获悉，12月31日晚，人民广场将举行迎接新世纪倒计时活动，零点鸣钟并燃放礼花。\u003c/p>\u003cp>市公安局交警支队通告，31日20时至次日2时，人民广场周边的解放路、人民路部分路段禁止机动车通行。当晚市区6条公交线路延时运营至凌晨1时。\u003c/p>\u003cp>市公安消防支队提醒，家中燃放烟花爆竹要远离易燃物品，不要在阳台和楼道里燃放。\u003c/p>\u003c/div>\u003c/div>\u003cp class=\"meta\">数字版 · 据原版录入\u003c/p>"},{"id":"w_wb_040216","url":"epaper.wcwb.cn/2004/0216.htm","title":"梧城晚报 2004-02-16 · 开学前　全市学校和校外活动场所查消防","requires":"ch2","keywords":"消防 安全检查 学校 校外活动场所 开学 2004 少年宫 火灾","html":"\u003cdiv class=\"np\">\u003cdiv class=\"np-mast\">\u003cb>梧城晚报\u003c/b>\u003cspan>2004年2月16日　星期一　第四版 · 城事\u003c/span>\u003c/div>\u003ch1>开学前　全市学校和校外活动场所查消防\u003c/h1>\u003cdiv class=\"np-by\">本报讯\u003c/div>\u003cdiv class=\"np-cols\">\u003cp>记者从市教育局获悉，春季开学前，市教育局会同市公安消防支队，对全市中小学、幼儿园和校外活动场所做了一次消防安全检查，共查出隐患一百余处，已责令限期整改。\u003c/p>\u003cp>检查中发现，一些学校的楼道堆放杂物，部分灭火器过期未换，有的应急照明灯不亮。消防部门要求，安全出口和疏散楼梯必须保持畅通。\u003c/p>\u003cp>这次检查是在元旦凌晨市少年宫火灾之后部署的。市教育局表示，今年起将把消防安全列入学校年度考核。\u003c/p>\u003c/div>\u003c/div>\u003cp class=\"meta\">数字版 · 据原版录入\u003c/p>"},{"id":"w_wb_261205","url":"epaper.wcwb.cn/2026/1205.htm","title":"梧城晚报 2026-12-05 · 寒潮明起来袭　最低气温将降至零下12℃","requires":"ch0","keywords":"寒潮 降温 大风 供热 天气 2026","html":"\u003cdiv class=\"np\">\u003cdiv class=\"np-mast\">\u003cb>梧城晚报\u003c/b>\u003cspan>2026年12月5日　星期六　第四版 · 城事\u003c/span>\u003c/div>\u003ch1>寒潮明起来袭　最低气温将降至零下12℃\u003c/h1>\u003cdiv class=\"np-by\">本报记者　方晴\u003c/div>\u003cdiv class=\"np-cols\">\u003cp>记者昨日从市气象台获悉，受强冷空气影响，6日起本市将出现大风降温天气，48小时内气温下降10℃以上，8日早晨市区最低气温将降至零下12℃左右。市气象台已发布寒潮蓝色预警。\u003c/p>\u003cp>市热力公司表示，全市供热管网目前运行正常，降温期间将适当提高供水温度。居民家中暖气不热，可拨打热力公司服务热线报修。\u003c/p>\u003cp>气象部门提醒，降温期间早晚路面容易结冰，老人和孩子尽量减少外出；用煤炉取暖的居民要注意通风，谨防煤气中毒。\u003c/p>\u003c/div>\u003c/div>\u003cp class=\"meta\">数字版 · 据原版录入\u003c/p>"},{"id":"w_quan_1207","url":"www.wuchengquan.cn/p/1207","title":"七中旧案重新侦查，许嘉作案嫌疑已排除","requires":"ch0","onOpen":{"note":"n_quan_1207"},"keywords":"七中 旧案 许嘉 重新侦查 千年虫 晚报都登了 网吧老板","html":"\u003ch1>七中旧案重新侦查，许嘉作案嫌疑已排除\u003c/h1>\u003cdiv class=\"meta\">梧城发布 · 2026-12-07 18:00 · 转发 8,912\u003c/div>\u003cp>据市检察院消息，梧城七中系列学生死亡案已重新展开侦查。经复查，已排除原七中高三学生许嘉的作案嫌疑。\u003c/p>\u003cdiv class=\"cmt\">\u003cb>七中老校友\u003c/b> \u003cspan class=\"meta\">12-07\u003c/span>\u003cbr>当年我们班里还传着看过那张报纸。\u003c/div>\u003cdiv class=\"cmt\">\u003cb>梧桐路老街坊\u003c/b> \u003cspan class=\"meta\">12-07\u003c/span>\u003cbr>他以前还到我家修过电脑。挺好的一个孩子。\u003c/div>\u003cdiv class=\"cmt\">\u003cb>千禧网吧老板\u003c/b> \u003cspan class=\"meta\">12-07\u003c/span>\u003cbr>当年我在热线上说过“晚报都登了”。许嘉，对不起。\u003c/div>\u003cdiv class=\"cmt\">\u003cb>磊磊\u003c/b> \u003cspan class=\"meta\">12-08\u003c/span>\u003cbr>站长，这篇我转给七中的老同学了。\u003c/div>"},{"id":"w_quan_1209","url":"www.wuchengquan.cn/p/1209","title":"梧城热线的老网页又能看了","requires":"ch0","keywords":"梧城旧网 热线 存档 磊磊 王磊 时光机 晚报","html":"\u003ch1>梧城热线的老网页又能看了\u003c/h1>\u003cdiv class=\"meta\">磊磊（梧城旧网）· 2026-12-09 22:10\u003c/div>\u003cp>好些人来问以前的热线，老服务器里还能读的几页我都挂上去了。谁要是存过以前的网页，麻烦连同旁边那个图片文件夹一起发我，好多帖子还缺着图。\u003c/p>\u003cp>wcrx.jiuwang.org　archive.jiuwang.org\u003c/p>\u003cdiv class=\"cmt\">\u003cb>鸽子飞了\u003c/b> \u003cspan class=\"meta\">12-09\u003c/span>\u003cbr>我老电脑里好像存过几页，晚上回去翻翻。\u003c/div>\u003cdiv class=\"cmt\">\u003cb>豆浆控\u003c/b> \u003cspan class=\"meta\">12-10\u003c/span>\u003cbr>我的密码早就忘了，还能看吗？\u003c/div>\u003cdiv class=\"cmt\">\u003cb>磊磊\u003c/b> \u003cspan class=\"meta\">12-10\u003c/span>\u003cbr>能看，点上面第一个网址。\u003c/div>"},{"id":"w_quan_1222","url":"www.wuchengquan.cn/p/1222","title":"关于胶囊，关于孟凡","requires":"ch2","publishedAt":"2026-12-22 09:30","onOpen":{"note":"n_quan_1222"},"keywords":"陈一鸣 孟凡 南方 胶囊 声明 王小刚","html":"\u003ch1>关于胶囊，关于孟凡\u003c/h1>\u003cdiv class=\"meta\">一鸣惊人 · 2026-12-22 09:30[[?after 2026-12-22 20:00]] · 转发 1,530[[/?]]\u003c/div>\u003cp>这两天好多人在问孟凡的事。\u003c/p>\u003cp>孟凡是当年跟我们一起封盒子的。2004年起，盒子就是他替大家收着的。09年跨年以后他去了南方，后来我们几个就跟他联系不上了。\u003c/p>\u003cp>胶囊回来了，他那张盘我们会好好留着。请大家别再猜了！！谢谢！！\u003c/p>[[?after 2026-12-22 09:33]]\u003cdiv class=\"cmt\">\u003cb>小鹿乱撞\u003c/b> \u003cspan class=\"meta\">12-22 09:33\u003c/span>\u003cbr>抱抱一鸣\u003c/div>[[/?]][[?after 2026-12-22 09:39]]\u003cdiv class=\"cmt\">\u003cb>梧桐路老街坊\u003c/b> \u003cspan class=\"meta\">12-22 09:39\u003c/span>\u003cbr>他妈还在找他呢。\u003c/div>[[/?]][[?after 2026-12-22 09:48]]\u003cdiv class=\"cmt\">\u003cb>王小刚\u003c/b> \u003cspan class=\"meta\">12-22 09:48\u003c/span>\u003cbr>要真去了南方，怎么十七年连个电话都没往家打？\u003c/div>[[/?]][[?after 2026-12-22 09:52]]\u003cdiv class=\"cmt\">\u003cb>一鸣惊人\u003c/b> \u003cspan class=\"meta\">12-22 09:52\u003c/span>\u003cbr>（该评论已被作者删除）\u003c/div>[[/?]]"},{"id":"w_my_about","url":"www.mingyuan.tv/about.html","title":"鸣远影像 · 关于","requires":"ch0","keywords":"陈一鸣 鸣远 关于 省城 工作室 建国建工 合作","html":"\u003ch1>关于鸣远\u003c/h1>\u003cp>陈一鸣，1986年生于梧城。从十三岁起就拿着父亲的摄像机拍同学。工作室至今保存着他们在少年宫迎接千禧年的那盘录像。2004年到省城读书，2009年在省城开了第一家影像工作室，2011年回梧城创办鸣远影像。\u003c/p>\u003cp>我们拍婚礼、拍城市，也拍那些快要拆掉的老地方。\u003c/p>\u003cp class=\"meta\">合作伙伴：建国建工集团　梧城晚报　梧城发布\u003c/p>"},{"id":"w_my_works","url":"www.mingyuan.tv/works.html","title":"鸣远影像 · 作品","requires":"ch2","keywords":"作品 除虫小队 梧桐路 纪录片 鸣远","html":"\u003ch1>作品\u003c/h1>\u003cul>\u003cli>《梧桐路》（2019，纪录短片）　沿街的店主讲起了各自开张那天的事。\u003c/li>\u003cli>梧城婚礼季（2025）\u003c/li>\u003cli>\u003cb>《除虫小队》（拍摄中）\u003c/b>　从1999年留下的几盘录像带开始，回访当年镜头里的朋友。[[?c1_clips]]　\u003ca href=\"/1999.html\">看当年的录像\u003c/a>[[/?]]\u003c/li>\u003c/ul>"},{"id":"w_my_plan","url":"www.mingyuan.tv/plan.html","title":"鸣远影像 · 跨年直播流程","requires":"ch2","keywords":"直播 流程 23:00 读信 开盒 建国建工 场地","html":"\u003ch1>跨年直播节目单\u003c/h1>\u003cp class=\"meta\">鸣远影像　2026年12月31日晚\u003c/p>\u003ctable class=\"wt\">\u003cthead>\u003ctr>\u003cth scope=\"col\">时间\u003c/th>\u003cth scope=\"col\">内容\u003c/th>\u003c/tr>\u003c/thead>\u003ctbody>\u003ctr>\u003ctd>23:00\u003c/td>\u003ctd>[[?!ch7]]楼顶开播[[/?]]\u003c/td>\u003c/tr>\u003ctr>\u003ctd>23:20\u003c/td>\u003ctd>1999年封盒录像回放\u003c/td>\u003c/tr>\u003ctr>\u003ctd>23:50\u003c/td>\u003ctd>陈一鸣读自己的信（软盘副本）\u003c/td>\u003c/tr>\u003ctr>\u003ctd>00:00\u003c/td>\u003ctd>倒数，开盒\u003c/td>\u003c/tr>\u003c/tbody>\u003c/table>\u003cp>直播负责人：陈一鸣\u003c/p>\u003cp class=\"meta\">特别鸣谢：建国建工集团（场地支持）[[?!ch7]]。楼顶场地待现场确认，不能上楼则改在楼下开播。[[/?]]\u003c/p>"},{"id":"w_ar_sng_kaike","url":"www.wcsng.gov.cn/huodong/weijike.htm","title":"梧城少年宫 · 秋季计算机兴趣班开课","requires":"ch0","orig":{"skin":"sng","url":"www.wcsng.gov.cn/huodong/weijike.htm","when":"1999-10-19","fixedSnapshot":true},"html":"\u003cdiv class=\"sng\">\u003cdiv class=\"sng-top\">\u003cdiv class=\"sng-logo\">梧城少年宫\u003csmall>WUCHENG CHILDREN'S PALACE\u003c/small>\u003c/div>\u003ctime class=\"sng-date\">\u003c!--site-date-->\u003c/time>\u003c/div>\u003cdiv class=\"old-mq\">\u003cspan>\u003c!--site-banner-->\u003c/span>\u003c/div>\u003cdiv class=\"sng-main\">\u003cnav class=\"sng-nav\" aria-label=\"本站导航\">\u003cb>本站导航\u003c/b>\u003ca href=\"/\">■ 首页\u003c/a>\u003ca href=\"/jianjie.htm\">■ 本单位简介\u003c/a>\u003ca href=\"/xingqu/\">■ 兴趣小组\u003c/a>\u003ca href=\"/notice/\">■ 通知公告\u003c/a>\u003ca href=\"/huodong/\" aria-current=\"location\">■ 活动剪影\u003c/a>\u003ca href=\"/lianxi.htm\">■ 联系我们\u003c/a>\u003c/nav>\u003cdiv class=\"sng-art\">\u003cdiv class=\"sng-path\">您现在的位置：首页 &gt;&gt; 活动剪影 &gt;&gt; 正文\u003c/div>\u003ch1>秋季计算机兴趣班开课\u003c/h1>\u003cdiv class=\"sng-info\">1999-10-19　少年宫办公室\u003c/div>\u003cp>10月17日下午，本单位秋季计算机兴趣班在三楼微机室上了第一课，报名的八名初一学员都到了。兴趣班每周日下午上课，授课的学生志愿者由七中计算机教师推荐。\u003c/p>\u003cp class=\"sng-return\">\u003ca href=\"/huodong/\">返回活动剪影\u003c/a>\u003c/p>\u003c/div>\u003c/div>\u003cdiv class=\"sng-foot\">梧城少年宫\u003cbr>建议使用 IE 4.0 以上版本、800×600 分辨率浏览\u003c/div>\u003c/div>"},{"id":"w_ar_sng_1999","url":"www.wcsng.gov.cn/xingqu.htm","title":"梧城少年宫 · 千禧计算机兴趣班招生简章","requires":"ch0","keywords":"少年宫 兴趣班 许嘉 计算机 1999","source":"\u003c!-- 课程表是许嘉给的，原样贴上：10.17 第一课 千年虫演示 | 10.24 第二课 备份 | 11.07 第三课 CMOS电池 | 11.14 第四课 文件日期、日志 | 11.21 第五课 对钟 -->","orig":{"skin":"sng","url":"www.wcsng.gov.cn/xingqu.htm","when":"1999-11-15","fixedSnapshot":true},"html":"\u003cdiv class=\"sng\">\u003cdiv class=\"sng-top\">\u003cdiv class=\"sng-logo\">梧城少年宫\u003csmall>WUCHENG CHILDREN'S PALACE\u003c/small>\u003c/div>\u003ctime class=\"sng-date\">\u003c!--site-date-->\u003c/time>\u003c/div>\u003cdiv class=\"old-mq\">\u003cspan>\u003c!--site-banner-->\u003c/span>\u003c/div>\u003cdiv class=\"sng-main\">\u003cnav class=\"sng-nav\" aria-label=\"本站导航\">\u003cb>本站导航\u003c/b>\u003ca href=\"/\">■ 首页\u003c/a>\u003ca href=\"/jianjie.htm\">■ 本单位简介\u003c/a>\u003ca href=\"/xingqu/\" aria-current=\"location\">■ 兴趣小组\u003c/a>\u003ca href=\"/notice/\">■ 通知公告\u003c/a>\u003ca href=\"/huodong/\">■ 活动剪影\u003c/a>\u003ca href=\"/lianxi.htm\">■ 联系我们\u003c/a>\u003c/nav>\u003cdiv class=\"sng-art\">\u003cdiv class=\"sng-path\">您现在的位置：首页 &gt;&gt; 兴趣小组 &gt;&gt; 正文\u003c/div>\u003ch1>千禧计算机兴趣班招生简章\u003c/h1>\u003cdiv class=\"sng-info\">发布时间：1999-10-11　来源：少年宫办公室　点击：86 次\u003c/div>\u003cp>为普及计算机知识，培养学生的动手能力，本单位今秋开设千禧计算机兴趣班。现将招生事项公布如下：\u003c/p>\u003cp>一、招生对象：初一学生，本期招收8名。\u003c/p>\u003cp>二、上课时间、地点：每周日下午，三楼微机室。\u003c/p>\u003cp>三、课程内容：从电脑基本操作讲起，结合世纪之交可能出现的日期错误，学习查看系统日期、检查电脑设置和安装补丁。授课的学生志愿者由七中计算机教师推荐。\u003c/p>\u003cp>四、报名地点：少年宫一楼办公室。咨询电话：2216381。\u003c/p>\u003cp class=\"sng-info\">10月17日补记：本期名额已满。\u003c/p>\u003cp class=\"sng-return\">\u003ca href=\"/xingqu/\">返回兴趣小组\u003c/a>\u003c/p>\u003c/div>\u003c/div>\u003cdiv class=\"sng-foot\">梧城少年宫\u003cbr>建议使用 IE 4.0 以上版本、800×600 分辨率浏览\u003c/div>\u003c/div>"},{"id":"w_ar_sng_1999b","url":"www.wcsng.gov.cn/huodong/jiaonang.htm","title":"梧城少年宫 · 千禧时间胶囊","requires":"ch1","keywords":"千禧 时间胶囊 少年宫 1999 微机组 封存 2027","orig":{"skin":"sng","url":"www.wcsng.gov.cn/huodong/jiaonang.htm","when":"2000-01-05","fixedSnapshot":true,"remark":"快照备注：本页的活动照片未保存。"},"html":"\u003cdiv class=\"sng\">\u003cdiv class=\"sng-top\">\u003cdiv class=\"sng-logo\">梧城少年宫\u003csmall>WUCHENG CHILDREN'S PALACE\u003c/small>\u003c/div>\u003ctime class=\"sng-date\">\u003c!--site-date-->\u003c/time>\u003c/div>\u003cdiv class=\"old-mq\">\u003cspan>\u003c!--site-banner-->\u003c/span>\u003c/div>\u003cdiv class=\"sng-main\">\u003cnav class=\"sng-nav\" aria-label=\"本站导航\">\u003cb>本站导航\u003c/b>\u003ca href=\"/\">■ 首页\u003c/a>\u003ca href=\"/jianjie.htm\">■ 本单位简介\u003c/a>\u003ca href=\"/xingqu/\">■ 兴趣小组\u003c/a>\u003ca href=\"/notice/\">■ 通知公告\u003c/a>\u003ca href=\"/huodong/\" aria-current=\"location\">■ 活动剪影\u003c/a>\u003ca href=\"/lianxi.htm\">■ 联系我们\u003c/a>\u003c/nav>\u003cdiv class=\"sng-art\">\u003cdiv class=\"sng-path\">您现在的位置：首页 &gt;&gt; 活动剪影 &gt;&gt; 正文\u003c/div>\u003ch1>千禧时间胶囊\u003c/h1>\u003cdiv class=\"sng-info\">发布时间：2000-01-04　来源：少年宫办公室　点击：203 次\u003c/div>\u003cp>为迎接新世纪，本单位计算机兴趣班于1999年12月31日晚举办了“千禧时间胶囊”活动。铁盒加铅封后锁入一楼办公室的铁柜，由本单位代为保管。\u003c/p>\u003cp>举办这次活动，是希望同学们从小立下志向，珍惜今天的学习时光。启封定在2027年元旦，届时由本单位通知学员到场。\u003c/p>\u003cp class=\"sng-return\">\u003ca href=\"/huodong/\">返回活动剪影\u003c/a>\u003c/p>\u003c/div>\u003c/div>\u003cdiv class=\"sng-foot\">梧城少年宫\u003cbr>建议使用 IE 4.0 以上版本、800×600 分辨率浏览\u003c/div>\u003c/div>"},{"id":"w_ar_sng_1999c","url":"www.wcsng.gov.cn/huodong/chuchong.htm","title":"梧城少年宫 · 计算机班学员为居民义务检查电脑","requires":"ch1","keywords":"除虫小队 少年宫 1999 千年虫 上门 检查 电脑 梧桐路","onOpen":{"note":"n_ar_chuchong"},"orig":{"skin":"sng","url":"www.wcsng.gov.cn/huodong/chuchong.htm","when":"1999-12-01","fixedSnapshot":true,"remark":"快照备注：本页的活动照片未保存。"},"html":"\u003cdiv class=\"sng\">\u003cdiv class=\"sng-top\">\u003cdiv class=\"sng-logo\">梧城少年宫\u003csmall>WUCHENG CHILDREN'S PALACE\u003c/small>\u003c/div>\u003ctime class=\"sng-date\">\u003c!--site-date-->\u003c/time>\u003c/div>\u003cdiv class=\"old-mq\">\u003cspan>\u003c!--site-banner-->\u003c/span>\u003c/div>\u003cdiv class=\"sng-main\">\u003cnav class=\"sng-nav\" aria-label=\"本站导航\">\u003cb>本站导航\u003c/b>\u003ca href=\"/\">■ 首页\u003c/a>\u003ca href=\"/jianjie.htm\">■ 本单位简介\u003c/a>\u003ca href=\"/xingqu/\">■ 兴趣小组\u003c/a>\u003ca href=\"/notice/\">■ 通知公告\u003c/a>\u003ca href=\"/huodong/\" aria-current=\"location\">■ 活动剪影\u003c/a>\u003ca href=\"/lianxi.htm\">■ 联系我们\u003c/a>\u003c/nav>\u003cdiv class=\"sng-art\">\u003cdiv class=\"sng-path\">您现在的位置：首页 &gt;&gt; 活动剪影 &gt;&gt; 正文\u003c/div>\u003ch1>计算机班学员为居民义务检查电脑\u003c/h1>\u003cdiv class=\"sng-info\">发布时间：1999-11-29　来源：少年宫办公室　点击：64 次\u003c/div>\u003cp>11月28日下午，本单位计算机兴趣班的学员在七中学生志愿者带领下，到梧桐路居民家中义务检查电脑的日期设置。\u003c/p>\u003cp>当天下午，学员们共为居民检查了七台电脑，其中三台当场校正了日期。另有两台关机后不能保存日期，学员们把故障记下来，提醒住户更换主板电池。\u003c/p>\u003cp class=\"sng-return\">\u003ca href=\"/huodong/\">返回活动剪影\u003c/a>\u003c/p>\u003c/div>\u003c/div>\u003cdiv class=\"sng-foot\">梧城少年宫\u003cbr>建议使用 IE 4.0 以上版本、800×600 分辨率浏览\u003c/div>\u003c/div>"},{"id":"w_ar_sng_2004a","url":"www.wcsng.gov.cn/notice/0103.htm","title":"梧城少年宫 · 关于元旦凌晨火灾的情况通报","requires":"ch2","keywords":"情况通报 少年宫 火情 冯振邦 李静 铁门 2004 赵小川 冬令营","onOpen":{"note":"n_ar_tongbao"},"orig":{"skin":"sng","url":"www.wcsng.gov.cn/notice/0103.htm","when":"2004-01-04","fixedSnapshot":true},"html":"\u003cdiv class=\"sng sng-gray\">\u003cdiv class=\"sng-top\">\u003cdiv class=\"sng-logo\">梧城少年宫\u003csmall>WUCHENG CHILDREN'S PALACE\u003c/small>\u003c/div>\u003ctime class=\"sng-date\">\u003c!--site-date-->\u003c/time>\u003c/div>\u003cdiv class=\"old-mq\">\u003cspan>\u003c!--site-banner-->\u003c/span>\u003c/div>\u003cdiv class=\"sng-main\">\u003cnav class=\"sng-nav\" aria-label=\"本站导航\">\u003cb>本站导航\u003c/b>\u003ca href=\"/\">■ 首页\u003c/a>\u003ca href=\"/jianjie.htm\">■ 本单位简介\u003c/a>\u003ca href=\"/xingqu/\">■ 兴趣小组\u003c/a>\u003ca href=\"/notice/\" aria-current=\"location\">■ 通知公告\u003c/a>\u003ca href=\"/huodong/\">■ 活动剪影\u003c/a>\u003ca href=\"/lianxi.htm\">■ 联系我们\u003c/a>\u003c/nav>\u003cdiv class=\"sng-art\">\u003cdiv class=\"sng-path\">您现在的位置：首页 &gt;&gt; 通知公告 &gt;&gt; 正文\u003c/div>\u003ch1>关于元旦凌晨火灾的情况通报\u003c/h1>\u003cdiv class=\"sng-info\">发布时间：2004-01-03　来源：主任办公室　签发人：冯振邦　点击：1,208 次\u003c/div>\u003cp>2004年1月1日凌晨，本单位主楼二楼电子制作工作间发生火灾。零时四分，本单位值班教师向消防部门报警。本单位天文组学员赵小川在火灾中不幸遇难。现将有关情况通报如下：\u003c/p>\u003cp>一、人员撤离。当晚值班教师李静组织三楼冬令营学员沿东梯撤离。参加冬令营的18名小学生撤至院内，经点名全部到齐，现已由家长接回。\u003c/p>\u003cp>二、起火原因。根据事发当晚在场人员的陈述，本单位初步认为起火可能与楼顶燃放烟花有关。有关材料已交消防部门，起火原因以消防部门的调查结论为准。\u003c/p>\u003cp>三、善后工作。本单位对赵小川同学的遇难表示沉痛哀悼，向其家属致以深切慰问，将积极配合有关部门调查，做好善后工作。\u003c/p>\u003cp class=\"sng-sign\">梧城少年宫\u003cbr>2004年1月3日\u003c/p>\u003cp class=\"sng-return\">\u003ca href=\"/notice/\">返回通知公告\u003c/a>\u003c/p>\u003c/div>\u003c/div>\u003cdiv class=\"sng-foot\">梧城少年宫\u003cbr>建议使用 IE 4.0 以上版本、800×600 分辨率浏览\u003c/div>\u003c/div>"},{"id":"w_ar_sng_y2k","url":"www.wcsng.gov.cn/notice/0102.htm","title":"梧城少年宫 · 本单位电脑顺利跨入2000年","requires":"ch1","keywords":"少年宫 千禧年 微机室 六号机 教学演示 2000","orig":{"skin":"sng","url":"www.wcsng.gov.cn/notice/0102.htm","when":"2000-01-05","fixedSnapshot":true},"html":"\u003cdiv class=\"sng\">\u003cdiv class=\"sng-top\">\u003cdiv class=\"sng-logo\">梧城少年宫\u003csmall>WUCHENG CHILDREN'S PALACE\u003c/small>\u003c/div>\u003ctime class=\"sng-date\">\u003c!--site-date-->\u003c/time>\u003c/div>\u003cdiv class=\"old-mq\">\u003cspan>\u003c!--site-banner-->\u003c/span>\u003c/div>\u003cdiv class=\"sng-main\">\u003cnav class=\"sng-nav\" aria-label=\"本站导航\">\u003cb>本站导航\u003c/b>\u003ca href=\"/\">■ 首页\u003c/a>\u003ca href=\"/jianjie.htm\">■ 本单位简介\u003c/a>\u003ca href=\"/xingqu/\">■ 兴趣小组\u003c/a>\u003ca href=\"/notice/\" aria-current=\"location\">■ 通知公告\u003c/a>\u003ca href=\"/huodong/\">■ 活动剪影\u003c/a>\u003ca href=\"/lianxi.htm\">■ 联系我们\u003c/a>\u003c/nav>\u003cdiv class=\"sng-art\">\u003cdiv class=\"sng-path\">您现在的位置：首页 &gt;&gt; 通知公告 &gt;&gt; 正文\u003c/div>\u003ch1>本单位电脑顺利跨入2000年\u003c/h1>\u003cdiv class=\"sng-info\">发布时间：2000-01-02　来源：少年宫办公室　点击：58 次\u003c/div>\u003cp>元旦值班期间，办公室、财务室及三楼微机室已完成电脑日期检查，办公和教学用机均可照常使用。\u003c/p>\u003cp>微机室六号机留作课堂演示，仍保留原有的日期设置。计算机兴趣班按原课表上课。\u003c/p>\u003cp class=\"sng-sign\">梧城少年宫办公室\u003cbr>2000年1月2日\u003c/p>\u003cp class=\"sng-return\">\u003ca href=\"/notice/\">返回通知公告\u003c/a>\u003c/p>\u003c/div>\u003c/div>\u003cdiv class=\"sng-foot\">梧城少年宫\u003cbr>建议使用 IE 4.0 以上版本、800×600 分辨率浏览\u003c/div>\u003c/div>"},{"id":"w_ar_sng_hanjia","url":"www.wcsng.gov.cn/notice/hanjia.htm","title":"梧城少年宫 · 寒假兴趣班报名须知","requires":"ch1","orig":{"skin":"sng","url":"www.wcsng.gov.cn/notice/hanjia.htm","when":"2000-01-03","fixedSnapshot":true},"html":"\u003cdiv class=\"sng\">\u003cdiv class=\"sng-top\">\u003cdiv class=\"sng-logo\">梧城少年宫\u003csmall>WUCHENG CHILDREN'S PALACE\u003c/small>\u003c/div>\u003ctime class=\"sng-date\">\u003c!--site-date-->\u003c/time>\u003c/div>\u003cdiv class=\"old-mq\">\u003cspan>\u003c!--site-banner-->\u003c/span>\u003c/div>\u003cdiv class=\"sng-main\">\u003cnav class=\"sng-nav\" aria-label=\"本站导航\">\u003cb>本站导航\u003c/b>\u003ca href=\"/\">■ 首页\u003c/a>\u003ca href=\"/jianjie.htm\">■ 本单位简介\u003c/a>\u003ca href=\"/xingqu/\">■ 兴趣小组\u003c/a>\u003ca href=\"/notice/\" aria-current=\"location\">■ 通知公告\u003c/a>\u003ca href=\"/huodong/\">■ 活动剪影\u003c/a>\u003ca href=\"/lianxi.htm\">■ 联系我们\u003c/a>\u003c/nav>\u003cdiv class=\"sng-art\">\u003cdiv class=\"sng-path\">您现在的位置：首页 &gt;&gt; 通知公告 &gt;&gt; 正文\u003c/div>\u003ch1>寒假兴趣班报名须知\u003c/h1>\u003cdiv class=\"sng-info\">2000-01-03　梧城少年宫办公室\u003c/div>\u003cp>本单位寒假兴趣班即日起接受报名，现将有关事项告知如下：\u003c/p>\u003cp>一、报名地点：少年宫一楼办公室。报名时间：周二至周日8:30—17:30。\u003c/p>\u003cp>二、各班上课时间可在报名处查询。\u003c/p>\u003cp>三、秋季班学员续报寒假班，须重新登记。\u003c/p>\u003cp>咨询电话：2216381。\u003c/p>\u003cp class=\"sng-sign\">梧城少年宫办公室\u003cbr>2000年1月3日\u003c/p>\u003cp class=\"sng-return\">\u003ca href=\"/notice/\">返回通知公告\u003c/a>\u003c/p>\u003c/div>\u003c/div>\u003cdiv class=\"sng-foot\">梧城少年宫\u003cbr>建议使用 IE 4.0 以上版本、800×600 分辨率浏览\u003c/div>\u003c/div>"},{"id":"w_ar_sng_shuhua","url":"www.wcsng.gov.cn/huodong/shuhua.htm","title":"梧城少年宫 · “六一”少儿书画展参观安排","requires":"ch2","orig":{"skin":"sng","url":"www.wcsng.gov.cn/huodong/shuhua.htm","when":"2002-06-01","fixedSnapshot":true},"html":"\u003cdiv class=\"sng\">\u003cdiv class=\"sng-top\">\u003cdiv class=\"sng-logo\">梧城少年宫\u003csmall>WUCHENG CHILDREN'S PALACE\u003c/small>\u003c/div>\u003ctime class=\"sng-date\">\u003c!--site-date-->\u003c/time>\u003c/div>\u003cdiv class=\"old-mq\">\u003cspan>\u003c!--site-banner-->\u003c/span>\u003c/div>\u003cdiv class=\"sng-main\">\u003cnav class=\"sng-nav\" aria-label=\"本站导航\">\u003cb>本站导航\u003c/b>\u003ca href=\"/\">■ 首页\u003c/a>\u003ca href=\"/jianjie.htm\">■ 本单位简介\u003c/a>\u003ca href=\"/xingqu/\">■ 兴趣小组\u003c/a>\u003ca href=\"/notice/\">■ 通知公告\u003c/a>\u003ca href=\"/huodong/\" aria-current=\"location\">■ 活动剪影\u003c/a>\u003ca href=\"/lianxi.htm\">■ 联系我们\u003c/a>\u003c/nav>\u003cdiv class=\"sng-art\">\u003cdiv class=\"sng-path\">您现在的位置：首页 &gt;&gt; 活动剪影 &gt;&gt; 正文\u003c/div>\u003ch1>“六一”少儿书画展参观安排\u003c/h1>\u003cdiv class=\"sng-info\">2002-06-01　梧城少年宫办公室\u003c/div>\u003cp>为庆祝“六一”国际儿童节，6月1日至2日，本单位在一楼礼堂举办少儿书画展，展出美术组和书法组学员的作品。展厅每日上午9时至下午4时开放，欢迎市民参观。\u003c/p>\u003cp class=\"sng-return\">\u003ca href=\"/huodong/\">返回活动剪影\u003c/a>\u003c/p>\u003c/div>\u003c/div>\u003cdiv class=\"sng-foot\">梧城少年宫\u003cbr>建议使用 IE 4.0 以上版本、800×600 分辨率浏览\u003c/div>\u003c/div>"},{"id":"w_ar_sng_langsong","url":"www.wcsng.gov.cn/huodong/langsong.htm","title":"梧城少年宫 · 朗诵班学员在市少儿朗诵比赛中获奖","requires":"ch2","orig":{"skin":"sng","url":"www.wcsng.gov.cn/huodong/langsong.htm","when":"2003-06-03","fixedSnapshot":true},"html":"\u003cdiv class=\"sng\">\u003cdiv class=\"sng-top\">\u003cdiv class=\"sng-logo\">梧城少年宫\u003csmall>WUCHENG CHILDREN'S PALACE\u003c/small>\u003c/div>\u003ctime class=\"sng-date\">\u003c!--site-date-->\u003c/time>\u003c/div>\u003cdiv class=\"old-mq\">\u003cspan>\u003c!--site-banner-->\u003c/span>\u003c/div>\u003cdiv class=\"sng-main\">\u003cnav class=\"sng-nav\" aria-label=\"本站导航\">\u003cb>本站导航\u003c/b>\u003ca href=\"/\">■ 首页\u003c/a>\u003ca href=\"/jianjie.htm\">■ 本单位简介\u003c/a>\u003ca href=\"/xingqu/\">■ 兴趣小组\u003c/a>\u003ca href=\"/notice/\">■ 通知公告\u003c/a>\u003ca href=\"/huodong/\" aria-current=\"location\">■ 活动剪影\u003c/a>\u003ca href=\"/lianxi.htm\">■ 联系我们\u003c/a>\u003c/nav>\u003cdiv class=\"sng-art\">\u003cdiv class=\"sng-path\">您现在的位置：首页 &gt;&gt; 活动剪影 &gt;&gt; 正文\u003c/div>\u003ch1>朗诵班学员在市少儿朗诵比赛中获奖\u003c/h1>\u003cdiv class=\"sng-info\">2003-06-03　梧城少年宫办公室\u003c/div>\u003cp>5月31日，梧城市少儿朗诵比赛在市文化馆举行。本单位朗诵班有6名学员获奖，其中小学高年级组一等奖1名、二等奖2名，小学低年级组三等奖3名。\u003c/p>\u003cp>分组获奖名单已张贴在三楼302教室门口，学员和家长可于周日上午前往查看。本单位向获奖学员和指导教师表示祝贺。\u003c/p>\u003cp class=\"sng-return\">\u003ca href=\"/huodong/\">返回活动剪影\u003c/a>\u003c/p>\u003c/div>\u003c/div>\u003cdiv class=\"sng-foot\">梧城少年宫\u003cbr>建议使用 IE 4.0 以上版本、800×600 分辨率浏览\u003c/div>\u003c/div>"},{"id":"w_ar_sng_zanting","url":"www.wcsng.gov.cn/notice/zanting.htm","title":"梧城少年宫 · 寒假兴趣班暂停报名","requires":"ch2","orig":{"skin":"sng","url":"www.wcsng.gov.cn/notice/zanting.htm","when":"2004-01-03","fixedSnapshot":true},"html":"\u003cdiv class=\"sng\">\u003cdiv class=\"sng-top\">\u003cdiv class=\"sng-logo\">梧城少年宫\u003csmall>WUCHENG CHILDREN'S PALACE\u003c/small>\u003c/div>\u003ctime class=\"sng-date\">\u003c!--site-date-->\u003c/time>\u003c/div>\u003cdiv class=\"old-mq\">\u003cspan>\u003c!--site-banner-->\u003c/span>\u003c/div>\u003cdiv class=\"sng-main\">\u003cnav class=\"sng-nav\" aria-label=\"本站导航\">\u003cb>本站导航\u003c/b>\u003ca href=\"/\">■ 首页\u003c/a>\u003ca href=\"/jianjie.htm\">■ 本单位简介\u003c/a>\u003ca href=\"/xingqu/\">■ 兴趣小组\u003c/a>\u003ca href=\"/notice/\" aria-current=\"location\">■ 通知公告\u003c/a>\u003ca href=\"/huodong/\">■ 活动剪影\u003c/a>\u003ca href=\"/lianxi.htm\">■ 联系我们\u003c/a>\u003c/nav>\u003cdiv class=\"sng-art\">\u003cdiv class=\"sng-path\">您现在的位置：首页 &gt;&gt; 通知公告 &gt;&gt; 正文\u003c/div>\u003ch1>寒假兴趣班暂停报名\u003c/h1>\u003cdiv class=\"sng-info\">2004-01-03　梧城少年宫办公室\u003c/div>\u003cp>受元旦凌晨火灾影响，本单位寒假兴趣班自即日起暂停报名，恢复时间另行通知。\u003c/p>\u003cp>已登记的学员家长请保留报名回执。如需查询，请拨打报名咨询电话2216381。\u003c/p>\u003cp class=\"sng-sign\">梧城少年宫办公室\u003cbr>2004年1月3日\u003c/p>\u003cp class=\"sng-return\">\u003ca href=\"/notice/\">返回通知公告\u003c/a>\u003c/p>\u003c/div>\u003c/div>\u003cdiv class=\"sng-foot\">梧城少年宫\u003cbr>建议使用 IE 4.0 以上版本、800×600 分辨率浏览\u003c/div>\u003c/div>"},{"id":"w_ar_sng_jieying","url":"www.wcsng.gov.cn/notice/jieying.htm","title":"梧城少年宫 · 关于2003年冬令营提前结营的通知","requires":"ch2","orig":{"skin":"sng","url":"www.wcsng.gov.cn/notice/jieying.htm","when":"2004-01-02","fixedSnapshot":true},"html":"\u003cdiv class=\"sng\">\u003cdiv class=\"sng-top\">\u003cdiv class=\"sng-logo\">梧城少年宫\u003csmall>WUCHENG CHILDREN'S PALACE\u003c/small>\u003c/div>\u003ctime class=\"sng-date\">\u003c!--site-date-->\u003c/time>\u003c/div>\u003cdiv class=\"old-mq\">\u003cspan>\u003c!--site-banner-->\u003c/span>\u003c/div>\u003cdiv class=\"sng-main\">\u003cnav class=\"sng-nav\" aria-label=\"本站导航\">\u003cb>本站导航\u003c/b>\u003ca href=\"/\">■ 首页\u003c/a>\u003ca href=\"/jianjie.htm\">■ 本单位简介\u003c/a>\u003ca href=\"/xingqu/\">■ 兴趣小组\u003c/a>\u003ca href=\"/notice/\" aria-current=\"location\">■ 通知公告\u003c/a>\u003ca href=\"/huodong/\">■ 活动剪影\u003c/a>\u003ca href=\"/lianxi.htm\">■ 联系我们\u003c/a>\u003c/nav>\u003cdiv class=\"sng-art\">\u003cdiv class=\"sng-path\">您现在的位置：首页 &gt;&gt; 通知公告 &gt;&gt; 正文\u003c/div>\u003ch1>关于2003年冬令营提前结营的通知\u003c/h1>\u003cdiv class=\"sng-info\">2004-01-02　梧城少年宫办公室\u003c/div>\u003cp>因元旦凌晨本单位发生火灾，2003年冬令营于1月1日提前结营，学员均已由家长接回。已缴费用的退还办法另行通知。\u003c/p>\u003cp>家长如发现孩子的衣物或其他随身物品遗落在少年宫，请致电办公室（2216380），告知物品特征并留下联系电话。工作人员找到后将通知家长领取。\u003c/p>\u003cp>特此通知。\u003c/p>\u003cp class=\"sng-sign\">梧城少年宫办公室\u003cbr>2004年1月2日\u003c/p>\u003cp class=\"sng-return\">\u003ca href=\"/notice/\">返回通知公告\u003c/a>\u003c/p>\u003c/div>\u003c/div>\u003cdiv class=\"sng-foot\">梧城少年宫\u003cbr>建议使用 IE 4.0 以上版本、800×600 分辨率浏览\u003c/div>\u003c/div>"},{"id":"w_ar_sng_guoqing","url":"www.wcsng.gov.cn/notice/guoqing.htm","title":"梧城少年宫 · 国庆期间办公室开放时间","requires":"ch2","orig":{"skin":"sng","url":"www.wcsng.gov.cn/notice/guoqing.htm","when":"2003-09-26","fixedSnapshot":true},"html":"\u003cdiv class=\"sng\">\u003cdiv class=\"sng-top\">\u003cdiv class=\"sng-logo\">梧城少年宫\u003csmall>WUCHENG CHILDREN'S PALACE\u003c/small>\u003c/div>\u003ctime class=\"sng-date\">\u003c!--site-date-->\u003c/time>\u003c/div>\u003cdiv class=\"old-mq\">\u003cspan>\u003c!--site-banner-->\u003c/span>\u003c/div>\u003cdiv class=\"sng-main\">\u003cnav class=\"sng-nav\" aria-label=\"本站导航\">\u003cb>本站导航\u003c/b>\u003ca href=\"/\">■ 首页\u003c/a>\u003ca href=\"/jianjie.htm\">■ 本单位简介\u003c/a>\u003ca href=\"/xingqu/\">■ 兴趣小组\u003c/a>\u003ca href=\"/notice/\" aria-current=\"location\">■ 通知公告\u003c/a>\u003ca href=\"/huodong/\">■ 活动剪影\u003c/a>\u003ca href=\"/lianxi.htm\">■ 联系我们\u003c/a>\u003c/nav>\u003cdiv class=\"sng-art\">\u003cdiv class=\"sng-path\">您现在的位置：首页 &gt;&gt; 通知公告 &gt;&gt; 正文\u003c/div>\u003ch1>国庆期间办公室开放时间\u003c/h1>\u003cdiv class=\"sng-info\">2003-09-26　梧城少年宫办公室\u003c/div>\u003cp>国庆节期间（10月1日至7日），本单位一楼办公室每天上午9时至11时对外开放。家长可来电或到办公室查询报名办法和各班假期课表。报名咨询电话：2216381。\u003c/p>\u003cp class=\"sng-sign\">梧城少年宫办公室\u003cbr>2003年9月26日\u003c/p>\u003cp class=\"sng-return\">\u003ca href=\"/notice/\">返回通知公告\u003c/a>\u003c/p>\u003c/div>\u003c/div>\u003cdiv class=\"sng-foot\">梧城少年宫\u003cbr>建议使用 IE 4.0 以上版本、800×600 分辨率浏览\u003c/div>\u003c/div>"},{"id":"w_ar_sng_daonian","url":"www.wcsng.gov.cn/notice/daonian.htm","title":"梧城少年宫 · 沉痛悼念遇难学员赵小川同学","requires":"ch2","orig":{"skin":"sng","url":"www.wcsng.gov.cn/notice/daonian.htm","when":"2004-01-04","fixedSnapshot":true},"html":"\u003cdiv class=\"sng sng-gray\">\u003cdiv class=\"sng-top\">\u003cdiv class=\"sng-logo\">梧城少年宫\u003csmall>WUCHENG CHILDREN'S PALACE\u003c/small>\u003c/div>\u003ctime class=\"sng-date\">\u003c!--site-date-->\u003c/time>\u003c/div>\u003cdiv class=\"old-mq\">\u003cspan>\u003c!--site-banner-->\u003c/span>\u003c/div>\u003cdiv class=\"sng-main\">\u003cnav class=\"sng-nav\" aria-label=\"本站导航\">\u003cb>本站导航\u003c/b>\u003ca href=\"/\">■ 首页\u003c/a>\u003ca href=\"/jianjie.htm\">■ 本单位简介\u003c/a>\u003ca href=\"/xingqu/\">■ 兴趣小组\u003c/a>\u003ca href=\"/notice/\" aria-current=\"location\">■ 通知公告\u003c/a>\u003ca href=\"/huodong/\">■ 活动剪影\u003c/a>\u003ca href=\"/lianxi.htm\">■ 联系我们\u003c/a>\u003c/nav>\u003cdiv class=\"sng-art\">\u003cdiv class=\"sng-path\">您现在的位置：首页 &gt;&gt; 通知公告 &gt;&gt; 正文\u003c/div>\u003ch1>沉痛悼念遇难学员赵小川同学\u003c/h1>\u003cdiv class=\"sng-info\">2004-01-04　梧城少年宫办公室\u003c/div>\u003cp>2004年1月1日凌晨，本单位天文组学员赵小川在火灾中不幸遇难，年仅十七岁。\u003c/p>\u003cp>赵小川同学是七中高二学生，自2000年起参加本单位天文组活动。他自己磨制镜片、安装电机，做成了望远镜“望舒号”，常和天文组的伙伴们在楼顶观测、记录流星。\u003c/p>\u003cp>全体教职工沉痛悼念赵小川同学，并向他的家人致以深切慰问。\u003c/p>\u003cp class=\"sng-sign\">梧城少年宫全体教职工\u003cbr>2004年1月4日\u003c/p>\u003cp class=\"sng-return\">\u003ca href=\"/notice/\">返回通知公告\u003c/a>\u003c/p>\u003c/div>\u003c/div>\u003cdiv class=\"sng-foot\">梧城少年宫\u003cbr>建议使用 IE 4.0 以上版本、800×600 分辨率浏览\u003c/div>\u003c/div>"},{"id":"w_ar_sng_xinxiang","url":"www.wcsng.gov.cn/xinxiang.htm","title":"梧城少年宫 · 主任信箱 · 来信办法","requires":"ch0","orig":{"skin":"sng","url":"www.wcsng.gov.cn/xinxiang.htm","when":"1999-11-15","fixedSnapshot":true},"html":"\u003cdiv class=\"sng\">\u003cdiv class=\"sng-top\">\u003cdiv class=\"sng-logo\">梧城少年宫\u003csmall>WUCHENG CHILDREN'S PALACE\u003c/small>\u003c/div>\u003ctime class=\"sng-date\">\u003c!--site-date-->\u003c/time>\u003c/div>\u003cdiv class=\"old-mq\">\u003cspan>\u003c!--site-banner-->\u003c/span>\u003c/div>\u003cdiv class=\"sng-main\">\u003cnav class=\"sng-nav\" aria-label=\"本站导航\">\u003cb>本站导航\u003c/b>\u003ca href=\"/\">■ 首页\u003c/a>\u003ca href=\"/jianjie.htm\">■ 本单位简介\u003c/a>\u003ca href=\"/xingqu/\">■ 兴趣小组\u003c/a>\u003ca href=\"/notice/\">■ 通知公告\u003c/a>\u003ca href=\"/huodong/\">■ 活动剪影\u003c/a>\u003ca href=\"/lianxi.htm\" aria-current=\"location\">■ 联系我们\u003c/a>\u003c/nav>\u003cdiv class=\"sng-art\">\u003cdiv class=\"sng-path\">您现在的位置：首页 &gt;&gt; 联系我们 &gt;&gt; 正文\u003c/div>\u003ch1>主任信箱 · 来信办法\u003c/h1>\u003cdiv class=\"sng-info\">1999-11-15　梧城少年宫办公室\u003c/div>\u003cp>欢迎家长和学员对本单位活动安排提出意见。来信请交少年宫办公室，信封上注明“主任收”，也可发电子邮件至 wcsng@public.wc169.net。如需答复，请留下回信地址。\u003c/p>\u003cp class=\"sng-return\">\u003ca href=\"/lianxi.htm\">返回联系我们\u003c/a>\u003c/p>\u003c/div>\u003c/div>\u003cdiv class=\"sng-foot\">梧城少年宫\u003cbr>建议使用 IE 4.0 以上版本、800×600 分辨率浏览\u003c/div>\u003c/div>"},{"id":"w_ar_sng_home00","url":"www.wcsng.gov.cn/","title":"梧城少年宫 · 首页","requires":"ch0","orig":{"skin":"sng","url":"www.wcsng.gov.cn/","when":"2004-01-04"},"html":"\u003cdiv class=\"sng[[?ch2 & !ch3]] sng-gray[[/?]]\">\u003cdiv class=\"sng-top\">\u003cdiv class=\"sng-logo\">梧城少年宫\u003csmall>WUCHENG CHILDREN'S PALACE\u003c/small>\u003c/div>\u003ctime class=\"sng-date\">\u003c!--site-date-->\u003c/time>\u003c/div>\u003cdiv class=\"old-mq\">\u003cspan>\u003c!--site-banner-->\u003c/span>\u003c/div>\u003cdiv class=\"sng-main\">\u003cnav class=\"sng-nav\" aria-label=\"本站导航\">\u003cb>本站导航\u003c/b>\u003ca href=\"/\" aria-current=\"page\">■ 首页\u003c/a>\u003ca href=\"/jianjie.htm\">■ 本单位简介\u003c/a>\u003ca href=\"/xingqu/\">■ 兴趣小组\u003c/a>\u003ca href=\"/notice/\">■ 通知公告\u003c/a>\u003ca href=\"/huodong/\">■ 活动剪影\u003c/a>\u003ca href=\"/lianxi.htm\">■ 联系我们\u003c/a>\u003c/nav>\u003cdiv class=\"sng-art\">\u003cdiv class=\"sng-path\">您现在的位置：首页\u003c/div>[[?!ch2]]\u003ch1>梧城少年宫\u003c/h1>\u003cp>本单位开设计算机、天文、朗诵、书法、美术、舞蹈等兴趣小组，周末及寒暑假向全市中小学生开放。\u003c/p>[[/?]][[?ch2 & !ch3]]\u003ch1>沉痛悼念遇难学员赵小川同学\u003c/h1>\u003cp class=\"sng-c\">2004年1月1日，赵小川同学在少年宫火灾中遇难，年仅十七岁。　\u003ca href=\"/notice/daonian.htm\">全文\u003c/a>\u003c/p>[[/?]]\u003cdiv class=\"sng-sub\">本单位动态\u003c/div>{{LIST}}\u003c/div>\u003c/div>\u003cdiv class=\"sng-foot\">梧城少年宫\u003cbr>建议使用 IE 4.0 以上版本、800×600 分辨率浏览\u003c/div>\u003c/div>","list":[{"page":"w_ar_sng_daonian","label":"沉痛悼念遇难学员赵小川同学","meta":"2004-01-04"},{"page":"w_ar_sng_2004a","label":"关于元旦凌晨火灾的情况通报","meta":"2004-01-03"},{"page":"w_ar_sng_zanting","label":"寒假兴趣班暂停报名","meta":"2004-01-03"},{"page":"w_ar_sng_jieying","label":"关于2003年冬令营提前结营的通知","meta":"2004-01-02"},{"page":"w_ar_sng_guoqing","label":"国庆期间办公室开放时间","meta":"2003-09-26"},{"page":"w_ar_sng_langsong","label":"朗诵班学员在市少儿朗诵比赛中获奖","meta":"2003-06-03"},{"page":"w_ar_sng_shuhua","label":"“六一”少儿书画展参观安排","meta":"2002-06-01"},{"page":"w_ar_sng_1999b","label":"千禧时间胶囊","meta":"2000-01-04"},{"page":"w_ar_sng_hanjia","label":"寒假兴趣班报名须知","meta":"2000-01-03"},{"page":"w_ar_sng_y2k","label":"本单位电脑顺利跨入2000年","meta":"2000-01-02"},{"page":"w_ar_sng_1999c","label":"计算机班学员为居民义务检查电脑","meta":"1999-11-29"},{"page":"w_ar_sng_kaike","label":"秋季计算机兴趣班开课","meta":"1999-10-19"},{"page":"w_ar_sng_1999","label":"千禧计算机兴趣班招生简章","meta":"1999-10-11"}]},{"id":"w_ar_sng_jianjie","url":"www.wcsng.gov.cn/jianjie.htm","title":"梧城少年宫 · 本单位简介","requires":"ch0","orig":{"skin":"sng","url":"www.wcsng.gov.cn/jianjie.htm","when":"2000-06-10"},"html":"\u003cdiv class=\"sng[[?ch2 & !ch3]] sng-gray[[/?]]\">\u003cdiv class=\"sng-top\">\u003cdiv class=\"sng-logo\">梧城少年宫\u003csmall>WUCHENG CHILDREN'S PALACE\u003c/small>\u003c/div>\u003ctime class=\"sng-date\">\u003c!--site-date-->\u003c/time>\u003c/div>\u003cdiv class=\"old-mq\">\u003cspan>\u003c!--site-banner-->\u003c/span>\u003c/div>\u003cdiv class=\"sng-main\">\u003cnav class=\"sng-nav\" aria-label=\"本站导航\">\u003cb>本站导航\u003c/b>\u003ca href=\"/\">■ 首页\u003c/a>\u003ca href=\"/jianjie.htm\" aria-current=\"page\">■ 本单位简介\u003c/a>\u003ca href=\"/xingqu/\">■ 兴趣小组\u003c/a>\u003ca href=\"/notice/\">■ 通知公告\u003c/a>\u003ca href=\"/huodong/\">■ 活动剪影\u003c/a>\u003ca href=\"/lianxi.htm\">■ 联系我们\u003c/a>\u003c/nav>\u003cdiv class=\"sng-art\">\u003cdiv class=\"sng-path\">您现在的位置：首页 &gt;&gt; 本单位简介\u003c/div>\u003ch1>本单位简介\u003c/h1>[[?ch2]]\u003cdiv class=\"sng-info\">梧桐路馆舍资料　2000年5月编\u003c/div>[[/?]]\u003cp>梧城少年宫创建于1956年，1984年迁至梧桐路20号，是市教育局直属的校外教育单位。\u003c/p>\u003csection class=\"sng-list\">\u003ch2>主楼各层用房\u003c/h2>\u003cdl class=\"sng-fields\">\u003cdt>一楼\u003c/dt>\u003cdd>办公室、礼堂、储藏室、锅炉房\u003c/dd>\u003cdt>二楼\u003c/dt>\u003cdd>值班室、天文组活动室、电子制作工作间\u003c/dd>\u003cdt>三楼\u003c/dt>\u003cdd>微机室、301教室、302教室\u003c/dd>\u003c/dl>\u003c/section>\u003cp>楼顶的天文观测台建于1988年。1997年春，本单位曾邀请市民登上观测台，观看海尔—波普彗星。\u003c/p>\u003cp>本单位现有专职教师十一名，开设天文、朗诵、书法、美术、舞蹈等兴趣小组，寒暑假举办冬令营、夏令营。\u003c/p>\u003cp>主任：冯振邦。\u003c/p>\u003c/div>\u003c/div>\u003cdiv class=\"sng-foot\">梧城少年宫\u003cbr>建议使用 IE 4.0 以上版本、800×600 分辨率浏览\u003c/div>\u003c/div>","list":[]},{"id":"w_ar_sng_xingqu","url":"www.wcsng.gov.cn/xingqu/","title":"梧城少年宫 · 兴趣小组","requires":"ch0","orig":{"skin":"sng","url":"www.wcsng.gov.cn/xingqu/","when":"2002-09-15"},"html":"\u003cdiv class=\"sng[[?ch2 & !ch3]] sng-gray[[/?]]\">\u003cdiv class=\"sng-top\">\u003cdiv class=\"sng-logo\">梧城少年宫\u003csmall>WUCHENG CHILDREN'S PALACE\u003c/small>\u003c/div>\u003ctime class=\"sng-date\">\u003c!--site-date-->\u003c/time>\u003c/div>\u003cdiv class=\"old-mq\">\u003cspan>\u003c!--site-banner-->\u003c/span>\u003c/div>\u003cdiv class=\"sng-main\">\u003cnav class=\"sng-nav\" aria-label=\"本站导航\">\u003cb>本站导航\u003c/b>\u003ca href=\"/\">■ 首页\u003c/a>\u003ca href=\"/jianjie.htm\">■ 本单位简介\u003c/a>\u003ca href=\"/xingqu/\" aria-current=\"page\">■ 兴趣小组\u003c/a>\u003ca href=\"/notice/\">■ 通知公告\u003c/a>\u003ca href=\"/huodong/\">■ 活动剪影\u003c/a>\u003ca href=\"/lianxi.htm\">■ 联系我们\u003c/a>\u003c/nav>\u003cdiv class=\"sng-art\">\u003cdiv class=\"sng-path\">您现在的位置：首页 &gt;&gt; 兴趣小组\u003c/div>\u003ch1>兴趣小组\u003c/h1>\u003cp>各兴趣小组由指导教师带班。[[?!ch2]]报名请到一楼办公室。[[/?]][[?ch2 & !ch3]]寒假报名暂停。[[/?]]\u003c/p>[[?ch2]]\u003cdiv class=\"sng-sub\">往期课表 · 2002年秋季\u003c/div>\u003ctable class=\"sng-tb\">\u003ctr>\u003cth>小组\u003c/th>\u003cth>活动时间\u003c/th>\u003cth>地点\u003c/th>\u003cth>说明\u003c/th>\u003c/tr>\u003ctr>\u003ctd>天文组\u003c/td>\u003ctd>周六 19:00—21:00\u003c/td>\u003ctd>二楼天文组活动室、楼顶天文台\u003c/td>\u003ctd>指导：胡老师。晚间活动须提前到一楼办公室登记。现有组员十四人。\u003c/td>\u003c/tr>\u003ctr>\u003ctd>朗诵\u003c/td>\u003ctd>周日 9:00—11:00\u003c/td>\u003ctd>302教室\u003c/td>\u003ctd>小学三至六年级\u003c/td>\u003c/tr>\u003ctr>\u003ctd>书法\u003c/td>\u003ctd>周六 9:00—11:00\u003c/td>\u003ctd>301教室\u003c/td>\u003ctd>请自备笔墨\u003c/td>\u003c/tr>\u003ctr>\u003ctd>美术\u003c/td>\u003ctd>周日 14:00—16:00\u003c/td>\u003ctd>301教室\u003c/td>\u003ctd>素描、水彩\u003c/td>\u003c/tr>\u003ctr>\u003ctd>舞蹈\u003c/td>\u003ctd>周六 14:00—16:00\u003c/td>\u003ctd>一楼礼堂\u003c/td>\u003ctd>小学一至四年级\u003c/td>\u003c/tr>\u003ctr>\u003ctd>计算机\u003c/td>\u003ctd>—\u003c/td>\u003ctd>三楼微机室\u003c/td>\u003ctd>2000年4月起暂停开班。\u003c/td>\u003c/tr>\u003c/table>\u003cp>当期收费为每人每学期四十元，天文组另收器材费二十元。\u003c/p>[[/?]]\u003cdiv class=\"sng-sub\">小组资料\u003c/div>{{LIST}}\u003c/div>\u003c/div>\u003cdiv class=\"sng-foot\">梧城少年宫\u003cbr>建议使用 IE 4.0 以上版本、800×600 分辨率浏览\u003c/div>\u003c/div>","list":[{"page":"w_ar_sng_1999","label":"千禧计算机兴趣班招生简章","meta":"1999-10-11"}]},{"id":"w_ar_sng_tongzhi","url":"www.wcsng.gov.cn/notice/","title":"梧城少年宫 · 通知公告","requires":"ch0","orig":{"skin":"sng","url":"www.wcsng.gov.cn/notice/","when":"2004-03-20"},"html":"\u003cdiv class=\"sng[[?ch2 & !ch3]] sng-gray[[/?]]\">\u003cdiv class=\"sng-top\">\u003cdiv class=\"sng-logo\">梧城少年宫\u003csmall>WUCHENG CHILDREN'S PALACE\u003c/small>\u003c/div>\u003ctime class=\"sng-date\">\u003c!--site-date-->\u003c/time>\u003c/div>\u003cdiv class=\"old-mq\">\u003cspan>\u003c!--site-banner-->\u003c/span>\u003c/div>\u003cdiv class=\"sng-main\">\u003cnav class=\"sng-nav\" aria-label=\"本站导航\">\u003cb>本站导航\u003c/b>\u003ca href=\"/\">■ 首页\u003c/a>\u003ca href=\"/jianjie.htm\">■ 本单位简介\u003c/a>\u003ca href=\"/xingqu/\">■ 兴趣小组\u003c/a>\u003ca href=\"/notice/\" aria-current=\"page\">■ 通知公告\u003c/a>\u003ca href=\"/huodong/\">■ 活动剪影\u003c/a>\u003ca href=\"/lianxi.htm\">■ 联系我们\u003c/a>\u003c/nav>\u003cdiv class=\"sng-art\">\u003cdiv class=\"sng-path\">您现在的位置：首页 &gt;&gt; 通知公告\u003c/div>\u003ch1>通知公告\u003c/h1>{{LIST}}\u003c/div>\u003c/div>\u003cdiv class=\"sng-foot\">梧城少年宫\u003cbr>建议使用 IE 4.0 以上版本、800×600 分辨率浏览\u003c/div>\u003c/div>","list":[{"h":"2004年"},{"page":"w_ar_sng_daonian","label":"沉痛悼念遇难学员赵小川同学","meta":"2004-01-04"},{"page":"w_ar_sng_2004a","label":"关于元旦凌晨火灾的情况通报","meta":"2004-01-03"},{"page":"w_ar_sng_zanting","label":"寒假兴趣班暂停报名","meta":"2004-01-03"},{"page":"w_ar_sng_jieying","label":"关于2003年冬令营提前结营的通知","meta":"2004-01-02"},{"h":"2003年"},{"page":"w_ar_sng_guoqing","label":"国庆期间办公室开放时间","meta":"2003-09-26"},{"h":"2002年"},{"page":"w_ar_sng_shuhua","label":"“六一”少儿书画展参观安排","meta":"2002-06-01"},{"h":"2001年"},{"h":"2000年"},{"page":"w_ar_sng_hanjia","label":"寒假兴趣班报名须知","meta":"2000-01-03"},{"page":"w_ar_sng_y2k","label":"本单位电脑顺利跨入2000年","meta":"2000-01-02"},{"h":"1999年"},{"page":"w_ar_sng_1999","label":"千禧计算机兴趣班招生简章","meta":"1999-10-11"}]},{"id":"w_ar_sng_huodong","url":"www.wcsng.gov.cn/huodong/","title":"梧城少年宫 · 活动剪影","requires":"ch0","orig":{"skin":"sng","url":"www.wcsng.gov.cn/huodong/","when":"2003-01-05"},"html":"\u003cdiv class=\"sng[[?ch2 & !ch3]] sng-gray[[/?]]\">\u003cdiv class=\"sng-top\">\u003cdiv class=\"sng-logo\">梧城少年宫\u003csmall>WUCHENG CHILDREN'S PALACE\u003c/small>\u003c/div>\u003ctime class=\"sng-date\">\u003c!--site-date-->\u003c/time>\u003c/div>\u003cdiv class=\"old-mq\">\u003cspan>\u003c!--site-banner-->\u003c/span>\u003c/div>\u003cdiv class=\"sng-main\">\u003cnav class=\"sng-nav\" aria-label=\"本站导航\">\u003cb>本站导航\u003c/b>\u003ca href=\"/\">■ 首页\u003c/a>\u003ca href=\"/jianjie.htm\">■ 本单位简介\u003c/a>\u003ca href=\"/xingqu/\">■ 兴趣小组\u003c/a>\u003ca href=\"/notice/\">■ 通知公告\u003c/a>\u003ca href=\"/huodong/\" aria-current=\"page\">■ 活动剪影\u003c/a>\u003ca href=\"/lianxi.htm\">■ 联系我们\u003c/a>\u003c/nav>\u003cdiv class=\"sng-art\">\u003cdiv class=\"sng-path\">您现在的位置：首页 &gt;&gt; 活动剪影\u003c/div>\u003ch1>活动剪影\u003c/h1>\u003cp>学员活动、展览与天文观测记录。\u003c/p>{{LIST}}\u003c/div>\u003c/div>\u003cdiv class=\"sng-foot\">梧城少年宫\u003cbr>建议使用 IE 4.0 以上版本、800×600 分辨率浏览\u003c/div>\u003c/div>","list":[{"page":"w_ar_sng_langsong","label":"朗诵班学员在市少儿朗诵比赛中获奖","meta":"2003-06-03"},{"page":"w_ar_sng_shuhua","label":"“六一”少儿书画展参观安排","meta":"2002-06-01"},{"page":"w_ar_sng_1999b","label":"千禧时间胶囊","meta":"2000-01-04"},{"page":"w_ar_sng_1999c","label":"计算机班学员为居民义务检查电脑","meta":"1999-11-29"},{"page":"w_ar_sng_kaike","label":"秋季计算机兴趣班开课","meta":"1999-10-19"}]},{"id":"w_ar_sng_lianxi","url":"www.wcsng.gov.cn/lianxi.htm","title":"梧城少年宫 · 联系我们","requires":"ch0","orig":{"skin":"sng","url":"www.wcsng.gov.cn/lianxi.htm","when":"2000-06-10"},"html":"\u003cdiv class=\"sng[[?ch2 & !ch3]] sng-gray[[/?]]\">\u003cdiv class=\"sng-top\">\u003cdiv class=\"sng-logo\">梧城少年宫\u003csmall>WUCHENG CHILDREN'S PALACE\u003c/small>\u003c/div>\u003ctime class=\"sng-date\">\u003c!--site-date-->\u003c/time>\u003c/div>\u003cdiv class=\"old-mq\">\u003cspan>\u003c!--site-banner-->\u003c/span>\u003c/div>\u003cdiv class=\"sng-main\">\u003cnav class=\"sng-nav\" aria-label=\"本站导航\">\u003cb>本站导航\u003c/b>\u003ca href=\"/\">■ 首页\u003c/a>\u003ca href=\"/jianjie.htm\">■ 本单位简介\u003c/a>\u003ca href=\"/xingqu/\">■ 兴趣小组\u003c/a>\u003ca href=\"/notice/\">■ 通知公告\u003c/a>\u003ca href=\"/huodong/\">■ 活动剪影\u003c/a>\u003ca href=\"/lianxi.htm\" aria-current=\"page\">■ 联系我们\u003c/a>\u003c/nav>\u003cdiv class=\"sng-art\">\u003cdiv class=\"sng-path\">您现在的位置：首页 &gt;&gt; 联系我们\u003c/div>\u003ch1>联系我们\u003c/h1>[[?ch2 & !ch3]]\u003cp>梧桐路旧楼暂停接待来访，家长如需咨询，可致电少年宫办公室。\u003c/p>[[/?]]\u003cdl class=\"sng-list sng-fields\">[[?!ch2]]\u003cdt>地址\u003c/dt>\u003cdd>梧城市梧桐路20号\u003c/dd>\u003cdt>乘车\u003c/dt>\u003cdd>3路、11路公共汽车梧桐路站下车，往东步行五分钟\u003c/dd>\u003cdt>办公时间\u003c/dt>\u003cdd>周二至周日 8:30—17:30\u003c/dd>[[/?]]\u003cdt>电话\u003c/dt>\u003cdd>办公室 2216380　报名咨询 2216381\u003c/dd>\u003cdt>电子邮件\u003c/dt>\u003cdd>wcsng@public.wc169.net\u003c/dd>\u003c/dl>\u003cp>欢迎家长和同学来信来电，对本单位工作提出意见和建议。\u003c/p>\u003cdiv class=\"sng-sub\">来信\u003c/div>{{LIST}}\u003c/div>\u003c/div>\u003cdiv class=\"sng-foot\">梧城少年宫\u003cbr>建议使用 IE 4.0 以上版本、800×600 分辨率浏览\u003c/div>\u003c/div>","list":[{"page":"w_ar_sng_xinxiang","label":"主任信箱 · 来信办法","meta":"1999-11-15"}]},{"id":"w_school_review","url":"www.wcsy.edu.cn/news/review.htm","title":"梧城实验小学 · 期末复习与考试须知","requires":"ch0","publishedAt":"2026-12-15","html":"\u003ch1>期末复习与考试须知\u003c/h1>\u003cdiv class=\"meta\">教导处　2026-12-15\u003c/div>\u003cp>本周起各班进入期末复习。语文、数学复习用书由任课老师随堂发放，家长不必另行购买。\u003c/p>\u003cp>各年级具体考试时间由班主任书面通知。因病不能到校的同学，请家长按平时的方式提前向班主任请假。\u003c/p>\u003cp style=\"text-align:right\">梧城实验小学教导处\u003cbr>2026年12月15日\u003c/p>\u003cp>\u003ca href=\"/\">返回校园首页\u003c/a>\u003c/p>"},{"id":"w_school_winter","url":"www.wcsy.edu.cn/news/winter.htm","title":"梧城实验小学 · 冬季作息时间调整","requires":"ch0","publishedAt":"2026-12-01","html":"\u003ch1>冬季作息时间调整\u003c/h1>\u003cdiv class=\"meta\">校办公室　2026-12-01\u003c/div>\u003cp>12月起执行冬季作息表，上午第一节课8时开始。各班到校时间由班主任通知，值日生无需提前到校。\u003c/p>\u003cp>请家长在校门两侧接送，保持校门通畅。遇雨雪天气，低年级各班由值周老师带队进校。\u003c/p>\u003cp style=\"text-align:right\">梧城实验小学校办公室\u003cbr>2026年12月1日\u003c/p>\u003cp>\u003ca href=\"/\">返回校园首页\u003c/a>\u003c/p>"},{"id":"w_quan_1204","url":"www.wuchengquan.cn/p/1204","title":"今晚塑料厂球馆打双打，还差个人","requires":"ch0","publishedAt":"2026-12-04 12:08","keywords":"羽毛球 双打 塑料厂 球馆","html":"\u003ch1>今晚塑料厂球馆打双打，还差个人\u003c/h1>\u003cdiv class=\"meta\">阿栋 · 2026-12-04 12:08\u003c/div>\u003cp>七点到九点，三号场，我们仨都下了班才过去。水平一般，能来回打几拍就成。拍子有多的，带鞋。\u003c/p>\u003cdiv class=\"cmt\">\u003cb>芹菜馅儿\u003c/b> \u003cspan class=\"meta\">12-04\u003c/span>\u003cbr>我七点半才下班，晚不晚？\u003c/div>\u003cdiv class=\"cmt\">\u003cb>阿栋\u003c/b> \u003cspan class=\"meta\">12-04\u003c/span>\u003cbr>来得及，到三号场找我们。\u003c/div>\u003cdiv class=\"cmt\">\u003cb>左手拍\u003c/b> \u003cspan class=\"meta\">12-04\u003c/span>\u003cbr>还差人吗？我七点就能到。\u003c/div>\u003cdiv class=\"cmt\">\u003cb>阿栋\u003c/b> \u003cspan class=\"meta\">12-04\u003c/span>\u003cbr>刚凑齐了。不过五个人也能打，轮着上，来吧。\u003c/div>\u003cdiv class=\"cmt\">\u003cb>左手拍\u003c/b> \u003cspan class=\"meta\">12-05\u003c/span>\u003cbr>昨晚有谁看见一个蓝拍套吗？我落在椅背上了。\u003c/div>"},{"id":"w_quan_1217","url":"www.wuchengquan.cn/p/1217","title":"城西电影院三排靠门那几个座，冬天慎选","requires":"ch0","publishedAt":"2026-12-17 21:54","keywords":"城西电影院 看电影 漏风","html":"\u003ch1>城西电影院三排靠门那几个座，冬天慎选\u003c/h1>\u003cdiv class=\"meta\">小羊不吃葱 · 2026-12-17 21:54\u003c/div>\u003cp>昨晚坐的就是三排靠门。门一开，冷风就直往裤腿里钻，看了两个钟头，脚都是冰的。\u003c/p>\u003cdiv class=\"cmt\">\u003cb>汽水瓶\u003c/b> \u003cspan class=\"meta\">12-17\u003c/span>\u003cbr>几号厅？我买了明晚的票。\u003c/div>\u003cdiv class=\"cmt\">\u003cb>小羊不吃葱\u003c/b> \u003cspan class=\"meta\">12-17\u003c/span>\u003cbr>二号厅。往里坐就没事了。\u003c/div>\u003cdiv class=\"cmt\">\u003cb>汽水瓶\u003c/b> \u003cspan class=\"meta\">12-17\u003c/span>\u003cbr>我买的就是二号厅，四排靠过道……\u003c/div>\u003cdiv class=\"cmt\">\u003cb>汽水瓶\u003c/b> \u003cspan class=\"meta\">12-19\u003c/span>\u003cbr>去过了，四排还行，不怎么冷。\u003c/div>"},{"id":"w_quan_1213","url":"www.wuchengquan.cn/p/1213","title":"梧城今年第一场雪","requires":"ch0","keywords":"下雪 梧桐路 菜场 路滑","html":"\u003ch1>梧城今年第一场雪\u003c/h1>\u003cdiv class=\"meta\">老梧城 · 2026-12-13 07:50\u003c/div>\u003cp>早上一开窗，窗台上都积了一指厚了。你们那边也下了吗？\u003c/p>\u003cdiv class=\"cmt\">\u003cb>豆浆控\u003c/b> \u003cspan class=\"meta\">12-13\u003c/span>\u003cbr>菜场这边也白了。\u003c/div>\u003cdiv class=\"cmt\">\u003cb>梧桐路老街坊\u003c/b> \u003cspan class=\"meta\">12-13\u003c/span>\u003cbr>也下了。楼下已经有人扫过了。\u003c/div>\u003cdiv class=\"cmt\">\u003cb>小鹿乱撞\u003c/b> \u003cspan class=\"meta\">12-13\u003c/span>\u003cbr>好想回梧城看雪……\u003c/div>\u003cdiv class=\"cmt\">\u003cb>汽水瓶\u003c/b> \u003cspan class=\"meta\">12-13\u003c/span>\u003cbr>东湖那边中午就化得差不多了。\u003c/div>"}],"bbsMeta":{"name":"梧城热线","sub":"1999—2026 · 梧城旧网存档（只读）","host":"wcrx.jiuwang.org","homeNotice":"这里是梧城热线的存档，旧帖可以翻阅，发帖和回帖已经关闭。原站硬盘受损，有些楼层暂时缺失。——磊磊（旧网维护）","archiveRequires":"never_open_admin","recoveryChapters":true,"batchToast":"梧城旧网 · 热线又能翻到 {n} 个旧帖"},"bbsBoards":[{"id":"jiefang","name":"梧桐路街坊","desc":"家长里短、谁家孩子考上了、哪儿又拆了","mod":"laojiefang"},{"id":"xiaoyuan","name":"校园","desc":"一中、二中、七中的同学们","mod":"leilei"},{"id":"tianwen","name":"天文爱好者","desc":"约人看星星、聊望远镜","mod":"beidou"},{"id":"jishu","name":"电脑技术","desc":"装机、修机、千年虫","mod":"leilei"},{"id":"xunren","name":"寻人寻物","desc":"互相帮一把","mod":"laojiefang"}],"users":[{"id":"laojiefang","nick":"梧桐路老街坊","gender":"男","title":"版主","reg":"1999-08-02","lastLogin":"2012-06-30 21:10","posts":2310,"intro":"梧桐路住了四十年。","sig":"远亲不如近邻"},{"id":"leilei","nick":"磊磊","gender":"男","title":"站务 · 灌水大王","reg":"1999-07-15","lastLogin":"2012-06-30 23:59","posts":9876,"intro":"七中2000届。笑话管够。","sig":"今天你灌水了吗"},{"id":"beidou","nick":"北斗","gender":"男","title":"天文版主","reg":"1999-10-01","lastLogin":"2011-11-11 02:13","posts":803,"intro":"中学物理老师。","sig":"抬头看看"},{"id":"wangshu","nick":"铅笔","gender":"男","title":"会员","reg":"2000-02-14","lastLogin":"2003-12-31 18:51","posts":41,"intro":"七中。在做一台望远镜。","sig":"天晴就上去"},{"id":"liuhaoji","nick":"六号机","gender":"男","title":"会员","reg":"2005-11-02","lastLogin":"2009-12-30 23:41","posts":10,"intro":"修车的。","sig":""},{"id":"milemile","nick":"米老鼠","gender":"女","title":"会员","reg":"2001-06-01","lastLogin":"2012-06-30 21:52","posts":128,"intro":"天天开心^_^","sig":""},{"id":"doujiangkong","nick":"豆浆控","gender":"女","title":"会员","reg":"2003-06-01","lastLogin":"2025-01-01 07:40","posts":77,"intro":"住菜场边上。","sig":""},{"id":"xiaogang0312","nick":"王小刚","gender":"男","title":"会员","reg":"2010-01-08","lastLogin":"2012-01-08 19:30","posts":4,"intro":"替我姑发的。","sig":""},{"id":"qz_gaoer","nick":"七中高二（3）","gender":"男","title":"会员","reg":"2002-09-01","lastLogin":"2004-06-30 18:00","posts":56,"intro":"","sig":""},{"id":"donghu","nick":"东湖钓叟","gender":"男","title":"会员","reg":"2000-05-01","lastLogin":"2012-05-20 05:30","posts":412,"intro":"钓鱼。","sig":""},{"id":"gezi","nick":"鸽子飞了","gender":"男","title":"会员","reg":"1999-12-28","lastLogin":"2015-01-01 08:00","posts":233,"intro":"","sig":""},{"id":"qianxi","nick":"千禧网吧老板","gender":"男","title":"会员","reg":"1999-09-10","lastLogin":"2008-12-31 23:10","posts":188,"intro":"梧桐路千禧网吧。通宵五块。","sig":"有空来坐"},{"id":"chunlan","nick":"春兰","gender":"女","title":"会员","reg":"1999-11-01","lastLogin":"2012-06-30 22:15","posts":356,"intro":"梧桐路口小卖部。","sig":"烟酒糖茶 电池胶卷"},{"id":"tianwenzu","nick":"天文组小胖","gender":"男","title":"会员","reg":"2001-09-01","lastLogin":"2003-12-20 20:40","posts":64,"intro":"少年宫天文组。","sig":"仰望星空！"},{"id":"jiaozhang","nick":"东乡家长","gender":"男","title":"会员","reg":"2003-11-28","lastLogin":"2003-12-02 18:05","posts":2,"intro":"","sig":""},{"id":"duimianlou","nick":"对面楼四层","gender":"女","title":"会员","reg":"2003-01-15","lastLogin":"2006-06-30 21:00","posts":41,"intro":"住少年宫对面。","sig":""},{"id":"xiaodaoyan","nick":"一鸣惊人","gender":"男","title":"会员","reg":"2001-01-20","lastLogin":"2004-01-01 03:12","posts":312,"intro":"以后要拍电影！！","sig":""},{"id":"tingzhenqi","nick":"白露为霜","gender":"女","title":"会员","reg":"2002-03-05","lastLogin":"2004-01-05 23:30","posts":47,"intro":"想当医生。","sig":""},{"id":"zaodao","nick":"凡人","gender":"男","title":"会员","reg":"2001-03-01","lastLogin":"2003-12-31 17:31","posts":23,"intro":"","sig":""},{"id":"aying","nick":"阿莹","gender":"女","title":"会员","reg":"1999-09-18","lastLogin":"2010-09-24 20:40","posts":183,"intro":"在百货大楼上班。","sig":""},{"id":"cheling","nick":"车铃不响","gender":"男","title":"会员","reg":"1999-09-27","lastLogin":"2011-04-08 19:25","posts":207,"intro":"上下班都骑车。","sig":""},{"id":"mantou","nick":"馒头同学","gender":"女","title":"会员","reg":"1999-10-03","lastLogin":"2007-11-20 21:06","posts":92,"intro":"","sig":"有信请回帖"},{"id":"xiaozhou","nick":"小周","gender":"男","title":"会员","reg":"2001-04-15","lastLogin":"2011-07-10 18:00","posts":68,"intro":"","sig":""},{"id":"siyecao","nick":"四叶草","gender":"女","title":"会员","reg":"1999-09-28","lastLogin":"2007-07-06 18:55","posts":104,"intro":"","sig":""},{"id":"zaobanche","nick":"早班车","gender":"女","title":"会员","reg":"1999-11-20","lastLogin":"2011-05-09 19:20","posts":127,"intro":"家在南站边上。","sig":""}],"threads":[{"id":1502,"board":"jiefang","author":"laojiefang","date":"2000-01-01 01:12","title":"零点谁在少年宫楼顶晃手电？","requires":"ch1","posts":[{"author":"laojiefang","date":"2000-01-01 01:12","html":"零点放炮那会儿，谁在少年宫楼顶闪手电啊。七中楼上也亮了，一闪一闪的。"},{"author":"leilei","date":"2000-01-01 01:30","html":"三楼亮灯那间是我们机房，今晚站长在里头值班。"}]},{"id":2210,"board":"jiefang","author":"laojiefang","date":"2004-01-01 08:30","title":"少年宫半夜着火了！","requires":"ch2","onOpen":{"note":"n_t2210"},"posts":[{"author":"laojiefang","date":"2004-01-01 08:30","html":"零点刚过，我拉开窗帘，看见少年宫东头在冒烟，后来来了三辆消防车。早上买菜听说有个孩子没出来。有人知道那孩子怎么样了吗？"},{"author":"gezi","date":"2004-01-01 09:12","html":"我在家看见楼顶上有颗礼花弹横着飞出去了。孩子的事我也才听说。"},{"author":"donghu","date":"2004-01-02 18:40","html":"今晚报上说，放炮的孩子姓孟。"},{"author":"laojiefang","date":"2004-01-02 18:55","html":"该不会是孟大军家那个吧？昨儿有人在派出所门口看见他爸了。"},{"author":"doujiangkong","date":"2004-01-02 19:20","html":"报上就写了个姓。老街坊，你把他爸的名字删了吧，人还没认准呢。"},{"author":"gezi","date":"2004-01-10 18:30","html":"我外甥认得晚报上那个女老师，那晚我去接他的时候，他还光着脚。"},{"author":"donghu","date":"2004-01-10 19:02","html":"没出来的是赵记家的小川，就是常坐在摊子后头磨镜片的那个。今早他妈照常出摊了，我什么也没敢问。"}]},{"id":2215,"board":"xiaoyuan","author":"qz_gaoer","date":"2004-01-03 21:00","title":"送别七中高二赵小川","requires":"ch2","posts":[{"author":"qz_gaoer","date":"2004-01-03 21:00","html":"跨年夜少年宫着了火，我们班的赵小川没能出来。\u003cbr>班里想给他妈妈做本留言册。以前找他修过随身听的，要是想写点什么，就回在这儿，我一起抄上。"},{"author":"milemile","date":"2004-01-03 22:47","html":"小川，楼顶见。"},{"author":"qz_gaoer","date":"2004-01-04 08:10","html":"米老鼠，你那句我照原样抄上了。"}]},{"id":2560,"board":"jiefang","author":"doujiangkong","date":"2005-01-01 07:40","title":"老少年宫台阶上那只蓝边碗","requires":"ch2","onOpen":{"note":"n_t2560"},"posts":[{"author":"doujiangkong","date":"2005-01-01 07:40","html":"早上路过老少年宫，台阶上摆着一碗豆浆，碗口盖着张纸，都冻住了。是只蓝边碗，看着像是赵记的。赵记今天也没出摊。"},{"author":"laojiefang","date":"2005-01-01 09:00","html":"是小川他妈放的。那孩子去年这天没的。"},{"author":"doujiangkong","date":"2006-01-01 07:38","html":"今早那只碗又摆在那儿了。"},{"author":"gezi","date":"2007-01-01 08:20","html":"年年放，赵记老板娘魔怔了吧。"},{"author":"doujiangkong","date":"2007-01-01 08:45","html":"鸽子，人家放个碗，碍着你什么了。"},{"author":"doujiangkong","date":"2010-01-01 07:35","html":"今年碗上扣了个搪瓷盖子。我从楼北边那条巷子抄近道去菜场，看见北窗底下有一串鞋印。"},{"author":"gezi","date":"2015-01-01 08:00","html":"十一年了。"},{"author":"doujiangkong","date":"2025-01-01 07:40","html":"今早路过，还是那只蓝边碗。"}]},{"id":3104,"board":"xunren","author":"xiaogang0312","date":"2010-01-08 19:20","title":"寻人：孟凡，23岁，2009年12月31日晚离家","requires":"ch1","onOpen":{"set":["c1_dial"],"note":"n_t3104"},"posts":[{"author":"xiaogang0312","date":"2010-01-08 19:20","html":"麻烦街坊们帮我姑找找我表哥孟凡，就是在小王汽修干活的那个。\u003cbr>2009年12月31日晚上十点半，他去赵记早点提了一壶豆浆。再往后，家里就打听不到他的消息了。\u003cbr>派出所问过他的同学，说他可能是出门打工了。可他从没出过远门，我姑放心不下。\u003cbr>有消息请打我姑家座机：2356017。见过他的，麻烦告知一下时间地点。"},{"author":"gezi","date":"2010-01-08 19:40","html":"我转到同学群里了。"},{"author":"donghu","date":"2010-01-08 20:02","html":"是不是那个放火的孟家小子？"},{"author":"laojiefang","date":"2010-01-08 20:10","html":"东湖，这话你也说得出口？他妈还在这儿等消息呢。"},{"author":"milemile","date":"2010-01-09 01:14","html":"小刚，我打家里电话一直占线。麻烦你跟阿姨说一声，我今晚手机一直开着。"},{"author":"gezi","date":"2010-02-14 12:00","html":"还没找到吗？"},{"author":"xiaogang0312","date":"2011-01-08 19:20","html":"我姑新印了一摞启事，电话改成 139 0457 0312 了，她出门找人的时候也能接。哪家店能贴一张？我给送过去。"},{"author":"xiaogang0312","date":"2012-01-08 19:30","html":"再顶一下。电话还是启事上那个，没换。"},{"author":"doujiangkong","date":"2015-12-31 22:00","html":"小刚，启事上那个号还能打吗？我手里还有一张，想拿去贴。"}]},{"id":1109,"board":"tianwen","author":"beidou","date":"1999-10-04 20:15","title":"报个到，大家平时用什么看星星？","requires":"ch0","sticky":true,"posts":[{"author":"beidou","date":"1999-10-04 20:15","html":"新开了个版，来了的朋友都报个到吧。我平时就用一副双筒，再加一张活动星图。"},{"author":"cheling","date":"1999-10-04 20:49","html":"外行问一句。我拿儿子的双筒望远镜看路灯，一盏灯看成了两盏，是不是坏了？"},{"author":"beidou","date":"1999-10-04 21:12","html":"多半没坏，是眼距还没调好。两个镜筒中间是能掰的，掰到两个圆圈合成一个就行了。"},{"author":"cheling","date":"1999-10-05 19:23","html":"调好了，谢谢！"},{"author":"wangshu","date":"2000-02-19 20:36","html":"报个到。我在少年宫天文组，正在磨镜片，望远镜还没装好。"},{"author":"beidou","date":"2000-02-19 21:08","html":"欢迎！自己磨镜片可不容易，磨好了来跟大家说说。"},{"author":"wangshu","date":"2000-02-20 18:52","html":"好的。"}]},{"id":1112,"board":"xiaoyuan","author":"mantou","date":"1999-10-12 19:42","title":"急！号码布怎么缝","requires":"ch0","posts":[{"author":"mantou","date":"1999-10-12 19:42","html":"明天就运动会了，号码布还没缝，我妈今晚又加班。只缝四个角行吗？跑起来会不会掉啊？"},{"author":"siyecao","date":"1999-10-12 19:58","html":"我们是拿别针别的。"},{"author":"mantou","date":"1999-10-12 20:06","html":"我们班不让用别针。。"},{"author":"aying","date":"1999-10-12 20:18","html":"四个角各缝几针就够了。缝的时候把衣服撑开，别把前后两层缝到一块儿去了。"},{"author":"mantou","date":"1999-10-12 21:05","html":"已经缝到一块儿了……拆了重来"},{"author":"aying","date":"1999-10-12 21:17","html":"呵呵，慢慢来。"}]},{"id":1172,"board":"jishu","author":"cheling","date":"1999-11-08 20:13","title":"鼠标往左走不动了","requires":"ch0","posts":[{"author":"cheling","date":"1999-11-08 20:13","html":"鼠标往右推没问题，一往左推箭头就不动了，得在桌上蹭好几下。底下的球是干净的。"},{"author":"siyecao","date":"1999-11-08 20:39","html":"换个垫子试试？"},{"author":"cheling","date":"1999-11-08 21:04","html":"换过了，还是一样。"},{"author":"qianxi","date":"1999-11-08 22:27","html":"把球抠出来，看看里面那两根小滚轴，灰一般都粘在轴上，拿指甲刮一刮就好了。"},{"author":"cheling","date":"1999-11-09 19:48","html":"真好了！谢谢老板。"}]},{"id":1219,"board":"jiefang","author":"cheling","date":"1999-12-08 19:05","title":"机修厂家属院，煤钱交哪家？","requires":"ch2","forumChapter":2,"posts":[{"author":"cheling","date":"1999-12-08 19:05","html":"机修厂家属院二栋的街坊在吗？收煤钱的是哪一户啊？"},{"author":"aying","date":"1999-12-08 20:32","html":"二单元一楼西边那家。她家门铃坏了，你敲窗户就行。"},{"author":"zaobanche","date":"1999-12-08 20:51","html":"顺便问一下，礼拜天她还收不收？"},{"author":"cheling","date":"1999-12-09 19:37","html":"交过了。也帮你问了，礼拜天上午她在家。"},{"author":"zaobanche","date":"1999-12-09 20:05","html":"谢了。"}]},{"id":1572,"board":"jiefang","author":"aying","date":"2000-03-07 18:41","title":"谁的蓝袖套落我柜台上了","requires":"ch0","posts":[{"author":"aying","date":"2000-03-07 18:41","html":"百货大楼二楼毛线柜，右手的一只，蓝底白点，长到胳膊肘。我先收在抽屉里了。"},{"author":"chunlan","date":"2000-03-08 12:09","html":"我姐昨天去买过毛线，我回去问问。"},{"author":"chunlan","date":"2000-03-09 09:34","html":"问过了，不是她的。"}]},{"id":1663,"board":"xiaoyuan","author":"mantou","date":"2000-09-26 18:36","title":"孔令辉拿冠军以后，学校球台天天排队","requires":"ch1","forumChapter":1,"posts":[{"author":"mantou","date":"2000-09-26 18:36","html":"课间去打乒乓球，好不容易排到我，刚发个球就打铃了。"},{"author":"siyecao","date":"2000-09-26 19:08","html":"我们那儿是输一分就下。"},{"author":"mantou","date":"2000-09-26 19:24","html":"我们是输三个球才下，体育委员还老霸着台子。"},{"author":"gezi","date":"2000-09-26 20:05","html":"人多就打转转呗。两边各排一队，打一拍就跑到对面去排。"}]},{"id":2128,"board":"tianwen","author":"tianwenzu","date":"2003-10-15 18:32","title":"神舟五号今晚会从咱们这儿过吗？","requires":"ch2","forumChapter":2,"posts":[{"author":"tianwenzu","date":"2003-10-15 18:32","html":"杨利伟还在天上呢。今晚在梧城能看见飞船吗？该往哪边看？"},{"author":"beidou","date":"2003-10-15 18:51","html":"我也没查到梧城的过境时间。"},{"author":"zaodao","date":"2003-10-15 19:16","html":"我家楼下好多人都搬马扎出来看了。"},{"author":"wangshu","date":"2003-10-15 19:31","html":"先用肉眼找找天上有没有会动的亮点。望远镜能看见的地方太小了。"},{"author":"tianwenzu","date":"2003-10-16 12:21","html":"看了半天，还是没找着。。"}]},{"id":1001,"board":"jiefang","author":"laojiefang","date":"1999-08-02 20:00","title":"梧城热线开站啦！","requires":"ch0","posts":[{"author":"laojiefang","date":"1999-08-02 20:00","html":"梧桐路的街坊们，以后有事就来这儿说。谁家丢了东西、哪儿修路过不去，都能来问。"},{"author":"leilei","date":"1999-08-02 20:05","html":"沙发！！"},{"author":"laojiefang","date":"1999-08-02 20:30","html":"沙发是什么意思？"},{"author":"leilei","date":"1999-08-02 20:31","html":"就是第一个回帖的意思 ^_^"}]},{"id":1105,"board":"jiefang","author":"laojiefang","date":"1999-10-01 21:00","title":"国庆五十周年，梧桐路挂灯笼了","requires":"ch1","posts":[{"author":"laojiefang","date":"1999-10-01 21:00","html":"梧桐路的红灯笼从路口一直挂到少年宫，晚上出来看的人可真多。"},{"author":"beidou","date":"1999-10-01 21:40","html":"刚注册。明晚灯还亮吗？今天人太多了，没挤进去。"},{"author":"leilei","date":"1999-10-01 22:10","html":"听说要亮到7号。"}],"forumChapter":1},{"id":1180,"board":"tianwen","author":"beidou","date":"1999-11-07 19:30","title":"梧城今年第一场雪","requires":"ch1","posts":[{"author":"beidou","date":"1999-11-07 19:30","html":"雪停了以后天晴了一会儿，东边的木星特别亮，土星就在它边上。"},{"author":"leilei","date":"1999-11-07 20:15","html":"我趴窗户上看了半天，只看见了我自己。"},{"author":"chunlan","date":"1999-11-07 20:40","html":"我在店门口看见一颗亮的，等我再出去，已经让云挡上了。"},{"author":"beidou","date":"1999-11-07 20:49","html":"磊磊，你把屋里的灯关了再看。"}],"forumChapter":1},{"id":1002,"board":"jiefang","author":"leilei","date":"1999-08-02 21:00","title":"发帖之前看一眼","requires":"ch0","sticky":true,"posts":[{"author":"leilei","date":"1999-08-02 21:00","html":"热线开张了，几条规矩先说在前头：\u003cbr>1. 不许骂人，不许揭人家的短\u003cbr>2. 寻人寻物的，找着了回来回个帖\u003cbr>3. 卖东西的，标题前面加【出售】\u003cbr>4. 每天至少灌一帖（这条不强求 ^_^）\u003cbr>\u003cbr>有事发站内信给leilei。"},{"author":"laojiefang","date":"1999-08-02 21:20","html":"第四条也算规矩？"},{"author":"leilei","date":"1999-08-02 21:22","html":"算！灌水有益健康 ^_^"}]},{"id":1110,"board":"jishu","author":"leilei","date":"1999-10-10 20:30","title":"【笑话】我爸学电脑","requires":"ch1","posts":[{"author":"leilei","date":"1999-10-10 20:30","html":"家里刚买了电脑，我爸非要学。\u003cbr>\u003cbr>第一天，他听说电脑有辐射，让我妈给显示器织了个毛线罩子。\u003cbr>第二天，他说键盘上的字母乱七八糟，A和B都不挨着，要拿回店里换个排好的。\u003cbr>第三天，他学会了关机。现在每天晚上九点，准时把我关机。"},{"author":"aying","date":"1999-10-10 20:52","html":"罩子是什么颜色的？我们柜台刚到了一批毛线。"},{"author":"leilei","date":"1999-10-10 20:55","html":"大红的。我妈说喜庆。"},{"author":"cheling","date":"1999-10-10 21:10","html":"你爸知道你在网上这么说他吗"},{"author":"leilei","date":"1999-10-10 21:11","html":"他不会上网 ^_^"},{"author":"laojiefang","date":"1999-10-11 08:30","html":"九点关机挺好。你明年该高考了吧？"}],"forumChapter":1},{"id":1215,"board":"jiefang","author":"qianxi","date":"1999-12-05 15:00","title":"千禧网吧换新机器了！通宵还是五块！","requires":"ch1","posts":[{"author":"qianxi","date":"1999-12-05 15:00","html":"三十台机器全换成了奔腾三，能打《星际》。通宵还是五块，学生证打九折。"},{"author":"leilei","date":"1999-12-05 16:00","html":"老板，机器打千年虫补丁了吗？"},{"author":"qianxi","date":"1999-12-05 16:05","html":"打了打了，跨年夜照常营业！"},{"author":"laojiefang","date":"1999-12-05 18:00","html":"通宵的还给学生打折啊？"},{"author":"leilei","date":"1999-12-05 18:20","html":"老板，我妈要是来问，你就说没见过我 ^_^"},{"author":"qianxi","date":"1999-12-05 18:31","html":"你妈下午就来过了，在柜台上留了张你的照片。"}],"forumChapter":2},{"id":1200,"board":"jishu","author":"chunlan","date":"1999-12-10 10:20","title":"求助：电脑一开机就说“文件已损坏”","requires":"ch1","posts":[{"author":"chunlan","date":"1999-12-10 10:20","html":"我儿子装了个游戏，现在一开机就说文件已损坏，进不去了。有谁会弄吗？"},{"author":"leilei","date":"1999-12-10 12:30","html":"它说的是哪个文件？把那行字抄下来，周末我去看看。"},{"author":"chunlan","date":"1999-12-12 19:00","html":"修好了，谢谢那个小伙子。"}],"forumChapter":2},{"id":1240,"board":"jiefang","author":"laojiefang","date":"1999-12-19 21:00","title":"明天澳门回归，学校要搬电视进教室","requires":"ch1","posts":[{"author":"laojiefang","date":"1999-12-19 21:00","html":"孙子说明天早读要在教室看交接仪式的重播。我今晚就守着看直播了。"},{"author":"chunlan","date":"1999-12-19 21:30","html":"明天我店里开着电视，路过的进来看就是了。"},{"author":"aying","date":"1999-12-19 21:42","html":"春兰你几点开门？"},{"author":"chunlan","date":"1999-12-19 21:56","html":"六点半。"},{"author":"leilei","date":"1999-12-20 17:25","html":"我们看完还得唱《七子之歌》。"}],"forumChapter":2},{"id":1230,"board":"jishu","author":"leilei","date":"1999-12-20 21:00","title":"千年虫到底会不会让电脑罢工？","requires":"ch1","posts":[{"author":"leilei","date":"1999-12-20 21:00","html":"还有十一天。站长说老电脑过了零点会以为是1900年，真的假的？"},{"author":"beidou","date":"1999-12-20 21:40","html":"是真的。有些老程序年份只存后两位，到了00就会当成1900。"},{"author":"qianxi","date":"1999-12-20 22:15","html":"我那三十台都打过补丁了，放心来玩。"},{"author":"chunlan","date":"1999-12-21 12:30","html":"那我店里收钱的机子也要弄吗？"},{"author":"beidou","date":"1999-12-21 13:05","html":"是什么型号的？你先看看小票上的日期是怎么打的。"}],"forumChapter":2},{"id":1260,"board":"jiefang","author":"laojiefang","date":"1999-12-31 22:00","title":"千禧夜，大家都在哪儿？","requires":"ch1","posts":[{"author":"laojiefang","date":"1999-12-31 22:00","html":"还有俩钟头就两千年了，都在哪儿过呢？我还在家包饺子呢。"},{"author":"chunlan","date":"1999-12-31 22:31","html":"还在店里呢，刚要关门，又来人买烟花了。"},{"author":"leilei","date":"1999-12-31 23:50","html":"在网吧。我爸把家里电脑的插头拔了，说断了电就没事了。"},{"author":"qianxi","date":"2000-01-01 00:20","html":"网吧满座，三十台没有一台死机！"},{"author":"beidou","date":"2000-01-01 00:45","html":"我在东湖边过的零点。回来发现围巾落在湖边了。。"}],"forumChapter":2},{"id":3108,"board":"jiefang","author":"gezi","date":"2010-01-12 19:00","title":"菜场口孟凡那张寻人启事，还要再贴吗？","requires":"ch2","onOpen":{"note":"n_t3108"},"posts":[{"author":"gezi","date":"2010-01-12 19:00","html":"菜场门口那张启事掉了半截，我想重新贴一张。可又听人说，孟凡去南方打工了？小刚，家里接到电话没？"},{"author":"laojiefang","date":"2010-01-12 19:20","html":"小王汽修的人说，他师傅早几年就想带他去东莞，那边有亲戚。"},{"author":"doujiangkong","date":"2010-01-12 19:40","html":"早上碰见孟凡他妈了，她手里还拿着一沓新印的启事。墙上那块地方给她留着吧。"},{"author":"chunlan","date":"2010-01-12 20:10","html":"我柜台上也贴了一张，来买东西的都问我。他31号下午来我这儿买过电池，说晚上要用手电。"},{"author":"gezi","date":"2010-01-12 20:30","html":"行，那我去贴了。有消息的还是打启事上的电话。"}]},{"id":1190,"board":"jiefang","author":"laojiefang","date":"1999-11-28 20:00","title":"电脑里那颗扁电池，钟表摊上有卖吗？","requires":"ch1","onOpen":{"note":"n_t1190"},"posts":[{"author":"laojiefang","date":"1999-11-28 20:00","html":"我孙子的电脑一拔插头，下回开机时间就不对了。今天来了几个孩子帮着看了看，说是得换块扁电池。菜场门口修表的有卖吗？"},{"author":"leilei","date":"1999-11-28 20:40","html":"那种电池也分大小，您先别白跑。今天是我们站长带人去的，明天我帮您问问。"},{"author":"laojiefang","date":"2000-04-13 20:30","html":"磊磊，报上这个许某，是不是上回来我家的那个大孩子？你管他叫站长的。"},{"author":"qianxi","date":"2000-04-13 21:00","html":"七中那个“千年虫”就是他。晚报都登了。"},{"author":"wangshu","date":"2000-04-13 22:10","html":"他不是。"},{"author":"laojiefang","date":"2000-04-13 22:30","html":"你那天也来过我家？"},{"author":"wangshu","date":"2000-04-13 22:41","html":"给您看电池的。"}]}],"gxContacts":[],"notes":{"n_d1":{"text":"一鸣想在四十岁时把带子剪成电影《除虫小队》。"},"n_d2":{"text":"小川答应孟凡，望舒号做好了先给他看。"},"n_d3":{"text":"孟凡的手受伤了，白露给他涂了药。"},"n_d4":{"text":"孟凡在信里写：“四十岁我要有自己的家，门口不放酒瓶子了。”"},"n_d5":{"text":"米乐1999年：“一个都不能少！谁少了我就去他家把他拽出来！”"},"n_invite":{"text":"灰盘《邀请.txt》：十年了，12月31号礼拜四晚上十一点，老少年宫楼顶。没有落款。"},"n_del_letter":{"text":"灰盘上找回一封被删的信，开头“一鸣，白露，凡凡，米乐”，落款“川 03.12.31”。中间被覆盖了。"},"n_del_log":{"text":"灰盘上找回《望舒号.txt》前两天的日志：“六号机的钟又是1903年”。"},"n_xj_l1":{"text":"许嘉第一课：六号机不打补丁，留作“病号机”。过了零点它显示1900年，年份差一百。照这样算，2005年它会显示1905。"},"n_xj_names":{"text":"许嘉12月26日的名单上记着，兴趣班报名八人，到这时还来上课的是一鸣、白露、孟凡、小川、米乐。他还记了一句：孟凡手上老有伤，不让问。"},"n_xj_l3":{"text":"许嘉第三课（下雪天）：“先到的等一等，后到的慢慢来，路上滑，别跑。”米乐说要当队歌。"},"n_xj_photo":{"text":"许嘉给橱窗照片记了姓名：比V的是陈一鸣，穿灰绿外套、两手垂着的是孟凡，抱镜筒的是赵小川。"},"n_xj_last":{"text":"许嘉最后一课（2000-04-02）：小川先保管灰盘，下周日还给许嘉，等五个人到齐再开盒。"},"n_v1999":{"text":"录像是一鸣家的带子转录的。那晚中间换过人拿摄像机，胡老师也帮着拍了几段。"},"n_quan_post":{"text":"一鸣在12月1日的悬赏帖里说，胶囊从2004年起由一个伙伴保管，2009年底没了下落。他约大家12月31日看老少年宫的楼顶直播。"},"n_quan_found":{"text":"一鸣12月21日发帖说胶囊找到了，约网友31日晚看直播。"},"n_wb_fire":{"text":"1月2日晚报：17岁的赵某在二楼工作间门内被发现。三楼18名学员沿东梯撤到院内，点名时全都在场。少年宫怀疑火情与一名孟姓少年放的烟花有关，当时调查仍在进行。"},"n_wb_hero":{"text":"1月10日晚报报道李静获表彰，文中写道：“李静在二楼平台关紧了起火工作间的铁门，护送18名学员从门前安全通过。”这段话出自少年宫报送的事迹材料。"},"n_my_live":{"text":"鸣远影像的直播预告配了一张梧桐路旧楼的航拍，照片下标着拍摄日期：2026年12月10日。"},"n_radio_lj":{"text":"李静是七中2000届毕业生，读书时主持过校广播站的《点歌台》。2004年被评为“梧城见义勇为青年”，如今在梧城广播电台主持《梧城夜话》。"},"n_school_paper":{"text":"三（2）班班报第13期：12月18日（周五），米老师从文印室领回了印好的班报。通知写的是21日（周一）早读，由各组组长到讲台领报。"},"n_t2210":{"text":"街坊看见一颗礼花弹横着飞过去。晚报只提到放烟花的少年姓孟，有人在楼里问，是不是孟大军的儿子。街坊认得遇难的小川，是赵记老板娘的儿子。"},"n_t2560":{"text":"街坊认出台阶上那只蓝边碗，说是小川妈妈放的。2010年元旦早晨，豆浆控抄近路去菜场，看见少年宫北窗底下的雪地上有鞋印。"},"n_t3104":{"text":"王小刚在寻人帖里说，2009年12月31日晚十点半，孟凡从赵记早点提走一壶豆浆，此后家里没能联系上他。2011年小刚在回帖里更新了联系方式，现在由他姑姑接听，手机 139 0457 0312。"},"n_box":{"text":"匿名包裹：铁皮饼干盒，缠着电工胶布（有机油味），盒盖的纸签上写“给你们。等你们一起开。”填充物是撕碎的彩纸。"},"n_count":{"text":"清单写五张，盒里六张。多出来的是一张没贴标签的灰盘。"},"n_1909":{"text":"灰盘《邀请.txt》：六号机记录1909-12-20 21:14。"},"n_keeper":{"text":"盒底的白胶布：2004年3月起，孟凡代管胶囊。"},"n_xiaoliu":{"text":"1999录像21:41:20：桌边六个孩子，最小的扎羊角辫，有个男孩叫她“小六”。"},"n_2009":{"text":"《邀请.txt》写于2009年12月20日（礼拜天），约的是12月31日晚十一点，老少年宫楼顶。"},"n_writer":{"text":"孟凡在邀请里写的是“有话跟你们所”，和绿盘那封信犯的是同一个错。"},"n_back":{"text":"封盒录像里的声音：男孩1一鸣（那晚大半是他拍的），男孩2小川，男孩3孟凡（打不出“说”，小川教他加h），女孩1米乐（粉盘），女孩2白露（白盘）。"},"n_owner":{"text":"灰盘最早属于许嘉：隐藏压缩包作者 xujia，2000-04-02 17:30。压缩包注释：“楼顶那张合影还留着吧？”"},"n_since":{"text":"寻人帖：孟凡2009年12月31日晚十点半从赵记早点提走一壶豆浆，之后家里没能联系上他。"},"n_board1":{"text":"2000年，灰盘在许嘉手里。2009年，孟凡用它写了邀请。许嘉去世以后，这张盘是怎么到孟凡手里的？"},"n_undel":{"text":"灰盘上找回一封残信。收信人是一鸣、白露、凡凡、米乐，落款“川 03.12.31”。"},"n_owner2":{"text":"灰盘的第二个主人是赵小川。他2003年12月31日下午还在用它。"},"n_handoff":{"text":"许嘉2000年4月2日把灰盘交给小川，约好“下周日”还。"},"n_phrase":{"text":"许嘉的话：先到的等一等，后到的慢慢来，路上滑。"},"n_fire":{"text":"2004年元旦凌晨，赵小川在少年宫二楼工作间遇难。那晚三楼参加冬令营的十八个孩子都撤到了院里。"},"n_hero":{"text":"1月10日的表彰报道引用少年宫报送的事迹材料：朗诵教师李静组织冬令营的孩子撤离，18人全部平安。"},"n_photo":{"text":"1999楼顶合影从左到右：米乐、一鸣、孟凡、白露、小川。"},"n_last":{"text":"王小刚的寻人帖说，孟凡在2009年跨年夜从赵记提走了一壶豆浆。蓝边碗那帖里，街坊认出了放碗的人，是小川的妈妈。"},"n_board2":{"text":"灰盘：许嘉→小川→孟凡。许嘉和小川先后去世。孟凡从2009年跨年夜起失联。"},"n_t3108":{"text":"2010年1月，街坊间传说孟凡去南方打工了。春兰记得，孟凡12月31日下午去她店里买过电池，说晚上要用手电。"},"n_t1190":{"text":"1999年11月，七中的站长带几个孩子帮街坊看过电脑。次年4月，有人在同一帖里认出许嘉。网名“铅笔”的人也在场，他就是给老人看电池的孩子。"},"n_wb_991018":{"text":"1999年10月18日晚报：全市重点单位开始做跨年模拟测试，中小学电脑由市教育局信息中心统一检测。"},"n_wb_000413":{"text":"2000年4月13日晚报：报道写许某在4月4日夜里去世。警方当时认定三起学生死亡事件系许某所为，4月12日通报案件已结。"},"n_wb_031228":{"text":"2003年12月28日晚报：18名郊县小学生参加冬令营，在营期间统一食宿，计划于1月3日结营。"},"n_wb_261208":{"text":"2026年12月8日晚报：七中旧案重新侦查，许嘉的嫌疑已排除，另一名嫌疑人已归案。"},"n_ar_chuchong":{"text":"少年宫官网1999-11-29：计算机兴趣班在七中学生志愿者带领下上门，为街坊检查了七台电脑。"},"n_ar_tongbao":{"text":"1月3日，冯振邦签发的通报写道，李静组织学员沿东梯撤离，18个孩子点名时都在。少年宫当时怀疑火情与楼顶的烟花有关。"},"n_quan_1207":{"text":"七中旧案重查后，网吧老板在梧城圈向许嘉道歉。他还记得自己当年在热线回过一句“晚报都登了”。"},"n_quan_1222":{"text":"一鸣12月22日在梧城圈发帖，声称孟凡在2009年跨年以后去了南方。孟凡的表弟王小刚回：“要真去了南方，怎么十七年连个电话都没往家打？”"}},"collectibles":{"roof_portrait":{"asset":"roof-portrait","title":"五人楼顶合影","rect":[0,0,880,710],"image":"./trial-photo-ebee31ae183d80f5.png","parts":[{"flag":"solved_c2_photo"}]}}}));
/* 《千年虫2》重构版：图片由 src/story2/base.js 的 Q.photo() 按 photo-manifest.json 嵌入；没有生成的图片显示文字说明。 */



Y2K.boot();