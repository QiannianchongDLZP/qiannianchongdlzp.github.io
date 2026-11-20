'use strict';
(async () => {
  const auth = window.QNC2License;
  const request = new URLSearchParams(location.search);
  const pendingFull = request.has('full');
  const continueOnLoad = request.get('full') === 'continue' || request.get('unlock') === 'continue';
  const resumeScreen = sessionStorageSafe('y2k2_screen:' + location.pathname);
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
  async function fetchPublic(url, resource) {
    const response = await fetch(url, {cache:'no-store', credentials:'omit'});
    if (!response.ok) throw Error(resource + '下载失败（HTTP ' + response.status + '）。');
    return response;
  }
  async function readPackage(release, url) {
    const response = await fetchPublic(url, '完整版游戏包');
    const bytes = new Uint8Array(await response.arrayBuffer());
    const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', bytes));
    const hex = Array.from(digest, n => n.toString(16).padStart(2, '0')).join('');
    if (hex !== release.sha256 || new TextDecoder().decode(bytes.subarray(0, 8)) !== 'QNC2ENC1')
      throw Error('完整版游戏包校验失败。');
    return bytes;
  }
  async function loadPackage() {
    let release = window.QNC2_GAME_PACKAGE;
    if (validRelease(release)) {
      try { return await readPackage(release, './' + release.file); }
      catch { /* A cached index can point to a retired package. Read the live index below. */ }
    }
    const refresh = '?v=' + Date.now();
    let issue;
    try {
      const response = await fetchPublic('./package-config.js' + refresh, '游戏包索引');
      const match = (await response.text()).trim().match(/^window\.QNC2_GAME_PACKAGE=(\{[^\n]+\});$/);
      const latest = match && JSON.parse(match[1]);
      if (!validRelease(latest)) throw Error('完整版游戏包索引有误。');
      release = latest;
      return await readPackage(release, './' + release.file + refresh);
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
  async function play() {
    const permission = await auth.api('/api/content-key');
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
      authorized = await auth.resume();
      if (authorized) { await play(); return; }
    } catch (error) {
      if (error.status === 401 || error.status === 403) authorized = false;
      else startupMessage = errorText(error);
    }
  }

  if (pendingFull) setRoute('unlock', continueOnLoad ? 'continue' : '1');
  const program = document.querySelector('#trial-program');
  const script = document.createElement('script');
  script.textContent = program.textContent;
  program.remove();
  document.body.append(script);
  if (request.has('unlock') || pendingFull) setRoute(null);
  mountAuthorNote();
})();
