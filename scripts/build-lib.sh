#!/bin/sh

set -e

rm -rf dist

# Typecheck
yarn tsc

# Build
yarn vite build 

# Build type declarations
yarn tsc --noEmit false --declaration --emitDeclarationOnly --isolatedModules false --outDir dist/types
