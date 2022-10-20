import express from 'express';
import bodyParser from 'body-parser';

import {createContractController} from "./controller/createContractController.js";

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
  response.json({ info: 'Node.js, Express, and Postgres API' });
});

app.get('/create-contracts', createContractController);
// app.get('/users/:id', db.getUserById);
// app.post('/users', db.createUser);
// app.put('/users/:id', db.updateUser);
// app.delete('/users/:id', db.deleteUser);

app.listen(port, () => {
  console.log(`App running on port ${port}.`);
});
