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
    #author-note .note-highlight { color: #ffa34d; }
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
      <p>首先，非常感谢大家喜欢《千年虫1》。我是 1999 年出生的，千禧年对我来说一直有着特别的意义。这次带来的第二部，讲的是五个在少年宫一起上课的孩子的故事。选在 11 月 27 日发布，是因为这天刚好是我的生日，也算给自己留个纪念。</p>
      <p>这一部会收一点费用。做游戏确实挺花时间和精力，我以后还想接着做下去，能有一点收入，也多一份动力。价格就照着生日，定成了 <strong class="note-highlight">11.27 元</strong>。</p>
      <p>从序章到第三章都可以免费玩。大家先玩玩看，喜欢再买激活码就行。在闲鱼搜 <strong class="note-highlight">“千年虫 2”</strong>，卖家是 <strong class="note-highlight">“鲨鱼 pku”</strong>，下单后会自动发货。一个码最多能在 5 个浏览器上激活。玩的时候记得用普通窗口。要是用了无痕模式，窗口一关，激活记录和存档就都留不住了。</p>
      <p>我们也有一个玩家 QQ 群，群号是 <strong>1130040971</strong>。想关注我的话，在<strong>小红书</strong>、<strong>抖音</strong>和 <strong>B 站</strong>搜“千年虫”就能找到我。</p>
      <p>还想特别谢谢两位玩家，<strong class="note-highlight">北大的茴香白菜同学</strong>和 <strong class="note-highlight">LYB 同学</strong>。做第二部的这段时间，他们给我提了不少建议，帮了我很多忙。</p>
      <p>希望你们也喜欢第二部，游戏愉快！</p>
      <div class="note-signature">Shark 于 北京大学<time datetime="2026-11-27">2026.11.27</time></div>
    </div>`;
  document.body.append(dialog);

  const key = 'qnc2-author-note-dismissed';
  let read = false;
  try {
    if (performance.getEntriesByType('navigation')[0]?.type === 'reload') {
      read = sessionStorage.getItem(key) === '1';
    } else {
      sessionStorage.removeItem(key);
    }
  } catch {}
  const opener = document.createElement('button');
  opener.className = 'tbtn author-note-entry';
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
    try { sessionStorage.setItem(key, '1'); } catch {}
    opener.focus({ preventScroll: true });
  });
  function bindTitle() {
    const actions = title.querySelector('.title-actions');
    if (!actions) return;
    if (opener.parentNode !== actions) actions.append(opener);
    if (!read && !dialog.open && !title.classList.contains('panel-open')) openNote();
  }
  new MutationObserver(bindTitle).observe(title, { childList: true, attributes: true, attributeFilter: ['class'] });
  bindTitle();
})();
