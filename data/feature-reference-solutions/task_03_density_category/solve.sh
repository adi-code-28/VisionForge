#!/bin/sh
set -eu

# Reference Solution for Task 03: Density Reasoning Category
SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
mkdir -p src
if [ -f "$SCRIPT_DIR/src/pipeline.js" ]; then
  cp -f "$SCRIPT_DIR/src/pipeline.js" src/pipeline.js
elif [ -f "$SCRIPT_DIR/pipeline.js" ]; then
  cp -f "$SCRIPT_DIR/pipeline.js" src/pipeline.js
elif [ -f "data/feature-reference-solutions/task_03_density_category/src/pipeline.js" ]; then
  cp -f data/feature-reference-solutions/task_03_density_category/src/pipeline.js src/pipeline.js
fi

echo "Reference solution for Density Reasoning Category applied successfully."

