import {profile} from './profile.js';
export const commands = ['help','whoami','about','skills','experience','projects','project','education','awards','contact','resume','github','theme','clear','date','echo','sudo'];
export function executeCommand(raw) {
  const input = raw.trim();
  const [name, ...args] = input.split(/\s+/);
  const command = name.toLowerCase();
  if (!input) return {text:''};
  switch(command) {
    case 'help': return {text:'AVAILABLE COMMANDS\n\nwhoami        The engineer behind the terminal\nskills        My working stack\nexperience    Where I’ve worked\nprojects      Selected engineering contributions\nproject <id>  Open a case study\neducation     My academic background\nawards        Recognition & certification\ncontact       Let’s start a conversation\nresume        Résumé link and availability\ngithub        My GitHub profile\ntheme         Toggle light / dark\nclear         Start with a clean terminal\ndate          Current local date and time\necho <text>   Say it back\n\nTab completes commands. ↑ / ↓ recalls history.\nCtrl / ⌘ + K focuses this terminal. Ctrl + L clears.\nThis is a portfolio shell; it does not run system commands.'};
    case 'whoami': case 'about': return {text:`${profile.name}\n${profile.role} · ${profile.location}\n\n${profile.summary}\n\n4+ years · Go · distributed systems · platform engineering\nCurrently: Neurealm / Retia Medical\nPreviously: Accenture / Maersk`};
    case 'skills': return {text:Object.entries(profile.skills).map(([key,values])=>`${key.toUpperCase()}\n${values.join(' · ')}`).join('\n\n')};
    case 'experience': return {text:profile.experience.map(x=>`${x.company} / ${x.client}\n${x.role} | ${x.date}\n${x.description}`).join('\n\n')};
    case 'projects': case 'ls': return {text:profile.projects.map(x=>`${x.id.padEnd(12)} ${x.shortName}\n             ${x.description}`).join('\n\n')+'\n\nRun project <id> to explore a case study.'};
    case 'project': {const p=profile.projects.find(x=>x.id===args[0]?.toLowerCase()); return p ? {text:`Opening ${p.shortName}…`,action:'project',id:p.id} : {text:'Usage: project <id>\nAvailable IDs: platform, argos, workflows'};}
    case 'education': return {text:'Kalinga Institute of Industrial Technology (KIIT)\nB.Tech · Electronics & Telecommunication Engineering\nBhubaneswar, India · August 2022'};
    case 'awards': return {text:'Pinnacle Award — FY25 North Star\nAccenture · July 2025\nTechnical excellence and delivery impact\n\nGitHub Copilot Certification\nAugust 2025 · AI-assisted development workflows & LLM tooling'};
    case 'contact': return {text:`Email    ${profile.email}\nGitHub   ${profile.github}\nLocation ${profile.location}\n\nUse the Contact section to email me or copy my address.`};
    case 'resume': return {text:profile.resumeUrl ? `Résumé: ${profile.resumeUrl}\nOpening the résumé panel…` : 'Résumé download is coming soon.\nFor a current copy, email '+profile.email,action:'resume'};
    case 'github': return {text:profile.github+'\nUse the GitHub link in Contact to explore my profile.'};
    case 'theme': return {text:'Theme switched.',action:'theme'};
    case 'clear': return {text:'',action:'clear'};
    case 'date': return {text:new Date().toLocaleString(undefined,{dateStyle:'full',timeStyle:'long'})};
    case 'echo': return {text:args.join(' ')};
    case 'sudo': return {text:'Nice try. No root access required to build something great.\nTry projects instead.'};
    case 'pwd': return {text:'/home/visitor/rishabh-portfolio'};
    default: return {text:`Command not found: ${name}\nType help for the available commands.`};
  }
}
