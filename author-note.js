(() => {
  'use strict';
  const title = document.getElementById('title');
  if (!title) return;

  const style = document.createElement('style');
  style.textContent = `
    #author-note {
      box-sizing: border-box; width: min(38rem, calc(100% - 24px)); height: fit-content;
      max-height: calc(100vh - 32px); max-height: calc(100dvh - 32px);
      margin: auto; padding: 0; border: 1px solid #ad9b79; border-radius: 8px;
      background: #faf6ed; color: #342d25; box-shadow: 0 18px 70px #0006;
      font: 16px/1.85 system-ui, "Microsoft YaHei", sans-serif; text-align: left;
    }
    #author-note[open] { display: flex; flex-direction: column; overflow: hidden; }
    #author-note::backdrop { background: rgb(12 13 12 / 60%); }
    #author-note h2 {
      margin: 0; padding: 18px 28px 10px; border-bottom: 1px solid #ddd2bf;
      color: #352c22; font: 600 23px/1.45 "Songti SC", SimSun, serif;
    }
    #author-note .note-text {
      min-height: 0; padding: 4px 28px; overflow: auto; overscroll-behavior: contain;
      touch-action: pan-y; user-select: text; -webkit-user-select: text; overflow-wrap: anywhere;
    }
    #author-note p { margin: 0.8em 0; }
    #author-note .note-highlight { color: #ad4800; font-weight: 650; white-space: nowrap; }
    #author-note .note-signature { text-align: right; margin: 1em 0; }
    #author-note form { margin: 0; padding: 10px 28px; text-align: right; border-top: 1px solid #ddd2bf; }
    #author-note button {
      font: 600 15px/1.5 system-ui, sans-serif; color: #faf6ed; background: #514434;
      border: 1px solid #514434; border-radius: 4px; min-height: 42px; padding: 6px 22px; cursor: pointer;
    }
    #author-note :focus-visible { outline: 2px solid #9a500d; outline-offset: -2px; }
    #author-note h2:focus { outline: none; }
    @media(max-width: 540px) {
      #author-note h2 { padding: 12px 18px 8px; font-size: 21px; }
      #author-note .note-text { padding-inline: 18px; }
      #author-note form { padding: 8px 18px; }
    }
  `;
  document.head.append(style);

  const dialog = document.createElement('dialog');
  dialog.id = 'author-note';
  dialog.setAttribute('aria-labelledby', 'author-note-title');
  dialog.innerHTML = `
    <h2 id="author-note-title" tabindex="-1" autofocus>作者的话</h2>
    <div class="note-text" tabindex="0" role="region" aria-label="寄语正文">
      <p>谢谢大家喜欢《千年虫1》。一代里学校的那些事，大多是照着我自己初中、高中的经历写的。也有几件更早，是我小时候真碰到过的。写的时候只是想把记得的事写下来，没想到很多人玩着玩着，也想起了自己那时候的事。这让我挺开心的。如果你还没玩过一代，建议先去玩一下。认识了这几个人再来玩二代，会更有感觉。</p>
      <p>我是 1999 年出生的，所以千禧年对我来说有着特别的意义。今天 11 月 27 日是我的生日，二代就放在今天发，算是给自己留个纪念。这一部会收一点费用。做游戏占了我很多时间，后面也还想接着写下去。有一点收入，就能多留些时间给下一部，也算给自己一点继续做下去的动力。价格就照着生日，定成了11.27元。</p>
      <p>序章和第一章可以免费玩，先玩玩看，喜欢再买激活码就行。激活码在闲鱼搜“千年虫 2”，卖家是“鲨鱼 pku”，自动发货。一个码最多能在 5 个浏览器上激活。玩的时候请用普通窗口，别用无痕模式，不然窗口一关，激活和存档都留不住。</p>
      <p>玩完想找人聊聊的话，可以来 QQ 群：<span class="note-highlight">1130040971</span>。也可以关注我的<span class="note-highlight">小红书</span>、<span class="note-highlight">抖音</span>和<span class="note-highlight">b站</span>账号（搜千年虫就可以找到）。</p>
      <p>希望你们也喜欢第二部。</p>
      <p class="note-signature">Shark 于 北京大学 2026.11</p>
    </div>
    <form method="dialog"><button type="submit">关闭</button></form>`;
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
