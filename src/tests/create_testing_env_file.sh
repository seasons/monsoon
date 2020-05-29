#!/bin/bash
echo "Writing to .env.testing"
: > .env.testing
for line in `sed "s/=.*//" .env.testing.example`
do
    echo "$line=${!line}" >> .env.testing
done
