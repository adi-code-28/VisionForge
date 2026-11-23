# Adding New Harbor Benchmark Tasks

This guide explains how to add a new benchmark task to the VisionForge/HAR­BOR suite in a reusable, configuration‑driven way.

## 1. Directory Layout

```
<repo-root>/
├─ data/
│   └─ harbor-tasks/
│       └─ <task-id>/
│           ├─ task.toml          # Task metadata
│           ├─ spec.json|spec.yaml # Optional structured spec (see below)
│           ├─ reference/
│           │   └─ solve.sh        # Oracle reference solution
│           └─ flawed/
│               ├─ <variant-1>/solve.sh
│               └─ <variant-2>/solve.sh
├─ docs/adding_tasks.md          # This guide
├─ scripts/generate-harbor-feature-tasks.js
└─ ...
```

*Each task lives in its own folder under `data/harbor‑tasks/`.*

## 2. Required Files

| File | Purpose |
|------|---------|
| **task.toml** | Minimal metadata that the `feature_task_strategy.js` engine consumes. Required keys:
| | `id` – unique task identifier (e.g., `vf_feat_04_ui_button`). |
| | `name` – human‑readable description. |
| | `type` – one of `cli`, `api`, `core`, `ui`. |
| | `entry` – relative path to the reference solution script (`reference/solve.sh`). |
| **spec.json** or **spec.yaml** *(optional)* | Structured specification that can be parsed automatically to generate the task folder. Use this for bulk task creation. |
| **reference/solve.sh** | The “oracle” solution that should achieve a reward of 1.0. |
| **flawed/** | Sub‑folders for each buggy variant. The naming convention `<variant‑name>` should be descriptive (e.g., `off_by_one`, `missing_edge_case`). |

## 3. Adding a New Task

1. **Create a folder** under `data/harbor-tasks/` with a unique ID.
   ```bash
   mkdir -p data/harbor-tasks/vf_feat_04_ui_button
   ```
2. **Write `task.toml`**. Example:
   ```toml
   id = "vf_feat_04_ui_button"
   name = "Add Theme‑Toggle Button"
   type = "ui"
   entry = "reference/solve.sh"
   ```
3. **Add the reference solution** (`reference/solve.sh`). This script must bring the repository to a state where the benchmark reward is 1.0.
4. **Add buggy variants** inside `flawed/`:
   ```bash
   mkdir -p data/harbor-tasks/vf_feat_04_ui_button/flawed/off_by_one
   cp reference/solve.sh data/harbor-tasks/vf_feat_04_ui_button/flawed/off_by_one/solve.sh
   # edit the copy to introduce the bug (e.g., change `==` to `=`)
   ```
5. **(Optional) Create a spec file** if you want the task generator to auto‑populate the folder.
   ```json
   {
     "id": "vf_feat_04_ui_button",
     "name": "Add Theme‑Toggle Button",
     "type": "ui",
     "entry": "reference/solve.sh"
   }
   ```
6. **Regenerate the task package** (if you use the generator):
   ```bash
   node scripts/generate-harbor-feature-tasks.js --task vf_feat_04_ui_button
   ```
7. **Validate** the new task:
   ```bash
   npm run validate-strategy-evidence
   npm run verify-all
   ```
   The evidence matrix should now contain rows for the new task and each of its buggy variants.

## 4. Updating the Strategy Engine

`src/feature_task_strategy.js` reads all `task.toml` files under `data/harbor-tasks/`. No code change is required if you follow the layout above. The engine will automatically pick up new tasks on the next run.

## 5. Checklist

- [ ] Folder created under `data/harbor-tasks/`.
- [ ] `task.toml` present and correctly populated.
- [ ] Reference solution (`reference/solve.sh`) works (reward = 1.0).
- [ ] At least two buggy variants added under `flawed/`.
- [ ] `npm run verify-all` passes with the new task.

---

*Tip:* Keep the reference solution deterministic (no random seeds) to ensure reproducible benchmark scores.
