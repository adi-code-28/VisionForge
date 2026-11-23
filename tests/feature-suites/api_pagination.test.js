const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const { spawn } = require('node:child_process');
const path = require('node:path');

const rootDir = fs.existsSync(path.resolve(__dirname, '../package.json'))
  ? path.resolve(__dirname, '..')
  : path.resolve(__dirname, '../..');
const TEST_PORT = 3918;

function startServer() {
  return new Promise((resolve, reject) => {
    const serverProc = spawn('node', ['server.js'], {
      cwd: rootDir,
      env: { ...process.env, PORT: String(TEST_PORT) },
      stdio: ['pipe', 'pipe', 'pipe']
    });

    serverProc.stdout.on('data', d => {
      if (d.toString().includes('running at')) resolve(serverProc);
    });

    serverProc.on('error', reject);
    setTimeout(() => resolve(serverProc), 1200);
  });
}

async function request(path, options = {}) {
  const url = `http://localhost:${TEST_PORT}${path}`;
  const res = await fetch(url, options);
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

test('API Pagination & Filtering: GET /api/tasks with query params', async (t) => {
  const serverProc = await startServer();

  try {
    // Seed 10 tasks
    await request('/api/benchmarks/generate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ count: 12, seed: 101, category: 'all', difficulty: 'medium' })
    });

    await t.test('Backward compatibility: returns { tasks } when no pagination params', async () => {
      const res = await request('/api/tasks');
      assert.equal(res.status, 200);
      assert.ok(Array.isArray(res.data.tasks));
      assert.ok(res.data.tasks.length >= 12);
    });

    await t.test('Filtering by category: returns only matching tasks', async () => {
      const res = await request('/api/tasks?category=spatial');
      assert.equal(res.status, 200);
      assert.ok(res.data.tasks.length > 0);
      res.data.tasks.forEach(task => {
        assert.equal(task.category, 'spatial');
      });
    });

    await t.test('Filtering by difficulty: returns only matching difficulty', async () => {
      const res = await request('/api/tasks?difficulty=medium');
      assert.equal(res.status, 200);
      assert.ok(res.data.tasks.length > 0);
      res.data.tasks.forEach(task => {
        assert.equal(task.difficulty, 'medium');
      });
    });

    await t.test('Pagination: returns envelope with total, count, offset, limit', async () => {
      const res = await request('/api/tasks?offset=2&limit=3');
      assert.equal(res.status, 200);
      assert.equal(res.data.offset, 2);
      assert.equal(res.data.limit, 3);
      assert.equal(res.data.count, 3);
      assert.equal(res.data.tasks.length, 3);
      assert.ok(typeof res.data.total === 'number');
    });

    await t.test('Validation: returns 400 for negative offset or zero/negative limit', async () => {
      const resNegOffset = await request('/api/tasks?offset=-1&limit=5');
      assert.equal(resNegOffset.status, 400);
      assert.ok(resNegOffset.data.error);

      const resZeroLimit = await request('/api/tasks?offset=0&limit=0');
      assert.equal(resZeroLimit.status, 400);

      const resInvalidLimit = await request('/api/tasks?limit=abc');
      assert.equal(resInvalidLimit.status, 400);
    });
  } finally {
    serverProc.kill();
  }
});
