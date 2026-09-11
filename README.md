# Nateponds portfolio

Next.js App Router + React + Three.js, using JavaScript and plain CSS. The homepage preserves the animated sky, branches, moon, and rigged birds. No environment variables are required.

## Start coding

1. Install Node.js 20.9 or newer (Node.js 24 LTS recommended).
2. Run `npm install`.
3. Run `npm run dev` and open http://localhost:3000.
4. Edit `src/content/site.js` to change your name, heading, and description. Save to see the change.

On Windows PowerShell with script execution disabled, use `npm.cmd` and `npx.cmd` in place of `npm` and `npx`.

## Where things live

```text
src/
  app/
    layout.jsx          Shared HTML shell, metadata, global CSS import
    page.jsx            Homepage markup; start here for new sections
    globals.css         Site styles and responsive rules
  components/
    sky-background.jsx  Client component; mounts and cleans up Three.js
  content/
    site.js             Editable text and site metadata
  lib/sky/
    experience.js       Scene composition, animation loop, lifecycle
    atmosphere.js       Volumetric clouds, sky colors, stars
    birds.js            Bird models and animation
    daylight.js         Solar calculations and optional IP lookup
    foreground.js       Foreground branch blur
    nature.js           Branches and moon
public/assets/          Images and GLB models; served at /assets/...
scripts/               Asset preparation and browser verification
docs/                  Scene notes and reference images
prototype-webgl/       Historical sprite backups, not part of the app
raw/                   Original asset sources, not served by Next.js
```

`@/` points to `src/`, so `@/components/sky-background` imports that component without relative path nesting. Keep page content in React; keep canvas rendering in `lib/sky`.

## Common edits

### Add a section to the homepage

Edit `src/app/page.jsx`. Put new content inside `<main>` and adjust `#content` in `globals.css` from its centered hero layout when adding multiple sections. The sky stays fixed behind the page. Normal scrolling and interactive links are enabled.

### Add an About page

Create `src/app/about/page.jsx`:

```jsx
import Link from 'next/link';

export const metadata = { title: 'About' };

export default function AboutPage() {
  return (
    <main>
      <h1>About me</h1>
      <p>Write your introduction here.</p>
      <Link href="/">Back home</Link>
    </main>
  );
}
```

Visit `/about`. To link to it from the homepage, import `Link` from `next/link` and add `<Link href="/about">About</Link>`. The sky is currently homepage-only; other pages use the CSS background.

### Add an interactive component

Create a file in `src/components/`. Add `'use client';` at the top only when it needs React state, effects, event handlers, or browser APIs. Pages and layouts are server components by default. The sky loads through an effect so WebGL code never runs on the server.

### Change the scene

Edit `src/lib/sky/`. Development preview URLs:

- `/?sky=day&sceneTime=12`
- `/?sky=sunset&sceneTime=12`
- `/?sky=night&sceneTime=12`

Remove the query string for the automatic sky and bird entrance. Preview controls and `window.__sky` are development-only. Reduced-motion preferences show a still scene. If WebGL or model loading fails, the heading remains visible over the CSS background. The optional IP-based location request falls back to the local clock; see [scene notes](docs/sky-implementation.md).

## Commands and verification

| Command | Purpose |
| --- | --- |
| `npm run dev` | Local development with Fast Refresh on port 3000 |
| `npm run lint` | Check application and scripts with ESLint |
| `npm run build` | Build for production (does not run lint) |
| `npm start` | Serve the production build on port 3000 |
| `npm run cutouts` | Regenerate legacy image cutouts from raw assets |

Browser checks require the development server in another terminal. Install Chromium once with `npx playwright install chromium`, then run `npm run test:sky` and `npm run test:birds`. These check palettes, animation states, mobile layout, reduced motion, location fallback, and bird regressions. Screenshots go in ignored `artifacts/sky/`.

Set `BASE_URL` to test another development port. Set `BROWSER_CHANNEL=msedge` to use installed Microsoft Edge instead of Playwright Chromium. In PowerShell: `$env:BROWSER_CHANNEL = 'msedge'`.

For production, run `npm run lint`, `npm run build`, then `npm start`. Deploy with a host that supports Next.js or a Node.js server. `.next/` is generated output; the old Vite `dist/` directory is no longer used. Commit source and `package-lock.json`, not generated output or `node_modules`.

Framework reference: [Next.js App Router documentation](https://nextjs.org/docs/app).
