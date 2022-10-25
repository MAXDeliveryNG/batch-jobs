import express from 'express';
import bodyParser from 'body-parser';
import dotenv from "dotenv";

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
});
