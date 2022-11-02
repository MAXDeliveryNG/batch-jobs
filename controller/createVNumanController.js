import fetch from "node-fetch";
import pool from "../configs/connection.js"
import appConfig from '../configs/appConfig.js';
import { getChampionsWithoutVnuban } from "../configs/queryConstants.js";
import axios from 'axios';

async function sendSqlFailureEmail(err) {
  const emailBody = {
    toEmails: [
      'collections@maxdrive.ai', 
      'props-email-notification@maxdrive.ai',
    ],
    subject: 'vNuban Creation Failure',
    htmlBody: `<p>Hello Team, <br/> Database error for vNuban creation.</p>
    <p>${err}</p>
    <p>Regards</p>`
  }
 
  let url1 = `${appConfig.NOTIFICATION_PUSH_URL}/v1/email/send`
  axios.post(url1, emailBody, {headers :{
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${appConfig.authToken}`
  }
})
  .then(function (response) {
    console.log(response);
  })
  .catch(function (error) {
    console.log(error);
  })
  .finally(function () {
  });
  console.log("function sendSqlFailureEmail Run Successfully.");
}

async function sendVNubanFailureEmail(data, err) {
  const emailBody = {
    toEmails: [
      'collections@maxdrive.ai', 
      'props-email-notificatio,n@maxdrive.ai'
    ],
    subject: 'vNuban Creation Failure',
    htmlBody: `<p>Hello Team, <br/> The vNuban creation has failed for below champion.</p>
    <p>
      <ul>
        <li>Champion uuid: ${data.champion_uuid}</li>
        <li>Champion name: ${data.champion_name}</li>
        <li>Champion email: ${data.champion_email}</li>
        <li>Champion phone: ${data.champion_phone}</li>
        <li>Virtual account type: ${data.type}</li>
      </ul>
    </p>
    <p>${err}</p>
    <p>Regards</p>`
  }
  let url= `${appConfig.NOTIFICATION_PUSH_URL}/v1/email/send`
  axios.post(url, emailBody,{headers :{
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${appConfig.authToken}`
  }
  }  )
  .then(function (response) {
    console.log(response);
  })
  .catch(function (error) {
    console.log(error);
  })
  .finally(function () {
  });
  console.log("function sendVNubanFailureEmail Run Successfully.");
}

async function createWoven(payload, championDetail) {
  try {
    const response = await fetch('https://api.staging.max.ng/thirdparty/v1/champion/virtual/account', {
      method: 'post',
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${appConfig.authToken}`
      }
    });
    const res = await response.json();
    console.log(res);

    const notificationMsg = `Dear ${championDetail.champion_name}, your Woven A/C has been created. ${res.data}`;

    const smsBody = {
      message: notificationMsg,
      phoneNumbers: championDetail.phone,
      channel: 'generic',
    };
    sendSmsToChampion(smsBody, championDetail, "Woven");

  } catch (error) {
    console.log('Woven creation failure for ' + championDetail  + error);
    sendVNubanFailureEmail({
      champion_uuid: championDetail.champion_uuid,
      champion_name: championDetail.champion_name,
      champion_email: championDetail.email,
      champion_phone: championDetail.phone,
      type: "Woven"
    }, error);
  }
  console.log("function createWoven Run Successfully.");
}

async function createMoneify(payload, championDetail) {
  try {
    const response = await fetch('https://api.staging.max.ng/thirdparty/v1/champion/monnify/virtual/account', {
      method: 'post',
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${appConfig.authToken}`
      }
    });
    const res = await response.json();
    console.log(res);

    const notificationMsg = `Dear ${championDetail.champion_name}, your Moneify A/C has been created. ${res.data}`;

    const smsBody = {
      message: notificationMsg,
      phoneNumbers: championDetail.phone,
      channel: 'generic',
    };
    sendSmsToChampion(smsBody, championDetail, "Moneify");

  } catch (error) {
    console.log('Woven creation failure for ' + championDetail  + error);
    sendVNubanFailureEmail({
      champion_uuid: championDetail.champion_uuid,
      champion_name: championDetail.champion_name,
      champion_email: championDetail.email,
      champion_phone: championDetail.phone,
      type: "Moneify"
    }, error);
  }
  console.log("function createMoneify Run Successfully.");
}

async function sendSmsToChampion(smsBody, championDetail, type) {
  try {
    const url = `${appConfig.NOTIFICATION_PUSH_URL}/v1/sms/send`;

    axios.post(url, smsBody, {headers :{
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${appConfig.authToken}`
    }
  }
  )
  .then(function (response) {
    console.log(response);
  })
  .catch(function (error) {
    console.log(error);
  })
  .finally(function () {
  });
  } catch (error) {
    LoggingService.error('Error sending SMS notification ', error);
    sendVNubanSMSFailureEmail({
      champion_uuid: championDetail.champion_uuid,
      champion_name: championDetail.champion_name,
      champion_email: championDetail.email,
      champion_phone: championDetail.phone,
      type: type
    }, error);
  }
  console.log("function sendSmsToChampion Run Successfully.");
}

const getChamps = (req, res) => {
  pool.query(getChampionsWithoutVnuban, async (error, results) => {
    if (error) {
      console.log('Error running SQL query: ' + error);
      sendSqlFailureEmail(error);
      res.status(500).json(error);
    }
    console.log("Champion Details Successfully Fetched..")
    
    const champs = results?.rows || [];
  
    champs.map(champ => {
      createWoven({
        customer_reference: champ.champion_uuid,
        email: champ.email,
        mobile_number: champ.phone,
        name: champ.champion_name
      }, champ)
      createMoneify({
        accountReference: champ.champion_uuid,
        customerEmail: champ.email,
        customerName: champ.champion_name,
        preferredBanks: ["232"]
      }, champ)
    })
    res.status(200).json(champs);
  })
  console.log("function getChamps Run Successfully.");
};

export { getChamps };