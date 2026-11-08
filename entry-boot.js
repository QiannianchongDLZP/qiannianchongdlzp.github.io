(() => {
 'use strict';
 const payload=document.getElementById('qnc2-trial');
 if(!payload)return;
 const auth=window.QNC2License;
 const status=document.getElementById('decrypt-status'),actions=document.getElementById('entry-actions');
 let running=false,finished=false;
 function fail(message){
  finished=false;
  status.textContent=message;
  actions.hidden=false;
 }
 function showTrial(){
  if(finished)return;finished=true;
  actions.hidden=true;
  const script=document.createElement('script');
  if(payload.dataset.src){
   status.textContent='正在载入试玩…';
   script.src=payload.dataset.src;
   script.onload=()=>auth.install();
   script.onerror=()=>{script.remove();fail('试玩内容载入失败，请检查网络后重试。');};
   document.body.append(script);
  }else{
   // An older cached index carries the trial inline.
   script.textContent=payload.textContent;
   document.body.replaceChildren(script);
   auth.install();
  }
 }
 async function start(){
  if(running||finished)return;running=true;
  status.textContent='正在载入故事…';actions.hidden=true;
  try{
   // A stored identity selects the player. The content-key endpoint still authorizes each visit.
   if(!await (auth.hasActivation ? auth.hasActivation() : auth.resume())){showTrial();return;}
   finished=true;
   status.textContent='正在载入完整版…';
   const script=document.createElement('script');script.src='/decrypt-player.js?v=20261108-load1';
   script.onerror=()=>{script.remove();fail('暂时无法载入故事，请重试。');};
   document.body.append(script);
  }catch(e){
   if(e.status===401||e.status===403){showTrial();return;}
   status.textContent='暂时无法连接，请检查网络后重试。';actions.hidden=false;
  }finally{running=false;}
 }
 document.getElementById('entry-retry').onclick=start;
 document.getElementById('entry-trial').onclick=showTrial;
 window.addEventListener('qnc2-entry-error',event=>{
  finished=false;running=false;
  if(event.detail?.status===401||event.detail?.status===403)showTrial();
  else actions.hidden=false;
 });
 start();
})();
