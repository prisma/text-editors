#!/bin/sh

rm -rf public/typescript

version=$(cat package.json | grep typescript | awk -F '"' '{ print $4 }')
echo Using TypeScript version: $version

mkdir -p public/typescript/$version/lib
cp node_modules/typescript/lib/*.d.ts public/typescript/$version/lib