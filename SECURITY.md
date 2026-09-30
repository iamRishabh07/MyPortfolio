# Security design and deployment

This public portfolio has no accounts, database, backend API, uploads, payment processing, or privileged credentials. The terminal is an allowlisted browser command interpreter, not a real system shell. Visitors cannot edit hosted files through it. Modifying a page in browser developer tools changes only that visitor’s local view.

## Included protections

- No npm/runtime dependencies, remote scripts, font CDNs, analytics, or API calls.
- No eval, Function constructor, shell execution, or execution of visitor input.
- Terminal input/output uses textContent. Dynamic case-study values pass through HTML escaping.
- Terminal input length, history, and rendered output counts are bounded.
- Résumé links reject executable schemes, insecure external HTTP, and embedded credentials. Only HTTPS and same-origin loopback HTTP development links are allowed. Configure your own trusted résumé URL; HTTPS alone does not establish trust.
- Restrictive Content Security Policy: no inline scripts, event handlers, eval, fetches, arbitrary frames, objects, workers, or form submissions. The only permitted frame origin is https://drive.google.com for the requested résumé viewer. Scripts and styles load only from the same origin.
- Response headers for MIME sniffing, clickjacking, referrer privacy, device permissions, opener isolation, and resource isolation.
- External new-tab links use noopener noreferrer.
- Theme/motion are the only persistent preferences. Terminal history exists only in memory.
- Local preview is loopback-only, allowlists public files, validates Host, rejects non-GET/HEAD methods, traversal, and symlink escapes. It is not a production server.

## Public configuration is not a secret store

profile.js contains editable public content: name, email, skills, projects, and résumé URL. Every file sent to a browser can be read by visitors. Frontend environment variables are public when bundled too. There are no secrets in this version.

If you later add AI or a contact API, put credentials in a server-side secret store. Any new backend needs its own authorization where appropriate, validation, abuse controls, and security review.

## Deployment

1. Run the checks/build and publish only dist/ over HTTPS. Protect your hosting account, repository, and domain registrar with MFA and least-privilege access.
2. The build generates dist/_headers for Netlify/Cloudflare Pages static hosting, and root vercel.json for repository-connected Vercel hosting. Disable host-injected analytics or preview toolbars unless you review and adjust CSP for them.
3. Other hosts must apply security-policy.mjs values as actual HTTP response headers. Uploading _headers alone has no effect on arbitrary servers.
4. HTML contains a meta CSP fallback, but frame-ancestors and other HTTP-only protections require response headers. A meta tag alone does not prevent framing.
5. HSTS is set to one year, only for this hostname. Enable HTTPS before deployment. No includeSubDomains or preload commitment is made.
6. Check actual response headers after hosting with browser DevTools or curl -I https://YOUR-DOMAIN. Test the terminal, dialogs, themes, résumé, and mobile layout on the live site. Hosting may omit or override settings.
7. Do not host unrelated or user-uploaded HTML/JavaScript on the same origin. The CSP trusts the site’s own origin.

## Verification and limits

Checked: JavaScript syntax, commands, unknown-command handling, project selection, HTML escaping, unsafe URL rejection, restrictive CSP values, absence of remote scripts/font imports, asset references, and build packaging. No live site was deployed or audited. Browser visual QA was unavailable. This is defense in depth, not a promise of invulnerability or a penetration test. DDoS protection and account compromise resistance also depend on your host and account settings.

## References

- https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html
- https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/frame-ancestors
- https://developers.cloudflare.com/pages/configuration/headers/
- https://docs.netlify.com/manage/routing/headers/
- https://vercel.com/docs/project-configuration/vercel-json

## Résumé viewer update

The résumé button and terminal command immediately embed the configured Drive file using its /preview URL. Only recognized drive.google.com file links are transformed into iframe sources; other safe links retain an external-open fallback. The iframe is sandboxed, receives no referrer, and is removed when closed. Opening the viewer makes requests to Google, whose viewer may run its own scripts and use cookies under the visitor’s browser settings. Parent-page script/connect restrictions remain in place. A public Drive sharing setting is required for signed-out visitors. Drive availability/embedding cannot be guaranteed; a direct-open fallback remains visible. The supplied Drive link could not be inspected from this environment.

## Personal portfolio redesign (v2)

The new cursor highlights and card tilt use bounded numeric pointer coordinates through individual CSS style properties; no visitor HTML, style text, eval, external animation library, or relaxed unsafe-inline/unsafe-eval CSP was added. Desktop effects are disabled for coarse pointers, and motion can be reduced or switched off. Project and skill explorers have independently scoped keyboard tabs. The preview server defaults to loopback port 3001.
