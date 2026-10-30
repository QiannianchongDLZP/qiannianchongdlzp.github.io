(() => {
 'use strict';
 const config=window.QNC2_LICENSE_CONFIG||{},base=config.apiBase||'',playPath=config.playPath||'/play';let modal,busy=false,identityPromise,installed=false;
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
 function identity(){return identityPromise||=(async()=>{
  if(!window.isSecureContext||!crypto.subtle)throw Error('此浏览器需要通过本机地址或HTTPS打开，才能记住激活信息。');
  const db=await new Promise((resolve,reject)=>{const r=indexedDB.open('qnc2-browser-identity',1);r.onupgradeneeded=()=>r.result.createObjectStore('keys');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(Error('浏览器不允许保存激活信息，请退出无痕模式后重试。'));});
  const read=()=>new Promise((resolve,reject)=>{const r=db.transaction('keys').objectStore('keys').get('identity');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
  const existing=await read();if(existing){db.close();return existing;}
  const pair=await crypto.subtle.generateKey({name:'ECDSA',namedCurve:'P-256'},false,['sign','verify']);
  // Generate outside the transaction, then recheck inside a serialized write so
  // two tabs opening together keep the same browser identity.
  const selected=await new Promise((resolve,reject)=>{const tx=db.transaction('keys','readwrite'),store=tx.objectStore('keys'),r=store.get('identity');let choice;r.onsuccess=()=>{choice=r.result||pair;if(!r.result)store.put(pair,'identity');};tx.oncomplete=()=>resolve(choice);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});db.close();return selected;
 })();}
 async function prove(purpose,key){const pair=await identity(),publicKey=await crypto.subtle.exportKey('jwk',pair.publicKey),c=await api('/api/challenge',{purpose,publicKey});const signature=await crypto.subtle.sign({name:'ECDSA',hash:'SHA-256'},pair.privateKey,new TextEncoder().encode(c.message));const encoded=btoa(String.fromCharCode(...new Uint8Array(signature))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');return api('/api/'+purpose,{id:c.id,signature:encoded,...(key?{key}:{})});}
 async function resume(){if(!sessionStorage.getItem('qnc2-session')&&indexedDB.databases){const dbs=await indexedDB.databases();if(!dbs.some(x=>x.name==='qnc2-browser-identity'))return false;}const session=await api('/api/session');if(session.unlocked)return true;await prove('resume');return true;}
 window.QNC2License={api,prove,resume,playPath,install};
 function open(complete=false){
  if(modal){modal.querySelector('input')?.focus();return;}
  const layer=document.createElement('div');layer.className='license-layer';layer.innerHTML='<form class="license-dialog" role="dialog" aria-modal="true" aria-labelledby="license-title"><button class="license-close" type="button" aria-label="关闭">×</button><h2 id="license-title"></h2><p>免费试玩包含序章和完整第一章。输入购买的密钥，即可继续后面的故事。</p><label for="license-key">解锁密钥</label><input id="license-key" autocomplete="off" spellcheck="false" placeholder="QNC2.…" required><p>每把密钥可绑定5个浏览器。同一浏览器再次打开不会重复占用名额。</p><button type="submit">解锁完整版</button><p class="license-status" role="status"></p></form>';
  layer.querySelector('h2').textContent=complete?'第一章已完成':'解锁完整故事';const previous=document.activeElement,close=()=>{if(busy)return;layer.remove();modal=null;previous?.focus();};layer.querySelector('.license-close').onclick=close;
  layer.addEventListener('keydown',e=>{if(e.key==='Escape')close();if(e.key==='Tab'){const els=[...layer.querySelectorAll('button,input')].filter(x=>!x.disabled),first=els[0],last=els.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});
  layer.querySelector('form').onsubmit=async e=>{e.preventDefault();if(busy)return;busy=true;const button=layer.querySelector('[type=submit]'),status=layer.querySelector('.license-status'),input=layer.querySelector('input');button.disabled=true;status.textContent='正在验证密钥…';try{await prove('activate',input.value);input.value='';status.textContent='解锁成功，正在继续故事…';location.replace(playPath);}catch(error){status.textContent=error.message;button.disabled=false;busy=false;}};
  document.body.append(layer);modal=layer;layer.querySelector('input').focus();
 }
 function install(){
 if(installed)return;installed=true;
 let completed=false;window.Y2KPaid={trialComplete(){if(!completed){completed=true;setTimeout(()=>open(true),0);}},open};
 if(window.Y2K_PAID_MODE==='full'){setTimeout(()=>{const resumeButton=document.querySelector('#title .menu .tbtn');if(resumeButton?.textContent==='继续调查'&&!resumeButton.disabled)resumeButton.click();document.getElementById('qnc2-reveal')?.remove();},0);return;}
 const mountEntry=()=>{const menu=document.querySelector('#title .menu');if(!menu||menu.querySelector('[data-license-entry]'))return;const button=document.createElement('button');button.className='tbtn';button.dataset.licenseEntry='1';button.textContent='解锁完整版';button.onclick=()=>open();menu.append(button);};
 mountEntry();const title=document.querySelector('#title');if(title)new MutationObserver(mountEntry).observe(title,{childList:true,subtree:true});
 if(location.search.includes('unlock=1'))open();
 }
 if(document.querySelector('#title'))install();
})();
