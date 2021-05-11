#!/usr/bin/env sh

node -r dotenv/config node_modules/prisma1/dist/index.js deploy --force -p prisma1/prisma.yml
bash scripts/prisma/_deploy.sh
