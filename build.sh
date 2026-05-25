#!/bin/sh
bun build --format iife --target browser --outfile ./build/script.js ./src/index.ts
cat ./extra/header.txt ./build/script.js ./extra/footer.txt > ./build/script.user.js
