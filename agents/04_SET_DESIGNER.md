# SET DESIGNER
Files: `components/sets/*`, `components/props/*`, `RomanDioramaStage.tsx`.
Miko sets are low-detail and low-contrast: big flat painted shapes, thin dark outline on every prop, 3-12 props per set, one visible light source with warm glow and cool shadow side, one colour mood per scene (palettes in `sets/textures.ts` MIKO_PALETTES). No busy brick/frieze patterns in focus. Windows dim, not blown out.
Background must stay calm: background change <= 0.6 per frame (tools/compare_to_miko.py).
Add a palette per new set; keep palettes consistent across all sets of one story.
