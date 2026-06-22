// login_test.js – simple script to call the backend login endpoint
// Edit the email and password variables with your credentials before running.
const fetch = require('node-fetch'); // node-fetch is bundled with Node 18+, otherwise install.

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const email = 'YOUR_EMAIL@example.com'; // <-- replace
const password = 'YOUR_PASSWORD'; // <-- replace

(async () => {
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    console.log('Status:', res.status);
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error invoking login:', err);
  }
})();
