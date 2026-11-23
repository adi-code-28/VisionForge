const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const REPO_ROOT = path.resolve(__dirname, '../..');
const BASE_VERSION = 'v0.1.0';
const BASE_COMMIT = 'fa51f3e';

const FEATURE_TASKS = [
  {
    id: 'vf_feat_01_cli_benchmark_generator',
    name: 'visionforge/cli-benchmark-generator',
    title: 'CLI Benchmark Generator and JSON/Summary Exporter',
    category: 'cli_tooling',
    difficulty: 'medium',
    startingVersion: BASE_VERSION,
    baseCommit: BASE_COMMIT,
    summary: 'Implement a command-line interface executable bin/visionforge.js to generate synthetic benchmarks directly from terminal.',
    instruction: `# Feature Development: CLI Benchmark Generator

## Context
VisionForge is a deterministic benchmark generator. Currently, tasks are only generated through the HTTP API. Developers need a native CLI executable so benchmarks can be scripted, piped into evaluators, and exported directly from terminal sessions.

## Objective
Implement \`bin/visionforge.js\` and configure \`package.json\` so the tool can be run via \`node bin/visionforge.js\` or via global/npm link.

## Requirements
1. **File Location**: Create \`bin/visionforge.js\` with a Node shebang (\`#!/usr/bin/env node\`).
2. **Package Configuration**: Update \`package.json\` to add the \`"bin"\` field:
   \`\`\`json
   "bin": {
     "visionforge": "bin/visionforge.js"
   }
   \`\`\`
3. **CLI Options**:
   - \`--seed <int>\`: scene seed (default: 42).
   - \`--count <int>\`: number of tasks (default: 4).
   - \`--category <string>\`: category (\`all\`, \`counting\`, \`spatial\`, \`attribute\`, \`multi_object\`, \`density\`; default: \`all\`).
   - \`--difficulty <string>\`: difficulty (\`easy\`, \`medium\`, \`hard\`; default: \`medium\`).
   - \`--format <json|summary>\`: output format (default: \`json\`).
   - \`--out <filepath>\`: optional file path to save output tasks.
4. **Output Behavior**:
   - When \`--format json\` (default): Print the generated tasks array as formatted JSON to stdout.
   - When \`--format summary\`: Print \`Total: <N>, Valid: <M>\` to stdout.
   - When \`--out <filepath>\`: Save the tasks JSON to the specified file path.
5. **Exit Codes & Validation**:
   - Exit with code \`0\` on success.
   - Exit with code \`1\` and print an error message to stderr if \`--count\` is less than 1 or not a number, or if \`--category\` or \`--difficulty\` is invalid.
6. **Regression Protection**:
   - Must not break existing pipeline modules or existing tests (\`tests/pipeline.test.js\`).
`,
    testSuitePath: 'tests/feature-suites/cli_export.test.js',
    testFileName: 'cli_export.test.js',
    solutionDir: 'data/feature-reference-solutions/task_01_cli',
    targetFiles: ['bin/visionforge.js', 'package.json']
  },
  {
    id: 'vf_feat_02_api_query_filtering_pagination',
    name: 'visionforge/api-query-filtering-pagination',
    title: 'API Query Filtering and Pagination for Task Listing',
    category: 'api_backend',
    difficulty: 'medium',
    startingVersion: BASE_VERSION,
    baseCommit: BASE_COMMIT,
    summary: 'Extend server.js GET /api/tasks with query filters (category, difficulty) and limit/offset pagination envelopes.',
    instruction: `# Feature Development: API Query Filtering & Pagination

## Context
In VisionForge, \`GET /api/tasks\` currently returns all tasks held in server memory as a flat list (\`{ tasks: [...] }\`). As benchmark suites grow large, clients need the ability to filter tasks by category or difficulty and retrieve results in paginated pages.

## Objective
Update \`server.js\` to parse URL search parameters and implement query-based filtering and pagination on \`GET /api/tasks\`.

## Requirements
1. **Endpoint**: \`GET /api/tasks\`
2. **Query Parameters**:
   - \`category\`: Filter tasks matching this exact category (\`counting\`, \`spatial\`, \`attribute\`, \`multi_object\`, \`density\`).
   - \`difficulty\`: Filter tasks matching this difficulty (\`easy\`, \`medium\`, \`hard\`).
   - \`limit\`: Max number of tasks to return.
   - \`offset\`: Zero-based start index in the filtered list.
3. **Response Formats**:
   - **Pagination Envelope**: When either \`limit\` or \`offset\` query parameter is provided:
     \`\`\`json
     {
       "total": <number of tasks matching filters before pagination>,
       "count": <number of tasks in this page>,
       "offset": <offset used>,
       "limit": <limit used>,
       "tasks": [<page of tasks>]
     }
     \`\`\`
   - **Backward Compatibility**: When neither \`limit\` nor \`offset\` is supplied, return:
     \`\`\`json
     {
       "tasks": [<all tasks matching category/difficulty filters>]
     }
     \`\`\`
4. **Validation & Error Handling**:
   - If \`offset\` is less than 0 or not an integer, return HTTP 400 Bad Request with \`{ "error": "..." }\`.
   - If \`limit\` is less than or equal to 0 or not an integer, return HTTP 400 Bad Request with \`{ "error": "..." }\`.
5. **Regression Protection**:
   - Do not break existing static asset serving or generation endpoints (\`tests/pipeline.test.js\`).
`,
    testSuitePath: 'tests/feature-suites/api_pagination.test.js',
    testFileName: 'api_pagination.test.js',
    solutionDir: 'data/feature-reference-solutions/task_02_api_pagination',
    targetFiles: ['server.js']
  },
  {
    id: 'vf_feat_03_density_reasoning_category',
    name: 'visionforge/density-reasoning-category',
    title: 'Density Reasoning Category & Validation Rules',
    category: 'core_pipeline',
    difficulty: 'hard',
    startingVersion: BASE_VERSION,
    baseCommit: BASE_COMMIT,
    summary: 'Add a 5th question family "density" to src/pipeline.js with deterministic ground truth, tie-breaking, and validation checks.',
    instruction: `# Feature Development: Density Reasoning Question Category

## Context
VisionForge currently supports 4 question families: counting, spatial, attribute, and multi_object. To evaluate advanced reasoning in AI coding models and multimodal systems, we must introduce a 5th category: \`density\`.

## Objective
Update \`src/pipeline.js\` to integrate the \`density\` category into scene analysis, benchmark generation, and task validation.

## Requirements
1. **Category Registration**:
   - Add \`'density'\` to the exported \`categories\` list in \`src/pipeline.js\`:
     \`['counting', 'spatial', 'attribute', 'multi_object', 'density']\`.
2. **Question Logic**:
   - Vehicle density in a lane is defined by the count of objects assigned to that lane in the scene.
   - **Case A (Unique Winner)**: If exactly one lane has the maximum vehicle count:
     - Question: \`"Which lane has the highest vehicle density?"\`
     - Answer: \`laneLabel(winningLane)\` (e.g. \`"Lane 2"\`).
     - Evidence: \`{ maxDensityLane: number, laneCounts: number[] }\`.
   - **Case B (Tie)**: If multiple lanes tie for the maximum vehicle count:
     - Question: \`"How many vehicles are in the densest lane?"\`
     - Answer: \`String(maxCount)\` (e.g. \`"3"\`).
     - Evidence: \`{ maxDensityCount: number, tiedLanes: number[], laneCounts: number[] }\`.
3. **Task Validation**:
   - \`validateTask(task)\` must accept \`category === 'density'\` as valid (no \`unknown_category\` failure).
4. **Deterministic Behavior**:
   - Tasks must produce deterministic questions and answers for identical seeds.
5. **Regression Protection**:
   - Must not alter behavior of existing categories (\`counting\`, \`spatial\`, \`attribute\`, \`multi_object\`) or fail \`tests/pipeline.test.js\`.
`,
    testSuitePath: 'tests/feature-suites/density_category.test.js',
    testFileName: 'density_category.test.js',
    solutionDir: 'data/feature-reference-solutions/task_03_density_category',
    targetFiles: ['src/pipeline.js']
  }
];

function exportHarborFeatureTask(taskDef, outputRootDir) {
  const taskDir = path.join(outputRootDir, taskDef.id);
  const envDir = path.join(taskDir, 'environment');
  const testsDir = path.join(taskDir, 'tests');
  const solutionDir = path.join(taskDir, 'solution');

  fs.mkdirSync(envDir, { recursive: true });
  fs.mkdirSync(testsDir, { recursive: true });
  fs.mkdirSync(solutionDir, { recursive: true });

  // Baseline files into environment for Docker build context
  if (fs.existsSync(path.join(REPO_ROOT, 'package.json'))) {
    fs.copyFileSync(path.join(REPO_ROOT, 'package.json'), path.join(envDir, 'package.json'));
  }
  if (fs.existsSync(path.join(REPO_ROOT, 'server.js'))) {
    fs.copyFileSync(path.join(REPO_ROOT, 'server.js'), path.join(envDir, 'server.js'));
  }
  for (const dirName of ['src', 'public', 'tests']) {
    const srcPath = path.join(REPO_ROOT, dirName);
    const destPath = path.join(envDir, dirName);
    if (fs.existsSync(srcPath)) {
      fs.cpSync(srcPath, destPath, { recursive: true, force: true });
    }
  }

  // 1. task.toml following Harbor Framework specification
  const tomlContent = `schema_version = "1.0"

[task]
name = "${taskDef.name}"
keywords = ["coding", "software-engineering", "node", "feature-development", "${taskDef.category}"]

[metadata]
difficulty = "${taskDef.difficulty}"
category = "${taskDef.category}"
starting_version = "${taskDef.startingVersion}"
base_commit = "${taskDef.baseCommit}"
title = "${taskDef.title}"

[verifier]
timeout_sec = 60.0
environment_mode = "shared"

[agent]
timeout_sec = 300.0

[environment]
build_timeout_sec = 300.0
cpus = 2
memory = "2G"
workdir = "/app"
`;
  fs.writeFileSync(path.join(taskDir, 'task.toml'), tomlContent, 'utf8');

  // 2. instruction.md
  fs.writeFileSync(path.join(taskDir, 'instruction.md'), taskDef.instruction, 'utf8');

  // 3. environment/Dockerfile
  const dockerfileContent = `# Harbor Task Environment for ${taskDef.id}
FROM node:22-alpine

WORKDIR /app

# Install git, bash, coreutils
RUN apk add --no-cache git bash coreutils

# Copy repository at baseline v0.1.0
COPY package.json server.js ./
COPY src/ ./src/
COPY public/ ./public/
COPY tests/ ./tests/

# Initialize git tracking at base commit
RUN git init && \\
    git config user.name "Evaluation Baseline" && \\
    git config user.email "baseline@eval.internal" && \\
    git add . && \\
    git commit -m "baseline ${taskDef.startingVersion}" && \\
    git tag ${taskDef.startingVersion}

# Ensure test and data directories exist
RUN mkdir -p /logs/verifier data

CMD ["/bin/bash"]
`;
  fs.writeFileSync(path.join(envDir, 'Dockerfile'), dockerfileContent, 'utf8');

  // 4. tests/test.sh & tests/<testFileName>
  const featureTestContent = fs.readFileSync(path.join(REPO_ROOT, taskDef.testSuitePath), 'utf8');
  fs.writeFileSync(path.join(testsDir, taskDef.testFileName), featureTestContent, 'utf8');

  const testShContent = `#!/bin/sh
set -e
mkdir -p /logs/verifier data

echo "========================================================"
echo "HARBOR EVALUATION VERIFIER: ${taskDef.id}"
echo "Starting Repository Version: ${taskDef.startingVersion} (${taskDef.baseCommit})"
echo "========================================================"

# If running in Harbor container, ensure tests are in tests directory
if [ -d "/tests" ] && [ -d "tests" ]; then
  cp -f /tests/*.test.js tests/ 2>/dev/null || true
fi

echo ""
echo "[CHECK 1/2] Running Regression Test Suite..."
if node --test tests/pipeline.test.js > /logs/verifier/regression.log 2>&1; then
  echo "✔ PASS: Regression tests passed. Existing functionality is protected."
else
  echo "✖ FAIL: Regression tests failed. Existing functionality was broken."
  cat /logs/verifier/regression.log
  echo 0 > /logs/verifier/reward.txt
  exit 1
fi

echo ""
echo "[CHECK 2/2] Running New Feature Verification Suite (${taskDef.testFileName})..."
if node --test tests/${taskDef.testFileName} > /logs/verifier/feature.log 2>&1; then
  echo "✔ PASS: Feature tests passed. Requirements satisfied."
  echo 1 > /logs/verifier/reward.txt
  echo "========================================================"
  echo "EVALUATION RESULT: SUCCESS (Reward = 1)"
  echo "========================================================"
  exit 0
else
  echo "✖ FAIL: Feature tests failed. Feature is missing or incorrect."
  cat /logs/verifier/feature.log
  echo 0 > /logs/verifier/reward.txt
  echo "========================================================"
  echo "EVALUATION RESULT: FAILURE (Reward = 0)"
  echo "========================================================"
  exit 1
fi
`;
  fs.writeFileSync(path.join(testsDir, 'test.sh'), testShContent, 'utf8');

  // 5. solution/
  const solveDirSource = path.join(REPO_ROOT, taskDef.solutionDir);
  if (fs.existsSync(solveDirSource)) {
    fs.cpSync(solveDirSource, solutionDir, { recursive: true, force: true });
  }

  return {
    taskId: taskDef.id,
    path: path.relative(REPO_ROOT, taskDir).replace(/\\/g, '/'),
    title: taskDef.title,
    category: taskDef.category,
    difficulty: taskDef.difficulty,
    startingVersion: taskDef.startingVersion,
    exportedAt: new Date().toISOString()
  };
}

module.exports = {
  FEATURE_TASKS,
  exportHarborFeatureTask,
  BASE_VERSION,
  BASE_COMMIT
};
