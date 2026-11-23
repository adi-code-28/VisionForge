const path = require('node:path');
const { FEATURE_TASKS, exportHarborFeatureTask } = require('../src/strategy/feature_task_strategy');

const outputRoot = path.resolve(__dirname, '../data/harbor-tasks');

console.log('================================================================');
console.log('EXPORTING HARBOR FEATURE-DEVELOPMENT TASK PACKAGES');
console.log(`Target Output Directory: ${outputRoot}`);
console.log('================================================================\n');

const results = [];
FEATURE_TASKS.forEach((task, index) => {
  console.log(`[${index + 1}/${FEATURE_TASKS.length}] Exporting ${task.id} (${task.title})...`);
  const exported = exportHarborFeatureTask(task, outputRoot);
  console.log(`    -> Exported to: ${exported.path}`);
  console.log(`    -> Files created: task.toml, instruction.md, environment/Dockerfile, tests/test.sh, tests/${task.testFileName}, solution/solve.sh`);
  results.push(exported);
});

console.log('\n================================================================');
console.log(`Successfully exported ${results.length} Harbor task packages!`);
console.log('================================================================');
