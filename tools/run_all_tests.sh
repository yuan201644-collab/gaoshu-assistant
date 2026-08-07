#!/bin/bash
cd "$(dirname "$0")/.." || exit 1
PASS=0; FAIL=0
run_test() { echo "--- $1 ---"; if bash "$2"; then echo "✅ 通过"; PASS=$((PASS+1)); else echo "❌ 失败"; FAIL=$((FAIL+1)); fi; echo ""; }
run_test "前端 vitest"      "tools/test_frontend.sh"
run_test "前端 TS 类型检查" "tools/test_typescript.sh"
echo "===== 测试汇总 ====="; echo "通过: $PASS"; echo "失败: $FAIL"
[ $FAIL -eq 0 ] && exit 0 || exit 1
