#!/bin/bash -eu
# This script is executed when changes are merged into master
# It will build the docker image, and push it with two tags "latest" and the commit sha
# Job: https://ci.ts.sv/view/Collaboration/job/http-mockserver-master

VERSION=$(cat package.json | grep version | head -1 | awk -F: '{ print $2 }' | sed 's/[\",]//g' | tr -d '[[:space:]]')

# Images
IMAGE_NAME=063399264027.dkr.ecr.eu-west-1.amazonaws.com/tradeshift-base/http-mockserver

# Build (tag: latest)
docker build -t $IMAGE_NAME .

# Add version (tag: <version>)
docker tag $IMAGE_NAME:latest $IMAGE_NAME:$VERSION

# Push all tags
docker push $IMAGE_NAME
