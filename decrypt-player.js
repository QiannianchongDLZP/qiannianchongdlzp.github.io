(async()=>{
 const status=document.querySelector('#decrypt-status'),bytes=s=>Uint8Array.from(atob(s.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));
 try{
  const auth=window.QNC2License;let permission;
  try{permission=await auth.api('/api/content-key');}catch(e){if(e.status!==401||!await auth.resume())throw e;permission=await auth.api('/api/content-key');}
  const r=await fetch('/full-game.qnc',{cache:'no-store'});if(!r.ok)throw Error('加密游戏文件读取失败，请稍后重试。');
  const data=new Uint8Array(await r.arrayBuffer());if(new TextDecoder().decode(data.slice(0,8))!=='QNC2ENC1'||permission.format!=='QNC2ENC1')throw Error('游戏文件格式不正确。');
  const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',data)),n=>n.toString(16).padStart(2,'0')).join('');if(digest!==permission.sha256)throw Error('游戏文件校验失败，请刷新后重试。');
  const key=await crypto.subtle.importKey('raw',bytes(permission.key),{name:'AES-GCM'},false,['decrypt']);permission.key='';
  let plain;try{plain=await crypto.subtle.decrypt({name:'AES-GCM',iv:data.slice(8,20),additionalData:data.slice(0,8),tagLength:128},key,data.slice(20));}catch{throw Error('解密失败，密钥与游戏文件不匹配，或文件已被修改。');}
  status.textContent='正在进入故事…';
  const reveal='<style id="qnc2-reveal">html{background:#101113}body{visibility:hidden!important}html:after{content:"千年虫 2　·　正在载入故事…";position:fixed;inset:0;display:grid;place-items:center;background:#101113;color:#d9d3c6;font:18px/1.8 system-ui;letter-spacing:2px}</style>';
  const html=new TextDecoder().decode(plain).replace('<head>','<head>'+reveal).replace('src="/license-client.js"','src="/license-client.js?v=20261030-entry2"');
  document.open();document.write(html);document.close();
 }catch(e){status.textContent=e.message||'无法解锁，请检查网络后重试。';document.getElementById('decrypt-return')?.removeAttribute('hidden');window.dispatchEvent(new Event('qnc2-entry-error'));}
})();
