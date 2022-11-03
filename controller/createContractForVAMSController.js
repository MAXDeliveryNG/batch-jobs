import fetch from "node-fetch";

import { getChampionsWithoutContractForVAMS } from "../model/collectionModel.js";
import appConfig from '../configs/appConfig.js';

const createContractForVAMSController = async (request, response) => {
  const {body} = request;
  const champion_id = body?.champion_id;

  if (!champion_id) {
   return response.status(400).json({status: "error", message: "champion_id id din't provided."});
  }

  console.log(body);

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
    response.status(output.statusCode).json(output)
  }
};

export {
  createContractForVAMSController
}