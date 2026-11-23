# VisionForge Strategic Roadmap: AI Coding Benchmark Generation

## Milestone Completed: Reusable Feature-Task Strategy & Harbor Integration

### What Has Been Built
1. **Repository Version Baseline**: Initialized and tagged `v0.1.0` (commit `fa51f3e`) as the immutable starting repository version.
2. **Strategy Engine (`src/strategy/feature_task_strategy.js`)**: Encapsulates feature task specifications, contracts, and programmatic Harbor task exporter.
3. **Three Production-Ready Feature Tasks**:
   - `vf_feat_01_cli_benchmark_generator`: Command-line benchmark generator and exporter.
   - `vf_feat_02_api_query_filtering_pagination`: Query filtering (`category`, `difficulty`) and limit/offset pagination.
   - `vf_feat_03_density_reasoning_category`: Core pipeline 5th question family with tie-breaker logic.
4. **Harbor Task Interface Compliance**:
   - Every task has `task.toml` (v1.0 schema), `instruction.md`, `environment/Dockerfile`, `tests/test.sh`, and `solution/solve.sh`.
   - Verifier enforces a two-gate check: existing regression suite + new feature suite, writing Harbor reward to `/logs/verifier/reward.txt`.
5. **Empirical 4-State Validation Matrix (`scripts/validate-strategy-evidence.js`)**:
   - Evaluates:
     - Baseline (Regression PASS, Feature FAIL -> Reward 0)
     - Flawed implementation (Feature FAIL -> Reward 0)
     - Breaking change (Regression FAIL -> Reward 0)
     - Reference solution (Regression PASS, Feature PASS -> Reward 1)
   - Outputs verifiable JSON evidence to `data/validation_evidence_matrix.json`.
6. **Unified Web Dashboard & API**:
   - Live browser dashboard inspecting feature tasks, requirements, Harbor specs, and validation matrix.
   - Direct export endpoint `/api/strategy/export`.
7. **Empirical Docker & Harbor Execution Verified**:
   - Executed `harbor run --path data/harbor-tasks/<task-id> --agent oracle` across all 3 tasks in live Docker containers.
   - All 3 tasks achieved 100% success (`Reward = 1.000`, 0 exceptions).

---

## Next Steps
1. **Agent Benchmarking**: Evaluate models (GPT-4o, Claude 3.5 Sonnet, Gemini 1.5 Pro) through Harbor's Agent harness against these tasks.
2. **Additional Feature Domains**: Author tasks for frontend client features, automated telemetry logging, and persistence layers.
