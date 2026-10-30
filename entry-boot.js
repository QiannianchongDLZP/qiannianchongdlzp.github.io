(() => {
 'use strict';
 const payload=document.getElementById('qnc2-trial');
 if(!payload)return;
 const trial=payload.textContent,auth=window.QNC2License;
 let running=false,finished=false;
 function showTrial(){
  if(finished)return;finished=true;
  const script=document.createElement('script');script.textContent=trial;
  document.body.replaceChildren(script);
  auth.install();
 }
 async function start(){
  if(running||finished)return;running=true;
  const status=document.getElementById('decrypt-status'),actions=document.getElementById('entry-actions');
  status.textContent='正在载入故事…';actions.hidden=true;
  try{
   if(!await auth.resume()){showTrial();return;}
   finished=true;
   const script=document.createElement('script');script.src='/decrypt-player.js?v=20261030-entry2';
   script.onerror=()=>{finished=false;running=false;status.textContent='暂时无法载入故事，请重试。';actions.hidden=false;};
   document.body.append(script);
  }catch(e){
   if(e.status===401||e.status===403){showTrial();return;}
   status.textContent='暂时无法连接，请检查网络后重试。';actions.hidden=false;
  }finally{running=false;}
 }
 document.getElementById('entry-retry').onclick=start;
 document.getElementById('entry-trial').onclick=showTrial;
 window.addEventListener('qnc2-entry-error',()=>{finished=false;running=false;document.getElementById('entry-actions').hidden=false;});
 start();
})();
