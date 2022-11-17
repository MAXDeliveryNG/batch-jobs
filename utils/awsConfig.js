export default {
  awsEndpoint: "",
  topics: {
    contract: process.env.AWS_TOPIC_ARN_CONTRACT,
    champion: process.env.AWS_TOPIC_ARN_CHAMPION
  },
  awsRegion: process.env.AWS_REGION
};


