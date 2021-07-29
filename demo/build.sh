#!/bin/sh

# Build the Query Console
cd ../
yarn build
cp -R dist ./demo/public