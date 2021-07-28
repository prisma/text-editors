#!/bin/sh

rm -rf public/typescript

mkdir -p public/typescript/lib
cp node_modules/typescript/lib/lib.*.d.ts public/typescript/lib