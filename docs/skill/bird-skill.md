---
name: portfolio-bird-animation
description: Maintain and refine the animated birds in this Portfolio V2 repository. Use only for changes to the imported bird asset, animation blending, flight and landing paths, perch behavior, background travelers, bird rendering, or bird-specific regression checks in this project. Do not use for generic bird art, unrelated Three.js work, or other repositories.
metadata:
  short-description: Maintain this portfolio's animated birds
---

# Portfolio Bird Animation

Work only within this repository. Preserve the approved sky direction and the existing imported, rigged bird unless the user explicitly asks to change them.

## Start with project context

Read only the files relevant to the requested change:

- `docs/sky-implementation.md` for approved behavior and art direction.
- `src/lib/sky/birds.js` for model loading, skeleton cloning, clip blending, head movement, foot anchoring, and disposal.
- `src/lib/sky/experience.js` for timing, paths, scale, landing, traveler birds, reduced motion, and rendering.
- `src/components/sky-background.jsx` and `src/app/globals.css` for canvas lifecycle, layering, fallback, and presentation.
- `scripts/verify-bird-fixes.mjs` for bird regressions and `scripts/verify-sky.mjs` for the full scene contract.
- `public/assets/BIRD-LICENSE.md` before replacing or redistributing the bird asset.

Follow the repository `AGENTS.md`. Before changing application code, read the relevant guide under `node_modules/next/dist/docs/` as required there.

## Current project contract

Treat these as invariants unless the user changes the product direction:

- Load `public/assets/bird-animations.glb`; it is the licensed Mesh2Motion CC0 asset documented in `public/assets/BIRD-LICENSE.md`.
- Require the `Flap` and `Idle` clips. Clone the skinned scene with `SkeletonUtils.clone` so each bird has independent animation state.
- Keep the hero bird's separate overlay renderer when available, with the main scene as its fallback.
- The hero bird first crosses the scene, returns to land on the branch, then stays perched. Its feet, rather than the model origin, define the perch anchor.
- Head-look offsets must remain bounded and must not accumulate into the authored animation pose.
- Background travelers leave the viewport completely and remain away; they do not wrap around.
- Reduced motion shows a still perched bird. Hidden tabs pause visible progress, and returning to the tab must not replay the entrance.
- Mobile may alter bird scale and composition, but the bird must remain readable without covering the portfolio heading or controls.
- Dispose mixers, skeletons, materials, geometries, textures, animation frames, timers, and event listeners created by the scene.

## Make a focused change

1. Identify whether the issue belongs to the bird rig, the scene path/composition, or the canvas/rendering lifecycle.
2. Reproduce it with the development preview controls when possible: `?sky=day`, `?sky=sunset`, `?sky=night`, and `&sceneTime=<seconds>`.
3. Change the smallest responsible module. Preserve authored clips and asset licensing instead of rebuilding bird geometry or animation in code.
4. Update `docs/sky-implementation.md` only when the approved behavior, asset, timing, or architecture changes.

When tuning motion, judge the full sequence rather than a single frame. The bird should carry momentum through the crossing, brake progressively on approach, settle onto both feet without sliding, and transition cleanly from `Flap` to `Idle`. Keep head turns irregular and subtle. Check the silhouette, wing clipping, branch contact, and visibility at mobile, desktop, and wide viewport sizes.

## Verify the result

Run checks in proportion to the change:

```powershell
npm.cmd run lint
npm.cmd run build
```

For runtime checks, start the development server in one terminal, then run the relevant browser checks in another:

```powershell
npm.cmd run dev
npm.cmd run test:birds
npm.cmd run test:sky
```

Use `test:birds` for head-pose accumulation and traveler exit behavior. Use `test:sky` when timing, landing, palettes, responsive composition, reduced motion, location fallback, or rendering changes. Inspect the generated screenshots under `artifacts/sky/` when visual behavior changed.

If a check cannot run because the browser or development server is unavailable, report that limitation precisely. Do not replace a failed visual or runtime check with confidence based only on source inspection.

## Completion criteria

Before handing off a bird-related change, confirm the requested behavior, relevant viewport sizes, reduced-motion behavior, and disposal path. Report the changed files, the observed result, and the exact checks that passed.
