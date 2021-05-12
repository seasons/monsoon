#!/usr/bin/env sh

yarn prisma:update-bindings
mv prisma1/src/prisma/* src/prisma
rm -rf prisma1/src
yarn prisma introspect