#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const { generateBenchmark } = require('../src/pipeline');

function parseArgs(argv) {
  const args = { seed: 42, count: 4, category: 'all', difficulty: 'medium', format: 'json', out: null };
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--seed' && i + 1 < argv.length) args.seed = parseInt(argv[++i], 10);
    else if (arg === '--count' && i + 1 < argv.length) args.count = parseInt(argv[++i], 10);
    else if (arg === '--category' && i + 1 < argv.length) args.category = argv[++i];
    else if (arg === '--difficulty' && i + 1 < argv.length) args.difficulty = argv[++i];
    else if (arg === '--format' && i + 1 < argv.length) args.format = argv[++i];
    else if (arg === '--out' && i + 1 < argv.length) args.out = argv[++i];
    else if (arg === '--help' || arg === '-h') {
      console.log('Usage: visionforge [--seed N] [--count N] [--category CAT] [--difficulty DIFF] [--format json|summary] [--out PATH]');
      process.exit(0);
    }
  }
  return args;
}

const VALID_CATEGORIES = ['all', 'counting', 'spatial', 'attribute', 'multi_object', 'density'];
const VALID_DIFFICULTIES = ['easy', 'medium', 'hard'];

const opts = parseArgs(process.argv);
if (isNaN(opts.count) || opts.count < 1) {
  console.error('Error: --count must be a positive integer');
  process.exit(1);
}
if (isNaN(opts.seed)) {
  console.error('Error: --seed must be a valid integer');
  process.exit(1);
}
if (!VALID_CATEGORIES.includes(opts.category)) {
  console.error(`Error: unknown category "${opts.category}"`);
  process.exit(1);
}
if (!VALID_DIFFICULTIES.includes(opts.difficulty)) {
  console.error(`Error: unknown difficulty "${opts.difficulty}"`);
  process.exit(1);
}

const tasks = generateBenchmark({ count: opts.count, seed: opts.seed, difficulty: opts.difficulty, category: opts.category });

if (opts.out) {
  const outPath = path.resolve(process.cwd(), opts.out);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(tasks, null, 2), 'utf8');
}

if (opts.format === 'summary') {
  const valid = tasks.filter(t => t.validation && t.validation.valid).length;
  console.log(`Total: ${tasks.length}, Valid: ${valid}`);
} else {
  console.log(JSON.stringify(tasks, null, 2));
}
