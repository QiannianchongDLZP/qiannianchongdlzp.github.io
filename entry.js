'use strict';
(async () => {
  const auth = window.QNC2License;
  const request = new URLSearchParams(location.search);
  const pendingFull = request.has('full');
  const continueOnLoad = request.get('full') === 'continue' || request.get('unlock') === 'continue';
  const resumeScreen = sessionStorageSafe('y2k2_screen:' + location.pathname);
  const startup = document.getElementById('startup');
  let authorized = false;
  let startupMessage = '';

  function sessionStorageSafe(name) {
    try { return sessionStorage.getItem(name); } catch { return null; }
  }
  function errorText(error) {
    if (error instanceof TypeError || error.name === 'AbortError')
      return '暂时无法连接激活服务，请检查网络后重试。';
    return error.message || '暂时无法解锁，请重试。';
  }
  function setRoute(parameter, value) {
    const url = new URL(location.href);
    url.searchParams.delete('full');
    url.searchParams.delete('unlock');
    if (parameter) url.searchParams.set(parameter, value);
    history.replaceState(null, '', url);
  }
  function mountAuthorNote() {
    const script = document.createElement('script');
    script.src = './author-note.js';
    document.body.append(script);
  }
  function validRelease(release) {
    return typeof release?.sha256 === 'string' && /^[a-f0-9]{64}$/.test(release.sha256)
      && release.file === 'full-game-' + release.sha256.slice(0, 16) + '.qnc';
  }
  async function fetchPublic(url, resource, cache = 'no-cache') {
    const response = await fetch(url, {cache, credentials:'omit'});
    if (!response.ok) throw Error(resource + '下载失败（HTTP ' + response.status + '）。');
    return response;
  }
  async function verifiedBytes(response, release) {
    const bytes = new Uint8Array(await response.arrayBuffer());
    const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', bytes));
    const hex = Array.from(digest, n => n.toString(16).padStart(2, '0')).join('');
    if (hex !== release.sha256 || new TextDecoder().decode(bytes.subarray(0, 8)) !== 'QNC2ENC1')
      throw Error('完整版游戏包校验失败。');
    return bytes;
  }
  async function readPackage(release, url, networkCache = 'default') {
    // One slot per installation. Only verified ciphertext may be reused; the
    // server must still authorize and issue the key on every full-game start.
    const slot = new URL('./qnc2-cached-package', location.href).href;
    let cache;
    try {
      cache = await window.caches?.open('qnc2-encrypted-v1');
      const hit = await cache?.match(slot);
      if (hit?.headers.get('X-QNC2-Digest') === release.sha256) return await verifiedBytes(hit, release);
    } catch { networkCache = 'reload'; }
    const response = await fetchPublic(url, '完整版游戏包', networkCache);
    const bytes = await verifiedBytes(response, release);
    if (cache) {
      try {
        await cache.put(slot, new Response(bytes, {headers: {'X-QNC2-Digest': release.sha256}}));
      } catch { /* Storage may be full or disabled. The downloaded bytes are usable. */ }
    }
    return bytes;
  }
  async function readIndex(url) {
    const response = await fetchPublic(url, '游戏包索引');
    const match = (await response.text()).trim().match(/^window\.QNC2_GAME_PACKAGE=(\{[^\n]+\});$/);
    const release = match && JSON.parse(match[1]);
    if (!validRelease(release)) throw Error('完整版游戏包索引有误。');
    return release;
  }
  async function loadPackage() {
    let release = window.QNC2_GAME_PACKAGE;
    try {
      release = await readIndex('./package-config.js');
      return await readPackage(release, './' + release.file);
    } catch { /* Retry against a fresh index when a deployment or stale CDN entry intervenes. */ }
    const refresh = '?v=' + Date.now();
    let issue;
    try {
      release = await readIndex('./package-config.js' + refresh);
      return await readPackage(release, './' + release.file + refresh, 'reload');
    } catch (error) { issue = error; }
    // Pages and the public repository serve the same encrypted bytes.
    if (location.origin === 'https://qiannianchongdlzp.github.io' && validRelease(release)) {
      try {
        return await readPackage(release, 'https://raw.githubusercontent.com/QiannianchongDLZP/qiannianchongdlzp.github.io/main/' + release.file);
      } catch { /* Report the primary site's error. */ }
    }
    const reason = issue instanceof TypeError ? '完整版下载中断。' : issue.message;
    throw Error(reason + ' 激活仍然有效，请稍后点“重新载入完整版”。');
  }
  async function play(permission) {
    if (permission.format !== 'QNC2ENC1') throw Error('激活服务返回了不匹配的游戏格式。');
    const bytes = await loadPackage();
    const raw = Uint8Array.from(atob(permission.key.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
    const key = await crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['decrypt']);
    raw.fill(0);
    permission.key = '';
    const plain = await crypto.subtle.decrypt({name:'AES-GCM', iv:bytes.subarray(8,20), additionalData:bytes.subarray(0,8)}, key, bytes.subarray(20));
    const html = new TextDecoder().decode(plain);
    // The trial program has not run in this document, so the full game's
    // global declarations, clocks and listeners are installed just once.
    window.QNC2ResumeTrial = continueOnLoad || (resumeScreen === 'game'
      && performance.getEntriesByType('navigation')[0]?.type === 'reload');
    setRoute(null);
    document.open();
    document.write(html.replace(/<\/body>(?=<\/html>\s*$)/i, '<script src="./author-note.js"></script></body>'));
    document.close();
  }

  window.QNC2Unlock = {
    get authorized() { return authorized; },
    get message() { return startupMessage; },
    async activate(key, continueTrial) {
      if (location.protocol === 'file:')
        throw Error('请通过游戏网址打开，或双击加密版文件夹里的“启动游戏.cmd”，然后输入密钥。');
      try {
        if (!authorized) await auth.prove('activate', key);
        authorized = true;
      } catch (error) { throw Error(errorText(error)); }
      setRoute('full', continueTrial ? 'continue' : 'title');
      location.reload();
    }
  };
  if (location.protocol !== 'file:') {
    try {
      const permission = auth.contentPermission ? await auth.contentPermission() :
        (await auth.resume() ? await auth.api('/api/content-key') : null);
      if (permission) {
        authorized = true;
        if (startup) startup.querySelector('[role=status]').textContent = '正在载入完整版…';
        await play(permission); return;
      }
    } catch (error) {
      if (error.status === 401 || error.status === 403) authorized = false;
      else startupMessage = errorText(error);
    }
  }

  if (pendingFull) setRoute('unlock', continueOnLoad ? 'continue' : '1');
  const script = document.createElement('script');
  const onTrialReady = () => {
    if (request.has('unlock') || pendingFull) setRoute(null);
    mountAuthorNote();
  };
  if (startup) {
    script.src = startup.dataset.trial;
    script.onload = onTrialReady;
    script.onerror = () => {
      startup.querySelector('[role=status]').textContent = '游戏载入中断，请重试。';
      const retry = startup.querySelector('button');
      retry.hidden = false;
      retry.onclick = () => location.reload();
    };
    document.body.append(script);
  } else {
    // An older cached entry can still carry its own inline trial program.
    const program = document.querySelector('#trial-program');
    script.textContent = program.textContent;
    program.remove();
    document.body.append(script);
    onTrialReady();
  }
})();
