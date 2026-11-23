const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const pipelineModule = fs.existsSync(path.resolve(__dirname, '../src/pipeline.js'))
  ? require('../src/pipeline')
  : require('../../src/pipeline');
const { generateBenchmark, validateTask, sceneFor } = pipelineModule;

test('Density Category: pipeline supports density reasoning', (t) => {
  const tasks = generateBenchmark({ count: 6, seed: 50, category: 'density', difficulty: 'hard' });

  assert.equal(tasks.length, 6);

  tasks.forEach(task => {
    assert.equal(task.category, 'density');
    assert.ok(task.question.includes('density') || task.question.includes('densest'));
    assert.ok(task.answer, 'Answer must not be empty');
    assert.ok(task.evidence, 'Evidence must be present');

    const validation = validateTask(task);
    assert.equal(validation.valid, true, `Validation failed: ${validation.failures.join(', ')}`);
  });
});

test('Density Category: deterministic for identical seeds', () => {
  const setA = generateBenchmark({ count: 4, seed: 1234, category: 'density' });
  const setB = generateBenchmark({ count: 4, seed: 1234, category: 'density' });

  assert.deepEqual(setA.map(t => ({ q: t.question, a: t.answer })), setB.map(t => ({ q: t.question, a: t.answer })));
});

test('Density Category: correctly calculates maximum density lane or count', () => {
  const scene = sceneFor(99);
  const byLane = n => scene.objects.filter(o => o.lane === n);
  const counts = [1, 2, 3].map(n => ({ lane: n, count: byLane(n).length }));
  const max = Math.max(...counts.map(c => c.count));
  const winners = counts.filter(c => c.count === max);

  const [task] = generateBenchmark({ count: 1, seed: 99, category: 'density' });

  if (winners.length === 1) {
    assert.equal(task.answer, `Lane ${winners[0].lane}`);
    assert.match(task.question, /highest vehicle density/i);
  } else {
    assert.equal(task.answer, String(max));
    assert.match(task.question, /densest lane/i);
  }
});
