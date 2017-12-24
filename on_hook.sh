#!/usr/bin/env bash
set -xv
if [[ ! -z "${DEFINITELY_RUNNING_IN_PRODUCTION}" ]]; then
    BRANCH=$(git rev-parse --abbrev-ref HEAD)
    git fetch origin && git reset --hard origin/$BRANCH
fi
./www/posts/update.sh
