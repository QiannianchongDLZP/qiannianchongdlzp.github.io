(async()=>{
 const status=document.querySelector('#decrypt-status'),bytes=s=>Uint8Array.from(atob(s.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));
 const download=new AbortController();
 async function permissionFor(auth){
  try{return await auth.api('/api/content-key');}
  catch(error){
   if(error.status!==401)throw error;
   if(auth.hasActivation){
    if(!await auth.hasActivation())throw error;
    await auth.prove('resume');
   }else if(!await auth.resume())throw error;
   return auth.api('/api/content-key');
  }
 }
 async function readPackage(file,cache){
  const response=await fetch('/'+file,{cache,signal:download.signal});
  if(!response.ok)throw Error('加密游戏文件读取失败，请稍后重试。');
  return new Uint8Array(await response.arrayBuffer());
 }
 async function checksum(data){
  const digest=await crypto.subtle.digest('SHA-256',data);
  return Array.from(new Uint8Array(digest),n=>n.toString(16).padStart(2,'0')).join('');
 }
 try{
  const release=window.QNC2_GAME_PACKAGE;
  if(release&&(!/^[0-9a-f]{64}$/.test(release.sha256)||release.file!=='full-game-'+release.sha256.slice(0,16)+'.qnc'))throw Error('游戏版本信息不正确，请刷新页面。');
  const file=release?.file||'full-game.qnc';
  const grant=permissionFor(window.QNC2License);
  // An unbound identity (for example after a mistyped activation code) must not trigger a full download.
  // With a saved session, overlap the ciphertext transfer with mandatory server authorization.
  const startDownload=()=>readPackage(file,release?'force-cache':'no-store');
  const [permission,initial]=await Promise.all([grant,
   sessionStorage.getItem('qnc2-session') ? startDownload() : grant.then(startDownload)]);
  let data=initial;
  const expected=release?.sha256||permission.sha256;
  if(await checksum(data)!==expected){
   if(!release)throw Error('游戏文件校验失败，请刷新后重试。');
   data=await readPackage(file,'reload');
   if(await checksum(data)!==expected)throw Error('游戏文件校验失败，请刷新后重试。');
  }
  if(new TextDecoder().decode(data.subarray(0,8))!=='QNC2ENC1'||permission.format!=='QNC2ENC1')throw Error('游戏文件格式不正确。');
  const key=await crypto.subtle.importKey('raw',bytes(permission.key),{name:'AES-GCM'},false,['decrypt']);permission.key='';
  let plain;try{plain=await crypto.subtle.decrypt({name:'AES-GCM',iv:data.subarray(8,20),additionalData:data.subarray(0,8),tagLength:128},key,data.subarray(20));}catch{throw Error('解密失败，密钥与游戏文件不匹配，或文件已被修改。');}
  status.textContent='正在进入故事…';
  const reveal='<style id="qnc2-reveal">html{background:#101113}body{visibility:hidden!important}html:after{content:"千年虫 2　·　正在载入故事…";position:fixed;inset:0;display:grid;place-items:center;background:#101113;color:#d9d3c6;font:18px/1.8 system-ui;letter-spacing:2px}</style>';
  const html=new TextDecoder().decode(plain).replace('<head>','<head>'+reveal).replace('src="/license-client.js"','src="/license-client.js?v=20261108-load1"');
  document.open();document.write(html);document.close();
 }catch(e){status.textContent=e.message||'无法解锁，请检查网络后重试。';document.getElementById('decrypt-return')?.removeAttribute('hidden');window.dispatchEvent(new CustomEvent('qnc2-entry-error',{detail:{status:e.status}}));}
 finally{download.abort();}
})();
