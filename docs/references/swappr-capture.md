# SWAPPR showcase capture

Captured 2026-09-12 from the local checked-in SWAPPR source at `.trash/SWAPPR beta` (Git revision `303e09e8571fd86f4544d0fe27bab6bb681bb86f`). The source is an Express server serving the checked-in static marketplace UI and seeded SQLite records; the capture route was `/index.html`, served locally on port 8084.

The three PNGs in `public/assets/portfolio/showcases/` are raw viewport screenshots. They were taken with Playwright at device scale factor 1 and no browser chrome or device frame:

| Asset | Viewport | Source state |
| --- | ---: | --- |
| `swappr-desktop.png` | 1440 × 900 | All Notebooks marketplace, sidebar, seeded cards |
| `swappr-tablet.png` | 820 × 1180 | Two-column responsive marketplace |
| `swappr-mobile.png` | 390 × 844 | Single-column responsive marketplace |

The browser session used the checked-in seeded user `ana_reyes` in `sessionStorage` so the source's login redirect would allow the marketplace to render. Notebook titles, authors, descriptions, likes, sidebar sections, buttons, and the chat control come from the source and local SQLite seed data. The live deployment (`https://swappr.nateponds.com`) was unreachable in the capture environment. The source loads Tailwind from `https://cdn.tailwindcss.com`; because that CDN was blocked in the browser sandbox, the same CDN bundle was mirrored into the ignored `artifacts/showcase/tailwind.cdn.js` capture helper before screenshotting. The source's Google Fonts request remained unavailable, so the browser used its declared fallback font stack.

