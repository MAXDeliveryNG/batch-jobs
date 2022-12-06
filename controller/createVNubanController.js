import fetch from "node-fetch";
import pool from "../configs/connection.js"
import appConfig from '../configs/appConfig.js';
import { getChampionsWithoutVnuban } from "../configs/queryConstants.js";
import axios from 'axios';

let failureEmailReceivers = appConfig.FAILURE_STAG_EMAILS.split(",");
if (appConfig.ENVIRONMENT == 'production') {
  failureEmailReceivers = appConfig.FAILURE_PROD_EMAILS.split(",");
}

async function sendSqlFailureEmail(err) {
  try {
    const emailBody = {
      toEmails: failureEmailReceivers,
      subject: (appConfig.ENVIRONMENT != 'production' ? 'Test email: ' : '') + 'Notification of vNuban creation failure',
      htmlBody: `<p>Hello Team, <br/> Database error for vNuban creation.</p>
      <p>${err}</p>
      <p>Regards</p>`
    }
   
    let url = `${appConfig.NOTIFICATION_PUSH_URL}/v1/email/send`;

    axios.post(url, emailBody, {headers :{
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${appConfig.authToken}`
    }})
  } catch (error) {
    console.log('Error sending Email ', error);
  }
}

async function sendVNubanFailureEmail(data, err) {
  try {
    const emailBody = {
      toEmails: failureEmailReceivers,
      subject: (appConfig.ENVIRONMENT != 'production' ? 'Test email: ' : '') + 'Notification of vNuban creation failure',
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
    
    let url= `${appConfig.NOTIFICATION_PUSH_URL}/v1/email/send`;

    axios.post(url, emailBody, {headers :{
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${appConfig.authToken}`
    }})
  } catch (error) {
    console.log('Error sending Email ', error);
  }
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

    const notificationMsg = `Dear ${championDetail.champion_name}, your Moneify A/C has been created. ${res.data}`;

    const smsBody = {
      message: notificationMsg,
      phoneNumbers: championDetail.phone,
      
      hannel: 'generic',
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
}

async function sendSmsToChampion(smsBody, championDetail, type) {
  try {
    const url = `${appConfig.NOTIFICATION_PUSH_URL}/v1/sms/send`;

    axios.post(url, smsBody, {headers :{
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${appConfig.authToken}`
    }})
  
  } catch (error) {
    console.log('Error sending SMS notification ', error);
    sendVNubanSMSFailureEmail({
      champion_uuid: championDetail.champion_uuid,
      champion_name: championDetail.champion_name,
      champion_email: championDetail.email,
      champion_phone: championDetail.phone,
      type: type
    }, error);
  }
}

const createVNuban = (req, res) => {
  pool.query(getChampionsWithoutVnuban, async (error, results) => {
    if (error) {
      console.log('Error running SQL query: ' + error);
      sendSqlFailureEmail(error);
      res.status(500).json(error);
    }
    
    let champs = results?.rows || [];
  
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
    
    if (appConfig.ENVIRONMENT != 'production') {
      console.log("vNuban creation started");
    }
    if (req) {
      res.status(200).json(champs);
    }
  })
};

export default createVNuban;