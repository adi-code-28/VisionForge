const test = require('node:test');
const assert = require('node:assert/strict');
const { generateBenchmark, sceneFor } = require('../src/pipeline');
test('scenes are reproducible for the same seed', () => assert.deepEqual(sceneFor(42), sceneFor(42)));
test('generated tasks have deterministic ground truth and validation', () => { const tasks = generateBenchmark({ count: 4, seed: 42, difficulty: 'medium', category: 'all' }); assert.equal(tasks.length, 4); tasks.forEach(t => { assert.ok(t.question); assert.notEqual(t.answer, undefined); assert.equal(t.validation.valid, true); assert.match(t.svg, /<svg/); }); });
