const STORE_KEY='kito_workspace_v1';
const emptyData=()=>({tasks:[],decisions:[],notes:[]});
function loadData(){try{const saved=JSON.parse(localStorage.getItem(STORE_KEY)||'{}');return {...emptyData(),...saved,tasks:(saved.tasks||[]).map(t=>({priority:'Normal',due:'',...t}))}}catch(e){return emptyData()}}
let data=loadData();
const $=id=>document.getElementById(id);
const safe=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const stamp=()=>new Date().toLocaleDateString(undefined,{day:'numeric',month:'short',year:'numeric'});
function save(){localStorage.setItem(STORE_KEY,JSON.stringify(data));renderAll()}
function switchTab(name){document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('active',b.dataset.tab===name));document.querySelectorAll('.panel').forEach(p=>p.classList.toggle('active',p.id==='panel-'+name))}
document.querySelectorAll('.tab').forEach(b=>b.addEventListener('click',()=>switchTab(b.dataset.tab)));
document.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>switchTab(b.dataset.go)));
$('today-date').textContent=new Date().toLocaleDateString(undefined,{weekday:'short',day:'numeric',month:'short'});
$('task-form').addEventListener('submit',e=>{e.preventDefault();const title=$('task-input').value.trim();if(!title)return;data.tasks.unshift({id:Date.now(),title,done:false,priority:$('task-priority').value,due:$('task-due').value,created:stamp()});$('task-input').value='';$('task-due').value='';$('task-priority').value='Normal';save()});
$('decision-form').addEventListener('submit',e=>{e.preventDefault();const decision=$('decision-input').value.trim();if(!decision)return;data.decisions.unshift({id:Date.now(),decision,reason:$('reason-input').value.trim(),alternative:$('alternative-input').value.trim(),date:stamp()});e.target.reset();save()});
$('note-form').addEventListener('submit',e=>{e.preventDefault();const title=$('note-title').value.trim();if(!title)return;data.notes.unshift({id:Date.now(),title,body:$('note-body').value.trim(),date:stamp()});e.target.reset();save()});
$('memory-search').addEventListener('input',renderMemory);
$('task-search').addEventListener('input',renderTasks);
$('note-search').addEventListener('input',renderNotes);
$('clear-completed').addEventListener('click',()=>{data.tasks=data.tasks.filter(t=>!t.done);save()});
function toggleTask(id){const t=data.tasks.find(x=>x.id===id);if(t)t.done=!t.done;save()}
function removeItem(type,id){data[type]=data[type].filter(x=>x.id!==id);save()}
function taskCard(t){const due=t.due?new Date(t.due+'T00:00:00').toLocaleDateString(undefined,{day:'numeric',month:'short',year:'numeric'}):'No due date';return '<article class="item-card '+(t.done?'task-done':'')+'"><div class="task-row"><input class="task-check" type="checkbox" '+(t.done?'checked':'')+' aria-label="Mark task complete" onchange="toggleTask('+Number(t.id)+')"><div class="task-copy"><div class="item-title">'+safe(t.title)+'</div><div class="item-meta"><span class="priority priority-'+safe(t.priority||'Normal').toLowerCase()+'">'+safe(t.priority||'Normal')+'</span> · Due '+safe(due)+' · Added '+safe(t.created||'')+'</div></div></div><div class="item-actions"><button class="small-action danger" onclick="removeItem(\'tasks\','+Number(t.id)+')">Delete</button></div></article>'}
function decisionCard(d){return '<article class="item-card"><div class="item-title">'+safe(d.decision)+'</div><div class="item-meta">Saved '+safe(d.date)+'</div>'+(d.reason?'<p class="item-detail"><b>Why:</b> '+safe(d.reason)+'</p>':'')+(d.alternative?'<p class="item-detail"><b>Alternative:</b> '+safe(d.alternative)+'</p>':'')+'<div class="item-actions"><button class="small-action danger" onclick="removeItem(\'decisions\','+Number(d.id)+')">Delete</button></div></article>'}
function noteCard(n){return '<article class="item-card"><div class="item-title">'+safe(n.title)+'</div><div class="item-meta">'+safe(n.date)+'</div><p class="item-detail">'+safe(n.body||'No extra detail.')+'</p><div class="item-actions"><button class="small-action danger" onclick="removeItem(\'notes\','+Number(n.id)+')">Delete</button></div></article>'}
function renderTasks(){const q=$('task-search').value.toLowerCase();const found=data.tasks.filter(t=>t.title.toLowerCase().includes(q));$('task-list').innerHTML=found.map(taskCard).join('')||'<p class="empty-state">No matching tasks. Add something you want to move forward.</p>'}
function renderMemory(){const q=$('memory-search').value.toLowerCase();const found=data.decisions.filter(d=>(d.decision+' '+d.reason+' '+d.alternative).toLowerCase().includes(q));$('memory-list').innerHTML=found.map(decisionCard).join('')||'<p class="empty-state">No matching decisions yet. Save one above to build your decision memory.</p>'}
function renderNotes(){const q=$('note-search').value.toLowerCase();const found=data.notes.filter(n=>(n.title+' '+n.body).toLowerCase().includes(q));$('note-list').innerHTML=found.map(noteCard).join('')||'<p class="empty-state">No matching notes yet. Capture an idea while it is fresh.</p>'}
function renderAll(){
 const open=data.tasks.filter(t=>!t.done).length;
 $('task-count').textContent=open;$('decision-count').textContent=data.decisions.length;$('note-count').textContent=data.notes.length;
 $('task-summary').textContent=open+' open · '+(data.tasks.length-open)+' completed';
 renderTasks();
 $('brief-tasks').innerHTML=data.tasks.filter(t=>!t.done).slice(0,3).map(taskCard).join('')||'<p class="empty-state">No open tasks. Enjoy the breathing room.</p>';
 $('brief-decisions').innerHTML=data.decisions.slice(0,2).map(decisionCard).join('')||'<p class="empty-state">No decisions saved yet.</p>';
 renderMemory();renderNotes();
}
function backupWorkspace(){const blob=new Blob([JSON.stringify({app:'KITO',version:1,exportedAt:new Date().toISOString(),data},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='kito-backup-'+new Date().toISOString().slice(0,10)+'.json';document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url)}
$('backup-button').addEventListener('click',backupWorkspace);
$('backup-button-main').addEventListener('click',backupWorkspace);
$('restore-button').addEventListener('click',()=>$('restore-file').click());
$('restore-file').addEventListener('change',async e=>{const file=e.target.files[0];if(!file)return;try{const parsed=JSON.parse(await file.text());const restored=parsed.data||parsed;if(!Array.isArray(restored.tasks)||!Array.isArray(restored.decisions)||!Array.isArray(restored.notes))throw new Error('Invalid backup');if(!confirm('Restore this backup? It will replace the workspace currently on this device.'))return;data={tasks:restored.tasks,decisions:restored.decisions,notes:restored.notes};save();alert('KITO workspace restored.')}catch(err){alert('This backup file could not be read. Choose a KITO JSON backup.')}finally{e.target.value=''}});
renderAll();
