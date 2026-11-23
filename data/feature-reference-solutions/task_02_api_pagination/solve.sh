#!/bin/sh
set -eu

# Reference Solution for Task 02: API Query Filtering & Pagination
SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
if [ -f "$SCRIPT_DIR/server.js" ]; then
  cp -f "$SCRIPT_DIR/server.js" server.js
elif [ -f "data/feature-reference-solutions/task_02_api_pagination/server.js" ]; then
  cp -f data/feature-reference-solutions/task_02_api_pagination/server.js server.js
fi

echo "Reference solution for API Query Filtering & Pagination applied successfully."

