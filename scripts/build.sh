#!/bin/sh

export CONTAINER_TAG="micro-lc-notification-center";

test -z `command -v docker` && (echo "docker could not be found"; exit 1)

docker build --build-arg RELEASE_MODE=local --tag $CONTAINER_TAG .
