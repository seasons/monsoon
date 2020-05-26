#!/bin/bash

helpFunction()
{
   echo ""
   echo "Wasn't able run alter_db SQL command"
   echo "Usage: $0 -p password -t table_name -d database_name"
   echo "  -p Postgres password for user prisma"
   echo "  -t Table name to access"
   echo "  -d Database name"
   exit 1 # Exit script after printing help
}

while getopts "d:p:t:" opt
do
   case "$opt" in
      p ) password="$OPTARG" ;;
      t ) postgres_table="$OPTARG" ;;
      d ) database_name="$OPTARG" ;;
      ? ) helpFunction ;; # Print helpFunction in case parameter is non-existent
   esac
done

# Print helpFunction in case parameters are empty
if [ -z "$password" ] || [ -z "$postgres_table" ] || [ -z "$database_name" ]
then
   echo "Some or all of the parameters are empty";
   helpFunction
fi

# Begin script in case all parameters are correct
PGPASSWORD=$password psql -h localhost -p 9876 -U prisma -d $database_name -c "ALTER TABLE $postgres_table.\"ProductVariant\"                             ADD CHECK (total >= 0),
  ADD CHECK (reservable >= 0),
  ADD CHECK (reserved >= 0),
  ADD CHECK (\"nonReservable\" >= 0),
  ADD CHECK (stored >= 0),
  ADD CHECK (offloaded >= 0),
  ADD CHECK (total = reservable + reserved + \"nonReservable\" + stored + offloaded);"

echo "Added constraints Added product variant constraints to DB"