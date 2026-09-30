// Deploy-time configuration. No secrets, tokens, or private URLs belong here.
export const contentSecurityPolicy = "default-src 'none'; script-src 'self'; script-src-attr 'none'; style-src 'self'; style-src-attr 'none'; img-src 'self' data:; font-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-src https://drive.google.com; frame-ancestors 'none'; worker-src 'none'";
export const securityHeaders = {
  'Content-Security-Policy':contentSecurityPolicy,
  'X-Content-Type-Options':'nosniff',
  'X-Frame-Options':'DENY',
  'Referrer-Policy':'no-referrer',
  'Permissions-Policy':'camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()',
  'Cross-Origin-Opener-Policy':'same-origin',
  'Cross-Origin-Resource-Policy':'same-origin'
};
export const productionHeaders = {...securityHeaders,'Strict-Transport-Security':'max-age=31536000'};
