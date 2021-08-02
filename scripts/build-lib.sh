#!/bin/sh

set -e

rm -rf dist

# Typecheck
tsc

# Build
vite build $@ # Forward any arguments to this script to the build command (used when building the demo)

# Build type declarations
tsc --noEmit false --declaration --emitDeclarationOnly --outFile dist/lib.d.ts --isolatedModules false
