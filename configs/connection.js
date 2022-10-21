import pg from 'pg';

import config from "./appConfig.js";

const Pool = pg.Pool;

const pool = new Pool({
  user: config.db.user,
  host: config.db.host,
  database: config.db.database,
  password: config.db.password,
  port: config.db.port,
});

export default pool;
