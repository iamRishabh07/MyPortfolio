# Rishabh — Personal engineering portfolio

A complete, interactive personal portfolio. The first screen introduces Rishabh with his supplied portrait, name, and role alongside an immediately usable terminal. Midnight glass surfaces, cursor lighting, subtle card tilt, scroll reveals, and interactive project/skill explorers make the page responsive to the visitor. There are no framework or npm dependencies.

## Run

Requires Node.js 18 or newer. No npm install is needed.

```bash
npm run dev
```

Open http://127.0.0.1:3001. The default is now 3001 to avoid your Grafana service on 3000. Keep this terminal running. Press Control + C to stop it. Save code changes and refresh the browser; this preview does not auto-refresh. Do not open index.html via file://.

If that port is occupied:

```bash
PORT=3002 npm run dev
```

## Update an existing installation

This version replaces the page structure, stylesheet, and interaction code. Extract the complete new package into a new directory, open that directory in your IDE, stop the old server, and start this version. Keep your old folder as a backup and merge any personal edits you made into the new profile.js. Hard-refresh with Command + Shift + R on Mac.

## What works

- Photo/name/role in the first section and a prominent working terminal
- Terminal command history, autocomplete, quick-command buttons, and keyboard shortcuts
- Interactive work browser with keyboard-operable tabs and detailed case-study dialogs
- Experience timeline, skills categories, recognition, and contact links
- On-page Google Drive résumé preview from both the résumé button and terminal
- Light/dark theme and motion preferences saved only on the visitor’s device
- Pointer-following glass highlights and small perspective tilt on desktop
- Touch layouts with hover effects disabled; reduced-motion detection and a manual motion toggle

## Edit content

- profile.js: résumé URL, contact data, skills, experience, project copy, and metrics
- index.html: personal introduction, biography, education, static narrative, and SEO metadata
- styles.css: colors, spacing, responsive breakpoints, glass and motion styling
- app.js: UI behavior, effects, dialogs, and data rendering
- terminal.js: allowlisted command responses
- security.js: escaping and safe résumé/embed URLs
- security-policy.mjs: hosting security-header configuration
- assets/portrait.png: supplied photo (rendered with CSS framing, no AI retouching)

Public frontend content is readable by visitors. Never place secrets, private keys, or privileged API credentials in these files.

## Résumé

Your URL is already configured:

```js
resumeUrl: 'https://drive.google.com/file/d/1GoPXCV1WW5Ffowm1sWOl2W6nOedeeHbt/view?usp=sharing',
```

Set Drive sharing to Anyone with the link / Viewer. Recognized Google Drive file URLs automatically use /preview inside the on-page viewer. A direct-open fallback is always visible. Other HTTPS URLs open through a link instead of being embedded. To update the résumé, change the root profile.js and rebuild; do not edit dist/profile.js directly.

## Terminal commands

help, whoami, about, skills, experience, projects, project platform, project argos, project workflows, education, awards, contact, resume, github, theme, clear, date, echo, sudo. ls aliases projects; pwd returns the virtual portfolio path.

- Command/Ctrl + K: focus and highlight terminal
- Up/Down: session command history
- Tab: autocomplete nonempty command or project ID
- Shift + Tab: normal keyboard navigation
- Command/Ctrl + L: clear while focused
- Escape: close a dialog or blur terminal

This is a safe portfolio interpreter, not a system shell or AI chatbot. Input is rendered as text and is never executed. History stays in memory and is limited to 100 commands.

## Build and host

```bash
npm run check
npm run build
```

Deploy only dist/. The interactive UI runs in the browser; no production Node server, database, API key, or backend is needed. No site has been deployed for you.

The build produces dist/_headers for Netlify/Cloudflare Pages and root vercel.json for repository-connected Vercel hosting. For other hosts, configure equivalent security-policy.mjs response headers in the server/CDN. Use HTTPS and verify actual response headers after publishing. See SECURITY.md for specifics.

The only third-party runtime content is the on-demand Google Drive résumé frame. Fonts are system fonts, and the portfolio does not use tracking, analytics, or third-party JavaScript packages.

## Validation

Syntax, command behavior, link/embed validation, security policy, markup/selector contracts, and production packaging have been checked. Browser visual testing was unavailable in this environment. Test the final host on desktop and your phone, including dialogs, résumé access, keyboard navigation, and reduced motion. Professional metrics originate in the supplied résumé; diagrams are conceptual rather than live infrastructure data.
