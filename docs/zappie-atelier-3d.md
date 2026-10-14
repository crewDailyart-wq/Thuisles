# Zappies atelier — 3D prototype

Entry: `/atelier-prototype`, linked from the existing atelier heading. The prototype is isolated from accounts, progress and purchases; choices are React state only and disappear on reload.

- Three.js WebGL room with separate geometry for marble terrace, gold arches, display cabinets, shelves, podium, sea and distant fantasy islands.
- Four fixed camera positions: podium, hats, colours and accessories. Smooth movement, or immediate transitions with reduced motion.
- Six 3D objects selectable directly by raycast or by accessible buttons anchored to their world positions. One item per category; reset and return-to-podium controls.
- Existing Zappie SVG is used as a sprite in the 3D scene. No Blender/GLB asset was available in the inspected repository. The `mascotGroup` in `scene.ts` is the replacement point for the owner's model. This prototype does not represent the finished 3D character.
- Responsive camera distance, touch controls, keyboard controls and an explicit WebGL failure state.
- Scene loaded only on this route. Renderer, observers, listeners, materials and geometry cleaned up on unmount; hidden/offscreen tabs skip rendering. Device pixel ratio capped at 1.6.

Files: `src/components/zappie/atelier/{Atelier3D.tsx,scene.ts,model.ts,atelier.css}`.

Verification: `npx next typegen && npx tsc --noEmit`; targeted ESLint; `scripts/atelier-preview-test.mjs` after a production build. The workflow uploads desktop/tablet/mobile screenshots and checks outfit changes, reset, keyboard navigation, reload, no local storage writes and WebGL failure. Software-rendered CI is not a performance benchmark for real school tablets.

## Material study 01

`/atelier-prototype/studie` is an isolated art-direction slice: one detailed pedestal and one display cabinet. It intentionally has no character or completed fantasy backdrop. Deep blue clearcoat, gold fittings, amber light ports, emissive cyan rings, a planar reflected floor and HDR bloom are rendered from geometry. Three fixed inspection views and a bloom toggle help review the materials. Rendering happens only after a view, size or glow change. No choices are stored.
