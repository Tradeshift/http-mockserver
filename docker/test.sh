#!/bin/bash
set -e
IMAGE_NAME=docker.tradeshift.net/http-mockserver:$(git rev-parse HEAD)
docker build -t $IMAGE_NAME .

docker run $IMAGE_NAME npm test
