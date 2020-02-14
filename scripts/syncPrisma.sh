echo "sync prisma"
if [ $1 == "staging" ]
then
    echo "set staging vars"
    TO_HOST=$DB_STAGING_HOST
    TO_PORT=$DB_STAGING_PORT
    TO_USERNAME=$DB_STAGING_USERNAME
    TO_DBNAME=$DB_STAGING_DBNAME
elif [ $1 == "local" ]
then 
    echo "set local vars"
    TO_HOST=$DB_LOCAL_HOST
    TO_PORT=$DB_LOCAL_PORT
    TO_USERNAME=$DB_LOCAL_USERNAME
    TO_DBNAME=$DB_LOCAL_DBNAME
else 
    echo "first arg must be one of local | staging"
fi

if [ $1 == "staging" ] || [ $1 == "local" ]
then
# .pgpass specifies passwords for the databases
export PGPASSFILE=$PWD/.pgpass

# Copy monsoon$production schema and all contained tables as is to staging.
pg_dump --format=t --clean --create --no-password --host=$DB_PROD_HOST --port=$DB_PROD_PORT\
 --username=$DB_PROD_USERNAME $DB_PROD_DBNAME | pg_restore --host=$TO_HOST\
 --port=$TO_PORT --username=$TO_USERNAME --no-password --dbname=$TO_DBNAME

# Drop the (old) monsoon$staging schema and all contained tables
echo 'DROP SCHEMA "monsoon$staging" CASCADE' | psql --host=$TO_HOST\
 --port=$TO_PORT --username=$TO_USERNAME --no-password --dbname=$TO_DBNAME

# Adjust the name of the schema to be appropriate for staging
echo 'ALTER SCHEMA "monsoon$production" RENAME TO "monsoon$staging"' | psql --host=$TO_HOST\
 --port=$TO_PORT --username=$TO_USERNAME --no-password --dbname=$TO_DBNAME
fi




