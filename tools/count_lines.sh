#!/bin/bash
[ $# -ge 1 ] && { wc -l "$1" | tail -1; exit 0; }
find src tests -path ./node_modules -prune -o \( -name "*.ts" -o -name "*.vue" -o -name "*.css" \) -print 2>/dev/null | grep -v "/node_modules/" | grep -v "/tests/" | xargs wc -l | tail -1
