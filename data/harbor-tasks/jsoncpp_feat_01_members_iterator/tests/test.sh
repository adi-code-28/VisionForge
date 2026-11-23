#!/usr/bin/env bash
# Verifier: Regression gate + Feature acceptance gate for jsoncpp members()
set -e

REWARD=0
mkdir -p /logs/verifier

cd /app

echo "=== GATE 1: Regression (existing jsoncpp ctest suite) ==="
cmake --build /app/build --target jsoncpp_test 2>&1 | tail -5
if ctest --test-dir /app/build --output-on-failure 2>&1 | tee /logs/verifier/regression-stdout.txt; then
  echo "REGRESSION: PASS"
  REGRESSION_PASS=1
else
  echo "REGRESSION: FAIL"
  REGRESSION_PASS=0
fi

echo ""
echo "=== GATE 2: Feature (members() iterator) ==="
cp /tests/test_members_iterator.cpp /app/src/test_members_iterator.cpp

# Compile the feature test against installed jsoncpp
g++ -std=c++17 \
  /app/src/test_members_iterator.cpp \
  -I/app/include \
  /app/build/lib/libjsoncpp.a \
  -o /tmp/test_members \
  2>&1 | tee /logs/verifier/compile-stdout.txt

if /tmp/test_members 2>&1 | tee /logs/verifier/feature-stdout.txt; then
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
