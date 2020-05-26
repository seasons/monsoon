#!/bin/bash
echo "POSTGRES_PASSWORD=${POSTGRES_PASSWORD}" >> .env.testing
echo "POSTGRES_TABLE=${POSTGRES_TABLE}" >> .env.testing
echo "POSTGRES_DATABASE=${POSTGRES_DATABASE}" >> .env.testing
echo "PRISMA_ENDPOINT=${PRISMA_ENDPOINT}" >> .env.testing
echo "PRISMA_SECRET=${PRISMA_SECRET}" >> .env.testing



