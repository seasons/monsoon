echo "** Note: Please ensure you are in monsoon's root directory, or this won't work **"
echo $'\n(For your convenience:)\nPrisma production URL: https://dashboard.heroku.com/apps/monsoon-prisma-production\n'\
$'Prisma staging URL: https://dashboard.heroku.com/apps/monsoon-prisma-staging\n'
read -p "DANGER ALERT. You are about to delete all data on the database at ${DB_STAGING_HOST} with name ${DB_STAGING_DBNAME}"\
" and replace it with data from DB ${DB_PROD_DBNAME} at host ${DB_PROD_HOST}"$' Proceed? (y/n)\n\n' answer

if [ $answer == "y" ]
then
# .pgpass specifies passwords for the databases
export PGPASSFILE=$PWD/.pgpass

# Copy monsoon$production schema and all contained tables as is to staging.
pg_dump --format=t --clean --create --no-password --host=$DB_PROD_HOST --port=$DB_PROD_PORT\
 --username=$DB_PROD_USERNAME $DB_PROD_DBNAME | pg_restore --host=$DB_STAGING_HOST\
 --port=$DB_STAGING_PORT --username=$DB_STAGING_USERNAME --no-password --dbname=$DB_STAGING_DBNAME

# Drop the (old) monsoon$staging schema and all contained tables
echo 'DROP SCHEMA "monsoon$staging" CASCADE' | psql --host=$DB_STAGING_HOST\
 --port=$DB_STAGING_PORT --username=$DB_STAGING_USERNAME --no-password --dbname=$DB_STAGING_DBNAME

# Adjust the name of the schema to be appropriate for staging
echo 'ALTER SCHEMA "monsoon$production" RENAME TO "monsoon$staging"' | psql --host=$DB_STAGING_HOST\
 --port=$DB_STAGING_PORT --username=$DB_STAGING_USERNAME --no-password --dbname=$DB_STAGING_DBNAME
fi

