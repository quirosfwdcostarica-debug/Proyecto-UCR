require('dotenv').config();
const { supabase } = require('./src/config/db');

async function testLogin() {
  const email = 'stephsgfwd@gmail.com';
  const password = 'Sami12345';
  
  console.log('Attempting sign-in for:', email);
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error) {
    console.error('Supabase Auth Sign-In Error:', error.message, error.status);
  } else {
    console.log('Supabase Auth Sign-In Success! User ID:', data.user.id);
  }
  process.exit(0);
}

testLogin();
