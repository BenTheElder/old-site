#!/usr/bin/env bash
BRANCH=$(git rev-parse --abbrev-ref HEAD)
git fetch origin && git reset --hard origin/$BRANCH
./www/blog/update.sh
