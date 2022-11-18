# batch-jobs
batch jobs for collection service built with NodeJS and postgresSQL

## Project setup
You need node >14 to run this project

### Installation
```
git clone https://github.com/MAXDeliveryNG/batch-jobs.git 

or else if you are using gittoken then

git clone https://<your-github-token>@github.com/MAXDeliveryNG/batch-jobs.git

cd batch-jobs

npm/yarn install
```
For more info please check how to create git personal access token https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token

Then set env variables for local setup. Create a .env variable inside root of the project and copy paste the following content
```
NODE_ENV=development
PORT=8080
DB_HOST=stagingdb.max.ng
DB_DATABASE=v2staging
DB_USER=
DB_PASSWORD=
DB_PORT=5432
AUTH_TOKEN=
API_URL=https://api.staging.max.ng/collection/v1
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/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
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_TOPIC_ARN_CHAMPION=""
AWS_TOPIC_ARN_CONTRACT=""
AWS_REGION=""
NOTIFICATION_PUSH_URL=http://api.staging.max.ng/messaging_notification_push
FAILURE_PROD_EMAILS=collections@maxdrive.ai,props-email-notification@maxdrive.ai
FAILURE_STAG_EMAILS=props-email-notification@maxdrive.ai
```
⚠️ Note that authToken is subjected to change at times and also do not commit the .env file

### Run
To run the project please run
```
npm run start
```
And then you can call the API e.g http://localhost:8080/create-contracts?days=30&noOfRecords=all
```
days: This will ensure how many days of data you want to retrieve where champions don't have active contracts
noOfRecords: "all or numeric value" -> all means all records will be process for the given no of days 
or else provide a numeric value to process i.e 1 to infinity
```
Stagging URL: https://api.staging.max.ng/batch_job/create-contracts?days=1000&noOfRecords=2
