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

    console.log('Adding column nivel_beca to table ESTUDIANTES...');
    await sequelize.query('ALTER TABLE "ESTUDIANTES" ADD COLUMN IF NOT EXISTS nivel_beca TEXT;');
    console.log('✅ Column nivel_beca added successfully to ESTUDIANTES table!');

    // Show columns for verification
    const [columns] = await sequelize.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'ESTUDIANTES'
    `);
    console.log('\nColumns for table ESTUDIANTES:');
    columns.forEach(c => console.log(` - ${c.column_name}: ${c.data_type}`));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

run();
