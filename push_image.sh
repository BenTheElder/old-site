#!/usr/bin/env bash
set -x
IMAGE_NAME="site:latest"
DOCKER_ID_USER="${DOCKER_ID_USER:-bentheelder}"
# build binary
env GOOS=linux go build . && \
# build, tag and push image
docker build -t "${IMAGE_NAME}" . && \
docker tag "${IMAGE_NAME}" "${DOCKER_ID_USER}/${IMAGE_NAME}"
docker push "${DOCKER_ID_USER}/${IMAGE_NAME}"
# cleanup
rm site
