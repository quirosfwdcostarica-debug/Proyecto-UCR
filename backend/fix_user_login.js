require('dotenv').config();
const { supabase } = require('./src/config/db');
const db = require('./src/models');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function checkUser(email) {
  console.log('\n=== DIAGNÓSTICO DE USUARIO ===\n');

  // 1. Verificar en Supabase
  console.log(`🔍 Buscando ${email} en Supabase...`);
  const { data: listData } = await supabase.auth.admin.listUsers();
  const supabaseUser = listData.users.find(x => x.email === email);

  if (!supabaseUser) {
    console.log('❌ Usuario NO ENCONTRADO en Supabase');
    return false;
  }
  console.log('✅ Usuario encontrado en Supabase');
  console.log(`   - ID: ${supabaseUser.id}`);
  console.log(`   - Email confirmado: ${supabaseUser.email_confirmed_at ? '✅ SÍ' : '❌ NO'}`);

  // 2. Verificar en BD local
  console.log(`\n🔍 Buscando en BD local...`);
  const localUser = await db.User.findOne({ where: { email } });

  if (!localUser) {
    console.log('⚠️  Usuario NO ENCONTRADO en BD local (desajuste)');
    return { supabaseUser, localUser: null };
  }
  console.log('✅ Usuario encontrado en BD local');
  console.log(`   - ID: ${localUser.id}`);
  console.log(`   - Email verificado: ${localUser.email_verified ? '✅ SÍ' : '❌ NO'}`);
  console.log(`   - Activo: ${localUser.activo ? '✅ SÍ' : '❌ NO'}`);
  console.log(`   - Tipo: ${localUser.tipo}`);

  return { supabaseUser, localUser };
}

async function fixUser(email) {
  console.log('\n=== REPARACIÓN DE USUARIO ===\n');

  const { supabaseUser, localUser } = await checkUser(email);

  if (!supabaseUser) {
    console.log('❌ No se puede reparar: usuario no existe en Supabase');
    return false;
  }

  if (!localUser) {
    console.log('\n🔧 Creando registro en BD local...');
    try {
      await db.User.create({
        id: supabaseUser.id,
        email: supabaseUser.email,
        nombre: supabaseUser.user_metadata?.nombre || email.split('@')[0],
        tipo: supabaseUser.user_metadata?.tipo || 'EXALUMNO',
        email_verified: true,
        activo: true
      });
      console.log('✅ Usuario creado en BD local');
    } catch (err) {
      console.error('❌ Error creando usuario:', err.message);
      return false;
    }
  } else {
    console.log('\n🔧 Actualizando registros...');
    try {
      // Asegurar que email está verificado en Supabase
      if (!supabaseUser.email_confirmed_at) {
        console.log('   - Confirmando email en Supabase...');
        await supabase.auth.admin.updateUserById(supabaseUser.id, {
          email_confirm: true
        });
        console.log('     ✅ Email confirmado en Supabase');
      }

      // Actualizar en BD local
      console.log('   - Actualizando BD local...');
      await localUser.update({
        email_verified: true,
        activo: true
      });
      console.log('     ✅ Usuario activado en BD local');
    } catch (err) {
      console.error('❌ Error actualizando:', err.message);
      return false;
    }
  }

  console.log('\n✅ USUARIO REPARADO - Intenta iniciar sesión nuevamente');
  return true;
}

async function listAllUsers() {
  console.log('\n=== LISTA DE USUARIOS ===\n');
  
  try {
    const users = await db.User.findAll({
      attributes: ['email', 'email_verified', 'activo', 'tipo', 'nombre']
    });

    if (users.length === 0) {
      console.log('No hay usuarios en la BD');
      return;
    }

    console.log('📋 Usuarios en BD local:\n');
    users.forEach(u => {
      const status = u.activo && u.email_verified ? '✅' : '⚠️';
      console.log(`${status} ${u.email} (${u.tipo}) - Activo: ${u.activo}, Verificado: ${u.email_verified}`);
    });
  } catch (err) {
    console.error('Error listando usuarios:', err.message);
  }
}

async function main() {
  console.log('🔐 HERRAMIENTA DE DIAGNÓSTICO Y REPARACIÓN DE LOGIN\n');

  await db.sequelize.authenticate();
  console.log('✅ Conectado a la BD\n');

  rl.question('¿Qué deseas hacer?\n1. Verificar usuario\n2. Reparar usuario\n3. Listar todos los usuarios\n\nOpción (1-3): ', async (option) => {
    if (option === '1' || option === '2') {
      rl.question('Ingresa el correo electrónico: ', async (email) => {
        try {
          if (option === '1') {
            await checkUser(email);
          } else {
            await fixUser(email);
          }
        } catch (err) {
          console.error('Error:', err.message);
        }
        rl.close();
        process.exit(0);
      });
    } else if (option === '3') {
      try {
        await listAllUsers();
      } catch (err) {
        console.error('Error:', err.message);
      }
      rl.close();
      process.exit(0);
    } else {
      console.log('Opción inválida');
      rl.close();
      process.exit(1);
    }
  });
}

main().catch(err => {
  console.error('Error fatal:', err);
  process.exit(1);
});
