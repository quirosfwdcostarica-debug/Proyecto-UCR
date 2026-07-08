const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const lines = env.split('\n');
const vars = {};
lines.forEach(line => {
  const [key, ...rest] = line.split('=');
  if (key && rest.length > 0) {
    vars[key.trim()] = rest.join('=').trim().replace(/^"|"$/g, '').replace(/^'|'$/g, '');
  }
});

const supabase = createClient(
  vars.NEXT_PUBLIC_SUPABASE_URL,
  vars.SUPABASE_SERVICE_KEY
);

async function checkTelefono() {
  const { data, error } = await supabase.from('USERS').select('telefono').limit(1);
  console.log("Check result:", { data, error });
}

checkTelefono();
