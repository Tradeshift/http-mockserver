#!/bin/bash
# This script is executed when changes are made to a pull request
# It will build the docker image and run tests
# Job: https://ci.ts.sv/view/Collaboration/job/http-mockserver-ghprb

set -e
IMAGE_NAME=eu.gcr.io/tradeshift-base/http-mockserver:$(git rev-parse HEAD)
docker build -t $IMAGE_NAME .

docker version
echo "Starting tests..."
docker run $IMAGE_NAME npm test
