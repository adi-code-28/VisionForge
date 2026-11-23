#!/usr/bin/env bash
# Verifier: Regression gate + Feature acceptance gate for zod noEmoji
set -e

REWARD=0
mkdir -p /logs/verifier

cd /app

echo "=== GATE 1: Regression (existing Zod tests) ==="
if pnpm test 2>&1 | tee /logs/verifier/regression-stdout.txt; then
  echo "REGRESSION: PASS"
  REGRESSION_PASS=1
else
  echo "REGRESSION: FAIL"
  REGRESSION_PASS=0
fi

echo ""
echo "=== GATE 2: Feature (noEmoji validator) ==="
cp /tests/no_emoji.test.ts /app/src/__tests__/no_emoji.test.ts
if pnpm exec jest src/__tests__/no_emoji.test.ts --no-coverage 2>&1 | tee /logs/verifier/feature-stdout.txt; then
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
