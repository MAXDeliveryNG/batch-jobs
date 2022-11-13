const getContractsQuery =  `SELECT * FROM collection_service.contracts`;
const getChampionsWithoutContractQuery = (days=30) => `select * from (
  SELECT  
  distinct on (ch.max_champion_id) ch.max_champion_id ,
  (u.first_name || ' ' ||  u.last_name ) AS champion_name,
  vt.name as "Vehicle Type",
  v.plate_number,
  v.max_vehicle_id,
  cast(ch.created_at AS date) champion_createdate,
  ch.id as champion_uuid,
  lc.name as coll_location_name,
  hp.value as vehicle_hpvalue,
  hp.daily_remit as daily_remit,
  v.id as vehicle_id,
  'TRUE' as has_insurance,
  hp.standard_duration as standard_duration,
  hp.insurance_duration as insurance_duration,
  v.pricing_template_id as pricing_template_id,
  ch.is_driver_license as driver_license,
  va.vnuban
  FROM vehicle_service.champion_vehicle_histories ch_v_history
  INNER JOIN vehicle_service.vehicles v
  ON v.id = ch_v_history.vehicle_id
  LEFT JOIN champion_service.champions ch
  ON ch.id::VARCHAR = v.champion_id
  LEFT JOIN account_service.users u
  ON u.id = ch.account_id
  LEFT JOIN collection_service.contracts co
  ON co.champion_id = ch.id::VARCHAR
  INNER JOIN
  vehicle_service.vehicle_types vt ON vt.id = v.vehicle_type_id
  left join collection_service.locations lc on lower(ch.city) = lower(lc.name)
  left join vehicle_service.hpvs hp on v.hpv_id = hp.id
  left join max_third_party_service.virtual_accounts va on va.account_reference::text = ch.id::text
  WHERE
  cast(ch.created_at AS date)  >= CURRENT_DATE - ${days}
  AND v.champion_id IS NOT NULL
  AND co.daily_remit is null
  ) al
  ORDER BY al.champion_createdate ASC
  `;

const getChampionsWithoutContractVAMSQuery = ({max_champion_id, max_vehicle_id}) => `select * from (
  SELECT  
  distinct on (ch.max_champion_id) ch.max_champion_id ,
  (u.first_name || ' ' ||  u.last_name ) AS champion_name,
  vt.name as "Vehicle Type",
  v.plate_number,
  v.max_vehicle_id,
  cast(ch.created_at AS date) champion_createdate,
  ch.id as champion_uuid,
  lc.name as coll_location_name,
  hp.value as vehicle_hpvalue,
  hp.daily_remit as daily_remit,
  v.id as vehicle_id,
  'TRUE' as has_insurance,
  hp.standard_duration as standard_duration,
  hp.insurance_duration as insurance_duration,
  v.pricing_template_id as pricing_template_id,
  ch.is_driver_license as driver_license,
  va.vnuban
  FROM vehicle_service.champion_vehicle_histories ch_v_history
  INNER JOIN vehicle_service.vehicles v
  ON v.id = ch_v_history.vehicle_id
  LEFT JOIN champion_service.champions ch
  ON ch.id::VARCHAR = v.champion_id
  LEFT JOIN account_service.users u
  ON u.id = ch.account_id
  LEFT JOIN collection_service.contracts co
  ON co.champion_id = ch.id::VARCHAR
  INNER JOIN
  vehicle_service.vehicle_types vt ON vt.id = v.vehicle_type_id
  left join collection_service.locations lc on lower(ch.city) = lower(lc.name)
  left join vehicle_service.hpvs hp on v.hpv_id = hp.id
  left join max_third_party_service.virtual_accounts va on va.account_reference::text = ch.id::text
  WHERE
  ch.max_champion_id='${max_champion_id}'
  AND v.max_vehicle_id='${max_vehicle_id}'
  AND co.daily_remit is null
  ) al
  ORDER BY al.champion_createdate ASC
  `;
export {
  getContractsQuery,
  getChampionsWithoutContractQuery,
  getChampionsWithoutContractVAMSQuery
};
