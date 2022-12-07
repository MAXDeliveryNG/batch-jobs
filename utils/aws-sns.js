
// Load the AWS SDK for Node.js
import AWS from 'aws-sdk';

import awsConfig from "./awsConfig.js";

// Set region
AWS.config.update({region: awsConfig.awsRegion});

const sns = new AWS.SNS();

const publish = async (data) => {
  const params = {
    Message: JSON.stringify(data?.message),
    Subject: data?.subject,
    TopicArn: awsConfig.topics[data?.topic]
  };
  console.log(params);
  let publishRes = "";
  try {
    publishRes = await sns.publish(params).promise();
  } catch (e) {
    publishRes = e.message;
  } finally {
    console.log(publishRes)
  }
  return publishRes;
};

const subscribe = async (data) => {
  const params = {
    Protocol: data?.protocol,
    Endpoint: data?.endpoint,
    TopicArn: awsConfig.topics[data?.topic],
    ReturnSubscriptionArn: true
  };
  try {
    const subscribeRes = await sns.subscribe(params).promise();
    console.log(subscribeRes);
    return subscribeRes;
  } catch (e) {
    throw new Error(e.message);
  }
};

const unsubscribe = async (data) => {
  const params = {
    SubscriptionArn: data?.subscriptionArn,
  };
  try {
    const unsubscribeRes = await sns.unsubscribe(params).promise();
    console.log(unsubscribeRes);
    return unsubscribeRes;
  } catch (e) {
    throw new Error(e.message);
  }
};

const confirmSubscription = async (params) => {
  try {
    const unsubscribeRes = await sns.confirmSubscription(params).promise();
    console.log(unsubscribeRes);
    return unsubscribeRes;
  } catch (e) {
    throw new Error(e.message);
  }
};

export {
  publish,
  subscribe,
  unsubscribe,
  confirmSubscription
};
