const $ = id => document.getElementById(id);
const today = new Date();
const localDate = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
let serial = 0, names = [];
const locks = {};
const lockGroups = {date:["date"],stage:["stage","stageCustom"],concept:["concept","conceptCustom"],quality:["quality"],collection:["collection","mixed"],product:["product","set"],handle:["handle","noHandle"],version:["version"]};
function control(parent, key, title, options, value = '') {
  const label = document.createElement('label');
  label.textContent = title;
  const input = document.createElement(options ? 'select' : 'input');
  input.setAttribute('aria-label',title); input.name = key; input.id = `field-${++serial}`;
  if (options) input.replaceChildren(new Option(`Choose ${title.toLowerCase()}`, ''), ...options.map(v => new Option(v,v)));
  else input.type = key === 'date' ? 'date' : key === 'version' ? 'number' : 'text';
  input.required = true;
  if (key === 'version') { input.min='1'; input.max='999999'; input.step='1'; }
  if (key === 'handle') { input.placeholder='@creator'; input.maxLength=100; input.autocomplete='off'; }
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
  control(root,'stage','Stage',[...STAGES,'Custom'],data.stage);
  customControl(root,'stage',data.stageCustom);
  control(root,'concept','Concept',[...CONCEPTS,'Custom'],data.concept);
  customControl(root,'concept',data.conceptCustom);
  control(root,'quality','Quality',QUALITIES,data.quality);
}
function customControl(root,key,value='') {
  const label=field(root,key).parentElement;
  const extra=document.createElement('div'); extra.className='custom-label'; extra.textContent=`Custom ${key}`;
  const input=document.createElement('input'); input.type='text'; input.name=key+'Custom'; input.value=value; input.maxLength=80; input.required=true; input.placeholder=`Enter custom ${key}`; input.setAttribute('aria-label',`Custom ${key}`);
  extra.append(input); label.after(extra);
  // Keep the dropdown and its custom text together in the same grid cell.
  label.append(extra);
}
function syncCard(card) {
  card.querySelectorAll('input,select').forEach(el=>el.disabled=false);
  for(const key of ['stage','concept']) { const custom=field(card,key+'Custom'); custom.parentElement.hidden=field(card,key).value!=='Custom'; custom.disabled=custom.parentElement.hidden; }
  const mixed=field(card,'mixed').checked, set=field(card,'set').checked;
  field(card,'collection').disabled=mixed;
  field(card,'set').disabled=mixed;
  field(card,'product').disabled=mixed || set || !field(card,'collection').value;
  field(card,'handle').disabled=field(card,'noHandle').checked;
  card.querySelector('.mixed-note').hidden=!mixed;
  if(card.parentElement?.id==='batch-entries') {
    Object.keys(locks).forEach(key=>lockGroups[key].forEach(name=>field(card,name).disabled=true));
    card.querySelectorAll('.field-lock').forEach(button=>{const locked=!!locks[button.dataset.key]; button.textContent=locked?'Locked':'Lock'; button.setAttribute('aria-pressed',String(locked)); button.setAttribute('aria-label',`${locked?'Unlock':'Lock'} ${button.dataset.title}`);});
  }
}
function renumber() {
  const cards=activeContainer().children;
  [...cards].forEach((card,i)=>{card.querySelector('h2').textContent=`AD-${String(i+1).padStart(2,'0')}`; const remove=card.querySelector('.remove'); remove.hidden=cards.length===1; remove.setAttribute('aria-label',`Remove AD-${String(i+1).padStart(2,'0')}`);});
}
function activeContainer() {return $('batch-entries');}
function addCard(container, data={}) {
  const card=document.createElement('section'); card.className='entry';
  const head=document.createElement('div'); head.className='entry-header';
  const title=document.createElement('h2');
  const remove=document.createElement('button'); remove.type='button'; remove.className='remove'; remove.textContent='Remove';
  remove.onclick=()=>{card.remove();renumber();invalidate();}; head.append(title,remove); card.append(head);
  const grid=document.createElement('div'); grid.className='grid'; card.append(grid);
  campaign(grid,data);
  const collection=control(grid,'collection','Collection',Object.keys(CATALOG).sort((a,b)=>a.localeCompare(b,'en')),data.collection);
  const product=control(grid,'product','Product',(CATALOG[data.collection] || []).slice().sort((a,b)=>a.localeCompare(b,'en')),data.product);
  const collectionOptions=document.createElement('div'); collectionOptions.className='field-options';
  check(collectionOptions,'mixed','Mixed Collections',data.mixed);
  const mixedNote=document.createElement('span'); mixedNote.className='mixed-note'; mixedNote.textContent='Product automatically set to Mixed Set'; collectionOptions.append(mixedNote);
  const productOptions=document.createElement('div'); productOptions.className='field-options';
  check(productOptions,'set','Set',data.set);
  const setNote=document.createElement('span'); setNote.className='set-note'; setNote.textContent='Tick if multiple products from the same collection are featured'; productOptions.append(setNote);
  control(grid,'handle','Creator Handle',null,data.handle);
  control(grid,'version','Version number',null,data.version ?? '1');
  const handleToggle=document.createElement('div'); handleToggle.className='wide'; check(handleToggle,'noHandle','No Handle',data.noHandle); grid.append(handleToggle);
  collection.addEventListener('change',()=>{product.replaceChildren(new Option('Choose product',''),...(CATALOG[collection.value]||[]).slice().sort((a,b)=>a.localeCompare(b,'en')).map(v=>new Option(v,v))); syncCard(card);});
  card.addEventListener('change',()=>syncCard(card)); container.append(card);
  if(container.id==='batch-entries') addLocks(card);
  field(card,'date').closest('.lock-field').classList.add('wide');
  field(card,'quality').closest('.lock-field').classList.add('wide');
  for(const key of ['stage','concept']) {
    const hint=document.createElement('p'); hint.className='field-hint'; hint.id=`${field(card,key).id}-hint`;
    hint.textContent=`Select custom to input a different ${key}.`;
    field(card,key).setAttribute('aria-describedby',hint.id);
    field(card,key).closest('.lock-field').append(hint);
  }
  collection.closest('.lock-field').append(collectionOptions);
  product.closest('.lock-field').append(productOptions);
  syncCard(card); renumber(); return card;
}
function invalidate() {
  names=[]; $('output-heading').textContent='AD NAMES WILL SHOW UP HERE'; $('results').replaceChildren(); $('copy-all').hidden=true; $('empty').hidden=false; $('status').replaceChildren(); $('error').textContent='';
}
const copyTimers = new WeakMap();
async function copy(text, button) {
  try {
    await navigator.clipboard.writeText(text);
    $('status').textContent='Copied.';
    if(button) {
      clearTimeout(copyTimers.get(button));
      if(!button.dataset.originalText) button.dataset.originalText=button.textContent;
      button.textContent='Copied!'; button.classList.add('copied');
      copyTimers.set(button,setTimeout(()=>{
        button.textContent=button.dataset.originalText; button.classList.remove('copied'); copyTimers.delete(button);
      },2000));
    }
  }
  catch { const area=document.createElement('textarea'); area.value=text; area.setAttribute('aria-label','Names to copy'); $('status').replaceChildren(document.createTextNode('Select and copy:'),area); area.focus(); area.select(); }
}

addCard($('batch-entries'));
$('add').onclick=()=>{ const container=activeContainer(); const card=addCard(container,values(container.lastElementChild)); applyLocks(); invalidate(); (card.querySelector('input:not(:disabled),select:not(:disabled)') || card.querySelector('.field-lock')).focus(); };
$('form').addEventListener('input',invalidate);
$('form').addEventListener('change',invalidate);
$('form').onsubmit=event=>{
  event.preventDefault(); invalidate();
  const groups=[];
  for(const [i,card] of [...activeContainer().children].entries()) {
    try {groups.push(buildNames(values(card)));}
    catch(error) {$('error').textContent=`AD-${String(i+1).padStart(2,'0')}: ${error.message}`; return;}
  }
  names=groups.flat(); $('output-heading').textContent='AD NAMES';
  groups.forEach((group,i)=>{
    const section=document.createElement('section'); section.className='result-group';
    const heading=document.createElement('h3'); heading.textContent=`AD-${String(i+1).padStart(2,'0')}`; section.append(heading);
    group.forEach((name,j)=>{
      const row=document.createElement('div'); row.className='result';
      const format=document.createElement('span'); format.className='format'; format.textContent=['1x1','4x5','9x16'][j];
      const code=document.createElement('code'); code.textContent=name;
      const button=document.createElement('button'); button.type='button'; button.textContent='Copy'; button.setAttribute('aria-label',`Copy AD-${String(i+1).padStart(2,'0')} ${format.textContent}`); button.onclick=()=>copy(name,button);
      row.append(format,code,button); section.append(row);
    }); $('results').append(section);
  });
  $('empty').hidden=true; $('copy-all').hidden=false; $('status').textContent=`${names.length} names generated.`;
};
$('copy-all').onclick=()=>copy(names.join('\n'),$('copy-all'));


function addLocks(card) {
  for(const key of Object.keys(lockGroups)) {
    const input=field(card,key), label=input.parentElement;
    const title=label.firstChild.textContent;
    const wrapper=document.createElement('div'); wrapper.className='lock-field';
    label.replaceWith(wrapper); wrapper.append(label);
    const button=document.createElement('button'); button.type='button'; button.className='field-lock'; button.dataset.key=key; button.dataset.title=title;
    button.onclick=()=>toggleLock(card,key); wrapper.append(button);
  }
}
function applyLocks() {
  for(const card of $('batch-entries').children) {
    for(const key of Object.keys(lockGroups)) {
      if(!locks[key]) continue;
      for(const name of lockGroups[key]) {
        const input=field(card,name), value=locks[key][name];
        if(name==='product') {
          input.replaceChildren(new Option('Choose product',''),...(CATALOG[field(card,'collection').value]||[]).slice().sort((a,b)=>a.localeCompare(b,'en')).map(v=>new Option(v,v)));
        }
        if(input.type==='checkbox') input.checked=value; else input.value=value;
      }
    }
    // A newly shared collection must never retain a product from a different collection.
    const product=field(card,'product'), previous=product.value;
    product.replaceChildren(new Option('Choose product',''),...(CATALOG[field(card,'collection').value]||[]).slice().sort((a,b)=>a.localeCompare(b,'en')).map(v=>new Option(v,v)));
    product.value=previous;
    syncCard(card);
  }
}
function toggleLock(card,key) {
  invalidate();
  if(locks[key]) {
    delete locks[key];
    if(key==='collection') delete locks.product;
  } else {
    const current=values(card);
    const keys=key==='product'?['collection','product']:[key];
    for(const candidate of keys) {
      for(const name of lockGroups[candidate]) { const input=field(card,name); if(!input.disabled && !input.reportValidity()) return; }
    }
    for(const candidate of keys) locks[candidate]=Object.fromEntries(lockGroups[candidate].map(name=>[name,current[name]]));
  }
  applyLocks();
}
