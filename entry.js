'use strict';
(() => {
  const form = document.querySelector('#unlock');
  const field = document.querySelector('#license');
  const submit = document.querySelector('#submit');
  const status = document.querySelector('#status');
  const retry = document.querySelector('#retry');
  const auth = window.QNC2License;
  function askForCode(message = '') {
    form.hidden = false;
    submit.disabled = false;
    status.textContent = message;
  }
  function showFailure(error) {
    status.textContent = error instanceof TypeError || error.name === 'AbortError'
      ? '暂时无法连接激活服务，请检查网络后重试。' : error.message;
    retry.hidden = false;
  }
  async function play() {
    form.hidden = true;
    retry.hidden = true;
    status.textContent = '正在解锁游戏…';
    const release = window.QNC2_GAME_PACKAGE;
    if (!release || !/^full-game-[a-f0-9]{16}\.qnc$/.test(release.file)) throw Error('游戏包信息有误。');
    const permission = await auth.api('/api/content-key');
    if (permission.format !== 'QNC2ENC1') throw Error('激活服务返回了不匹配的游戏格式。');
    const response = await fetch('./' + release.file, {cache:'no-store'});
    if (!response.ok) throw Error('无法读取游戏包，请检查文件是否齐全。');
    const bytes = new Uint8Array(await response.arrayBuffer());
    const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', bytes));
    const hex = Array.from(digest, n => n.toString(16).padStart(2, '0')).join('');
    if (hex !== release.sha256 || new TextDecoder().decode(bytes.subarray(0, 8)) !== 'QNC2ENC1') throw Error('游戏包校验失败，请重新复制完整的加密版。');
    const raw = Uint8Array.from(atob(permission.key.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
    const key = await crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['decrypt']);
    raw.fill(0);
    permission.key = '';
    let plain;
    try {
      plain = await crypto.subtle.decrypt({name:'AES-GCM', iv:bytes.subarray(8,20), additionalData:bytes.subarray(0,8)}, key, bytes.subarray(20));
    } catch {
      throw Error('未能解密游戏，请核对游戏包版本。');
    }
    const html = new TextDecoder().decode(plain);
    document.open();
    document.write(html);
    document.close();
  }
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (submit.disabled) return;
    submit.disabled = true;
    retry.hidden = true;
    status.textContent = '正在验证激活码…';
    try {
      await auth.prove('activate', field.value.trim());
      field.value = '';
    } catch (error) {
      askForCode(error instanceof TypeError || error.name === 'AbortError' ? '暂时无法连接激活服务，请检查网络后重试。' : error.message);
      return;
    }
    try { await play(); } catch (error) { showFailure(error); }
  });
  retry.addEventListener('click', () => location.reload());
  async function start() {
    if (location.protocol === 'file:') {
      status.textContent = '请回到加密版文件夹，双击“启动游戏.cmd”。';
      return;
    }
    try {
      if (await auth.resume()) await play();
      else askForCode();
    } catch (error) {
      if (error.status === 401 || error.status === 403) askForCode(error.message);
      else showFailure(error);
    }
  }
  start();
})();
