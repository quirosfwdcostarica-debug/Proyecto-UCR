const fs = require('fs');
const path = require('path');

function loadEnv(filePath) {
  if (fs.existsSync(filePath)) {
    const env = fs.readFileSync(filePath, 'utf8');
    env.split('\n').forEach(l => {
      const line = l.trim();
      if (line && !line.startsWith('#') && line.includes('=')) {
        const [k, ...v] = line.split('=');
        process.env[k.trim()] = v.join('=').trim().replace(/['"]+/g, '');
      }
    });
  }
}

// Load env in correct order: .env then .env.local (so local overrides .env)
loadEnv(path.join(__dirname, '.env'));
loadEnv(path.join(__dirname, '.env.local'));

console.log("NEXT_PUBLIC_SUPABASE_URL from env:", process.env.NEXT_PUBLIC_SUPABASE_URL);

const { createClient } = require('@supabase/supabase-js');

async function testWithUrl(url, label) {
  console.log(`\n--- Testing Supabase Auth with ${label} (${url}) ---`);
  
  // Note: We use the SERVICE ROLE key to initialize the admin client, just like lib/supabase-admin.ts does
  const supabase = createClient(url, process.env.SUPABASE_SERVICE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  try {
    const email = "estudiante@ucr.ac.cr";
    const password = "WrongPassword123!"; // We expect a 400 invalid credentials, not fetch failure
    
    console.log(`Calling signInWithPassword for ${email}...`);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.log(`❌ Auth Error (expected if password wrong): ${error.status} - ${error.message}`);
    } else {
      console.log(`✅ Success! Data:`, data);
    }
  } catch (err) {
    console.error(`💥 CRASHED in code execution:`, err);
  }
}

async function main() {
  // Test with trailing slash (current state in .env.local)
  await testWithUrl(process.env.NEXT_PUBLIC_SUPABASE_URL, "URL with trailing slash");
  
  // Test with trailing slash removed
  const cleanUrl = process.env.NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, "");
  await testWithUrl(cleanUrl, "URL without trailing slash");
}

main();
