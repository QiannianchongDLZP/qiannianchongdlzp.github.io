(() => {
  'use strict';
  const title = document.getElementById('title');
  if (!title) return;

  const style = document.createElement('style');
  style.textContent = `
    #author-note {
      width: min(600px, calc(100% - 32px)); height: fit-content;
      max-height: calc(100vh - 32px); max-height: calc(100dvh - 32px);
      margin: auto;
    }
    #author-note:not([open]) { display: none; }
    #author-note::backdrop { background: rgba(0,0,0,.72); }
    #author-note .note-text {
      font-size: 15px; line-height: 1.9; overflow-wrap: anywhere;
      touch-action: pan-y; user-select: text; -webkit-user-select: text;
    }
    #author-note p { margin: 0 0 16px; }
    #author-note .note-highlight { color: var(--amber); }
    #author-note .note-signature { text-align: right; }
    #author-note time { display: block; color: #92959d; font-size: 13px; }
    #author-note form { margin: 0; }
  `;
  document.head.append(style);

  const dialog = document.createElement('dialog');
  dialog.id = 'author-note';
  dialog.className = 'panel title-panel';
  dialog.setAttribute('aria-labelledby', 'author-note-title');
  dialog.innerHTML = `
    <div class="title-panel-head">
      <h3 id="author-note-title" tabindex="-1" autofocus>作者的话</h3>
      <form method="dialog"><button type="submit" class="tbtn title-panel-close" aria-label="关闭" title="关闭">×</button></form>
    </div>
    <div class="title-panel-body note-text" tabindex="0" role="region" aria-label="寄语正文">
      <p>首先非常感谢大家对于《千年虫1》的喜爱。第一部里面的很多内容是照着我自己初高中的经历写的。写的时候只是想把记得的事写下来，没想到引起这么多玩家的共鸣，这让我挺开心的。如果你还没玩过第一部，那建议先去玩一下。</p>
      <p>我是 1999 年年末出生的，所以千禧年对我来说有着特别的意义。千禧年真是一个神奇的年代，让人觉得既陌生又熟悉。我相信这也是玩家喜欢这一部游戏的一个原因。今天发布第二部，选这个日子的原因是今天是我的生日，也算是给自己留个纪念。这一部会收一点费用。做游戏的确是耗时耗力的工作，我后面也还想接着做下去。有一点收入，也算给自己一点继续做下去的动力。价格就照着生日，定成了11.27元。</p>
      <p>序章和第一章可以免费玩，先玩玩看，喜欢再买激活码就行。激活码在闲鱼搜“千年虫 2”，卖家是“鲨鱼 pku”，自动发货。一个码最多能在 5 个浏览器上激活。玩的时候请用普通窗口，别用无痕模式，不然窗口一关，激活和存档都留不住。</p>
      <p>我们也有一个玩家QQ 群：<strong class="note-highlight">1130040971</strong>。也可以关注我的<strong class="note-highlight">小红书</strong>、<strong class="note-highlight">抖音</strong>和<strong class="note-highlight">b站</strong>账号（搜千年虫就可以找到）。</p>
      <p>希望你们也喜欢第二部，游戏愉快！</p>
      <div class="note-signature">Shark 于 北京大学<time datetime="2026-11-27">2026.11.27</time></div>
    </div>`;
  document.body.append(dialog);

  const key = 'qnc2-author-note-202611-read';
  let read = false;
  try { read = localStorage.getItem(key) === '1'; } catch {}
  const opener = document.createElement('button');
  opener.className = 'tbtn feedback-entry-button';
  opener.type = 'button';
  opener.textContent = '作者的话';
  opener.setAttribute('aria-haspopup', 'dialog');
  function openNote() {
    dialog.showModal();
    dialog.querySelector('.note-text').scrollTop = 0;
  }
  opener.addEventListener('click', openNote);
  dialog.addEventListener('close', () => {
    read = true;
    try { localStorage.setItem(key, '1'); } catch {}
    opener.focus({ preventScroll: true });
  });
  function bindTitle() {
    const actions = title.querySelector('.title-actions');
    if (!actions) return;
    actions.append(opener);
    if (!read && !dialog.open && !title.classList.contains('panel-open')) openNote();
  }
  new MutationObserver(bindTitle).observe(title, { childList: true });
  bindTitle();
})();
