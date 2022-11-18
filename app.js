import express from 'express';
import bodyParser from 'body-parser';
import dotenv from "dotenv";
import schedule from "node-schedule";
import fetch from "node-fetch";

import {initCronJob, initVNubanCronJob} from "./cronjob.js";

dotenv.config();

import {createContractController} from "./controller/createContractController.js";
import {
      createContractForVAMSController,
      subscribeToSNSTopicController, 
      createContractFromTopicController,
      unsubscribeToSNSTopicController
    } from "./controller/createContractForVAMSController.js";

import createVNuban from "./controller/createVNubanController.js";

import appConfig from './configs/appConfig.js';

const app = express();
const port = appConfig.PORT;

app.use(bodyParser.json());

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.get('/', (request, response) => {
  response.json({ app: 'batch-jobs' });
});

app.get('/create-contracts', createContractController);

app.post('/v1/create-contract', createContractForVAMSController);

app.post('/v1/sns-topic/subscribe', subscribeToSNSTopicController);
app.post('/v1/sns-topic/unsubscribe', unsubscribeToSNSTopicController);
app.post('/v1/web-hook/create-contract-from-topic', bodyParser.text(), createContractFromTopicController);

app.post('/v1/vnuban/create', createVNuban);

app.get('/test-slack', async (req, res) => {
  let resBody="";
  try {
    const res = await fetch(process.env.SLACK_WEBHOOK_URL, {
      method: 'post',
      body: JSON.stringify({text: "OK"})
    });
    resBody = await res.text();
  } catch (e) {
    console.log(e.message)
  }
  res.json({status: resBody});
});

app.get("/check-localhost", async (req, res) => {
  try{
    const r = await fetch("http://localhost:4020");
    const resJSON = await r.json();
    res.json(resJSON);
  } catch(e) {
    res.json({error: e.message});
  }
});   

const shutDown = async () => {
  console.log("****** process stopped removed all scheduled jobs ******");
  console.log(schedule.scheduledJobs);
  try {
    for (let item in schedule.scheduledJobs) {
      await schedule.scheduledJobs[item].deleteFromSchedule();
    }
    await schedule.gracefulShutdown();
  } catch(e) {
    console.log(e.message)
  } finally {
    process.exit(0)
  }
};
    
process.on('SIGTERM', shutDown);
process.on('SIGINT', shutDown);

app.listen(port, () => {
  console.log(`App running on port ${port}.`);
  initCronJob();
  initVNubanCronJob();
}); 
