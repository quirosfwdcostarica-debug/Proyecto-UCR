const { Sequelize } = require('sequelize');
const dns = require('dns');

dns.setDefaultResultOrder('ipv4first');

const passwords = [
  'quirosfwd',
  'quirosfwdcostarica',
  'quirosfwd24',
  'quirosfwd26',
  'quirosfwdcostarica24',
  'quirosfwdcostarica26',
  'quirosfwdcostarica2024',
  'quirosfwdcostarica2026'
];

async function test() {
  for (const pw of passwords) {
    const url = `postgresql://postgres.cpbskmydhtdtutplxozq:${pw}@aws-1-us-west-1.pooler.supabase.com:6543/postgres`;
    console.log(`Testing with password: ${pw}`);
    const seq = new Sequelize(url, {
      dialect: 'postgres',
      logging: false,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      }
    });
    try {
      await seq.authenticate();
      console.log(`✅ SUCCESS with password: ${pw}`);
      process.exit(0);
    } catch (e) {
      console.log(`❌ FAILED: ${e.message}`);
    }
  }
  console.log('All tests failed.');
  process.exit(1);
}

test();
