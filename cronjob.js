import fetch from "node-fetch";
import schedule from "node-schedule";

const postSlackMessage = async (message) => {

  try {
    const response = await fetch('https://hooks.slack.com/services/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', {
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
    // fetch("https://hooks.slack.com/services/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", {text: message})
  } catch(e) {
    console.log(e.message)
  }
};

const initCronJob = () => {
  // nodejs schedule
  const rule = new schedule.RecurrenceRule();
  rule.hour = 0; // hour of the day at which it will trigger
  rule.minute = 15;
  rule.tz = 'UTC+1'; // UTC+1 === WAT timezone (West Africa Time)

  const job = schedule.scheduleJob(rule, async () => {
    const startTime = (new Date()).getTime();
    const message = {
      status: "",
      runTime: new Date(),
      totalTimeTaken: 0,
      totalNoOfRecordProcessed: 0,
      result:""
    };
    try {
      console.time('TimeTakenCronJob');
      const result = await fetch(`http://localhost:8080/create-contracts?days=30&noOfRecords=10`);
      const responseJSON = await result.json();
      message.status="Success";
      message.totalNoOfRecordProcessed = responseJSON?.length || 0;
      message.result = JSON.stringify(responseJSON);
      console.timeEnd('TimeTakenCronJob');
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
