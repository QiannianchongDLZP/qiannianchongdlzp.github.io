(() => {
 'use strict';
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

bindTextInputs();
 const config=window.QNC2_LICENSE_CONFIG||{},base=config.apiBase||'';
 let identityPromise;
 async function api(path,body){
  const headers=body?{'Content-Type':'application/json','X-QNC2-Request':'1'}:{};
  if(config.publishableKey)headers.apikey=config.publishableKey;
  const token=sessionStorage.getItem('qnc2-session');if(token)headers['X-QNC2-Session']=token;
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),18000);
  try{const r=await fetch(base+path,{method:body?'POST':'GET',headers,body:body?JSON.stringify(body):undefined,credentials:base?'omit':'same-origin',cache:'no-store',signal:controller.signal});
   const data=await r.json();if(!r.ok){const e=Error(data.error||'验证失败，请稍后重试');e.status=r.status;throw e;}
   if(data.sessionToken)sessionStorage.setItem('qnc2-session',data.sessionToken);return data;
  }finally{clearTimeout(timer);}
 }
 async function loadIdentity(create){
  if(!window.isSecureContext||!crypto.subtle)throw Error('此浏览器需要通过本机地址或HTTPS打开，才能记住激活信息。');
  const db=await new Promise((resolve,reject)=>{const r=indexedDB.open('qnc2-browser-identity',1);r.onupgradeneeded=()=>r.result.createObjectStore('keys');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(Error('浏览器不允许保存激活信息，请退出无痕模式后重试。'));});
  const read=()=>new Promise((resolve,reject)=>{const r=db.transaction('keys').objectStore('keys').get('identity');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
  const existing=await read();if(existing||!create){db.close();return existing||null;}
  const pair=await crypto.subtle.generateKey({name:'ECDSA',namedCurve:'P-256'},false,['sign','verify']);
  // Generate outside the transaction, then recheck inside a serialized write so
  // two tabs opening together keep the same browser identity.
  const selected=await new Promise((resolve,reject)=>{const tx=db.transaction('keys','readwrite'),store=tx.objectStore('keys'),r=store.get('identity');let choice;r.onsuccess=()=>{choice=r.result||pair;if(!r.result)store.put(pair,'identity');};tx.oncomplete=()=>resolve(choice);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});db.close();return selected;
 }
 function identity(create){
  if(!create)return identityPromise||loadIdentity(false);
  return identityPromise||=loadIdentity(true).catch(error=>{identityPromise=null;throw error;});
 }
 async function hasActivation(){
  if(sessionStorage.getItem('qnc2-session'))return true;
  if(!window.indexedDB||!window.isSecureContext||!window.crypto?.subtle)return false;
  if(indexedDB.databases){
   try{if(!(await indexedDB.databases()).some(db=>db.name==='qnc2-browser-identity'))return false;}
   catch{ /* Some browsers expose the method but disallow enumeration. Read the store instead. */ }
  }
  return !!await identity(false);
 }
 async function prove(purpose,key){
  const pair=await identity(purpose==='activate');
  if(!pair){const error=Error('此浏览器尚未激活。');error.status=401;throw error;}
  const publicKey=await crypto.subtle.exportKey('jwk',pair.publicKey),c=await api('/api/challenge',{purpose,publicKey});const signature=await crypto.subtle.sign({name:'ECDSA',hash:'SHA-256'},pair.privateKey,new TextEncoder().encode(c.message));const encoded=btoa(String.fromCharCode(...new Uint8Array(signature))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');return api('/api/'+purpose,{id:c.id,signature:encoded,...(key?{key}:{})});
 }
 async function resume(){if(!await hasActivation())return false;const session=await api('/api/session');if(session.unlocked)return true;await prove('resume');return true;}
 window.QNC2License={api,prove,resume};
})();
