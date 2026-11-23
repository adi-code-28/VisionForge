#!/bin/sh
set -e
mkdir -p /logs/verifier data

echo "========================================================"
echo "HARBOR EVALUATION VERIFIER: vf_feat_03_density_reasoning_category"
echo "Starting Repository Version: v0.1.0 (fa51f3e)"
echo "========================================================"

# If running in Harbor container, ensure tests are in tests directory
if [ -d "/tests" ] && [ -d "tests" ]; then
  cp -f /tests/*.test.js tests/ 2>/dev/null || true
fi

echo ""
echo "[CHECK 1/2] Running Regression Test Suite..."
if node --test tests/pipeline.test.js > /logs/verifier/regression.log 2>&1; then
  echo "✔ PASS: Regression tests passed. Existing functionality is protected."
else
  echo "✖ FAIL: Regression tests failed. Existing functionality was broken."
  cat /logs/verifier/regression.log
  echo 0 > /logs/verifier/reward.txt
  exit 1
fi

echo ""
echo "[CHECK 2/2] Running New Feature Verification Suite (density_category.test.js)..."
if node --test tests/density_category.test.js > /logs/verifier/feature.log 2>&1; then
  echo "✔ PASS: Feature tests passed. Requirements satisfied."
  echo 1 > /logs/verifier/reward.txt
  echo "========================================================"
  echo "EVALUATION RESULT: SUCCESS (Reward = 1)"
  echo "========================================================"
  exit 0
else
  echo "✖ FAIL: Feature tests failed. Feature is missing or incorrect."
  cat /logs/verifier/feature.log
  echo 0 > /logs/verifier/reward.txt
  echo "========================================================"
  echo "EVALUATION RESULT: FAILURE (Reward = 0)"
  echo "========================================================"
  exit 1
fi
