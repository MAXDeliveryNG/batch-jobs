import express from 'express';
import bodyParser from 'body-parser';
import dotenv from "dotenv";
import schedule from "node-schedule";

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

app.listen(port, () => {
  console.log(`App running on port ${port}.`);
  initCronJob();
  process.on('SIGINT', () => { 
    console.log("****** process stopped removed all scheduled jobs ******");
    schedule.gracefulShutdown()
    .then(() => process.exit(0))
  });
});