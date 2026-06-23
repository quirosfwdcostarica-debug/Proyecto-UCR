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

loadEnv(path.join(__dirname, '.env'));
loadEnv(path.join(__dirname, '.env.local'));

const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, "");
const supabase = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function main() {
  console.log("Querying USERS table via Supabase REST API...");
  const { data, error } = await supabase.from('USERS').select('id, email, nombre, tipo, status, activo').limit(5);
  
  if (error) {
    console.error("❌ REST API Query Failed:", error);
  } else {
    console.log("✅ REST API Query Succeeded! Users found:", data.length);
    data.forEach(u => console.log(`- ID: ${u.id}, Email: ${u.email}, Name: ${u.nombre}, Tipo: ${u.tipo}, Status: ${u.status}, Activo: ${u.activo}`));
  }
}

main();
