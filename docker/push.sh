#!/bin/bash
set -e
VERSION=$(npm run version --silent)
IMAGE_NAME=registry.tradeshift.com/http-mockserver:$VERSION
docker build -t $IMAGE_NAME .

docker push $IMAGE_NAME
