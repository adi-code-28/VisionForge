# VisionForge: AI Coding Benchmark Strategy & Harbor Task Platform

A production-grade, reusable strategy for generating realistic software feature-development tasks to evaluate autonomous AI coding systems (such as Claude Code, Codex, Devin, and Harbor Agents).

The platform transforms a working software repository into standardized evaluation packages adhering to the **[Harbor Task Interface](https://www.harborframework.com/)**, complete with baseline version pinning, isolated Docker environments, dual-gate verification (feature acceptance + regression protection), and empirical validation matrices.

---

## 1. Quick Start

### A. Run Dashboard Locally
```powershell
npm start
```
Visit `http://localhost:3000` to inspect:
- **AI Coding Feature Tasks**: Requirements (`instruction.md`), Harbor configs (`task.toml`), Dockerfiles, and reference solutions (`solve.sh`).
- **Validation Evidence Matrix**: 4-state empirical proof showing feature tests detect missing/incorrect behavior and regression suites protect existing functionality.
- **Legacy Visual QA Tasks**: The initial prototype mode.

### B. Run the Full Strategy & 4-State Validation Evidence Matrix
To execute the automated evaluation harness across all tasks:
```powershell
.\scripts\run-feature-benchmark-eval.ps1
```
Or with Node.js directly:
```powershell
node scripts/generate-harbor-feature-tasks.js
node scripts/validate-strategy-evidence.js
```

---

## 2. Reusable Feature-Task Generation Strategy

Generating realistic evaluation tasks for AI coding agents requires moving beyond synthetic puzzles or LeetCode snippets. Our strategy follows a 5-stage lifecycle:

```
┌─────────────────────────┐
│ 1. Baseline Pinning     │  Identify starting version (v0.1.0 / fa51f3e) & regression suite
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│ 2. Scoping & Spec       │  Author realistic SWE requirements in instruction.md
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│ 3. Harbor Packaging     │  Generate task.toml, Dockerfile, solve.sh, and test.sh
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│ 4. Dual Verifier Gate   │  Check 1: Regression (tests/pipeline.test.js)
│                         │  Check 2: Acceptance (tests/<feature>.test.js)
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│ 5. Empirical 4-State    │  Validate Baseline (FAIL), Flawed (FAIL),
│    Evidence Matrix      │  Regression Break (FAIL), Reference Solution (PASS -> Reward=1)
└─────────────────────────┘
```

---

## 3. Generated Harbor Task Packages

All packages are exported to `data/harbor-tasks/` and follow the exact [Harbor Task Specification](https://www.harborframework.com/):

| Task ID | Domain | Starting Version | Target Files | Verification Suite |
| :--- | :--- | :--- | :--- | :--- |
| `vf_feat_01_cli_benchmark_generator` | CLI & Tooling | `v0.1.0` (`fa51f3e`) | `bin/visionforge.js`, `package.json` | `tests/cli_export.test.js` |
| `vf_feat_02_api_query_filtering_pagination` | Backend API | `v0.1.0` (`fa51f3e`) | `server.js` | `tests/api_pagination.test.js` |
| `vf_feat_03_density_reasoning_category` | Core Pipeline | `v0.1.0` (`fa51f3e`) | `src/pipeline.js` | `tests/density_category.test.js` |

### Harbor Task Package Structure
```text
data/harbor-tasks/<task_id>/
├── task.toml             # Harbor v1.0 schema: metadata, timeouts, resource limits
├── instruction.md        # Natural language specification and acceptance criteria
├── environment/
│   └── Dockerfile        # Isolated Node 22 Alpine container at baseline v0.1.0
├── solution/
│   └── solve.sh          # Reference implementation script
└── tests/
    ├── test.sh           # Verifier script: regression + feature check, reward logger
    └── <feature>.test.js # Dedicated hidden feature verification suite
```

---

## 4. Empirical Validation Evidence Matrix

Every task was verified across **4 distinct code states** by `scripts/validate-strategy-evidence.js`:

| State | Repository Condition | Regression Suite | Feature Suite | Harbor Reward | Invariant Proven |
| :--- | :--- | :---: | :---: | :---: | :--- |
| **1. Baseline** | Unmodified repo (`v0.1.0`) | **PASS** | **FAIL** | **0** | Feature tests detect missing behavior |
| **2. Flawed** | Incomplete/buggy solution | **PASS** | **FAIL** | **0** | Feature tests detect incorrect behavior |
| **3. Breaking** | Breaking change to existing logic | **FAIL** | **FAIL** | **0** | Regression checks protect existing code |
| **4. Solution** | Reference solution applied | **PASS** | **PASS** | **1** | Implementation satisfies all requirements |

---

## 5. Codex Build Audit & Gap Analysis

The initial build done by Codex created **VisionForge**, a synthetic visual reasoning QA generator. While mathematically sound, it did not satisfy the hackathon prompt's core objective:

| Requirement | Codex's Initial Build | Our Production Strategy |
| :--- | :--- | :--- |
| **Target Evaluated** | Multimodal/Vision QA (answers to SVG scenes) | **AI Coding Systems** (SWE feature development) |
| **Agent Action** | Write static text string to `/app/answer.txt` | **Implement software features** in the codebase |
| **Starting Version** | Untracked Alpine container (`COPY scene.svg`) | **Pinned repository commit** (`v0.1.0` / `fa51f3e`) |
| **Regression Checks** | **None** (zero repo code execution) | **Dual-stage verifier** protecting existing tests |
| **Testing Language** | Shell string comparison (`[ "$actual" = "$expected" ]`) | **Native repository test runner** (`node:test`) |
| **Validation Evidence** | Unit tests for SVG generator only | **Automated 4-state empirical proof matrix** |

---

## 6. Running Harbor CLI

When Docker and Harbor CLI are available (install with `pip install harbor` or `uv tool install harbor`):
```bash
harbor run --path data/harbor-tasks/vf_feat_01_cli_benchmark_generator --agent oracle
```
Harbor executes the container, runs the reference solution, executes `tests/test.sh`, and validates the reward written to `/logs/verifier/reward.txt`.
