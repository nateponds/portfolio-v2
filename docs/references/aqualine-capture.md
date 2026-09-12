# Aqualine showcase capture

- Source repository: `nateponds/aqualine_webdev1`
- Source revision: `07acc9b` (`updates: admin reports, pagination/search, soft-delete, forgot pass`)
- Capture route: `http://127.0.0.1:8071/index.php`
- Source checkout used for capture: `artifacts/showcase/aqualine`
- Capture method: PHP 8.2 built-in server with Playwright Chromium, device scale factor 1, animations and transitions disabled after page load.
- Page state: top of the public Aqualine landing page, with the source page's real HTML, CSS, and JavaScript. No private data or account state was used.

## Outputs

| File | Viewport | Dimensions |
| --- | ---: | ---: |
| `public/assets/portfolio/showcases/aqualine-desktop.png` | 1440 × 900 | 1440 × 900 px |
| `public/assets/portfolio/showcases/aqualine-tablet.png` | 820 × 1180 | 820 × 1180 px |
| `public/assets/portfolio/showcases/aqualine-mobile.png` | 390 × 844 | 390 × 844 px |

## Limitations

The repository's operations dashboard is `public/admin_pov.php`, but it requires an authenticated PHP session and the `aqualine_orders` MySQL database. Because those services were not available in the capture environment, the delivered screenshots use the public landing route instead of fabricating dashboard records. The source's mobile header remains horizontally clipped at 390 px because that is the behavior of the captured revision; the integration layer should preserve the raw screenshot and decide whether to crop or frame it.
