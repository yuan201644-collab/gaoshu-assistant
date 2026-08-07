#!/bin/bash
[ $# -lt 1 ] && { echo "用法: $0 <函数名>"; exit 1; }
grep -rn "function $1\|const $1\|export.*$1" src tests --include="*.ts" --include="*.vue"
