#!/bin/bash
container_name=monsoon_prisma_testing_1
docker_running=$( docker inspect -f {{.State.Running}} $container_name )
if [ $docker_running == false ]
then
  echo "Starting up new docker container"
  docker-compose up -d;
  sleep 20;
  export PRISMA_ENDPOINT="http://localhost:4477";
  yarn prisma deploy;
fi
yarn jest --verbose;