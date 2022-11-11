import fetch from "node-fetch";
import schedule from "node-schedule";

const postSlackMessage = async (message) => {

  try {
    const response = await fetch(process.env.SLACK_WEBHOOK_URL, {
      method: 'post',
      body: JSON.stringify({
        "blocks": [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "Auto generated contract creation status details:\n"
            }
          },
          {
            "type": "section",
            "fields": [
              {
                "type": "mrkdwn",
                "text": `*Status:*\n${message.status}`
              },
              {
                "type": "mrkdwn",
                "text": `*Environment:*\n${message.env}`
              },
              {
                "type": "mrkdwn",
                "text": `*Runtime:*\n${message.runTime}`
              },
              {
                "type": "mrkdwn",
                "text": `*Total record processed:*\n${message.totalNoOfRecordProcessed}`
              },
              {
                "type": "mrkdwn",
                "text": `*Time taken to process(second):*\n${message.totalTimeTaken}`
              },
            ]
          },
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "*Result:*\n\n ```" + message.result + "``` "
            }
          },
        ]
      })
    });
    const resText = await response.text();
    if (resText !== "ok") {
      throw new Error(resText);
    } else {
      console.log(resText);
      console.log("Successfully posted message to slack channel")
    }
  } catch(e) {
    console.log(e.message);
    console.log("Failed to post message to slack channel")
  }
};

const initCronJob = () => {
  // nodejs schedule
  const rule = new schedule.RecurrenceRule();
  rule.hour = 23; // hour of the day at which it will trigger
  rule.tz = 'Africa/Lagos'; // UTC+1 === WAT timezone (West Africa Time)

  const job = schedule.scheduleJob("*/10 * * * * *", async () => {
    const startTime = (new Date()).getTime();
    const message = {
      status: "",
      env: (process?.env?.DB_DATABASE?.indexOf("v2staging") > -1) ? "Staging" : "Production",
      runTime: new Date(),
      totalTimeTaken: 0,
      totalNoOfRecordProcessed: 0,
      result:""
    };
    try {
      const result = await fetch(`http://localhost:4020/create-contracts?days=30&noOfRecords=10`);
      const responseJSON = await result.json();
      message.status="Success";
      message.totalNoOfRecordProcessed = responseJSON?.length || 0;
      message.result = JSON.stringify(responseJSON);
    } catch (e) {
      message.status="Failure";
      message.result=e.message;
    } finally {
      const endTime = (new Date()).getTime();
      message.totalTimeTaken = (endTime - startTime)/1000;
      postSlackMessage(message);
    }
  });
};

export default initCronJob;
