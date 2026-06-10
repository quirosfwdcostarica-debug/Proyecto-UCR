const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY || 'gYn0FdHihGBZzj5vp');
const FROM = process.env.FROM_EMAIL || 'no-reply@alumni.ucr.ac.cr';
const FRONTEND = process.env.FRONTEND_URL || 'http://localhost:3000';
const TEMPLATE_ALUMNI_APPROVED = process.env.TEMPLATE_ALUMNI_APPROVED || 'template_h4avnom';

/**
 * Envía un magic link de verificación al estudiante.
 * @param {string} to - Correo destino
 * @param {string} token - Token único de verificación
 */
async function sendMagicLink(to, token) {
  const link = `${FRONTEND}/auth/verificar?token=${token}&email=${encodeURIComponent(to)}`;
  return resend.emails.send({
    from: FROM,
    to,
    subject: 'Verifica tu cuenta — Fundación Exalumnos UCR',
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:32px;background:#f8fafc;border-radius:8px">
        <img src="https://www.ucr.ac.cr/medios/imagenes/sitio/logo-ucr.svg" alt="UCR" style="height:40px;margin-bottom:24px">
        <h2 style="color:#0f4c81;margin-bottom:12px">¡Bienvenido/a a la Red de Exalumnos UCR!</h2>
        <p style="color:#475569;line-height:1.6">
          Haz clic en el siguiente botón para verificar tu correo y activar tu cuenta.
          Este enlace expira en <strong>24 horas</strong>.
        </p>
        <a href="${link}" style="display:inline-block;margin:24px 0;padding:14px 28px;background:#0f4c81;color:#fff;border-radius:6px;text-decoration:none;font-weight:bold">
          Verificar mi cuenta
        </a>
        <p style="color:#94a3b8;font-size:12px">
          Si no solicitaste este correo, puedes ignorarlo con seguridad.<br>
          <a href="${link}" style="color:#0f4c81;word-break:break-all">${link}</a>
        </p>
      </div>
    `,
  });
}

/**
 * Envía un correo de confirmación de registro a exalumnos (perfil pendiente).
 */
async function sendAlumniPendingEmail(to, nombre) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: 'Registro recibido — Fundación Exalumnos UCR',
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:32px;background:#f8fafc;border-radius:8px">
        <img src="https://www.ucr.ac.cr/medios/imagenes/sitio/logo-ucr.svg" alt="UCR" style="height:40px;margin-bottom:24px">
        <h2 style="color:#0f4c81">Hola, ${nombre}</h2>
        <p style="color:#475569;line-height:1.6">
          Hemos recibido tu registro en la plataforma de Exalumnos UCR. 
          Tu perfil está siendo verificado por el equipo de la Fundación.
          Te notificaremos en un plazo de <strong>48 horas hábiles</strong>.
        </p>
        <p style="color:#94a3b8;font-size:12px">Fundación de Exalumnos — Universidad de Costa Rica</p>
      </div>
    `,
  });
}

/**
 * Envía correo de recuperación de contraseña.
 */
async function sendPasswordReset(to, token) {
  const link = `${FRONTEND}/auth/reset-password?token=${token}&email=${encodeURIComponent(to)}`;
  return resend.emails.send({
    from: FROM,
    to,
    subject: 'Recuperar contraseña — Fundación Exalumnos UCR',
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:32px;background:#f8fafc;border-radius:8px">
        <h2 style="color:#0f4c81">Recuperar contraseña</h2>
        <p style="color:#475569">Haz clic para establecer una nueva contraseña. El enlace expira en 1 hora.</p>
        <a href="${link}" style="display:inline-block;margin:24px 0;padding:14px 28px;background:#0f4c81;color:#fff;border-radius:6px;text-decoration:none;font-weight:bold">
          Restablecer contraseña
        </a>
        <p style="color:#94a3b8;font-size:12px">Si no solicitaste esto, ignora este correo.</p>
      </div>
    `,
  });
}

/**
 * Envía correo de aprobación de exalumno usando template de Resend.
 * @param {string} to - Correo destino
 * @param {string} nombre - Nombre del exalumno
 */
async function sendAlumniApprovedEmail(to, nombre) {
  try {
    return resend.emails.send({
      from: FROM,
      to,
      template: TEMPLATE_ALUMNI_APPROVED,
      props: {
        nombre,
        loginUrl: `${FRONTEND}/auth/login`,
      },
    });
  } catch (error) {
    console.error('Error sending alumni approved email:', error);
    throw error;
  }
}

module.exports = { sendMagicLink, sendAlumniPendingEmail, sendPasswordReset, sendAlumniApprovedEmail };
