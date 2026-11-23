const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const binPath = fs.existsSync(path.resolve(__dirname, '../bin/visionforge.js'))
  ? path.resolve(__dirname, '../bin/visionforge.js')
  : path.resolve(__dirname, '../../bin/visionforge.js');
const rootDir = fs.existsSync(path.resolve(__dirname, '../package.json'))
  ? path.resolve(__dirname, '..')
  : path.resolve(__dirname, '../..');

test('CLI: bin/visionforge.js exists and is marked executable in package.json', () => {
  assert.ok(fs.existsSync(binPath), 'bin/visionforge.js must exist');
  const pkg = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
  assert.ok(pkg.bin, 'package.json must contain "bin" field');
  assert.equal(pkg.bin.visionforge || pkg.bin['visionforge-cli'], 'bin/visionforge.js');
});

test('CLI: generates benchmark tasks as JSON to stdout by default', () => {
  const result = spawnSync('node', [binPath, '--seed', '100', '--count', '3'], { encoding: 'utf8' });
  assert.equal(result.status, 0, `CLI failed with error: ${result.stderr}`);
  const tasks = JSON.parse(result.stdout.trim());
  assert.ok(Array.isArray(tasks));
  assert.equal(tasks.length, 3);
  assert.equal(tasks[0].scene.seed, 100);
});

test('CLI: supports --format summary', () => {
  const result = spawnSync('node', [binPath, '--seed', '42', '--count', '4', '--format', 'summary'], { encoding: 'utf8' });
  assert.equal(result.status, 0, `CLI failed with error: ${result.stderr}`);
  assert.match(result.stdout, /Total: 4/i);
  assert.match(result.stdout, /Valid: 4/i);
});

test('CLI: writes to output file when --out is specified', () => {
  const tempOut = path.join(rootDir, 'data', 'temp_cli_test_out.json');
  try {
    if (fs.existsSync(tempOut)) fs.unlinkSync(tempOut);
    const result = spawnSync('node', [binPath, '--seed', '77', '--count', '2', '--out', tempOut], { encoding: 'utf8' });
    assert.equal(result.status, 0, `CLI failed: ${result.stderr}`);
    assert.ok(fs.existsSync(tempOut), 'Output file should have been created');
    const written = JSON.parse(fs.readFileSync(tempOut, 'utf8'));
    assert.equal(written.length, 2);
  } finally {
    if (fs.existsSync(tempOut)) fs.unlinkSync(tempOut);
  }
});

test('CLI: exits with status code 1 on invalid arguments', () => {
  const resultInvalidCount = spawnSync('node', [binPath, '--count', '-1'], { encoding: 'utf8' });
  assert.equal(resultInvalidCount.status, 1, 'Should fail with status 1 on negative count');

  const resultInvalidCat = spawnSync('node', [binPath, '--category', 'invalid_category_xyz'], { encoding: 'utf8' });
  assert.equal(resultInvalidCat.status, 1, 'Should fail with status 1 on unknown category');
});
