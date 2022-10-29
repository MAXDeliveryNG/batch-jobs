import express from 'express';
import bodyParser from 'body-parser';
import dotenv from "dotenv";
import schedule from "node-schedule";
import fetch from "node-fetch";

import initCronJob from "./cronjob.js";

dotenv.config();

import {createContractController} from "./controller/createContractController.js";

import appConfig from './configs/appConfig.js';

console.log(appConfig);

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
    const r = await fetch("http://127.0.0.1:80");
    const resJSON = await r.json();
    res.json(resJSON);
  } catch(e) {
    res.json({error: e.message});
  }
});

app.listen(port, () => {
  console.log(`App running on port ${port}.`);
  initCronJob();
  process.on('SIGINT', () => { 
    console.log("****** process stopped removed all scheduled jobs ******");
    schedule.gracefulShutdown()
    .then(() => process.exit(0))
  });
});