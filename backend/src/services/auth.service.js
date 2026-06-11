const { supabase } = require('../config/db');
const { sendMagicLink, sendAlumniPendingEmail, sendPasswordReset, sendAlumniApprovedEmail } = require('../config/email');
const db = require('../models');
const crypto = require('crypto');

// Validación del dominio UCR
const isUCREmail = (email) => email?.toLowerCase().endsWith('@ucr.ac.cr');

// Validación de contraseña: mínimo 8 chars, una mayúscula y un número
const isValidPassword = (password) => {
  if (!password || password.length < 8) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  return true;
};

// Generar contraseña temporal segura (8+ caracteres, una mayúscula, un número)
const generateTemporaryPassword = () => {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '!@#$%^&*';
  
  let password = '';
  // Garantizar al menos una mayúscula
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  // Garantizar al menos un número
  password += numbers[Math.floor(Math.random() * numbers.length)];
  // Agregar 6 caracteres más aleatorios
  const all = uppercase + lowercase + numbers + special;
  for (let i = 0; i < 6; i++) {
    password += all[Math.floor(Math.random() * all.length)];
  }
  
  // Mezclar la contraseña
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

class AuthService {

  /**
   * RF-01: Registro de Estudiante
   * Solo permite correos @ucr.ac.cr. Envía magic link de verificación.
   */
  async registerStudent({ email, nombre, password }) {
    // Validaciones
    if (!isUCREmail(email)) {
      throw { status: 400, message: 'Solo se permiten correos institucionales @ucr.ac.cr para estudiantes.' };
    }
    if (!nombre || nombre.trim().length < 3) {
      throw { status: 400, message: 'El nombre debe tener al menos 3 caracteres.' };
    }
    if (!isValidPassword(password)) {
      throw { status: 400, message: 'La contraseña debe tener mínimo 8 caracteres, una mayúscula y un número.' };
    }

    // Verificar si ya existe
    const existingUser = await db.User.findOne({ where: { email } });
    if (existingUser) {
      throw { status: 409, message: 'Ya existe una cuenta con este correo.' };
    }

    // Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: false, // Requiere verificación vía magic link
      user_metadata: { nombre, tipo: 'ESTUDIANTE' }
    });

    if (authError) {
      throw { status: 500, message: 'Error al crear cuenta: ' + authError.message };
    }

    // Crear registro en nuestra BD
    await db.User.create({
      id: authData.user.id,
      email,
      nombre: nombre.trim(),
      tipo: 'ESTUDIANTE',
      email_verified: false,
      activo: true,
    });

    // Crear perfil de estudiante vacío (se completa después)
    await db.Estudiante.create({ user_id: authData.user.id });

    // Generar token de verificación y enviarlo
    const verificationToken = crypto.randomBytes(32).toString('hex');
    // Guardar token en metadata de Supabase (o usar Supabase's own magic link)
    await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email,
    });

    await sendMagicLink(email, verificationToken);

    return {
      message: 'Registro exitoso. Revisa tu correo para verificar tu cuenta. El enlace expira en 24 horas.',
      userId: authData.user.id,
    };
  }

  /**
   * RF-01: Registro de Exalumno
   * Permite cualquier correo. El perfil queda pendiente de verificación admin.
   */
  async registerAlumni({ email, nombre, password, carrera, escuela_facultad, anio_graduacion }) {
    // Validaciones
    if (!nombre || nombre.trim().length < 3) {
      throw { status: 400, message: 'El nombre debe tener al menos 3 caracteres.' };
    }
    if (!isValidPassword(password)) {
      throw { status: 400, message: 'La contraseña debe tener mínimo 8 caracteres, una mayúscula y un número.' };
    }
    const currentYear = new Date().getFullYear();
    if (!anio_graduacion || anio_graduacion < 1940 || anio_graduacion > currentYear) {
      throw { status: 400, message: `El año de graduación debe estar entre 1940 y ${currentYear}.` };
    }
    if (!carrera) {
      throw { status: 400, message: 'Debe seleccionar al menos una carrera.' };
    }

    // Verificar si ya existe
    const existingUser = await db.User.findOne({ where: { email } });
    if (existingUser) {
      throw { status: 409, message: 'Ya existe una cuenta con este correo.' };
    }

    // Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // El exalumno confirma correo pero queda pendiente de admin
      user_metadata: { nombre, tipo: 'EXALUMNO' }
    });

    if (authError) {
      throw { status: 500, message: 'Error al crear cuenta: ' + authError.message };
    }

    // Crear usuario en BD con estado PENDIENTE
    await db.User.create({
      id: authData.user.id,
      email,
      nombre: nombre.trim(),
      tipo: 'EXALUMNO',
      email_verified: true,
      activo: false, // Pendiente de aprobación por admin
    });

    // Crear perfil de exalumno
    await db.Exalumno.create({
      user_id: authData.user.id,
      escuela_facultad,
      anio_graduacion: parseInt(anio_graduacion),
    });

    await sendAlumniPendingEmail(email, nombre.trim());

    return {
      message: 'Registro exitoso. Tu perfil está siendo verificado por la Fundación. Te notificaremos en máximo 48 horas.',
      userId: authData.user.id,
    };
  }

  /**
   * RF-01: Login con correo y contraseña
   */
  async login({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data?.session) {
      const message = error?.message || 'Correo o contraseña incorrectos.';
      throw { status: 401, message };
    }

    // Verificar el usuario en nuestra BD
    const user = await db.User.findOne({ where: { email } });
    if (!user) {
      throw { status: 404, message: 'Usuario no encontrado en el sistema.' };
    }
    if (!user.email_verified) {
      throw { status: 403, message: 'Debes verificar tu correo antes de iniciar sesión.' };
    }
    if (!user.activo) {
      throw { status: 403, message: 'Tu cuenta está pendiente de verificación o ha sido suspendida.' };
    }

    const session = data.session;
    if (!session?.access_token || !session?.refresh_token) {
      throw { status: 500, message: 'No se pudo iniciar sesión. Intenta de nuevo más tarde.' };
    }

    return {
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        tipo: user.tipo,
        foto_url: user.foto_url,
      }
    };
  }

  /**
   * RF-01: Reenviar magic link (expira en 24 horas)
   */
  async resendMagicLink({ email }) {
    const user = await db.User.findOne({ where: { email } });
    if (!user) {
      throw { status: 404, message: 'No existe una cuenta con este correo.' };
    }
    if (user.email_verified) {
      throw { status: 400, message: 'Este correo ya fue verificado.' };
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      // Intentar con magic link directo de Supabase
      const token = crypto.randomBytes(32).toString('hex');
      await sendMagicLink(email, token);
    }

    return { message: 'Magic link reenviado. Revisa tu bandeja de entrada.' };
  }

  /**
   * RF-01: Recuperación de contraseña
   * Genera contraseña temporal, la actualiza en Supabase y envía por email
   */
  async forgotPassword({ email }) {
    // No revelar si el correo existe por seguridad
    const user = await db.User.findOne({ where: { email } });
    if (user) {
      try {
        // Generar contraseña temporal
        const tempPassword = generateTemporaryPassword();
        
        // Actualizar contraseña en Supabase
        const { error: updateError } = await supabase.auth.admin.updateUserById(
          user.id,
          { password: tempPassword }
        );
        
        if (updateError) {
          console.error('Error actualizando contraseña en Supabase:', updateError);
          throw { status: 500, message: 'Error al procesar la recuperación de contraseña.' };
        }
        
        // Enviar email con contraseña temporal usando EmailJS
        await sendPasswordReset(email, user.nombre, tempPassword);
      } catch (error) {
        console.error('Error en forgotPassword:', error);
        // No revelar el error al usuario por seguridad, pero loguearlo
      }
    }
    return { message: 'Si existe una cuenta con ese correo, recibirás tu contraseña temporal por email.' };
  }

  /**
   * Obtener datos del usuario autenticado actual
   */
  async getMe(supabaseUser) {
    const user = await db.User.findOne({
      where: { email: supabaseUser.email },
      include: [
        { model: db.Estudiante, required: false },
        { model: db.Exalumno, required: false },
      ]
    });
    if (!user) {
      throw { status: 404, message: 'Usuario no encontrado.' };
    }
    return user;
  }

  /**
   * Admin: verificar y activar un exalumno
   * Envía correo de confirmación cuando se aprueba
   */
  async approveAlumni(userId) {
    // Obtener datos del exalumno antes de actualizar
    const user = await db.User.findOne({
      where: { id: userId, tipo: 'EXALUMNO' }
    });
    if (!user) throw { status: 404, message: 'Exalumno no encontrado.' };

    // Activar el usuario
    const [updated] = await db.User.update(
      { activo: true },
      { where: { id: userId, tipo: 'EXALUMNO' } }
    );
    if (!updated) throw { status: 404, message: 'No se pudo actualizar el exalumno.' };

    // Enviar correo de aprobación
    try {
      await sendAlumniApprovedEmail(user.email, user.nombre);
    } catch (emailError) {
      console.error('Error al enviar correo de aprobación:', emailError);
      // No fallar la aprobación si falla el email
    }

    return { message: 'Perfil de exalumno aprobado y correo enviado.' };
  }
}

module.exports = new AuthService();
