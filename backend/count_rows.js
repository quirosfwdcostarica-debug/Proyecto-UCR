const { Sequelize } = require('sequelize');
const dns = require('dns');

dns.setDefaultResultOrder('ipv4first');

const url = 'postgresql://postgres.cpbskmydhtdtutplxozq:SistemasFWD2026@aws-1-us-west-1.pooler.supabase.com:5432/postgres';

const sequelize = new Sequelize(url, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

async function run() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    for (const tName of ['Estudiante', 'ESTUDIANTES', 'User', 'USERS', 'Exalumno', 'EXALUMNOS', 'Match', 'MATCHES']) {
      try {
        const [[{ count }]] = await sequelize.query(`SELECT COUNT(*) as count FROM "${tName}"`);
        console.log(`Table "${tName}" has ${count} rows.`);
      } catch (err) {
        console.error(`Error querying table "${tName}":`, err.message);
      }
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

run();
