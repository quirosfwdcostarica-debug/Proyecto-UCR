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

    // Query tables
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('Tables in database:', tables.map(t => t.table_name));

    // For tables Estudiante or ESTUDIANTES, show columns
    for (const tName of ['Estudiante', 'ESTUDIANTES', 'User', 'USERS']) {
      try {
        const [columns] = await sequelize.query(`
          SELECT column_name, data_type 
          FROM information_schema.columns 
          WHERE table_name = '${tName}'
        `);
        if (columns.length > 0) {
          console.log(`\nColumns for table ${tName}:`);
          columns.forEach(c => console.log(` - ${c.column_name}: ${c.data_type}`));
        } else {
          console.log(`\nTable ${tName} has no columns or does not exist.`);
        }
      } catch (err) {
        console.error(`Error querying table ${tName}:`, err.message);
      }
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

run();
