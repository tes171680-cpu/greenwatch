
const U=(window.APP_CONFIG||{}).SHEETS_API_URL;
const KEY=sessionStorage.getItem('GW_ADMIN_KEY');
if(!KEY) location.replace('admin-login.html');

let schema={}, currentTable='', currentRows=[], editing=null;
const list=document.getElementById('tableList'), thead=document.getElementById('thead'), tbody=document.getElementById('tbody');
const statusText=document.getElementById('statusText');

function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
async function get(params){const r=await fetch(U+'?'+new URLSearchParams({...params,admin_key:KEY}));const d=await r.json();if(!d.ok)throw new Error(d.error||'Request failed');return d}
async function post(data){const r=await fetch(U,{method:'POST',body:new URLSearchParams({...data,admin_key:KEY})});const d=await r.json();if(!d.ok)throw new Error(d.error||'Request failed');return d}

async function loadSchema(){
  try{
    statusText.textContent='Loading schema...';
    const d=await get({action:'admin_schema'}); schema=d.schema||{};
    list.innerHTML=Object.keys(schema).map(t=>`<button class="table-link" data-table="${esc(t)}">${esc(t)}</button>`).join('');
    list.querySelectorAll('.table-link').forEach(b=>b.onclick=()=>selectTable(b.dataset.table));
    statusText.textContent='Connected';
    const first=Object.keys(schema)[0]; if(first)selectTable(first);
  }catch(e){statusText.textContent=e.message}
}
async function selectTable(t){
  currentTable=t; editing=null;
  document.querySelectorAll('.table-link').forEach(b=>b.classList.toggle('active',b.dataset.table===t));
  document.getElementById('tableTitle').textContent=t;
  document.getElementById('statTable').textContent=t;
  await refresh();
}
async function refresh(){
  if(!currentTable)return;
  try{
    statusText.textContent='Loading '+currentTable+'...';
    const d=await get({action:'admin_list',table:currentTable});
    currentRows=d.records||[]; render(currentRows); statusText.textContent='Connected';
  }catch(e){statusText.textContent=e.message}
}
function render(rows){
  const cols=schema[currentTable]||[];
  document.getElementById('statRows').textContent=rows.length;
  document.getElementById('statCols').textContent=cols.length;
  thead.innerHTML='<tr>'+cols.map(c=>`<th>${esc(c)}</th>`).join('')+'<th>Actions</th></tr>';
  tbody.innerHTML=rows.length?rows.map((r,i)=>'<tr>'+cols.map(c=>`<td>${esc(r[c])}</td>`).join('')+
  `<td><div class="actions"><button class="btn secondary small" onclick="editRow(${i})">Edit</button><button class="btn danger small" onclick="deleteRow(${i})">Delete</button></div></td></tr>`).join('')
  :`<tr><td colspan="${cols.length+1}" class="muted">No records.</td></tr>`;
}
document.getElementById('search').addEventListener('input',e=>{
  const q=e.target.value.toLowerCase();render(currentRows.filter(r=>Object.values(r).some(v=>String(v).toLowerCase().includes(q))));
});
document.getElementById('refreshBtn').onclick=refresh;
document.getElementById('addBtn').onclick=()=>openModal();
document.getElementById('cancelModal').onclick=closeModal;
document.getElementById('recordModal').onclick=e=>{if(e.target.id==='recordModal')closeModal()};
document.getElementById('logoutBtn').onclick=()=>{sessionStorage.removeItem('GW_ADMIN_KEY');location.href='admin-login.html'};

function openModal(rowIndex=null){
  editing=rowIndex;
  const row=rowIndex===null?{}:currentRows[rowIndex];
  const cols=schema[currentTable]||[];
  document.getElementById('modalTitle').textContent=rowIndex===null?'Add record':'Edit record';
  document.getElementById('recordFields').innerHTML=cols.map(c=>{
    const isLong=['metadata_json','features_json','value','note','content'].includes(c);
    const val=row[c]??'';
    return `<div class="form-group"><label>${esc(c)}</label>${isLong?
      `<textarea name="${esc(c)}">${esc(val)}</textarea>`:
      `<input name="${esc(c)}" value="${esc(val)}" ${c==='id'&&rowIndex!==null?'readonly':''}>`
    }</div>`;
  }).join('');
  document.getElementById('recordModal').classList.add('show');
}
function closeModal(){document.getElementById('recordModal').classList.remove('show');editing=null}
window.editRow=i=>openModal(i);
window.deleteRow=async i=>{
  const row=currentRows[i], pk=(schema[currentTable]||[])[0];
  if(!confirm(`Delete ${currentTable} record ${row[pk]}?`))return;
  try{await post({action:'admin_delete',table:currentTable,pk_value:row[pk]});await refresh()}catch(e){alert(e.message)}
}
document.getElementById('recordForm').addEventListener('submit',async e=>{
  e.preventDefault();
  const obj=Object.fromEntries(new FormData(e.target).entries());
  try{
    if(editing===null){
      await post({action:'admin_insert',table:currentTable,record_json:JSON.stringify(obj)});
    }else{
      const pk=(schema[currentTable]||[])[0], old=currentRows[editing];
      await post({action:'admin_update',table:currentTable,pk_value:old[pk],record_json:JSON.stringify(obj)});
    }
    closeModal();await refresh();
  }catch(x){alert(x.message||String(x))}
});
loadSchema();

const cm=document.getElementById('customerModal');document.getElementById('createCustomerBtn')?.addEventListener('click',()=>cm.classList.add('show'));document.getElementById('cancelCustomer')?.addEventListener('click',()=>cm.classList.remove('show'));document.getElementById('customerForm')?.addEventListener('submit',async e=>{e.preventDefault();try{const f=Object.fromEntries(new FormData(e.target).entries());const d=await post({action:'admin_create_customer',...f});alert('Customer created: '+d.user_id);e.target.reset();cm.classList.remove('show');if(currentTable==='users')refresh()}catch(x){alert(x.message||String(x))}});