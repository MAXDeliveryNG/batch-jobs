#! /bin/bash
# image build script to upload docker img to gcr.

# initializing slack orb variables
echo export GIT_COMMIT_ID=$( git log -1 --format=format:"%h" ) >> $BASH_ENV
echo export GIT_COMMIT_DESC=$( git log --oneline --format=%B -n 1 HEAD | head -n 1 | sed 's/^/"/;s/$/"/' ) >> $BASH_ENV          
echo export GIT_COMMIT_AUTHOR=$( git log -1 --pretty=format:'%an' ) >> $BASH_ENV   
echo export BACKTICK=\\\` >> $BASH_ENV

if [ $CIRCLE_BRANCH = "main" ] ; then
  PROJECT_ID=${GOOGLE_PROD_PROJECT_ID}
  GCLOUD_SERVICE_KEY=${GCLOUD_PROD_SERVICE_KEY}
elif [ $CIRCLE_BRANCH = "staging" ] ; then
  PROJECT_ID=${GOOGLE_STAGING_PROJECT_ID}
  GCLOUD_SERVICE_KEY=${GCLOUD_STAGING_SERVICE_KEY}
elif [ $CIRCLE_BRANCH = "dev" ] ; then
  PROJECT_ID=${GOOGLE_DEV_PROJECT_ID}
  GCLOUD_SERVICE_KEY=${GCLOUD_DEV_SERVICE_KEY}
fi


apt-get install -qq -y gettext
echo $GCLOUD_SERVICE_KEY > ${HOME}/gcloud-service-key.json
gcloud auth activate-service-account --key-file=${HOME}/gcloud-service-key.json
gcloud --quiet config set project ${PROJECT_ID}
gcloud --quiet config set compute/zone ${GOOGLE_COMPUTE_ZONE}

echo "Deploying image to $CIRCLE_BRANCH repository..."

docker build -t ${PROJECT_NAME} .
docker tag ${PROJECT_NAME} eu.gcr.io/${PROJECT_ID}/${PROJECT_NAME}:latest
gcloud auth print-access-token | docker login -u oauth2accesstoken --password-stdin https://eu.gcr.io
docker push eu.gcr.io/${PROJECT_ID}/${PROJECT_NAME}:latest

# initializing slack orb variables
echo export IMAGE_URL=$( gcloud container images describe eu.gcr.io/${PROJECT_ID}/$PROJECT_NAME:latest --format="value(image_summary.fully_qualified_digest)" ) >> $BASH_ENV
source $BASH_ENV

#EOF
