#!/bin/bash
[ $# -lt 2 ] && { echo "用法: $0 <文件> <行号>"; exit 1; }
START=$(( $2 - 5 )); [ $START -lt 1 ] && START=1
echo "$1:$2 → 附近try/catch数: $(sed -n "${START},$(( $2 + 5 ))p" "$1" | grep -cE 'try|catch')"
