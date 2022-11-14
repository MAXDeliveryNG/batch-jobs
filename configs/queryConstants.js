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

  const getChampionsWithoutVnuban = `select * from (
    SELECT  
    distinct on (ch.max_champion_id) ch.max_champion_id ,
    cast(ch.created_at AS date) champion_createdate,
    ch.id as champion_uuid,
    co.vehicle_id as vehicle_uuid,
    co.id as contract_uuid,
    lc.name as coll_location_name,
    
    (u.first_name || ' ' ||  u.last_name ) AS champion_name,
    u.email,
    u.phone,
    
    va.vnuban
    FROM champion_service.champions ch
    INNER JOIN collection_service.contracts co
    ON co.champion_id = ch.id::VARCHAR
    INNER JOIN vehicle_service.vehicles v
    ON co.champion_id = v.champion_id::VARCHAR
    INNER join collection_service.locations lc on lower(ch.city) = lower(lc.name)
    INNER JOIN configuration_service.cities city ON lower(lc.name) = lower(city.name)
    INNER JOIN configuration_service.states state ON city.state_id = state.id
    INNER JOIN configuration_service.countries country ON state.country_id = country.id
    INNER JOIN account_service.users u ON u.id = ch.account_id
    left join max_third_party_service.virtual_accounts va on va.account_reference::text = ch.id::text
    WHERE
    country.name = 'Nigeria'
    and cast(ch.created_at AS date)  >= CURRENT_DATE - 3000
    and co.status_id in (1, 4)
    and ch.champion_status in ('active', 'temporarily_inactive')
    and va.account_reference is null
    ) al
    order by champion_createdate`;

export {
  getContractsQuery,
  getChampionsWithoutContractQuery,
  getChampionsWithoutVnuban
};
