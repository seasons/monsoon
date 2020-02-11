# Inspired by: https://thoughtbot.com/blog/how-to-back-up-a-heroku-production-database-to-staging

# Install parity
brew tap thoughtbot/formulae
brew install parity

# Back up the production DB
heroku git:remote -r staging -a monsoon-prisma-staging
heroku git:remote -r production -a monsoon-prisma-production
production backup

# Recreate the staging DB from production
staging restore-from production

# Adjust the name of the schema to be appropriate for staging
echo 'ALTER SCHEMA "monsoon$production" RENAME TO "monsoon$staging"' | heroku pg:psql --app monsoon-prisma-staging
