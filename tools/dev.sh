#!/bin/bash
cd "$(dirname "$0")/.." || { echo "找不到项目根目录"; exit 1; }
exec npm run dev
