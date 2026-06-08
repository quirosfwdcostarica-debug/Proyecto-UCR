const { createClient } = require('@supabase/supabase-js');
const { Sequelize } = require('sequelize');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

let supabase = null;

if (supabaseUrl && supabaseKey && supabaseUrl !== "tu_url_de_supabase_aqui") {
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log('Supabase client initialized.');
} else {
  console.warn('Supabase credentials missing or placeholder found. Please update the .env file.');
}

const sequelize = new Sequelize(process.env.DATABASE_URL || 'postgres://localhost:5432/postgres', {
  dialect: 'postgres',
  logging: false,
});

const PORT = process.env.PORT || 3000;

module.exports = {
  supabase,
  sequelize,
  PORT
};