#!/bin/bash
set -e
IMAGE_NAME=registry.tradeshift.com/http-mockserver:$(git rev-parse HEAD)
docker build -t $IMAGE_NAME .

docker run $IMAGE_NAME npm test
