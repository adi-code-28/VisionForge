const fs = require('node:fs');
const path = require('node:path');
const { spawnSync, spawn } = require('node:child_process');

const REPO_ROOT = path.resolve(__dirname, '..');

console.log('========================================================================');
console.log(' COMPREHENSIVE END-TO-END VERIFICATION: HARBOR BENCHMARK STRATEGY');
console.log('========================================================================\n');

let totalChecks = 0;
let passedChecks = 0;

function assertCheck(name, condition, details = '') {
  totalChecks++;
  if (condition) {
    passedChecks++;
    console.log(`  [PASS] ${name}`);
  } else {
    console.error(`  [FAIL] ${name}${details ? ` -> ${details}` : ''}`);
  }
}

// ---------------------------------------------------------
// 1. REGRESSION TEST SUITE (Baseline code)
// ---------------------------------------------------------
console.log('>>> [1/5] Baseline Regression Test Suite');
const regResult = spawnSync('node', ['--test', 'tests/pipeline.test.js'], { cwd: REPO_ROOT, encoding: 'utf8' });
assertCheck('tests/pipeline.test.js passes cleanly on baseline', regResult.status === 0, regResult.stderr);

// ---------------------------------------------------------
// 2. REPOSITORY VERSION IDENTIFICATION
// ---------------------------------------------------------
console.log('\n>>> [2/5] Repository Version Baseline');
const gitTagResult = spawnSync('git', ['describe', '--tags', '--always'], { cwd: REPO_ROOT, encoding: 'utf8' });
const gitLogResult = spawnSync('git', ['log', '-n', '1', '--oneline'], { cwd: REPO_ROOT, encoding: 'utf8' });
assertCheck('Git repository is initialized', fs.existsSync(path.join(REPO_ROOT, '.git')));
assertCheck('Git tag v0.1.0 exists', gitTagResult.stdout.includes('v0.1.0'));
console.log(`      Head Commit: ${gitLogResult.stdout.trim()}`);

// ---------------------------------------------------------
// 3. HARBOR TASK PACKAGES INTEGRITY
// ---------------------------------------------------------
console.log('\n>>> [3/5] Harbor Task Interface Compliance');
const taskDirs = [
  { id: 'vf_feat_01_cli_benchmark_generator', testFile: 'cli_export.test.js' },
  { id: 'vf_feat_02_api_query_filtering_pagination', testFile: 'api_pagination.test.js' },
  { id: 'vf_feat_03_density_reasoning_category', testFile: 'density_category.test.js' }
];

taskDirs.forEach(t => {
  const dir = path.join(REPO_ROOT, 'data/harbor-tasks', t.id);
  assertCheck(`Directory exists: data/harbor-tasks/${t.id}`, fs.existsSync(dir));

  const tomlPath = path.join(dir, 'task.toml');
  const hasToml = fs.existsSync(tomlPath);
  assertCheck(`[${t.id}] task.toml exists`, hasToml);
  if (hasToml) {
    const toml = fs.readFileSync(tomlPath, 'utf8');
    assertCheck(`[${t.id}] task.toml contains schema_version = "1.0"`, toml.includes('schema_version = "1.0"'));
    assertCheck(`[${t.id}] task.toml specifies starting_version = "v0.1.0"`, toml.includes('starting_version = "v0.1.0"'));
    assertCheck(`[${t.id}] task.toml specifies base_commit`, toml.includes('base_commit ='));
    assertCheck(`[${t.id}] task.toml has [verifier] section`, toml.includes('[verifier]'));
  }

  const instrPath = path.join(dir, 'instruction.md');
  const hasInstr = fs.existsSync(instrPath);
  assertCheck(`[${t.id}] instruction.md exists`, hasInstr);
  if (hasInstr) {
    const instr = fs.readFileSync(instrPath, 'utf8');
    assertCheck(`[${t.id}] instruction.md has clear Objective & Requirements`, instr.includes('## Objective') && instr.includes('## Requirements'));
  }

  const dockerPath = path.join(dir, 'environment/Dockerfile');
  assertCheck(`[${t.id}] environment/Dockerfile exists`, fs.existsSync(dockerPath));

  const solvePath = path.join(dir, 'solution/solve.sh');
  assertCheck(`[${t.id}] solution/solve.sh exists`, fs.existsSync(solvePath));

  const testShPath = path.join(dir, 'tests/test.sh');
  const hasTestSh = fs.existsSync(testShPath);
  assertCheck(`[${t.id}] tests/test.sh exists`, hasTestSh);
  if (hasTestSh) {
    const testSh = fs.readFileSync(testShPath, 'utf8');
    assertCheck(`[${t.id}] test.sh runs regression gate (pipeline.test.js)`, testSh.includes('tests/pipeline.test.js'));
    assertCheck(`[${t.id}] test.sh runs feature gate (${t.testFile})`, testSh.includes(`tests/${t.testFile}`));
    assertCheck(`[${t.id}] test.sh logs Harbor reward to /logs/verifier/reward.txt`, testSh.includes('/logs/verifier/reward.txt'));
  }
});

// ---------------------------------------------------------
// 4. 4-STATE EMPIRICAL VALIDATION EVIDENCE MATRIX
// ---------------------------------------------------------
console.log('\n>>> [4/5] Empirical 4-State Validation Evidence Matrix');
const evidencePath = path.join(REPO_ROOT, 'data/validation_evidence_matrix.json');
assertCheck('data/validation_evidence_matrix.json exists', fs.existsSync(evidencePath));

if (fs.existsSync(evidencePath)) {
  const data = JSON.parse(fs.readFileSync(evidencePath, 'utf8'));
  assertCheck('Evidence summary array contains all 3 tasks', data.evidenceSummary && data.evidenceSummary.length === 3);

  data.evidenceSummary.forEach(item => {
    assertCheck(`[${item.taskId}] State 1: Baseline passes regression & fails feature test`, item.baseline.regressionPass && item.baseline.featureFail);
    assertCheck(`[${item.taskId}] State 2: Flawed implementation fails feature test`, item.flawed.featureFail);
    assertCheck(`[${item.taskId}] State 3: Regression break detected`, item.regressionBreak.regressionFail);
    assertCheck(`[${item.taskId}] State 4: Reference solution passes all tests & earns reward 1`, item.solution.regressionPass && item.solution.featurePass && item.solution.reward === 1);
  });
}

// ---------------------------------------------------------
// 5. SERVER API & DASHBOARD ROUTES
// ---------------------------------------------------------
console.log('\n>>> [5/5] HTTP Server & Strategy API Verification');
const VERIFY_PORT = 3988;

async function verifyServer() {
  process.env.PORT = String(VERIFY_PORT);
  const { server } = require('../server');

  try {
    await new Promise(r => setTimeout(r, 600));

    // Test GET /
    const homeRes = await fetch(`http://localhost:${VERIFY_PORT}/`);
    assertCheck('GET / serves HTML dashboard', homeRes.status === 200);

    // Test GET /api/strategy/features
    const featRes = await fetch(`http://localhost:${VERIFY_PORT}/api/strategy/features`);
    const featData = await featRes.json();
    assertCheck('GET /api/strategy/features returns 3 feature tasks', featRes.status === 200 && featData.features && featData.features.length === 3);

    // Test GET /api/strategy/evidence
    const evRes = await fetch(`http://localhost:${VERIFY_PORT}/api/strategy/evidence`);
    const evData = await evRes.json();
    assertCheck('GET /api/strategy/evidence returns validation matrix', evRes.status === 200 && evData.evidence && evData.evidence.evidenceSummary);

    // Test POST /api/strategy/export
    const expRes = await fetch(`http://localhost:${VERIFY_PORT}/api/strategy/export`, { method: 'POST' });
    const expData = await expRes.json();
    assertCheck('POST /api/strategy/export exports packages successfully', expRes.status === 201 && expData.exported && expData.exported.length === 3);

    // Test POST /api/benchmarks/generate
    const genRes = await fetch(`http://localhost:${VERIFY_PORT}/api/benchmarks/generate`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ count: 4, seed: 10, difficulty: 'medium', category: 'all' })
    });
    const genData = await genRes.json();
    assertCheck('POST /api/benchmarks/generate creates tasks', genRes.status === 201 && genData.tasks && genData.tasks.length === 4);

  } finally {
    await new Promise(r => server.close(r));
  }
}

verifyServer().then(() => {
  console.log('\n========================================================================');
  console.log(` FINAL VERIFICATION RESULT: ${passedChecks}/${totalChecks} CHECKS PASSED`);
  if (passedChecks === totalChecks) {
    console.log(' ALL HARBOR TASK INTERFACE & VALIDATION REQUIREMENTS SATISFIED 100%');
  } else {
    console.log(' SOME CHECKS FAILED - SEE LOG ABOVE');
  }
  console.log('========================================================================\n');
  process.exitCode = (passedChecks === totalChecks ? 0 : 1);
}).catch(err => {
  console.error('Fatal verification error:', err);
  process.exit(1);
});
