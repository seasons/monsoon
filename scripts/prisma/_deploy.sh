#!/usr/bin/env sh

mv prisma1/src/prisma/* src/prisma
rm -rf prisma1/src
yarn prisma generate