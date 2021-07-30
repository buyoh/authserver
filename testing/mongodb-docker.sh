#!/bin/bash

cd `dirname $0`

docker run --name my-mongodb-docker --rm \
  -v $PWD/mongo/data/configdb:/data/configdb:rw \
  -v $PWD/mongo/data/db:/data/db:rw \
  -e MONGO_INITDB_ROOT_USERNAME=root \
  -e MONGO_INITDB_ROOT_PASSWORD=example \
  -d --net host mongo:5.0
  
# mongod --port 27017
