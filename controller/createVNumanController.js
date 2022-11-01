import fetch from "node-fetch";
import schedule from "node-schedule";
import pool from "../configs/connection.js"
import appConfig from '../configs/appConfig.js';
import { getChampionsWithoutVnuban } from "../configs/queryConstants.js";
import { RemoteEmailNotificationService } from '../remote/remote-email-notification-service';
import { LoggingService } from '../services/logger';
import { HttpService } from '../services/http-service';

function sendSqlFailureEmail(err) {
  const emailBody = {
    toEmails: [
      'collections@maxdrive.ai', 
      'props-email-notification@maxdrive.ai'
    ],
    subject: 'vNuban Creation Failure',
    htmlBody: `<p>Hello Team, <br/> Database error for vNuban creation.</p>
    <p>${err}</p>
    <p>Regards</p>`
  }
  RemoteEmailNotificationService.sendEmail({ data: emailBody });
}

function sendVNubanFailureEmail(data, err) {
  const emailBody = {
    toEmails: [
      'collections@maxdrive.ai', 
      'props-email-notification@maxdrive.ai'
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
  RemoteEmailNotificationService.sendEmail({ data: emailBody });
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
}

async function sendSmsToChampion(smsBody, championDetail, type) {
  try {
    const url = `${appConfig.NOTIFICATION_PUSH_URL}/v1/sms/send`;

    await HttpService.post<any>({
      url,
      data: smsBody,
      headers: [['Authorization', `Bearer ${this.v1Token}`]],
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
}

const getChamps = (req, res) => {
  pool.query(getChampionsWithoutVnuban, async (error, results) => {
    if (error) {
      console.log('Error running SQL query: ' + error);
      sendSqlFailureEmail(error);
      res.status(500).json(error);
    }
    
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
};

export { getChamps };