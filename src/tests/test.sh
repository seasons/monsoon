#!/bin/bash

if [[ ! -f .env.testing ]]
then
    sh src/tests/create_testing_env_file.sh
fi

source .env.testing

if [[ -z "$POSTGRES_PASSWORD" ]] || [[ -z "$POSTGRES_TABLE" ]] || [[ -z "$POSTGRES_DATABASE" ]]
then
  echo "Please ensure you have your .env.testing file setup correctly"
  exit 1
fi

container_name='monsoon_prisma_testing_1'
docker_running=$( docker inspect -f {{.State.Running}} $container_name )
if [[ $docker_running == false ]]
then
  echo "Starting up new docker container"
  docker-compose up;
  sleep 20;
  yarn prisma deploy -e .env.testing
  sh alter_db.sh -p $POSTGRES_PASSWORD -t $POSTGRES_TABLE -d $POSTGRES_DATABASE &>/dev/null
fi
yarn prisma reset -f -e .env.testing;
yarn jest --verbose;