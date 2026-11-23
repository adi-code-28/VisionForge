# Feature Development: Density Reasoning Question Category

## Context
VisionForge currently supports 4 question families: counting, spatial, attribute, and multi_object. To evaluate advanced reasoning in AI coding models and multimodal systems, we must introduce a 5th category: `density`.

## Objective
Update `src/pipeline.js` to integrate the `density` category into scene analysis, benchmark generation, and task validation.

## Requirements
1. **Category Registration**:
   - Add `'density'` to the exported `categories` list in `src/pipeline.js`:
     `['counting', 'spatial', 'attribute', 'multi_object', 'density']`.
2. **Question Logic**:
   - Vehicle density in a lane is defined by the count of objects assigned to that lane in the scene.
   - **Case A (Unique Winner)**: If exactly one lane has the maximum vehicle count:
     - Question: `"Which lane has the highest vehicle density?"`
     - Answer: `laneLabel(winningLane)` (e.g. `"Lane 2"`).
     - Evidence: `{ maxDensityLane: number, laneCounts: number[] }`.
   - **Case B (Tie)**: If multiple lanes tie for the maximum vehicle count:
     - Question: `"How many vehicles are in the densest lane?"`
     - Answer: `String(maxCount)` (e.g. `"3"`).
     - Evidence: `{ maxDensityCount: number, tiedLanes: number[], laneCounts: number[] }`.
3. **Task Validation**:
   - `validateTask(task)` must accept `category === 'density'` as valid (no `unknown_category` failure).
4. **Deterministic Behavior**:
   - Tasks must produce deterministic questions and answers for identical seeds.
5. **Regression Protection**:
   - Must not alter behavior of existing categories (`counting`, `spatial`, `attribute`, `multi_object`) or fail `tests/pipeline.test.js`.
