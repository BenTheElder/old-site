#!/usr/bin/env bash
set -x
IMAGE="docker.bentheelder.io/site:latest"
# build binary
env GOOS=linux go build . && \
# build, tag and push image
docker build --no-cache -t "${IMAGE}" . && \
docker push "${IMAGE}"
# cleanup
rm site
