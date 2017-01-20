#!/bin/bash
set -e
VERSION=$(cat package.json | grep version | head -1 | awk -F: '{ print $2 }' | sed 's/[\",]//g' | tr -d '[[:space:]]')
IMAGE_NAME=docker.tradeshift.net/http-mockserver:$VERSION
docker build -t $IMAGE_NAME .

docker push $IMAGE_NAME
