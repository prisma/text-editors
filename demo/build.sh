#!/bin/sh

# Build the Query Console
cd ../
yarn
yarn build
cp -R dist ./demo/public