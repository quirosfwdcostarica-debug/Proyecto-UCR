const { Client } = require('pg');

async function test(port) {
  const connectionString = `postgresql://postgres.cpbskmydhtdtutplxozq:ProyectoUCR@aws-1-us-west-1.pooler.supabase.com:${port}/postgres`;
  console.log(`Testing port ${port} with ProyectoUCR: postgresql://postgres.cpbskmydhtdtutplxozq:***@aws-1-us-west-1.pooler.supabase.com:${port}/postgres`);
  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log(`  ✅ SUCCESS on port ${port}!`);
    const res = await client.query('SELECT NOW()');
    console.log('  Result:', res.rows[0]);
    await client.end();
    return true;
  } catch (err) {
    console.log(`  ❌ FAILED on port ${port}: ${err.message}`);
    return false;
  }
}

async function main() {
  await test(6543);
}

main();
