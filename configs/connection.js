import pg from 'pg';

import CONFIG from "./appConfig.js";

const Pool = pg.Pool;

const config = CONFIG.dev;

const pool = new Pool({
  user: config.db.user,
  host: config.db.host,
  database: config.db.database,
  password: config.db.password,
  port: config.db.port,
});

export default pool;
