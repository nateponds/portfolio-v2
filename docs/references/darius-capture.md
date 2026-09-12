# Darius showcase capture

The three showcase screenshots in `public/assets/portfolio/showcases/` are source derived responsive captures for the Darius project.

## Provenance

- Source repository: `https://github.com/nateponds/darius.git`
- Source revision: `6c016846de8eabe3d4537c363840393bb6c9c2a2` (`ci: run nathanlab tests on Node 22 and wait out container RST on /login.`)
- Working clone: `artifacts/showcase/darius`
- Source surfaces used: `src/app/AppShell.tsx`, `src/app/page.tsx`, `src/app/components/EntryForm/EntryFormContainer.tsx`, `src/app/EntryRow.tsx`, and `src/app/globals.css`
- Capture harness: `artifacts/showcase/darius-capture/index.html` and `artifacts/showcase/capture-darius.mjs`
- Browser: Playwright Chromium 1243, headless, device scale factor 1
- Capture date: 2026-09-12 (Asia/Manila)

## Viewports

| Asset | Viewport | Content |
| --- | ---: | --- |
| `darius-desktop.png` | 1440 × 900 | Desktop AppShell header, overview, latest-entry form aside |
| `darius-tablet.png` | 820 × 1180 | Mobile AppShell header, overview, categories, accounts, latest entries, bottom tabs |
| `darius-mobile.png` | 390 × 844 | Phone AppShell header, overview, categories, accounts, bottom tabs and FAB |

## Capture method and limitations

The repository was cloned locally and inspected at the revision above. The production overview is authenticated and reads account, category, and entry data through Supabase. No authenticated session or private account data was used for this artifact. A local Next.js startup reached the dev-server ready state, but route compilation in the isolated clone stopped because the available offline dependency tree did not contain `serve-static`; the public login surface would also not provide the requested overview data without a session.

The captures therefore use a faithful static harness based on the source layout, palette, typography scale, responsive breakpoints, navigation, overview sections, entry form, and row treatments. All values in the rendered dashboard are synthetic and illustrative. Device framing and the common project-card composition are applied by the portfolio integration work so the raw screenshots remain reusable at their native dimensions.
