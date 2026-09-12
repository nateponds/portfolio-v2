# Linko showcase capture

Captured 2026-09-12 from the local checked-in Linko source at `../LINKO` (Git revision `e952506bf527bbc757356f7b790170071c9b002e`). The source is a React 19 / Vite app; the capture route was `/landing`, served locally with Vite.

The three PNGs in `public/assets/portfolio/showcases/` are raw viewport screenshots. They were taken with Playwright at device scale factor 1 and no browser chrome or device frame:

| Asset | Viewport | Source state |
| --- | ---: | --- |
| `linko-desktop.png` | 1440 × 900 | Landing hero with product-tour preview |
| `linko-tablet.png` | 820 × 1180 | Responsive landing hero and product preview |
| `linko-mobile.png` | 390 × 844 | Responsive landing hero and product preview |

The product preview is rendered by Linko's checked-in `HeroVideoPreview` component and local product-tour asset. No product UI was invented for this capture. The live deployment (`https://linko.nateponds.com`) was unreachable in the capture environment, so the local source was used.

