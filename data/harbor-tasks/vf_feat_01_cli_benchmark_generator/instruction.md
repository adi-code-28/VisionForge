# Feature Development: CLI Benchmark Generator

## Context
VisionForge is a deterministic benchmark generator. Currently, tasks are only generated through the HTTP API. Developers need a native CLI executable so benchmarks can be scripted, piped into evaluators, and exported directly from terminal sessions.

## Objective
Implement `bin/visionforge.js` and configure `package.json` so the tool can be run via `node bin/visionforge.js` or via global/npm link.

## Requirements
1. **File Location**: Create `bin/visionforge.js` with a Node shebang (`#!/usr/bin/env node`).
2. **Package Configuration**: Update `package.json` to add the `"bin"` field:
   ```json
   "bin": {
     "visionforge": "bin/visionforge.js"
   }
   ```
3. **CLI Options**:
   - `--seed <int>`: scene seed (default: 42).
   - `--count <int>`: number of tasks (default: 4).
   - `--category <string>`: category (`all`, `counting`, `spatial`, `attribute`, `multi_object`, `density`; default: `all`).
   - `--difficulty <string>`: difficulty (`easy`, `medium`, `hard`; default: `medium`).
   - `--format <json|summary>`: output format (default: `json`).
   - `--out <filepath>`: optional file path to save output tasks.
4. **Output Behavior**:
   - When `--format json` (default): Print the generated tasks array as formatted JSON to stdout.
   - When `--format summary`: Print `Total: <N>, Valid: <M>` to stdout.
   - When `--out <filepath>`: Save the tasks JSON to the specified file path.
5. **Exit Codes & Validation**:
   - Exit with code `0` on success.
   - Exit with code `1` and print an error message to stderr if `--count` is less than 1 or not a number, or if `--category` or `--difficulty` is invalid.
6. **Regression Protection**:
   - Must not break existing pipeline modules or existing tests (`tests/pipeline.test.js`).
