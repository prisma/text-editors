#!/bin/sh

set -e

# Build the Query Console
cd ..
yarn
yarn build -c vite.demo.config.ts
# tsc
# vite build 

# Make Prisma Client types accessible to the CDN
cd demo
rm -rf public/types
mkdir -p public/types
cp node_modules/.prisma/client/index.d.ts public/types/prisma-client.d.ts