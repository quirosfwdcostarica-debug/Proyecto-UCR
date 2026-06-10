require('dotenv').config();
const { supabase } = require('./src/config/db');
const db = require('./src/models');

async function forceCreate() {
  console.log('Authenticating with database...');
  await db.sequelize.authenticate();
  
  const usersToCreate = [
    {
      email: 'estudiante@ucr.ac.cr',
      password: 'Estudiante12345',
      nombre: 'Estudiante',
      tipo: 'ESTUDIANTE'
    },
    {
      email: 'exalumno@ucr.ac.cr',
      password: 'Exalumno12345',
      nombre: 'exalumno',
      tipo: 'EXALUMNO'
    }
  ];

  for (const u of usersToCreate) {
    try {
      console.log(`\nProcessing ${u.email}...`);
      
      let authUserId;
      // 1. Create or get user in Supabase
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: u.email,
        password: u.password,
        email_confirm: true, // Auto-confirm
        user_metadata: { nombre: u.nombre, tipo: u.tipo }
      });

      if (authError) {
        if (authError.message.includes('already been registered') || authError.message.includes('already exists')) {
          console.log(`User ${u.email} already exists in Supabase Auth. Fetching ID...`);
          // Fetch existing user to get their ID and force update their password and email_confirm
          const { data: listData } = await supabase.auth.admin.listUsers();
          const existing = listData.users.find(x => x.email === u.email);
          if (existing) {
            authUserId = existing.id;
            // Update password and confirm status just in case
            await supabase.auth.admin.updateUserById(authUserId, {
              password: u.password,
              email_confirm: true
            });
            console.log(`Updated Supabase user ${authUserId}`);
          } else {
             console.log(`Could not find existing user ${u.email} in Supabase list.`);
             continue;
          }
        } else {
          console.error(`Supabase error for ${u.email}:`, authError);
          continue;
        }
      } else {
        authUserId = authData.user.id;
        console.log(`Created new Supabase user with ID ${authUserId}`);
      }

      // 2. Ensure local DB record exists and is active
      const [userRecord, created] = await db.User.findOrCreate({
        where: { email: u.email },
        defaults: {
          id: authUserId,
          email: u.email,
          nombre: u.nombre,
          tipo: u.tipo,
          email_verified: true,
          activo: true
        }
      });

      if (!created) {
        await userRecord.update({ email_verified: true, activo: true });
        console.log(`Updated existing local DB record for ${u.email} (set active/verified)`);
      } else {
        console.log(`Created local DB record for ${u.email}`);
      }

      // 3. Create specific profile
      if (u.tipo === 'ESTUDIANTE') {
        await db.Estudiante.findOrCreate({ where: { user_id: authUserId } });
        console.log(`Ensured Estudiante profile exists`);
      } else {
        await db.Exalumno.findOrCreate({ 
          where: { user_id: authUserId },
          defaults: { escuela_facultad: 'Ingeniería', anio_graduacion: 2020 }
        });
        console.log(`Ensured Exalumno profile exists`);
      }

    } catch (err) {
      console.error(`Error processing ${u.email}:`, err);
    }
  }

  console.log('\nAll done!');
  process.exit(0);
}

forceCreate();
