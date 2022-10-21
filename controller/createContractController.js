import fetch from "node-fetch";

import { getChampionsWithoutContract } from "../model/collectionModel.js";
import appConfig from '../configs/appConfig.js';

const createContractController = async (request, response) => {
  const {query} = request;
  const days = query?.days || 10;
  const result = [];
  let championsWithoutContract = [];
  try {
    championsWithoutContract = await getChampionsWithoutContract(days);
  } catch (e) {
    console.log(e.stack);
    result.push({
      status:"Error",
      message: e.message,
    })
  }
  
  if (championsWithoutContract?.length > 0) {
    for (let i=0; i<championsWithoutContract.length; i++) {
      const item = championsWithoutContract[i];
      const output = {
        "champion_id": item?.champion_uuid,
        "vehicle_id": item?.vehicle_id,
      }
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
        const res = await fetch(`${appConfig.dev.apiURL}/contracts`, {
          method: 'POST',
          headers: { 'Content-type': 'application/json', 'Authorization': `Bearer ${appConfig.dev.authToken}` },
          body: JSON.stringify(payload),
        });
        const jsonRes = await res.json();
        if (jsonRes.status === "success") {
          output.status = "Success"
        } else {
          throw new Error(jsonRes.message);
        }
      } catch (e) {
        output.status = "Error"
        output.error_message = e.message;
      }
      console.log("Response:::", JSON.stringify(output), "\n");
      result.push(output)
    }
  }
  response.status(200).json(result);
};

export {
  createContractController
}