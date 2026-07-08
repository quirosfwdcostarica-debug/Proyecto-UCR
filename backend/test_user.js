require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function main() {
  console.log("Buscando a yosimarvv@gmail.com...");
  const { data, error } = await supabase.from('USERS').select('*').eq('email', 'yosimarvv@gmail.com').maybeSingle();
  if (error) console.error("Error BD:", error);
  else console.log("Usuario encontrado:", data);
  
  console.log("Buscando en Auth...");
  const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
  if (authError) console.error("Error Auth:", authError);
  else {
    const user = authData.users.find(u => u.email === 'yosimarvv@gmail.com');
    console.log("Usuario en Auth:", user ? "Sí existe" : "No existe");
  }
}
main();
