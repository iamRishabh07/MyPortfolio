import {profile} from './profile.js';
import {commands, executeCommand} from './terminal.js';
import {escapeHTML, safeResumeUrl, resumePreviewUrl} from './security.js';

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
const storage = {
  get(key) {try {return localStorage.getItem(key)} catch {return null}},
  set(key, value) {try {localStorage.setItem(key, value)} catch {/* Storage may be unavailable. */}}
};
let toastTimer;
function toast(message) {
  $('#toast').textContent = message;
  $('#toast').classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 3200);
}
function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  storage.set('rs-theme', theme);
  $('#theme-toggle').setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`);
  $('meta[name="theme-color"]').content = theme === 'dark' ? '#080b12' : '#edf2f7';
}
function toggleTheme() {setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark')}
setTheme(storage.get('rs-theme') === 'light' ? 'light' : 'dark');
$('#theme-toggle').addEventListener('click', toggleTheme);
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
let motionOff = storage.get('rs-motion') === 'off' || reduceMotion.matches;
function setMotion() {
  document.documentElement.classList.toggle('motion-off', motionOff);
  $('#motion-toggle').textContent = `Motion: ${motionOff ? 'off' : 'on'}`;
  $('#motion-toggle').setAttribute('aria-pressed', String(motionOff));
  if(motionOff) $$('.reveal.pending').forEach(el => el.classList.remove('pending'));
}
setMotion();
$('#motion-toggle').addEventListener('click', () => {motionOff = !motionOff; storage.set('rs-motion', motionOff ? 'off' : 'on'); setMotion()});
reduceMotion.addEventListener('change', () => {motionOff = reduceMotion.matches || storage.get('rs-motion') === 'off'; setMotion()});
function clock() {
  const now = new Date();
  $('#local-clock').textContent = now.toLocaleTimeString('en-GB', {timeZone:'Asia/Kolkata',hour:'2-digit',minute:'2-digit'}) + ' IST';
  $('#year').textContent = now.getFullYear();
}
clock(); setInterval(clock, 60000);

// Public content from the supplied résumé. No simulated projects or live metrics.
const flows = {
  platform:'<span>gRPC</span><i></i><b>Go service</b><i></i><span>Vault</span>',
  argos:'<span>Java / SSE</span><i></i><b>Go middleware</b><i></i><span>React</span>',
  workflows:'<span>Kafka</span><i></i><b>Temporal</b><i></i><span>Provisioning</span>'
};
$('#project-tabs').innerHTML = profile.projects.map((project, index) => `<button class="project-tab" role="tab" id="project-tab-${index}" aria-controls="project-panel" aria-selected="${index === 0}" tabindex="${index === 0 ? 0 : -1}"><span>${escapeHTML(project.number)}</span><div><strong>${escapeHTML(project.shortName)}</strong><small>${escapeHTML(project.company.split(' / ')[0])}</small></div></button>`).join('');
function showProject(index, focus = false) {
  const tabs = $$('[role="tab"]', $('#project-tabs'));
  tabs.forEach((tab, i) => {tab.setAttribute('aria-selected', String(i === index)); tab.tabIndex = i === index ? 0 : -1});
  const project = profile.projects[index];
  const panel = $('#project-panel');
  panel.setAttribute('aria-labelledby', tabs[index].id);
  panel.innerHTML = `<div class="project-panel-content"><div class="project-topline"><span>${escapeHTML(project.company)}</span><span class="project-category">${escapeHTML(project.category)}</span></div><h3>${escapeHTML(project.name)}</h3><p class="project-description">${escapeHTML(project.description)}</p><div class="project-middle"><div class="project-metric"><strong>${escapeHTML(project.metric)}</strong><span>${escapeHTML(project.metricLabel)}</span></div><div class="project-flow" aria-label="Illustrative system flow">${flows[project.id] || ''}</div></div><div class="project-bottom"><div class="tags">${project.tags.map(tag => `<span>${escapeHTML(tag)}</span>`).join('')}</div><button class="case-button" data-project="${escapeHTML(project.id)}">My contribution <span aria-hidden="true">+</span></button></div><p class="project-note">Professional contribution · Résumé-reported results · Source code is proprietary</p></div>`;
  if(focus) tabs[index].focus();
}
function tabKey(event, index, length, select) {
  let target;
  if(['ArrowRight','ArrowDown'].includes(event.key)) target = (index + 1) % length;
  else if(['ArrowLeft','ArrowUp'].includes(event.key)) target = (index - 1 + length) % length;
  else if(event.key === 'Home') target = 0;
  else if(event.key === 'End') target = length - 1;
  else return;
  event.preventDefault(); select(target, true);
}
$$('[role="tab"]', $('#project-tabs')).forEach((tab, index) => {
  tab.addEventListener('click', () => showProject(index));
  tab.addEventListener('keydown', event => tabKey(event, index, profile.projects.length, showProject));
});
showProject(0);
$('#project-panel').addEventListener('click', event => {const button = event.target.closest('[data-project]'); if(button) openProject(button.dataset.project)});
const compactLayout = matchMedia('(max-width:640px)');
function projectOrientation() {$('#project-tabs').setAttribute('aria-orientation', compactLayout.matches ? 'horizontal' : 'vertical')}
projectOrientation(); compactLayout.addEventListener('change', projectOrientation);
$('#experience-list').innerHTML = profile.experience.map(item => `<article class="experience-item"><div class="experience-top"><strong>${escapeHTML(item.company)}</strong><small>${escapeHTML(item.date)}</small></div><div class="experience-role">${escapeHTML(item.role)} · ${escapeHTML(item.client)}</div><p>${escapeHTML(item.description)}</p><div class="tags">${item.tags.map(tag => `<span>${escapeHTML(tag)}</span>`).join('')}</div></article>`).join('');
const dialog=$('#detail-dialog');
let dialogTrigger=null;
function showDialog(html){dialog.classList.remove('resume-viewer-dialog');dialogTrigger=document.activeElement;$('#dialog-content').innerHTML=html;if(!dialog.open)dialog.showModal();dialog.scrollTop=0;$('.dialog-close').focus()}
function closeDialog(){dialog.close();dialogTrigger?.focus()}
$('.dialog-close').addEventListener('click',closeDialog);
dialog.addEventListener('click',event=>{if(event.target===dialog){const bounds=dialog.getBoundingClientRect();if(event.clientX<bounds.left||event.clientX>bounds.right||event.clientY<bounds.top||event.clientY>bounds.bottom)closeDialog()}});
dialog.addEventListener('cancel',()=>{dialogTrigger?.focus()});
function openProject(id){const project=profile.projects.find(item=>item.id===id);if(!project)return;showDialog(`<p class="dialog-eyebrow">${escapeHTML(project.company)} / CASE ${project.number}</p><h2 id="dialog-title">${escapeHTML(project.name)}</h2><div class="tags">${project.tags.map(tag=>`<span>${escapeHTML(tag)}</span>`).join('')}</div><h3>The challenge</h3><p>${escapeHTML(project.challenge)}</p><h3>My contribution</h3><ul>${project.approach.map(line=>`<li>${escapeHTML(line)}</li>`).join('')}</ul><h3>The outcome</h3><ul class="dialog-outcomes">${project.outcomes.map(line=>`<li>${escapeHTML(line)}</li>`).join('')}</ul><p class="dialog-note">${escapeHTML(project.note)}</p>`)}
function validResumeUrl(value){return safeResumeUrl(value,location.href)}
function openResume(){
  const url=validResumeUrl(profile.resumeUrl);
  const preview=resumePreviewUrl(profile.resumeUrl,location.href);
  if(preview){
    showDialog(`<div class="resume-viewer-heading"><div><p class="dialog-eyebrow">${escapeHTML(profile.name)} / RÉSUMÉ</p><h2 id="dialog-title">My résumé.</h2></div><a class="button secondary" href="${escapeHTML(url)}" target="_blank" rel="noopener noreferrer">Open in new tab</a></div><iframe class="resume-preview" title="${escapeHTML(profile.name)} — résumé preview" src="${escapeHTML(preview)}" referrerpolicy="no-referrer" sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads"></iframe><p class="resume-preview-help">Preview provided by Google Drive. If it doesn’t load, use “Open in new tab” above.</p>`);
    dialog.classList.add('resume-viewer-dialog');
    return;
  }
  showDialog(`<p class="dialog-eyebrow">${escapeHTML(profile.name)} / RÉSUMÉ</p><h2 id="dialog-title">The full picture.</h2>${url?`<p>View my experience, technical skills, and selected contributions.</p><a class="button primary" href="${escapeHTML(url)}" target="_blank" rel="noopener noreferrer">Open résumé</a>`:`<p>The résumé link has not been configured yet. Email me for a current copy.</p><a class="resume-dialog-link" href="mailto:${escapeHTML(profile.email)}?subject=R%C3%A9sum%C3%A9%20request">Request résumé by email</a>`}`);
}
// Unload the third-party viewer when the dialog closes.
dialog.addEventListener('close',()=>{dialog.querySelector('.resume-preview')?.remove();dialog.classList.remove('resume-viewer-dialog')});
$$('[data-resume]').forEach(button=>button.addEventListener('click',openResume));

// Scope each tab group independently so work and skills never interfere.
const categories = Object.keys(profile.skills);
const skillSymbols = ['{ }','<>','/','λ','TS','◇','⊙','~'];
$('#stack-tabs').innerHTML = categories.map((category,index) => `<button role="tab" id="stack-tab-${index}" aria-controls="stack-grid" aria-selected="${index === 0}" tabindex="${index === 0 ? 0 : -1}">${escapeHTML(category)}</button>`).join('');
function showStack(index, focus = false) {
  const tabs = $$('[role="tab"]', $('#stack-tabs'));
  tabs.forEach((tab,i) => {tab.setAttribute('aria-selected', String(i === index)); tab.tabIndex = i === index ? 0 : -1});
  $('#stack-grid').setAttribute('aria-labelledby', tabs[index].id);
  $('#stack-grid').innerHTML = profile.skills[categories[index]].map((skill,i) => `<div class="skill-tile"><span class="skill-symbol" aria-hidden="true">${escapeHTML(skillSymbols[i] || '{}')}</span><strong>${escapeHTML(skill)}</strong></div>`).join('');
  if(focus) tabs[index].focus();
}
showStack(0);
$$('[role="tab"]', $('#stack-tabs')).forEach((tab,index) => {
  tab.addEventListener('click', () => showStack(index));
  tab.addEventListener('keydown', event => tabKey(event,index,categories.length,showStack));
});

// A local, allowlisted portfolio command interpreter. Never eval visitor input.
const output = $('#terminal-output'), input = $('#terminal-input');
const history = []; let historyIndex = 0, draft = '';
function welcome() {
  output.innerHTML = `<div class="terminal-entry"><div class="terminal-prompt">visitor@rishabh ~ $ whoami</div><div class="terminal-profile-name">${escapeHTML(profile.name)}</div><div class="terminal-profile-role">${escapeHTML(profile.role)}</div><dl class="terminal-kv"><dt>based_in</dt><dd>${escapeHTML(profile.location)}</dd><dt>working_at</dt><dd>Neurealm / Retia Medical</dd><dt>previously</dt><dd>Accenture / Maersk</dd><dt>building</dt><dd>Go services & real-time systems</dd></dl><p class="terminal-tip">Your turn. Type <strong>help</strong> to explore, or <strong>resume</strong> to open my résumé.</p></div>`;
}
welcome();
function runCommand(raw) {
  if(!raw.trim()) return;
  const command = raw.slice(0,2000);
  history.push(command); if(history.length > 100) history.shift();
  historyIndex = history.length; draft = '';
  const result = executeCommand(command);
  if(result.action === 'clear') {output.replaceChildren(); return}
  const entry = document.createElement('div'); entry.className = 'terminal-entry';
  const prompt = document.createElement('div'); prompt.className = 'terminal-prompt'; prompt.textContent = `visitor@rishabh ~ $ ${command}`;
  const response = document.createElement('div'); response.className = 'terminal-response'; response.textContent = result.text;
  entry.append(prompt,response); output.append(entry);
  while(output.children.length > 100) output.firstElementChild.remove();
  output.scrollTop = output.scrollHeight;
  if(result.action === 'project') openProject(result.id);
  if(result.action === 'resume') openResume();
  if(result.action === 'theme') toggleTheme();
}
$('#terminal-form').addEventListener('submit', event => {event.preventDefault(); runCommand(input.value); input.value = ''});
input.maxLength = 2000;
input.addEventListener('keydown', event => {
  if(event.key === 'ArrowUp') {event.preventDefault(); if(historyIndex === history.length) draft = input.value; if(historyIndex > 0) input.value = history[--historyIndex]}
  if(event.key === 'ArrowDown') {event.preventDefault(); if(historyIndex < history.length) historyIndex++; input.value = historyIndex === history.length ? draft : history[historyIndex]}
  if(event.key === 'Tab' && !event.shiftKey && input.value.trim()) {
    const prefix = input.value.trimStart().toLowerCase();
    const choices = prefix.startsWith('project ') ? profile.projects.map(p => 'project ' + p.id) : commands;
    const matches = choices.filter(command => command.startsWith(prefix));
    if(matches.length) {event.preventDefault(); if(matches.length === 1) input.value = matches[0]; else toast(matches.join(' · '))}
  }
  if((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'l') {event.preventDefault(); output.replaceChildren()}
  if(event.key === 'Escape') input.blur();
});
let terminalAttention;
function focusTerminal() {
  if(dialog.open) closeDialog();
  $('#terminal').scrollIntoView({behavior:motionOff ? 'auto' : 'smooth',block:'center'});
  input.focus({preventScroll:true});
  $('#terminal-window').classList.add('attention');
  clearTimeout(terminalAttention);
  terminalAttention = setTimeout(() => $('#terminal-window').classList.remove('attention'),1300);
}
$$('.terminal-launch').forEach(button => button.addEventListener('click',focusTerminal));
$$('[data-command]').forEach(button => button.addEventListener('click',() => {runCommand(button.dataset.command); if(!dialog.open) input.focus({preventScroll:true})}));
$('#clear-terminal').addEventListener('click',() => {output.replaceChildren(); input.focus({preventScroll:true})});
document.addEventListener('keydown',event => {if((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {event.preventDefault(); focusTerminal()}});

$('#email-link').textContent = profile.email;
$('#email-link').href = `mailto:${profile.email}`;
$$('[data-email-link]').forEach(link => link.href = `mailto:${profile.email}`);
$$('[data-github]').forEach(link => {const url=safeResumeUrl(profile.github,location.href);if(url)link.href=url});
$('#copy-email').addEventListener('click',async() => {
  try {await navigator.clipboard.writeText(profile.email); toast('Email copied. I look forward to hearing from you.')}
  catch {showDialog(`<p class="dialog-eyebrow">GET IN TOUCH</p><h2 id="dialog-title">Let’s talk.</h2><p>Select and copy my email address:</p><div class="resume-code">${escapeHTML(profile.email)}</div><a class="resume-dialog-link" href="mailto:${escapeHTML(profile.email)}">Open your email app</a>`)}
});

// One pointer handler, one animation frame at a time. Touch keeps native scrolling.
const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
const cursor = $('.cursor-light');
let pointerFrame = 0, pointerX = 0, pointerY = 0, activeCard = null;
function resetCard(card) {
  if(!card) return;
  card.style.removeProperty('--tilt-x'); card.style.removeProperty('--tilt-y');
  card.style.removeProperty('--pointer-x'); card.style.removeProperty('--pointer-y');
}
document.addEventListener('pointermove', event => {
  if(!finePointer.matches || motionOff || event.pointerType === 'touch') return;
  pointerX=event.clientX; pointerY=event.clientY;
  const nextCard=event.target.closest?.('.spotlight');
  if(nextCard !== activeCard) {resetCard(activeCard);activeCard=nextCard}
  if(pointerFrame) return;
  pointerFrame=requestAnimationFrame(() => {
    pointerFrame=0;
    if(motionOff || !finePointer.matches) return;
    cursor.classList.add('visible');
    cursor.style.transform=`translate3d(${pointerX-260}px,${pointerY-260}px,0)`;
    if(!activeCard) return;
    const rect=activeCard.getBoundingClientRect(),x=pointerX-rect.left,y=pointerY-rect.top;
    activeCard.style.setProperty('--pointer-x',`${x}px`);
    activeCard.style.setProperty('--pointer-y',`${y}px`);
    if(activeCard.hasAttribute('data-tilt')) {
      activeCard.style.setProperty('--tilt-x',`${(0.5-y/rect.height)*3}deg`);
      activeCard.style.setProperty('--tilt-y',`${(x/rect.width-0.5)*3}deg`);
    }
  });
},{passive:true});
document.documentElement.addEventListener('pointerleave',() => {cursor.classList.remove('visible'); resetCard(activeCard); activeCard=null; cancelAnimationFrame(pointerFrame); pointerFrame=0});

let scrollTick=false;
function updateProgress() {
  const range=document.documentElement.scrollHeight-innerHeight;
  $('.scroll-progress').style.width=(range>0?scrollY/range*100:0)+'%';
  scrollTick=false;
}
addEventListener('scroll',() => {if(!scrollTick){requestAnimationFrame(updateProgress);scrollTick=true}},{passive:true});
addEventListener('resize',updateProgress); updateProgress();
if('IntersectionObserver' in window) {
  const navObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting) $$('nav a').forEach(link=>{const active=link.hash==='#'+entry.target.id;link.classList.toggle('active',active);if(active)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current')})}),{rootMargin:'-20% 0px -55% 0px',threshold:0});
  $$('main section[id]').forEach(section=>navObserver.observe(section));
  const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.remove('pending');entry.target.classList.add('visible');revealObserver.unobserve(entry.target)}}),{rootMargin:'0px 0px 30px 0px',threshold:0.05});
  $$('.section,.contact-section').forEach(el=>{el.classList.add('reveal');if(!motionOff && el.getBoundingClientRect().top>innerHeight)el.classList.add('pending');revealObserver.observe(el)});
}
