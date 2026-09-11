# Sky page

The approved direction is Fable blue daylight, a brief peach sunset, and deep blue Fable nighttime. Four large volumetric cloud banks frame the corners, with smaller clouds along the sides. The nearby branches reach left, sway and receive a Gaussian bloom that spreads past their silhouettes. Perch trees, the hero bird and background travelers use the same bloom pass. One imported rigged bird enters after 3 visible seconds, power-flaps across the scene, stays offscreen for 3 seconds, then returns, flares and lands over 3.2 seconds, then remains perched. Head turns use irregular pauses alongside the authored idle animation. Four distant travelers flap less the farther they are, then depart without wrapping. Hidden tabs pause the animation; returning does not replay the entrance.

## Implementation

The runtime rig adds bounded leg tuck, an authored standing-leg reach on approach, toe curl, tail trim and coordinated neck/head offsets. All controlled bones restore their last authored mixer pose before applying offsets, including repeated preview frames. Landing holds the standing leg rotations while wing actions finish folding. Birds and perch trees bloom in the main composer so softness spreads past their outlines. Feather materials retain the original texture with a restrained cool tint and matte response. The GLB mesh, skin weights and 55-bone hierarchy remain unchanged.

Bird motion uses arc-length cruise travel, progressive return braking, tangent-based heading/pitch and restrained banking. The crossing flies farther back (around z −4) so perspective keeps that first pass small; the return still approaches the nearby perch. The return climbs slightly, pitches up into a flare, and blends toward Glide as speed falls, then the perch quaternion takes over near contact. Wings fold over 0.55 seconds after foot contact. Airborne anchoring is fixed relative to the body and blends into the animated foot midpoint on approach. Four background birds have independent flap phases; farther birds use slower cadence, higher glide weight, smaller scale and deeper z. Perched head observations use quick eased turns, irregular holds and occasional tilts, evaluated from absolute time for repeatable previews without accumulated bone offsets. The hero starts crossing at 3 seconds, finishes the first pass in 1.25 seconds with a high Flap cadence, stays away for 3 seconds, returns at 7.25 seconds and touches down at 10.05 seconds.

- `src/lib/sky/atmosphere.js`: ray-marched 3D cloud density, directional self-shading, sky palettes and nighttime stars. Lower-resolution offscreen rendering and one adaptive quality adjustment limit GPU cost.
- `src/lib/sky/nature.js`: tapered branch meshes and textured lunar sphere with soft atmospheric edges.
- `src/lib/sky/birds.js`: imported Mesh2Motion CC0 bird, cloned skeletons, authored flight/idle blending, head looks and foot anchoring. No custom bird geometry remains.
- `src/lib/sky/daylight.js`: solar altitude from date and approximate coordinates. Sunset warmth peaks around the solar center reaching -0.833 degrees and fades within about twelve minutes on each side. Polar day and night use actual solar altitude.
- `src/lib/sky/experience.js`: perspective composition, lighting, animation and resource cleanup. Distant sky still uses a one-sided bokeh pass; trees and birds use the Gaussian bloom layer. Mobile has a larger relative bird and no pointer parallax. Reduced motion shows a still perched bird and still clouds/branches.
- `src/lib/sky/foreground.js`: offscreen rendering plus two-pass Gaussian blur so softness extends beyond silhouettes. Perch trees and all birds use the bloom into the main composer.

## Location

One browser request to `https://ipapi.co/json/` estimates location from the visitor's IP. No browser location permission is requested. Only latitude/longitude rounded to whole degrees and a timestamp are kept in session storage, for up to six hours. The provider necessarily receives the visitor's IP. Its availability and quota affect lookup success; the scene falls back to device-clock daylight if the request fails or times out. API documentation: https://ipapi.co/api/

## Assets

- `public/assets/bird-animations.glb`: Mesh2Motion CC0 bird with 55 bones and five animations. See `public/assets/BIRD-LICENSE.md` for source and license. The user approved deviation from the reference species to use a correctly rigged imported bird. The original reference photograph is retained but no longer loaded.
- Moon: the existing `public/assets/moon.png` photograph is projected onto the visible hemisphere of a mesh, with atmospheric edge fading. The moon's placement and phase are art-directed, not an astronomical ephemeris. A NASA map download was unavailable, so no new NASA asset is bundled.
- Cloud density, bark texture and branch geometry are generated in code. Four large corner banks are supplemented by smaller, shallower left/right side banks. Branches stretch and reach farther left. No image-generation service or paid model library was used.
- The previous sprite implementation is preserved under `prototype-webgl/*.sprite-backup.js`; it is no longer loaded by the page.

## Preview and verification

Run `npm run dev` (`npm.cmd run dev` when PowerShell script execution is restricted). In development only, `?sky=day`, `?sky=sunset`, and `?sky=night` preview palettes. Add `&sceneTime=12` to inspect the perched scene. The normal URL uses automatic time and the full entrance.

`npm run build` produces the Next.js production build; `npm start` serves it on port 3000. `npm run test:sky` runs headless Chromium checks against the development server and writes desktop, mobile, palette and landing screenshots under ignored `artifacts/sky/`. Install its browser once with `npx playwright install chromium`. Playwright is a development dependency only.
