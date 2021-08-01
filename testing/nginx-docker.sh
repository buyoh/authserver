#!/bin/bash

cd `dirname $0`

docker run --name my-nginx-docker --rm \
  -v $PWD/nginx/html:/usr/share/nginx/html:ro \
  -v $PWD/nginx/html1:/usr/share/nginx/html1:ro \
  -v $PWD/nginx/log:/var/log/nginx/:rw \
  -v $PWD/nginx/nginx.conf:/etc/nginx/nginx.conf:ro \
  -v $PWD/nginx/conf.d:/etc/nginx/conf.d:ro \
  -d --net host nginx
