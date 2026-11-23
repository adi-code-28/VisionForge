#!/bin/sh
set -eu
expected='Lane 1'
actual=$(tr -d '\r\n' < /app/answer.txt 2>/dev/null || true)
if [ "$actual" = "$expected" ]; then mkdir -p /logs/verifier; echo 1 > /logs/verifier/reward.txt; else mkdir -p /logs/verifier; echo 0 > /logs/verifier/reward.txt; exit 1; fi
