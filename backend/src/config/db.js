const { createClient } = require('@supabase/supabase-js');
const { Sequelize } = require('sequelize');
const dns = require('dns');
const { URL } = require('url');
require('dotenv').config();

// Forzar IPv4
dns.setDefaultResultOrder('ipv4first');

// ====================
// DEBUG DATABASE URL
// ====================
console.log('\n=== DATABASE DEBUG ===');

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL no está definida');
} else {
  try {
    const dbUrl = new URL(process.env.DATABASE_URL);

    console.log('Host:', dbUrl.hostname);
    console.log('Puerto:', dbUrl.port);
    console.log('Usuario:', dbUrl.username);
    console.log('Base de datos:', dbUrl.pathname);

    // Ocultar contraseña
    const maskedUrl = process.env.DATABASE_URL.replace(
      dbUrl.password,
      '********'
    );

    console.log('DATABASE_URL:', maskedUrl);
  } catch (error) {
    console.error('❌ DATABASE_URL inválida:', error.message);
  }
}

console.log('======================\n');

// ====================
// SUPABASE
// ====================
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_KEY ||
  process.env.SUPABASE_ANON_KEY;

let supabase = null;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  console.log('✅ Supabase client initialized.');
} else {
  console.warn(
    '⚠️ Supabase credentials missing. Please update the .env file.'
  );
}

// ====================
// SEQUELIZE
// ====================
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: console.log,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

const PORT = process.env.PORT || 3001;

module.exports = {
  supabase,
  sequelize,
  PORT
};