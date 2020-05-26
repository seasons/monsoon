#!/bin/bash
source .env.testing
container_name=monsoon_prisma_testing_1
docker_running=$( docker inspect -f {{.State.Running}} $container_name )
if [[ $docker_running == false ]]
then
  echo "Starting up new docker container"
  docker-compose up -d;
  sleep 20;
  yarn prisma deploy -e .env.testing
  sh alter_db.sh -p $POSTGRES_PASSWORD -t $POSTGRES_TABLE -d $POSTGRES_DATABASE &>/dev/null
fi
yarn prisma reset -f -e .env.testing;
yarn jest --verbose;