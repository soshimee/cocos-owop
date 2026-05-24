#!/bin/sh
bun build --format iife --target browser --outfile ./build/script.js --banner "$(cat banner.txt)" ./src/script.ts
