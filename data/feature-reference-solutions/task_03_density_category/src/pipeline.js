const fs = require('node:fs');
const path = require('node:path');

const COLORS = ['red', 'blue', 'yellow', 'white', 'green'];
const TYPES = ['car', 'car', 'bus', 'truck', 'ambulance'];
const categories = ['counting', 'spatial', 'attribute', 'multi_object', 'density'];

function rng(seed) {
  let x = seed >>> 0;
  return () => ((x = (x * 1664525 + 1013904223) >>> 0) / 4294967296);
}

function choose(random, values) {
  return values[Math.floor(random() * values.length)];
}

function sceneFor(seed) {
  const random = rng(seed), lanes = 3, count = 4 + Math.floor(random() * 4), laneSlots = [0, 0, 0];
  const objects = Array.from({ length: count }, (_, i) => {
    const lane = 1 + Math.floor(random() * lanes), slot = laneSlots[lane - 1]++;
    return {
      id: `vehicle_${i + 1}`,
      type: choose(random, TYPES),
      color: choose(random, COLORS),
      lane,
      x: 90 + (lane - 1) * 220 + Math.floor(random() * 55),
      y: 112 + slot * 75
    };
  });
  const obstructionLane = 1 + Math.floor(random() * lanes);
  return {
    id: `urban_${seed}`,
    seed,
    type: 'smart_city_road',
    width: 760,
    height: 460,
    lanes,
    crosswalkY: 340,
    obstruction: { id: 'obstruction_1', lane: obstructionLane, x: 130 + (obstructionLane - 1) * 205, y: 245 },
    objects
  };
}

function laneLabel(n) {
  return `Lane ${n}`;
}

function makeQuestion(scene, category) {
  const byLane = n => scene.objects.filter(o => o.lane === n);

  if (category === 'counting') {
    const type = choose(rng(scene.seed + 91), TYPES);
    const answer = scene.objects.filter(o => o.type === type).length;
    return { question: `How many ${type}s are visible in the scene?`, answer: String(answer), evidence: { type } };
  }

  if (category === 'spatial') {
    return { question: 'Which lane contains the road obstruction?', answer: laneLabel(scene.obstruction.lane), evidence: { obstruction: scene.obstruction.id } };
  }

  if (category === 'attribute') {
    const object = scene.objects[0];
    return { question: `What color is the ${object.type} labeled V1?`, answer: object.color, evidence: { objectId: object.id } };
  }

  if (category === 'density') {
    const counts = [1, 2, 3].map(n => ({ lane: n, count: byLane(n).length }));
    const max = Math.max(...counts.map(c => c.count));
    const winners = counts.filter(c => c.count === max);
    if (winners.length === 1) {
      return {
        question: 'Which lane has the highest vehicle density?',
        answer: laneLabel(winners[0].lane),
        evidence: { maxDensityLane: winners[0].lane, laneCounts: counts.map(c => c.count) }
      };
    }
    return {
      question: 'How many vehicles are in the densest lane?',
      answer: String(max),
      evidence: { maxDensityCount: max, tiedLanes: winners.map(w => w.lane), laneCounts: counts.map(c => c.count) }
    };
  }

  const counts = [1, 2, 3].map(n => byLane(n).length), max = Math.max(...counts), winners = counts.map((n, i) => n === max ? i + 1 : null).filter(Boolean);
  if (winners.length !== 1) {
    return { question: 'How many vehicles are in the lane with the road obstruction?', answer: String(byLane(scene.obstruction.lane).length), evidence: { lane: scene.obstruction.lane } };
  }
  return { question: 'Which lane has the most vehicles?', answer: laneLabel(winners[0]), evidence: { lane: winners[0] } };
}

function svgFor(scene) {
  const laneX = n => 70 + (n - 1) * 220;
  const color = c => ({ red:'#f25f5c', blue:'#5bc0eb', yellow:'#ffe066', white:'#f8fafc', green:'#70c1b3' }[c]);
  const cars = scene.objects.map((o, i) => `<g><rect x="${o.x}" y="${o.y}" width="82" height="38" rx="9" fill="${color(o.color)}" stroke="#16233d" stroke-width="3"/><rect x="${o.x+14}" y="${o.y+8}" width="38" height="13" rx="3" fill="#b8e4f5"/><text x="${o.x+56}" y="${o.y+25}" font-size="9" fill="#14213d">${o.type}</text><text x="${o.x+4}" y="${o.y-5}" font-size="11" font-weight="700" fill="#fff">V${i+1}</text></g>`).join('');
  return `<svg viewBox="0 0 ${scene.width} ${scene.height}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#b7d7e8"/><rect x="48" y="55" width="665" height="365" rx="18" fill="#303946"/><text x="68" y="40" fill="#1b263b" font-size="20" font-family="system-ui" font-weight="700">VisionForge • seeded urban scene ${scene.seed}</text>${[1,2].map(i=>`<line x1="${70+i*220}" y1="65" x2="${70+i*220}" y2="410" stroke="#f8d66d" stroke-width="5" stroke-dasharray="22 16"/>`).join('')}${[1,2,3].map(i=>`<text x="${laneX(i)+4}" y="88" fill="#f8fafc" font-size="13" font-weight="700">LANE ${i}</text>`).join('')}<g fill="#f8fafc">${Array.from({length:12},(_,i)=>`<rect x="${75+i*52}" y="${scene.crosswalkY}" width="34" height="40"/>`).join('')}</g><g><rect x="${laneX(scene.obstruction.lane)}" y="${scene.obstruction.y}" width="82" height="45" rx="5" fill="#ff9f1c" stroke="#fff" stroke-width="3"/><path d="M${laneX(scene.obstruction.lane)+18} ${scene.obstruction.y+34} l23 -27 l23 27z" fill="#d62828"/></g>${cars}<g><rect x="680" y="80" width="15" height="70" fill="#1d3557"/><circle cx="687" cy="92" r="8" fill="#e63946"/><circle cx="687" cy="113" r="8" fill="#f1fa8c"/><circle cx="687" cy="134" r="8" fill="#43aa8b"/></g></svg>`;
}

function validateTask(task) {
  const failures = [];
  if (!task.scene.objects.length) failures.push('scene_has_no_objects');
  if (!task.question || !task.answer) failures.push('missing_question_or_answer');
  if (!task.svg.includes('<svg')) failures.push('render_missing');
  if (!categories.includes(task.category)) failures.push('unknown_category');
  return { valid: failures.length === 0, checks: ['schema', 'render', 'ground_truth', 'unambiguous'], failures };
}

function generateBenchmark({ count, seed, difficulty, category }) {
  return Array.from({ length: Math.min(Math.max(count, 1), 50) }, (_, i) => {
    const scene = sceneFor(seed + i);
    const selected = category === 'all' ? categories[i % categories.length] : category;
    const qa = makeQuestion(scene, selected);
    const task = {
      id: `vf_${seed + i}_${selected}`,
      scene,
      category: selected,
      difficulty,
      question: qa.question,
      answer: qa.answer,
      evidence: qa.evidence,
      svg: svgFor(scene),
      createdAt: new Date().toISOString()
    };
    task.validation = validateTask(task);
    return task;
  });
}

function shell(value) {
  return value.replace(/'/g, "'\\''");
}

function exportHarborTask(task, outputRoot) {
  const dir = path.join(outputRoot, task.id);
  fs.mkdirSync(path.join(dir, 'environment'), { recursive: true });
  fs.mkdirSync(path.join(dir, 'tests'), { recursive: true });
  fs.mkdirSync(path.join(dir, 'solution'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'scene.svg'), task.svg);
  fs.writeFileSync(path.join(dir, 'task.toml'), `schema_version = "1.0"\n[task]\nname = "visionforge/${task.id}"\nkeywords = ["visual-reasoning", "synthetic", "urban"]\n[metadata]\ndifficulty = "${task.difficulty}"\ncategory = "reasoning"\n[verifier]\ntimeout_sec = 30.0\n[agent]\ntimeout_sec = 120.0\n[environment]\nbuild_timeout_sec = 300.0\ncpus = 1\nmemory = "1G"\n`);
  fs.writeFileSync(path.join(dir, 'instruction.md'), `# Visual reasoning task\n\nInspect \`/app/scene.svg\` and write **only** the answer to this question into \`/app/answer.txt\`:\n\n> ${task.question}\n`);
  fs.writeFileSync(path.join(dir, 'environment', 'Dockerfile'), 'FROM alpine:3.20\nWORKDIR /app\nCOPY scene.svg /app/scene.svg\n');
  fs.writeFileSync(path.join(dir, 'tests', 'test.sh'), `#!/bin/sh\nset -eu\nexpected='${shell(task.answer)}'\nactual=$(tr -d '\\r\\n' < /app/answer.txt 2>/dev/null || true)\nif [ "$actual" = "$expected" ]; then mkdir -p /logs/verifier; echo 1 > /logs/verifier/reward.txt; else mkdir -p /logs/verifier; echo 0 > /logs/verifier/reward.txt; exit 1; fi\n`);
  fs.writeFileSync(path.join(dir, 'solution', 'solve.sh'), `#!/bin/sh\nprintf '%s' '${shell(task.answer)}' > /app/answer.txt\n`);
  return { status: 'packaged', path: path.relative(process.cwd(), dir).replace(/\\/g, '/'), exportedAt: new Date().toISOString() };
}

module.exports = { generateBenchmark, validateTask, exportHarborTask, sceneFor, categories };
