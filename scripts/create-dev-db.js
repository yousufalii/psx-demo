const { Client } = require('pg');

const databaseName = 'psx_portfolio';

async function createDevelopmentDatabase() {
  const client = new Client({
    host: process.env.PGHOST || 'localhost',
    port: Number(process.env.PGPORT || 5432),
    database: 'postgres',
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || 'postgres',
  });

  await client.connect();
  try {
    const existing = await client.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [databaseName],
    );

    if (existing.rowCount === 0) {
      await client.query(`CREATE DATABASE ${databaseName}`);
      console.log(`Created local database: ${databaseName}`);
      return;
    }

    console.log(`Local database already exists: ${databaseName}`);
  } finally {
    await client.end();
  }
}

createDevelopmentDatabase().catch((error) => {
  console.error('Unable to create local development database:', error.message);
  process.exitCode = 1;
});
