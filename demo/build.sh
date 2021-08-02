#!/bin/sh

set -e

# Cleanup
rm -rf public

# Build the Query Console
cd ..
yarn
yarn tsc
yarn vite build -c vite.demo.config.ts
cd demo

# Move index.html from public/demo to public so that the Vercel deployment is available at root
mv public/demo/index.html public
rm -rf public/demo

# Make Prisma Client types accessible to the Vercel CDN so they can fetched at runtime
rm -rf public/types
mkdir -p public/types
cp node_modules/.prisma/client/index.d.ts public/types/prisma-client.d.ts