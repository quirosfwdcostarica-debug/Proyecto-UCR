require('dotenv').config();
const { supabase } = require('./src/config/db');
const db = require('./src/models');

async function seedAdmin() {
  console.log('Authenticating with database...');
  await db.sequelize.authenticate();
  
  const adminEmail = 'stephsgfwd@gmail.com';
  const adminPassword = 'Sami12345';
  const adminName = 'Steph'; // The name wasn't provided, I'll use a placeholder or derived name.
  const adminType = 'ADMINISTRADOR';

  try {
    console.log(`\nProcessing admin ${adminEmail}...`);
    
    let authUserId;
    // 1. Create or get user in Supabase
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true, // Auto-confirm
      user_metadata: { nombre: adminName, tipo: adminType }
    });

    if (authError) {
      if (authError.message.includes('already been registered') || authError.message.includes('already exists')) {
        console.log(`User ${adminEmail} already exists in Supabase Auth. Fetching ID...`);
        // Fetch existing user to get their ID and force update their password and email_confirm
        const { data: listData } = await supabase.auth.admin.listUsers();
        const existing = listData.users.find(x => x.email === adminEmail);
        if (existing) {
          authUserId = existing.id;
          // Update password and confirm status just in case
          await supabase.auth.admin.updateUserById(authUserId, {
            password: adminPassword,
            email_confirm: true,
            user_metadata: { nombre: adminName, tipo: adminType }
          });
          console.log(`Updated Supabase user ${authUserId}`);
        } else {
          console.log(`Could not find existing user ${adminEmail} in Supabase list.`);
          return;
        }
      } else {
        console.error(`Supabase error for ${adminEmail}:`, authError);
        return;
      }
    } else {
      authUserId = authData.user.id;
      console.log(`Created new Supabase user with ID ${authUserId}`);
    }

    // 2. Ensure local DB record exists and is active
    const [userRecord, created] = await db.User.findOrCreate({
      where: { email: adminEmail },
      defaults: {
        id: authUserId,
        email: adminEmail,
        nombre: adminName,
        tipo: adminType,
        email_verified: true,
        activo: true
      }
    });

    if (!created) {
      await userRecord.update({ tipo: adminType, email_verified: true, activo: true });
      console.log(`Updated existing local DB record for ${adminEmail} (set active/verified/ADMINISTRADOR)`);
    } else {
      console.log(`Created local DB record for ${adminEmail}`);
    }

  } catch (err) {
    console.error(`Error seeding admin ${adminEmail}:`, err);
  }

  console.log('\nAdmin seed done!');
  process.exit(0);
}

seedAdmin();
