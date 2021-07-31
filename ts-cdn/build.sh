#!/bin/sh

set -e

rm -rf public/typescript

version=$(cat package.json | grep typescript | awk -F '"' '{ print $4 }')
echo Using TypeScript version: $version

mkdir -p public/typescript/$version
cp node_modules/typescript/lib/*.d.ts public/typescript/$version