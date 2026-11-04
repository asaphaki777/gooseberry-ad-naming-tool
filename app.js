const $ = id => document.getElementById(id);
const today = new Date();
const localDate = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
let batch = false, serial = 0, names = [];
function control(parent, key, title, options, value = '') {
  const label = document.createElement('label');
  label.textContent = title;
  const input = document.createElement(options ? 'select' : 'input');
  input.name = key; input.id = `field-${++serial}`;
  if (options) input.replaceChildren(new Option(`Choose ${title.toLowerCase()}`, ''), ...options.map(v => new Option(v,v)));
  else input.type = key === 'date' ? 'date' : key === 'version' ? 'number' : 'text';
  input.required = true;
  if (key === 'version') { input.min='1'; input.max='999999'; input.step='1'; }
  if (key === 'handle') { input.placeholder='@influencer'; input.maxLength=100; input.autocomplete='off'; }
  input.value = value; label.append(input); parent.append(label); return input;
}
function check(parent,key,title,checked=false) {
  const label=document.createElement('label'); label.className='check';
  const input=document.createElement('input'); input.type='checkbox'; input.name=key; input.checked=checked;
  label.append(input,document.createTextNode(title)); parent.append(label); return input;
}
const field = (root,key) => root.querySelector(`[name="${key}"]`);
function values(root) {
  return Object.fromEntries([...root.querySelectorAll('input,select')].map(el=>[el.name,el.type==='checkbox'?el.checked:el.value]));
}
function campaign(root,data={}) {
  control(root,'date','Date',null,data.date ?? localDate);
  control(root,'stage','Stage',STAGES,data.stage);
  control(root,'concept','Concept',CONCEPTS,data.concept);
  control(root,'quality','Quality',QUALITIES,data.quality);
}
function syncCard(card) {
  const mixed=field(card,'mixed').checked, set=field(card,'set').checked;
  field(card,'collection').disabled=mixed;
  field(card,'set').disabled=mixed;
  field(card,'product').disabled=mixed || set || !field(card,'collection').value;
  field(card,'handle').disabled=field(card,'noHandle').checked;
  card.querySelector('.product-note').textContent=mixed?'Product: Mixed Set':set?'Product: Set':'';
}
function renumber() {
  const cards=activeContainer().children;
  [...cards].forEach((card,i)=>{card.querySelector('h2').textContent=`Ad ${i+1}`; const remove=card.querySelector('.remove'); remove.hidden=cards.length===1; remove.setAttribute('aria-label',`Remove Ad ${i+1}`);});
}
function activeContainer() {return $(batch?'batch-entries':'single-entries');}
function addCard(container, data={}) {
  const card=document.createElement('section'); card.className='entry';
  const head=document.createElement('div'); head.className='entry-header';
  const title=document.createElement('h2');
  const remove=document.createElement('button'); remove.type='button'; remove.className='remove'; remove.textContent='Remove';
  remove.onclick=()=>{card.remove();renumber();invalidate();}; head.append(title,remove); card.append(head);
  const grid=document.createElement('div'); grid.className='grid'; card.append(grid);
  if(container.id==='single-entries') campaign(grid,data);
  const collection=control(grid,'collection','Collection',Object.keys(CATALOG).sort((a,b)=>a.localeCompare(b,'en')),data.collection);
  const product=control(grid,'product','Product',(CATALOG[data.collection] || []).slice().sort((a,b)=>a.localeCompare(b,'en')),data.product);
  const toggles=document.createElement('div'); toggles.className='toggles wide';
  check(toggles,'mixed','Mixed Collections',data.mixed); check(toggles,'set','Set',data.set); grid.append(toggles);
  const note=document.createElement('p'); note.className='product-note wide'; grid.append(note);
  control(grid,'handle','Influencer handle',null,data.handle);
  control(grid,'version','Version number',null,data.version ?? '1');
  const handleToggle=document.createElement('div'); handleToggle.className='wide'; check(handleToggle,'noHandle','No Handle',data.noHandle); grid.append(handleToggle);
  collection.addEventListener('change',()=>{product.replaceChildren(new Option('Choose product',''),...(CATALOG[collection.value]||[]).slice().sort((a,b)=>a.localeCompare(b,'en')).map(v=>new Option(v,v))); syncCard(card);});
  card.addEventListener('change',()=>syncCard(card)); container.append(card); syncCard(card); renumber(); return card;
}
function invalidate() {
  names=[]; $('results').replaceChildren(); $('copy-all').hidden=true; $('empty').hidden=false; $('status').replaceChildren(); $('error').textContent='';
}
function setMode() {
  batch=$('mode').getAttribute('aria-checked')!=='true';
  $('mode').setAttribute('aria-checked',String(batch)); $('single').hidden=batch; $('batch').hidden=!batch;
  // Inactive controls must not participate in native form validation.
  $('single').querySelectorAll('input,select').forEach(el=>el.disabled=batch);
  $('batch').querySelectorAll('input,select').forEach(el=>el.disabled=!batch);
  activeContainer().querySelectorAll('.entry').forEach(syncCard);
  renumber(); invalidate();
}
async function copy(text) {
  try { await navigator.clipboard.writeText(text); $('status').textContent='Copied.'; }
  catch { const area=document.createElement('textarea'); area.value=text; area.setAttribute('aria-label','Names to copy'); $('status').replaceChildren(document.createTextNode('Select and copy:'),area); area.focus(); area.select(); }
}
campaign($('constants'));
addCard($('single-entries')); addCard($('batch-entries'));
$('batch').querySelectorAll('input,select').forEach(el=>el.disabled=true);
$('mode').onclick=setMode;
$('add').onclick=()=>{ const container=activeContainer(); const card=addCard(container,values(container.lastElementChild)); invalidate(); card.querySelector('input:not(:disabled),select:not(:disabled)').focus(); };
$('form').addEventListener('input',invalidate);
$('form').addEventListener('change',invalidate);
$('form').onsubmit=event=>{
  event.preventDefault(); invalidate();
  const groups=[];
  for(const [i,card] of [...activeContainer().children].entries()) {
    try {groups.push(buildNames({...values(card),...(batch?values($('constants')):{})}));}
    catch(error) {$('error').textContent=`Ad ${i+1}: ${error.message}`; return;}
  }
  names=groups.flat();
  groups.forEach((group,i)=>{
    const section=document.createElement('section'); section.className='result-group';
    const heading=document.createElement('h3'); heading.textContent=`Ad ${i+1}`; section.append(heading);
    group.forEach((name,j)=>{
      const row=document.createElement('div'); row.className='result';
      const format=document.createElement('span'); format.className='format'; format.textContent=['4x5','1x1','9x16'][j];
      const code=document.createElement('code'); code.textContent=name;
      const button=document.createElement('button'); button.type='button'; button.textContent='Copy'; button.setAttribute('aria-label',`Copy Ad ${i+1} ${format.textContent}`); button.onclick=()=>copy(name);
      row.append(format,code,button); section.append(row);
    }); $('results').append(section);
  });
  $('empty').hidden=true; $('copy-all').hidden=false; $('status').textContent=`${names.length} names generated.`;
};
$('copy-all').onclick=()=>copy(names.join('\n'));
