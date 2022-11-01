import fetch from "node-fetch";
import schedule from "node-schedule";
import pool from "../configs/connection.js"

const getChamps = (request, response) => {

  pool.query(`select * from (SELECT distinct on (ch.max_champion_id) ch.max_champion_id ,
    cast(ch.created_at AS date) champion_createdate,
    ch.id as champion_uuid,
    co.vehicle_id as vehicle_uuid,
    co.id as contract_uuid,
    lc.name as coll_location_name,
    va.vnuban
    FROM champion_service.champions ch
    INNER JOIN collection_service.contracts co
    ON co.champion_id = ch.id::VARCHAR
    INNER JOIN vehicle_service.vehicles v
    ON co.champion_id = v.champion_id::VARCHAR
    INNER join collection_service.locations lc on lower(ch.city) = lower(lc.name)
    INNER join account_service.users.id = champion_service.champions.account_id
    left join max_third_party_service.virtual_accounts va on va.account_reference::text = ch.id::text
    WHERE
    cast(ch.created_at AS date)  >= CURRENT_DATE - 30
    and co.status_id in (1, 4)
    and ch.champion_status in ('active', 'temporarily_inactive')
    and va.account_reference is null
    ) al
    order by champion_createdate`, async (error, results) => {
    if (error) {
      console.log(error)
    }
    
    //const champs = results.rows
    //const Woven = await fetch(`https://api.staging.max.ng/thirdparty/v1/champion/virtual/account`);
    //const Moneify = await fetch(`https://api.staging.max.ng/thirdparty/v1/champion/monnify/virtual/account`)
  //   createWoven({
  //     "max_champion_id": "MAX-IB-CH-4176",
  //     "champion_createdate": "2022-10-18T18:30:00.000Z",
  //     "champion_uuid": "c205cef6-d317-4aef-8e38-673de0f3882f",
  //     "vehicle_uuid": "2442b0d1-05f1-4320-b240-6e4bae1c7857",
  //     "contract_uuid": "ed01d57c-cd75-43fc-adbe-f6a029aa13ce",
  //     "coll_location_name": "Ibadan",
  //     "vnuban": null
  // })

    champs.map(champ => {
      createWoven({
        customer_reference: champ.champion_uuid,
        email: champ.email,
        mobile_number: champ.mobile_number,
        name: champ.name
      })
      createMonify({
        accountReference: champ.champion_uuid,
        customerEmail: champ.email,
        customerName: champ.name,
        preferredBanks: ["232"]
      })
      
    })
    
    response.status(200).json(results)
    
  })
};

createWoven = async(data)=>{
  try {
    const response = await fetch('https://api.staging.max.ng/thirdparty/v1/champion/virtual/account', {
      method: 'post',
      body: JSON.stringify(data),
      headers: {'Content-Type': 'application/json'}
    });
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.log(error)
  }
}

createMonify = async(data)=>{
  try {
    const response = await fetch('https://api.staging.max.ng/thirdparty/v1/champion/monnify/virtual/account', {
      method: 'post',
      body: JSON.stringify(data),
      headers: {'Content-Type': 'application/json'}
    });
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.log(error)
  }
}

export {getChamps};










   const data= pool.query(`select * from (
        SELECT  
        distinct on (ch.max_champion_id) ch.max_champion_id ,
        cast(ch.created_at AS date) champion_createdate,
        ch.id as champion_uuid,
        co.vehicle_id as vehicle_uuid,
        co.id as contract_uuid,
        lc.name as coll_location_name,
        va.vnuban
        FROM champion_service.champions ch
        INNER JOIN collection_service.contracts co
        ON co.champion_id = ch.id::VARCHAR
        INNER JOIN vehicle_service.vehicles v
        ON co.champion_id = v.champion_id::VARCHAR
        INNER join collection_service.locations lc on lower(ch.city) = lower(lc.name)
        left join max_third_party_service.virtual_accounts va on va.account_reference::text = ch.id::text
        WHERE
        cast(ch.created_at AS date)  >= CURRENT_DATE - 30
        and co.status_id in (1, 4)
        and ch.champion_status in ('active', 'temporarily_inactive')
        and va.account_reference is null
        ) al
        order by champion_createdate
        `);

    /*console.log(data)
    const initVNJob = () => {
        // nodejs schedule
        const rule = new schedule.RecurrenceRule();
        rule.hour = 2; // hour of the day at which it will trigger
        rule.tz = 'Africa/Lagos'; // UTC+1 === WAT timezone (West Africa Time)
      
        const job = schedule.scheduleJob(rule, async () => {
          try {
            const QueryCampions = getChamps()
            const Woven = await fetch(`https://api.staging.max.ng/thirdparty/v1/champion/virtual/account`);
            const Moneify = await fetch(`https://api.staging.max.ng/thirdparty/v1/champion/monnify/virtual/account`)
            // SMS VNuban Details to Champions

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
      
    export default initVNJob;*/
      
      
