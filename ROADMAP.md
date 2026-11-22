# VisionForge build roadmap

## Definition of done (MVP)

VisionForge generates reproducible urban visual scenes, derives questions and answers solely from scene metadata, validates each task, exports a valid Harbor task package, and shows the traceable lifecycle in a dashboard.

## What is implemented now

- Seeded urban-scene generator with lanes, vehicles, colors, crosswalks, traffic signal, and obstruction.
- Deterministic SVG renderer—no generative-image ambiguity.
- Four question families: counting, spatial, attribute, and multi-object reasoning.
- Metadata-derived ground truth and validation gate.
- Harbor exporter that writes `task.toml`, `instruction.md`, `environment/Dockerfile`, `tests/test.sh`, `solution/solve.sh`, and `scene.svg`.
- Browser dashboard for generation, evidence inspection, ground-truth reveal, and Harbor export.

## Execution order

1. **Now — prove the core loop:** run `npm test`, start the app, generate a balanced suite, then export one task. This is the demo backbone.
2. **Next — run Harbor for real:** install Python 3.12+, Docker, and Harbor; execute `harbor run --path data/harbor-tasks/<task-id> --agent oracle`. Do this before adding model APIs.
3. **Evaluation:** add an adapter for a selected vision model, normalize answers, and save per-task results.
4. **Analytics:** add accuracy by category/difficulty and error labels (`counting`, `spatial`, `attribute`, `multi_object`, `invalid_response`).
5. **Polish:** add scene-template variants and a two-minute scripted demo.

## Important constraints

This workstation currently lacks both a working Python installation and Docker, so actual Harbor container execution is intentionally the next environment-dependent milestone. The generated package follows Harbor’s required task layout and can be executed once those prerequisites are installed.

## Judge demo script

1. Generate 8 tasks with seed 42.
2. Open a spatial task; ask the judge to answer from the rendered evidence.
3. Reveal its metadata-derived answer and green validation result.
4. Export it as a Harbor task; show the package path.
5. Run the package through Harbor (after prerequisites are available), then show its verifier reward.
