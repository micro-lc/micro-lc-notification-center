#!/bin/sh

export CONTAINER_NAME="nc";

test -z "$1" || export CONTAINER_NAME=$1;

test -z `command -v docker` && (echo "docker could not be found"; exit 1)

CURRENT_CONTAINER=`docker ps -a --filter "name=${CONTAINER_NAME}" --format "{{.Names}}" | head -n 1`;

test -z "$CURRENT_CONTAINER" || docker stop $CURRENT_CONTAINER; docker rm $CURRENT_CONTAINER

docker run -d \
  -p 3000:8080 \
  --name $CONTAINER_NAME \
  micro-lc-notification-center
