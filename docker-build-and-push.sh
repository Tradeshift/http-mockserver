#!/bin/bash
set -e
IMAGE_NAME=registry.tradeshift.com/http-mockserver:$(git rev-parse HEAD)
docker build -t $IMAGE_NAME .

# Run tests
docker run $IMAGE_NAME npm test

docker push $IMAGE_NAME
