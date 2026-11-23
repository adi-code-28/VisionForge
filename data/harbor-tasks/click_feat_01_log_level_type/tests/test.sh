#!/usr/bin/env bash
# Verifier: Regression gate + Feature acceptance gate for click LogLevel
set -e

REWARD=0
mkdir -p /logs/verifier

cd /app

echo "=== GATE 1: Regression (existing click tests) ==="
if pytest tests/ -q --tb=short 2>&1 | tee /logs/verifier/regression-stdout.txt; then
  echo "REGRESSION: PASS"
  REGRESSION_PASS=1
else
  echo "REGRESSION: FAIL"
  REGRESSION_PASS=0
fi

echo ""
echo "=== GATE 2: Feature (LogLevel param type) ==="
if pytest /tests/test_log_level.py -q --tb=short 2>&1 | tee /logs/verifier/feature-stdout.txt; then
  echo "FEATURE: PASS"
  FEATURE_PASS=1
else
  echo "FEATURE: FAIL"
  FEATURE_PASS=0
fi

if [ "$REGRESSION_PASS" = "1" ] && [ "$FEATURE_PASS" = "1" ]; then
  REWARD=1
fi

echo "$REWARD" > /logs/verifier/reward.txt
echo "REWARD: $REWARD"
exit $(( 1 - REWARD ))
