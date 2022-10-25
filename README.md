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
DB_USER=max
DB_PASSWORD='Z2EDTCx5#YnD'
DB_PORT=5432
AUTH_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiZTFlOTBjYTUtZjk4OC00MTYyLTg2NzktZWQxNTNjZDIxOGFkIiwiZmlyc3RfbmFtZSI6IkFuaXRhIiwibGFzdF9uYW1lIjoiT2doZW5ha2hvZ2llIiwiZW1haWwiOiJhbml0YS5vZ2hlbmFraG9naWVAbWF4Lm5nIiwicm9sZSI6ImFkbWluIiwiYXBwX3JvbGVzIjp7ImNoYW1waW9uLXNlcnZpY2UiOiJvbmJvYXJkaW5nIiwibG9hbi1hc3NldC1tYW5hZ2VtZW50IjoiYWRtaW4ifX0sImlhdCI6MTY2MTg1Mzc4NiwiZXhwIjoxNjc3NjY0OTg2LCJhdWQiOiJlMWU5MGNhNS1mOTg4LTQxNjItODY3OS1lZDE1M2NkMjE4YWQiLCJpc3MiOiIvYXV0aC9sb2dpbiJ9.QLiYNv0yDBEDbozzsb08SAzTB9-70ee596hVNvY2g38
API_URL=https://api.staging.max.ng/collection/v1
```
⚠️ Note that authToken is subjected to change at times and also do not commit the .env file

Run
To run the project please run
```
npm run start
```
And then you can call the API e.g http://localhost:3000/create-contracts?days=30 days: This will ensure how many days of data you want to retrieve where champions don't have active contracts
