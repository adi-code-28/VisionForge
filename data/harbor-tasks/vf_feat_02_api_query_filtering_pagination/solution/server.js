const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { generateBenchmark, validateTask, exportHarborTask } = require('./src/pipeline');

const root = __dirname;
const dataDir = path.join(root, 'data');
const tasks = [];
fs.mkdirSync(dataDir, { recursive: true });

function send(res, status, body, type = 'application/json') {
  res.writeHead(status, { 'content-type': `${type}; charset=utf-8` });
  res.end(type === 'application/json' ? JSON.stringify(body) : body);
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', c => { raw += c; if (raw.length > 1_000_000) req.destroy(); });
    req.on('end', () => { try { resolve(raw ? JSON.parse(raw) : {}); } catch { reject(new Error('Invalid JSON body')); } });
  });
}

function safeStatic(url) {
  const relative = url === '/' ? 'public/index.html' : `public${decodeURIComponent(url.split('?')[0])}`;
  const file = path.resolve(root, relative);
  return file.startsWith(path.join(root, 'public')) ? file : null;
}

const server = http.createServer(async (req, res) => {
  try {
    const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = parsedUrl.pathname;

    if (req.method === 'GET' && pathname === '/api/tasks') {
      const category = parsedUrl.searchParams.get('category');
      const difficulty = parsedUrl.searchParams.get('difficulty');
      const limitParam = parsedUrl.searchParams.get('limit');
      const offsetParam = parsedUrl.searchParams.get('offset');

      let filtered = tasks;
      if (category) filtered = filtered.filter(t => t.category === category);
      if (difficulty) filtered = filtered.filter(t => t.difficulty === difficulty);

      if (limitParam !== null || offsetParam !== null) {
        const offset = offsetParam !== null ? parseInt(offsetParam, 10) : 0;
        const limit = limitParam !== null ? parseInt(limitParam, 10) : filtered.length;

        if (isNaN(offset) || offset < 0 || isNaN(limit) || limit <= 0) {
          return send(res, 400, { error: 'Invalid pagination parameters: offset must be >= 0 and limit must be > 0' });
        }

        const paged = filtered.slice(offset, offset + limit);
        return send(res, 200, {
          total: filtered.length,
          count: paged.length,
          offset,
          limit,
          tasks: paged
        });
      }

      return send(res, 200, { tasks: filtered });
    }

    if (req.method === 'GET' && pathname === '/api/analytics/summary') {
      const valid = tasks.filter(t => t.validation.valid).length;
      return send(res, 200, {
        total: tasks.length,
        valid,
        harborExported: tasks.filter(t => t.harbor).length,
        categoryCounts: Object.fromEntries(['counting','spatial','attribute','multi_object'].map(c => [c, tasks.filter(t => t.category === c).length]))
      });
    }

    if (req.method === 'POST' && pathname === '/api/benchmarks/generate') {
      const config = await readJson(req);
      const created = generateBenchmark({ count: Number(config.count) || 8, seed: Number(config.seed) || 42, difficulty: config.difficulty || 'medium', category: config.category || 'all' });
      created.forEach(t => tasks.unshift(t));
      return send(res, 201, { tasks: created });
    }

    if (req.method === 'POST' && pathname === '/api/harbor/export') {
      const { taskId } = await readJson(req);
      const task = tasks.find(t => t.id === taskId);
      if (!task) return send(res, 404, { error: 'Task not found' });
      if (!task.validation.valid) return send(res, 422, { error: 'Only validated tasks can be exported' });
      task.harbor = exportHarborTask(task, path.join(dataDir, 'harbor-tasks'));
      return send(res, 201, { harbor: task.harbor });
    }

    if (req.method === 'POST' && pathname === '/api/tasks/validate') {
      const { taskId } = await readJson(req);
      const task = tasks.find(t => t.id === taskId);
      if (!task) return send(res, 404, { error: 'Task not found' });
      task.validation = validateTask(task);
      return send(res, 200, { validation: task.validation });
    }

    if (req.method === 'GET') {
      const file = safeStatic(req.url);
      if (file && fs.existsSync(file) && fs.statSync(file).isFile()) {
        const type = file.endsWith('.css') ? 'text/css' : file.endsWith('.js') ? 'application/javascript' : 'text/html';
        return send(res, 200, fs.readFileSync(file, 'utf8'), type);
      }
    }

    send(res, 404, { error: 'Not found' });
  } catch (error) {
    send(res, 400, { error: error.message });
  }
});

server.listen(process.env.PORT || 3000, '0.0.0.0', () => console.log(`VisionForge running at http://localhost:${process.env.PORT || 3000}`));

module.exports = { server };
