// Public browser helpers. Never put secrets in this module.
export const escapeHTML = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function safeResumeUrl(value, base) {
  if(typeof value!=='string'||!value.trim())return null;
  try {
    const origin=new URL(base), url=new URL(value,origin);
    if(url.username||url.password)return null;
    const localPreview=url.origin===origin.origin&&url.protocol==='http:'&&['localhost','127.0.0.1','[::1]'].includes(url.hostname);
    return url.protocol==='https:'||localPreview?url.href:null;
  }catch{return null}
}

// Only a recognized Google Drive file URL can become an embedded preview.
export function resumePreviewUrl(value, base) {
  const safe = safeResumeUrl(value, base);
  if (!safe) return null;
  const url = new URL(safe);
  if (url.origin !== 'https://drive.google.com') return null;
  const match = url.pathname.match(/^\/file\/d\/([A-Za-z0-9_-]+)(?:\/(?:view|preview))?\/?$/);
  return match ? `https://drive.google.com/file/d/${match[1]}/preview` : null;
}
