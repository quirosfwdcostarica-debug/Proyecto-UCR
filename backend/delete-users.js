const { createClient } = require('@supabase/supabase-js');
const db = require('./src/models');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const emailsToDelete = [
    'Yosimarvv@gmail.com',
    'davidchapps08@gmail.com',
    'jbrionesfwdcostarica@gmail.com',
    'a14knight031031@gmail.com',
    'destroyer007golosoinsano@gmail.com',
    'alealvarela@gmail.com',
    'stephsgfwd@gmail.com'
  ];

  for (const email of emailsToDelete) {
    console.log(`Borrando ${email}...`);
    try {
      // Find in local table
      const user = await db.User.findOne({ where: { email } });
      
      if (user) {
        const userId = user.id;
        console.log(`Encontrado en tabla Users con id: ${userId}`);
        
        // Delete related
        await db.Estudiante.destroy({ where: { user_id: userId } });
        await db.Exalumno.destroy({ where: { user_id: userId } });
        await db.User.destroy({ where: { id: userId } });
        console.log(`Eliminado de las tablas de Sequelize.`);
      } else {
        console.log(`No encontrado en tabla Users de Sequelize.`);
      }

      // Find in Supabase Auth
      const { data: authUsers, error: listError } = await supabase.auth.admin.listUsers();
      if (listError) throw listError;
      
      const authUser = authUsers.users.find(u => u.email === email);
      if (authUser) {
        console.log(`Encontrado en Supabase Auth con id: ${authUser.id}`);
        const { error: delError } = await supabase.auth.admin.deleteUser(authUser.id);
        if (delError) throw delError;
        console.log(`Eliminado de Supabase Auth.`);
      } else {
        console.log(`No encontrado en Supabase Auth.`);
      }
    } catch (e) {
      console.error(`Error procesando ${email}:`, e.message);
    }
  }

  console.log('Terminado.');
  process.exit(0);
}

run();
