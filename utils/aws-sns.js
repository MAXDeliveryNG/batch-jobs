
// Load the AWS SDK for Node.js
import AWS from 'aws-sdk';

// Set region
AWS.config.update({region: 'eu-west-2'});

const sns = new AWS.SNS();

const publish = async (data) => {
  const params = {
    Message: JSON.stringify(data),
    Subject: data?.subject,
    TopicArn: data?.TopicArn
  };
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

export {
  publish
};
