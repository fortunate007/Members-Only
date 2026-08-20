const { Pool } = require("pg");

// A single shared connection pool, used everywhere we talk to Postgres.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle Postgres client", err);
  process.exit(1);
});

module.exports = pool;
