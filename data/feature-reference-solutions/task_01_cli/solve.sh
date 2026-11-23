#!/bin/sh
set -eu

# Reference Solution for Task 01: CLI Benchmark Generator
SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
mkdir -p bin
if [ -f "$SCRIPT_DIR/bin/visionforge.js" ]; then
  cp -f "$SCRIPT_DIR/bin/visionforge.js" bin/visionforge.js
elif [ -f "data/feature-reference-solutions/task_01_cli/bin/visionforge.js" ]; then
  cp -f data/feature-reference-solutions/task_01_cli/bin/visionforge.js bin/visionforge.js
fi
chmod +x bin/visionforge.js

# Update package.json to include bin field
node -e '
const fs = require("node:fs");
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
pkg.bin = { visionforge: "bin/visionforge.js" };
fs.writeFileSync("package.json", JSON.stringify(pkg, null, 2) + "\n");
'

echo "Reference solution for CLI Benchmark Generator applied successfully."

