
const C=window.APP_CONFIG||{};
function toast(t,m){const x=document.getElementById('toast');if(!x)return;document.getElementById('toastTitle').textContent=t;document.getElementById('toastText').textContent=m;x.classList.add('show');setTimeout(()=>x.classList.remove('show'),3300)}
document.getElementById('sessionForm')?.addEventListener('submit',async e=>{
 e.preventDefault(); const u=C.SHEETS_API_URL;
 if(!u||u.includes('PASTE_')) return toast('Configuration needed','Set the Apps Script URL in js/config.js.');
 const phone=document.getElementById('country').value+document.getElementById('phone').value.replace(/\D/g,'');
 const b=new URLSearchParams({action:'create_session',phone,status:'Demo Active',plan:'Starter',consent:'YES'});
 try{const r=await fetch(u,{method:'POST',body:b});const d=await r.json();if(!d.ok)throw new Error(d.error||'Save failed');toast('Session created','Saved to Google Sheets with ID '+d.id);e.target.reset()}catch(err){toast('Could not save',err.message||String(err))}
});
