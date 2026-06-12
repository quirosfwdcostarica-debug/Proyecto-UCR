const { Client } = require('pg');
require('dotenv').config();

async function test() {
  console.log('Connecting explicitly...');
  const client = new Client({
    user: 'postgres.cpbskmydhtdtutplxozq',
    password: 'SistemasFWD24',
    host: 'aws-1-us-west-1.pooler.supabase.com',
    port: 5432,
    database: 'postgres',
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('Successfully connected explicitly!');
    const res = await client.query('SELECT NOW()');
    console.log('Query result:', res.rows[0]);
    await client.end();
  } catch (err) {
    console.error('Explicit connection failed:', err);
  }
}

test();
