require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const db = require('./src/models');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const emailsToDelete = [
  'dchavarriafwdcostarica@gmail.com',
  'agrajalfwdcostarica@gmail.com',
  'alealvfwd@ucr.ac.cr',
  'alealvfwd@gmail.com',
  'andresgerardolv@gmail.com'
];

async function deleteUsers() {
  console.log('Autenticando...');
  await db.sequelize.authenticate();

  const { data: listData, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error('Error listando usuarios de Supabase:', listError);
    return;
  }

  for (const email of emailsToDelete) {
    console.log(`\nEliminando usuario: ${email}`);
    
    // 1. Borrar de Supabase Auth
    const authUser = listData.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (authUser) {
      const { error } = await supabase.auth.admin.deleteUser(authUser.id);
      if (error) console.error(`  - Error borrando de Supabase:`, error.message);
      else console.log(`  - Borrado de Supabase Auth (${authUser.id})`);
    } else {
      console.log(`  - No encontrado en Supabase Auth`);
    }

    // 2. Borrar de la BD backend (USERS, EXALUMNOS, etc se borra en cascada si esta configurado o lo borramos manual)
    const backendUser = await db.User.findOne({ where: { email: email.toLowerCase() } });
    if (backendUser) {
      await db.Exalumno.destroy({ where: { user_id: backendUser.id } });
      await db.Estudiante.destroy({ where: { user_id: backendUser.id } });
      await backendUser.destroy();
      console.log(`  - Borrado de BD Backend (Sequelize USERS)`);
    } else {
      console.log(`  - No encontrado en BD Backend`);
    }

    // Prisma deletion will be done via separate script in frontend

  }

  console.log('\n=== Eliminacion completa ===');
  process.exit(0);
}

deleteUsers().catch(console.error);
