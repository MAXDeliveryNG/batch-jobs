#!/bin/sh
set -e
set -o pipefail

# initializing slack orb variables
echo export GIT_COMMIT_ID=$( git log -1 --format=format:"%h" ) >> $BASH_ENV                 
echo export GIT_COMMIT_DESC=$( git log --oneline --format=%B -n 1 HEAD | head -n 1 | sed 's/^/"/;s/$/"/' ) >> $BASH_ENV  
echo export GIT_COMMIT_AUTHOR=$( git log -1 --pretty=format:'%an' ) >> $BASH_ENV   
echo export BACKTICK=\\\` >> $BASH_ENV             
source $BASH_ENV

WORKING_DIRECTORY="$PWD"
BRANCH=$1
CHARTNAME=$2
# PROJECT_ID=$3
# CLUSTER_NAME=$4
HELM_DIRECTORY="${WORKING_DIRECTORY}/helm"

if [ $BRANCH = "staging" ] ; then
    namespace="default"
    valuesfile="${HELM_DIRECTORY}/staging.yaml"
    cluster_zone=${GOOGLE_STAGING_COMPUTE_ZONE}
    cluster_name=${GOOGLE_STAGING_CLUSTER_NAME}
    project_id=${GOOGLE_STAGING_PROJECT_ID}
    service_key=${GCLOUD_STAGING_SERVICE_KEY}
elif [ $BRANCH = "main" ] ; then
    namespace="default"
    valuesfile="${HELM_DIRECTORY}/production.yaml"
    cluster_zone=${GOOGLE_COMPUTE_ZONE}
    cluster_name=${GOOGLE_CLUSTER_NAME}
    project_id=${GOOGLE_PROD_PROJECT_ID}
    service_key=${GCLOUD_PROD_SERVICE_KEY}
elif [ $BRANCH = "dev" ] ; then
    namespace="default"
    valuesfile="${HELM_DIRECTORY}/dev.yaml"
    cluster_zone=${GOOGLE_DEV_COMPUTE_ZONE}
    cluster_name=${GOOGLE_DEV_CLUSTER_NAME}
    project_id=${GOOGLE_DEV_PROJECT_ID}
    service_key=${GCLOUD_DEV_SERVICE_KEY} 
else
    echo "unsupported branch"
    exit
fi

echo "Deploying service: ${CHARTNAME}"

echo "Using namespace: $namespace"

echo "Authenticating with service account..."
echo $service_key > key.json
gcloud auth activate-service-account --key-file key.json

echo "Connecting to cluster: $cluster_name in zone: $cluster_zone"

if [ $BRANCH = "dev" ] ; then 
  gcloud container clusters get-credentials $cluster_name --zone $cluster_zone --project $project_id
else
  gcloud container clusters get-credentials $cluster_name --region $cluster_zone --project $project_id
fi

echo "Adding MAX Helm Repo..."
helm repo add MAXDeliveryNG https://maxdeliveryng.github.io/helm-charts
helm repo update

helm upgrade -i $CHARTNAME MAXDeliveryNG/$CHARTNAME --namespace $namespace  -f $valuesfile


#EOF