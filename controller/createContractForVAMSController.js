import fetch from "node-fetch";

import { getChampionsWithoutContractForVAMS } from "../model/collectionModel.js";
import {publish, subscribe, unsubscribe, confirmSubscription} from "../utils/aws-sns.js";
import appConfig from '../configs/appConfig.js';

const createContractForVAMSController = async (request, response) => {
  const {body} = request;
  const champion_id = body?.champion_id;

  if (!champion_id) {
   return response.status(400).json({status: "error", message: "champion_id id din't provided."});
  }

  const output = {};
  try {
    const championsWithoutContract = await getChampionsWithoutContractForVAMS(body);
    console.log(championsWithoutContract);
    if (championsWithoutContract?.length === 0) {
      throw new Error(`No record found with champion_id: ${champion_id}`);
    }
    const item = championsWithoutContract[0];
    output.champion_id = item?.champion_uuid;
    output.vehicle_id = item?.vehicle_id;

    let payload = {  
      "champion_id": item?.champion_uuid,
      "location": item?.coll_location_name,
      "hp_value": item?.vehicle_hpvalue,
      "daily_remit": item?.daily_remit,
      "vehicle_id": item?.vehicle_id,
      "has_insurance": item?.has_insurance === "TRUE",
      "standard_duration": item?.standard_duration,
      "insurance_duration": item?.insurance_duration,
      "pricing_template_id": item?.pricing_template_id,
      "driver_license": item?.driver_license
    };
    console.log("Payload:::", JSON.stringify(payload));
    try {
      const res = await fetch(`${appConfig.apiURL}/contracts`, {
        method: 'POST',
        headers: { 'Content-type': 'application/json', 'Authorization': `Bearer ${appConfig.authToken}` },
        body: JSON.stringify(payload),
      });
      const jsonRes = await res.json();
      if (jsonRes.status === "success") {
        output.status = "success";
        output.message = "Contract created successfully."
        output.statusCode = 200;
        output.champion_id = item?.champion_uuid;
      } else {
        throw new Error(jsonRes.message);
      }
    } catch (e) {
      throw new Error(e.message);
     
    }
  } catch (e) {
    output.status = "error"
    output.message = e.message;
    output.statusCode = 500;
  } finally {
    //publish to aws sns
    publish({
      ...output,
      topic: "contract",
      championId: champion_id,
      subject: `Contract creation status for champion id: ${champion_id}`
    });
    
    response.status(output.statusCode).json(output);
  }
};

const subscribeToSNSTopicController = async (request, response) => {
  let output = {};
  try {
    const {body} = request;
    const {topic, endpoint, protocol} = body;
    const res = await subscribe({topic, endpoint, protocol});
    output.status="success";
    output.statusCode = 200;
    output = {...output, ...res};
  } catch(e) {
    output.status="error",
    output.errorMessage=e.message;
    output.statusCode = 500;
  } finally {
    response.status(output.statusCode).json(output);
  }
};

const unsubscribeToSNSTopicController = async (request, response) => {
  let output = {};
  try {
    const {body} = request;
    const { subscriptionArn } = body;
    const res = await unsubscribe({subscriptionArn});
    output.status="success";
    output.statusCode = 200;
    output = {...output, ...res};
  } catch(e) {
    output.status="error",
    output.errorMessage=e.message;
    output.statusCode = 500;
  } finally {
    response.status(output.statusCode).json(output);
  }
};

const createContractFromChampion = async (params) => {
  console.log("params", params);

  if (!params?.max_champion_id) {
   return response.status(200).json({status: "error", message: "max_champion_id id din't provided."});
  }

  const output = {};
  try {
    const championsWithoutContract = await getChampionsWithoutContractForVAMS(params);
    console.log("championsWithoutContract", championsWithoutContract);
    if (championsWithoutContract?.length === 0) {
      const message = {
        champion_id: params?.max_champion_id,
        lastUpdateTime: new Date().toISOString(),
        messageInfo: {
          documentStatus: "Activated",
          origin: "lams"
        }
      }
      // publish here.
      await publish({
        topic: "contract",
        subject: `Contract creation status for champion id: ${params?.max_champion_id}`,
        message
      });
      return {status:"success", statusCode:200};
    }
    const item = championsWithoutContract[0];
    output.champion_id = item?.champion_uuid;
    output.vehicle_id = item?.vehicle_id;

    let payload = {  
      "champion_id": item?.champion_uuid,
      "location": item?.coll_location_name,
      "hp_value": item?.vehicle_hpvalue,
      "daily_remit": item?.daily_remit,
      "vehicle_id": item?.vehicle_id,
      "has_insurance": item?.has_insurance === "TRUE",
      "standard_duration": item?.standard_duration,
      "insurance_duration": item?.insurance_duration,
      "pricing_template_id": item?.pricing_template_id,
      "driver_license": item?.driver_license
    };
    console.log("Payload:::", JSON.stringify(payload));
    try {
      const res = await fetch(`${appConfig.apiURL}/contracts`, {
        method: 'POST',
        headers: { 'Content-type': 'application/json', 'Authorization': `Bearer ${appConfig.authToken}` },
        body: JSON.stringify(payload),
      });
      const jsonRes = await res.json();
      if (jsonRes.status === "success") {
        output.status = "success";
        output.message = "Contract created successfully."
        output.statusCode = 200;
        output.champion_id = item?.champion_uuid;

        const message = {
          champion_id: item?.max_champion_id,
          lastUpdateTime: new Date().toISOString(),
          messageInfo: {
            documentStatus: "Activated",
            origin: "lams"
          }
        }
        console.log("publish message :::", message)
        // publish here.
        await publish({
          topic: "contract",
          subject: `Contract creation status for champion id: ${params?.max_champion_id}`,
          message
        });
      } else {
        throw new Error(jsonRes.message);
      }
    } catch (e) {
      throw new Error(e.message);
    }
  } catch (e) {
    output.status = "error"
    output.message = e.message;
    output.statusCode = 200;
  } finally {
    return output;
  }
}

const createContractFromTopicController = async (request, response) => {
  let output = {};
  try {
    const requestData = JSON.parse(request.body);
    console.log("requestData", requestData);
    if (requestData?.Type === "SubscriptionConfirmation") {
      const confirmRes = await fetch(requestData?.SubscribeURL);
      if (confirmRes.status==200) {
        output = {status: "success", message: "Subscription confirmed", statusCode: 200, ...confirmRes}
      } else {
        output = {status: "error", message: "Subscription confirmation error.", statusCode: 200, ...confirmRes}
      }
    }
    if (requestData?.Type === "Notification") {
      const {champion_id, vehicle_id} = JSON.parse(requestData?.Message);
      const data  = await createContractFromChampion({max_champion_id: champion_id, max_vehicle_id: vehicle_id});
      output = {...data}
    }
  } catch(e) {
    output={status: "error", errorMessage: e.message, statusCode: 200}
  } finally {
    console.log(output);
    // send 200 ok response otherwise SNS will keep triggering that published message again and again
    response.status(200).json(output)
  }
} 

export {
  createContractForVAMSController,
  subscribeToSNSTopicController,
  createContractFromTopicController,
  unsubscribeToSNSTopicController
}