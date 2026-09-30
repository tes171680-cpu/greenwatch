
const U=(window.APP_CONFIG||{}).SHEETS_API_URL;
document.getElementById('loginForm').addEventListener('submit',async e=>{
  e.preventDefault(); const key=document.getElementById('adminKey').value.trim(), err=document.getElementById('error'); err.textContent='';
  if(!U||U.includes('PASTE_')){err.textContent='Set URL Apps Script di js/config.js dulu.';return}
  try{
    const r=await fetch(U+'?'+new URLSearchParams({action:'admin_ping',admin_key:key}));
    const d=await r.json(); if(!d.ok)throw new Error(d.error||'Invalid key');
    sessionStorage.setItem('GW_ADMIN_KEY',key); location.href='admin.html';
  }catch(x){err.textContent=x.message||String(x)}
});
