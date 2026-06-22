import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// En producción usar un dominio verificado en Resend.
// En desarrollo se puede usar onboarding@resend.dev (solo llega al dueño de la cuenta Resend).
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "Alumni U <noreply@alumni.ucr.ac.cr>";

/**
 * Envía email de notificación cuando un match es ACEPTADO (status → ACTIVO).
 * Se envía al estudiante notificándole que el exalumno aceptó conectar.
 */
export async function sendMatchAceptado(
  toEmail: string,
  estudianteNombre: string,
  exalumnoNombre: string
): Promise<void> {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: toEmail,
      subject: `¡${exalumnoNombre} aceptó conectar contigo! — Alumni U`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f8fafc; margin: 0; padding: 40px 20px;">
            <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(15,76,129,0.08);">
              
              <!-- Header -->
              <div style="background: linear-gradient(135deg, #0f4c81 0%, #1a7abf 100%); padding: 40px 32px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">Alumni U</h1>
                <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px;">Plataforma de Conexión Universitaria</p>
              </div>

              <!-- Body -->
              <div style="padding: 40px 32px;">
                <div style="text-align: center; margin-bottom: 28px;">
                  <div style="width: 64px; height: 64px; background: #dcfce7; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 32px; margin-bottom: 16px;">🎉</div>
                  <h2 style="color: #0f4c81; font-size: 22px; font-weight: 700; margin: 0 0 8px;">¡Tienes un nuevo match activo!</h2>
                </div>

                <p style="color: #475569; line-height: 1.6; font-size: 16px;">
                  Hola <strong style="color: #0f172a;">${estudianteNombre}</strong>,
                </p>
                <p style="color: #475569; line-height: 1.6; font-size: 16px;">
                  Nos alegra informarte que <strong style="color: #0f4c81;">${exalumnoNombre}</strong> ha aceptado conectar contigo en la plataforma Alumni U. ¡Es momento de iniciar una conversación y aprovechar esta oportunidad!
                </p>

                <!-- CTA -->
                <div style="text-align: center; margin: 32px 0;">
                  <a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}/mis-matches"
                     style="background: #0f4c81; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px; display: inline-block;">
                    Ver mis Matches →
                  </a>
                </div>

                <p style="color: #94a3b8; font-size: 13px; text-align: center; margin: 24px 0 0;">
                  Este email fue enviado automáticamente por la plataforma Alumni U.<br>
                  La Universidad — Fundación U.
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    });
  } catch (error) {
    // No lanzar el error para que no interrumpa el flujo principal
    console.error("[sendMatchAceptado] Error enviando email:", error);
  }
}

/**
 * Envía email de notificación cuando un match es RECHAZADO.
 * Se envía al estudiante informándole que la conexión no pudo establecerse.
 */
export async function sendMatchRechazado(
  toEmail: string,
  estudianteNombre: string
): Promise<void> {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: toEmail,
      subject: "Actualización sobre tu solicitud de match — Alumni U",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f8fafc; margin: 0; padding: 40px 20px;">
            <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(15,76,129,0.08);">
              
              <div style="background: linear-gradient(135deg, #0f4c81 0%, #1a7abf 100%); padding: 40px 32px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 26px; font-weight: 700;">Alumni U</h1>
                <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px;">Plataforma de Conexión Universitaria</p>
              </div>

              <div style="padding: 40px 32px;">
                <p style="color: #475569; line-height: 1.6; font-size: 16px;">
                  Hola <strong style="color: #0f172a;">${estudianteNombre}</strong>,
                </p>
                <p style="color: #475569; line-height: 1.6; font-size: 16px;">
                  Te informamos que la solicitud de conexión enviada no pudo concretarse en esta ocasión. No te desanimes — hay muchos exalumnos más en la plataforma con quienes podrías hacer match.
                </p>

                <div style="background: #eff6ff; border-left: 4px solid #0f4c81; padding: 16px 20px; border-radius: 0 8px 8px 0; margin: 24px 0;">
                  <p style="color: #0f4c81; font-weight: 600; margin: 0 0 4px; font-size: 15px;">💡 Consejo</p>
                  <p style="color: #475569; margin: 0; font-size: 14px;">Completa tu perfil y actualiza las áreas de apoyo que buscas para mejorar tus futuros matches.</p>
                </div>

                <div style="text-align: center; margin: 32px 0;">
                  <a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}/mis-matches"
                     style="background: #0f4c81; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px; display: inline-block;">
                    Ver más matches →
                  </a>
                </div>

                <p style="color: #94a3b8; font-size: 13px; text-align: center; margin: 24px 0 0;">
                  Este email fue enviado automáticamente por la plataforma Alumni U.
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    });
  } catch (error) {
    console.error("[sendMatchRechazado] Error enviando email:", error);
  }
}

/**
 * Envía confirmación de donación aprobada al exalumno.
 */
export async function sendDonacionAprobada(
  toEmail: string,
  exalumnoNombre: string,
  monto: number,
  destino: string
): Promise<void> {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: toEmail,
      subject: "¡Tu donación fue aprobada! — Alumni U",
      html: `
        <!DOCTYPE html>
        <html>
          <head><meta charset="utf-8" /></head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f8fafc; margin: 0; padding: 40px 20px;">
            <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(15,76,129,0.08);">
              
              <div style="background: linear-gradient(135deg, #0f4c81 0%, #1a7abf 100%); padding: 40px 32px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 26px; font-weight: 700;">Alumni U</h1>
              </div>

              <div style="padding: 40px 32px;">
                <div style="text-align: center; margin-bottom: 28px;">
                  <div style="width: 64px; height: 64px; background: #dcfce7; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 32px; margin-bottom: 16px;">✅</div>
                  <h2 style="color: #0f4c81; font-size: 22px; font-weight: 700; margin: 0;">¡Donación Aprobada!</h2>
                </div>

                <p style="color: #475569; line-height: 1.6; font-size: 16px;">
                  Estimado/a <strong>${exalumnoNombre}</strong>,
                </p>
                <p style="color: #475569; line-height: 1.6; font-size: 16px;">
                  Tu donación de <strong style="color: #0f4c81;">₡${monto.toLocaleString("es-CR")}</strong> destinada a <strong>${destino}</strong> ha sido verificada y aprobada por nuestro equipo. ¡Gracias por apoyar el talento de la U!
                </p>

                <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px 20px; margin: 24px 0;">
                  <p style="color: #166534; font-weight: 600; margin: 0 0 4px;">Detalle de la donación:</p>
                  <p style="color: #374151; margin: 0; font-size: 14px;">Monto: ₡${monto.toLocaleString("es-CR")}</p>
                  <p style="color: #374151; margin: 0; font-size: 14px;">Destino: ${destino}</p>
                </div>

                <p style="color: #94a3b8; font-size: 13px; text-align: center; margin-top: 32px;">
                  La Universidad — Fundación U
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    });
  } catch (error) {
    console.error("[sendDonacionAprobada] Error enviando email:", error);
  }
}

/**
 * Envía email de solicitud de conexión al receptor del match.
 */
export async function sendMatchConnectionRequest(
  toEmail: string,
  receptorNombre: string,
  emisorNombre: string
): Promise<void> {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: toEmail,
      subject: `${emisorNombre} quiere conectar contigo — Alumni U`,
      html: `
        <!DOCTYPE html>
        <html>
          <head><meta charset="utf-8" /></head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f8fafc; margin: 0; padding: 40px 20px;">
            <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(15,76,129,0.08);">
              <div style="background: linear-gradient(135deg, #0f4c81 0%, #1a7abf 100%); padding: 40px 32px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 26px; font-weight: 700;">Alumni U</h1>
                <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px;">Plataforma de Conexión Universitaria</p>
              </div>
              <div style="padding: 40px 32px;">
                <div style="text-align: center; margin-bottom: 28px;">
                  <div style="width: 64px; height: 64px; background: #eff6ff; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 32px; margin-bottom: 16px;">🤝</div>
                  <h2 style="color: #0f4c81; font-size: 22px; font-weight: 700; margin: 0 0 8px;">Nueva solicitud de conexión</h2>
                </div>
                <p style="color: #475569; line-height: 1.6; font-size: 16px;">
                  Hola <strong style="color: #0f172a;">${receptorNombre}</strong>,
                </p>
                <p style="color: #475569; line-height: 1.6; font-size: 16px;">
                  <strong style="color: #0f4c81;">${emisorNombre}</strong> quiere conectar contigo en la plataforma Alumni U. Ingresa para revisar su perfil y decidir si deseas aceptar.
                </p>
                <div style="text-align: center; margin: 32px 0;">
                  <a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}/mis-matches"
                     style="background: #0f4c81; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px; display: inline-block;">
                    Ver solicitud →
                  </a>
                </div>
                <p style="color: #94a3b8; font-size: 13px; text-align: center; margin: 24px 0 0;">
                  Este email fue enviado automáticamente por la plataforma Alumni U.
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    });
  } catch (error) {
    console.error("[sendMatchConnectionRequest] Error enviando email:", error);
  }
}

// ─── Emails de Autenticación ─────────────────────────────────────────────────

/**
 * Envía magic link de verificación al estudiante tras registrarse.
 */
export async function sendMagicLinkEmail(
  toEmail: string,
  link: string,
  nombre: string
): Promise<void> {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: toEmail,
      subject: "Verifica tu cuenta — Alumni U",
      html: `
        <!DOCTYPE html>
        <html>
          <head><meta charset="utf-8" /></head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f8fafc; margin: 0; padding: 40px 20px;">
            <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(15,76,129,0.08);">
              <div style="background: linear-gradient(135deg, #0f4c81 0%, #1a7abf 100%); padding: 40px 32px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 26px; font-weight: 700;">Alumni U</h1>
                <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px;">Plataforma de Conexión Universitaria</p>
              </div>
              <div style="padding: 40px 32px;">
                <h2 style="color: #0f4c81; font-size: 20px; font-weight: 700; margin: 0 0 16px;">¡Hola, ${nombre}!</h2>
                <p style="color: #475569; line-height: 1.6; font-size: 16px;">
                  Gracias por registrarte en Alumni U. Haz clic en el botón a continuación para verificar tu correo electrónico y activar tu cuenta.
                </p>
                <p style="color: #94a3b8; font-size: 13px; margin: 8px 0 24px;">Este enlace expira en 24 horas.</p>
                <div style="text-align: center; margin: 32px 0;">
                  <a href="${link}" style="background: #0f4c81; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px; display: inline-block;">
                    Verificar mi cuenta →
                  </a>
                </div>
                <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 24px;">
                  Si no creaste esta cuenta, ignora este email.
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    });
  } catch (error) {
    console.error("[sendMagicLinkEmail] Error:", error);
  }
}

/**
 * Notifica al exalumno que su perfil está pendiente de aprobación admin.
 */
export async function sendAlumniPendingEmail(
  toEmail: string,
  nombre: string
): Promise<void> {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: toEmail,
      subject: "Tu perfil está en revisión — Alumni U",
      html: `
        <!DOCTYPE html>
        <html>
          <head><meta charset="utf-8" /></head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f8fafc; margin: 0; padding: 40px 20px;">
            <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(15,76,129,0.08);">
              <div style="background: linear-gradient(135deg, #0f4c81 0%, #1a7abf 100%); padding: 40px 32px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 26px; font-weight: 700;">Alumni U</h1>
              </div>
              <div style="padding: 40px 32px;">
                <h2 style="color: #0f4c81; font-size: 20px; font-weight: 700; margin: 0 0 16px;">¡Registro recibido, ${nombre}!</h2>
                <p style="color: #475569; line-height: 1.6; font-size: 16px;">
                  Tu perfil de exalumno ha sido creado exitosamente y está siendo revisado por el equipo de la Fundación UCR. Recibirás una notificación en máximo <strong>48 horas</strong> cuando sea aprobado.
                </p>
                <div style="background: #eff6ff; border-left: 4px solid #0f4c81; padding: 16px 20px; border-radius: 0 8px 8px 0; margin: 24px 0;">
                  <p style="color: #0f4c81; font-weight: 600; margin: 0 0 4px;">¿Qué sigue?</p>
                  <p style="color: #475569; margin: 0; font-size: 14px;">Una vez aprobado, podrás acceder a la plataforma y conectarte con estudiantes activos de la UCR.</p>
                </div>
                <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 32px;">Alumni U — Fundación UCR</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });
  } catch (error) {
    console.error("[sendAlumniPendingEmail] Error:", error);
  }
}

/**
 * Envía contraseña temporal vía EmailJS (mismo mecanismo que el backend Express).
 * Retorna true si EmailJS aceptó el envío, false si falló.
 */
export async function sendPasswordResetEmailJS(
  toEmail: string,
  nombre: string,
  tempPassword: string
): Promise<boolean> {
  const serviceId  = process.env.EMAILJS_SERVICE_ID;
  const templateId = process.env.EMAILJS_PASSWORD_RESET_TEMPLATE_ID;
  const publicKey  = process.env.EMAILJS_PUBLIC_KEY;
  const privateKey = process.env.EMAILJS_PRIVATE_KEY;

  if (!serviceId || !templateId || !publicKey || !privateKey) {
    console.error("[sendPasswordResetEmailJS] Faltan variables EMAILJS_* en .env.local");
    return false;
  }

  try {
    const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id:  serviceId,
        template_id: templateId,
        user_id:     publicKey,
        accessToken: privateKey,
        template_params: {
          email:    toEmail,
          to_email: toEmail,
          nombre,
          password: tempPassword,
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("[sendPasswordResetEmailJS] EmailJS rechazó el envío:", errText);
      return false;
    }
    return true;
  } catch (e: any) {
    console.error("[sendPasswordResetEmailJS] Excepción:", e?.message ?? e);
    return false;
  }
}

/**
 * Envía contraseña temporal para recuperación de cuenta (Resend — requiere dominio verificado).
 * Retorna true si el email fue aceptado por Resend, false si falló.
 */
export async function sendPasswordResetEmail(
  toEmail: string,
  nombre: string,
  tempPassword: string
): Promise<boolean> {
  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: toEmail,
      subject: "Recuperación de contraseña — Alumni U",
      html: `
        <!DOCTYPE html>
        <html>
          <head><meta charset="utf-8" /></head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f8fafc; margin: 0; padding: 40px 20px;">
            <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(15,76,129,0.08);">
              <div style="background: linear-gradient(135deg, #0f4c81 0%, #1a7abf 100%); padding: 40px 32px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 26px; font-weight: 700;">Alumni U</h1>
              </div>
              <div style="padding: 40px 32px;">
                <h2 style="color: #0f4c81; font-size: 20px; font-weight: 700; margin: 0 0 16px;">Hola, ${nombre}</h2>
                <p style="color: #475569; line-height: 1.6; font-size: 16px;">
                  Recibiste esta contraseña temporal porque solicitaste recuperar el acceso a tu cuenta de Alumni U.
                </p>
                <div style="background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 24px 0; text-align: center;">
                  <p style="color: #64748b; font-size: 13px; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 0.05em;">Contraseña temporal</p>
                  <p style="color: #0f172a; font-size: 22px; font-weight: 700; font-family: monospace; margin: 0; letter-spacing: 0.1em;">${tempPassword}</p>
                </div>
                <p style="color: #ef4444; font-size: 14px; font-weight: 600;">Ingresa con esta contraseña y cámbiala de inmediato.</p>
                <div style="text-align: center; margin: 28px 0;">
                  <a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}/login?callbackUrl=%2Fauth%2Freset-password"
                     style="background: #0f4c81; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px; display: inline-block;">
                    Iniciar sesión y cambiar contraseña →
                  </a>
                </div>
                <p style="color: #94a3b8; font-size: 12px; text-align: center;">Si no solicitaste este email, ignóralo.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error("[sendPasswordResetEmail] Resend rechazó el email:", JSON.stringify(error));
      return false;
    }
    return true;
  } catch (exception: any) {
    console.error("[sendPasswordResetEmail] Excepción:", exception?.message ?? exception);
    return false;
  }
}

/**
 * Notifica al exalumno que su perfil fue aprobado por el admin.
 */
export async function sendAlumniApprovedEmail(
  toEmail: string,
  nombre: string
): Promise<void> {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: toEmail,
      subject: "¡Tu perfil fue aprobado! — Alumni U",
      html: `
        <!DOCTYPE html>
        <html>
          <head><meta charset="utf-8" /></head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f8fafc; margin: 0; padding: 40px 20px;">
            <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(15,76,129,0.08);">
              <div style="background: linear-gradient(135deg, #0f4c81 0%, #1a7abf 100%); padding: 40px 32px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 26px; font-weight: 700;">Alumni U</h1>
              </div>
              <div style="padding: 40px 32px;">
                <div style="text-align: center; margin-bottom: 24px;">
                  <div style="width: 64px; height: 64px; background: #dcfce7; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 32px; margin-bottom: 16px;">✅</div>
                  <h2 style="color: #0f4c81; font-size: 22px; font-weight: 700; margin: 0;">¡Tu perfil fue aprobado!</h2>
                </div>
                <p style="color: #475569; line-height: 1.6; font-size: 16px;">
                  Hola <strong>${nombre}</strong>, nos complace informarte que tu perfil de exalumno fue verificado y aprobado. ¡Ya puedes iniciar sesión y conectarte con estudiantes!
                </p>
                <div style="text-align: center; margin: 32px 0;">
                  <a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}/login"
                     style="background: #0f4c81; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px; display: inline-block;">
                    Ingresar a Alumni U →
                  </a>
                </div>
                <p style="color: #94a3b8; font-size: 12px; text-align: center;">Alumni U — Fundación UCR</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });
  } catch (error) {
    console.error("[sendAlumniApprovedEmail] Error:", error);
  }
}

/**
 * Notifica al admin cuando un match pasa a estado ACTIVO.
 */
export async function sendAdminNewActiveMatch(
  adminEmail: string,
  estudianteNombre: string,
  exalumnoNombre: string
): Promise<void> {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: adminEmail,
      subject: `Nuevo match activo: ${estudianteNombre} ↔ ${exalumnoNombre} — Alumni U`,
      html: `
        <!DOCTYPE html>
        <html>
          <head><meta charset="utf-8" /></head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f8fafc; margin: 0; padding: 40px 20px;">
            <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(15,76,129,0.08);">
              <div style="background: linear-gradient(135deg, #0f4c81 0%, #1a7abf 100%); padding: 32px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 700;">Alumni U — Admin</h1>
              </div>
              <div style="padding: 32px;">
                <h2 style="color: #0f4c81; font-size: 18px; margin: 0 0 16px;">🟢 Match Activado</h2>
                <p style="color: #475569; font-size: 15px; line-height: 1.6;">
                  El siguiente match ha sido aceptado y está activo:
                </p>
                <div style="background: #f8fafc; border-radius: 8px; padding: 16px; margin: 16px 0;">
                  <p style="margin: 0; color: #0f172a;"><strong>Estudiante:</strong> ${estudianteNombre}</p>
                  <p style="margin: 8px 0 0; color: #0f172a;"><strong>Exalumno:</strong> ${exalumnoNombre}</p>
                </div>
                <p style="color: #94a3b8; font-size: 12px; margin-top: 24px;">Notificación automática del sistema Alumni U.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });
  } catch (error) {
    console.error("[sendAdminNewActiveMatch] Error enviando email:", error);
  }
}

// ─── Aplicaciones ──────────────────────────────────────────────────────────────

/**
 * Notifica al exalumno que recibió una nueva aplicación a su posición.
 */
export async function sendNuevaAplicacion(
  toEmail: string,
  exalumnoNombre: string,
  posicionTitulo: string,
  estudianteNombre: string
): Promise<void> {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: toEmail,
      subject: `Nueva aplicación recibida: ${posicionTitulo} — Alumni U`,
      html: `
        <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f8fafc;margin:0;padding:40px 20px;">
          <div style="max-width:560px;margin:0 auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(15,76,129,0.08);">
            <div style="background:linear-gradient(135deg,#0f4c81 0%,#1a7abf 100%);padding:40px 32px;text-align:center;">
              <h1 style="color:white;margin:0;font-size:26px;font-weight:700;">Alumni U</h1>
              <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:14px;">Plataforma de Conexión Universitaria</p>
            </div>
            <div style="padding:40px 32px;">
              <div style="text-align:center;margin-bottom:28px;">
                <div style="width:64px;height:64px;background:#dbeafe;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:32px;margin-bottom:16px;">📋</div>
                <h2 style="color:#0f4c81;font-size:22px;font-weight:700;margin:0 0 8px;">¡Nueva aplicación recibida!</h2>
              </div>
              <p style="color:#475569;line-height:1.6;font-size:16px;">Hola <strong style="color:#0f172a;">${exalumnoNombre}</strong>,</p>
              <p style="color:#475569;line-height:1.6;font-size:16px;">
                <strong style="color:#0f4c81;">${estudianteNombre}</strong> acaba de aplicar a tu posición <strong>"${posicionTitulo}"</strong>. Revisa su perfil y CV en tu panel de aplicantes.
              </p>
              <div style="text-align:center;margin:32px 0;">
                <a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}/mis-posiciones"
                   style="background:#0f4c81;color:white;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:15px;display:inline-block;">
                  Ver mis posiciones →
                </a>
              </div>
              <p style="color:#94a3b8;font-size:13px;text-align:center;">Notificación automática del sistema Alumni U.</p>
            </div>
          </div>
        </body>
      `,
    });
  } catch (error) {
    console.error("[sendNuevaAplicacion] Error enviando email:", error);
  }
}

/**
 * Notifica al estudiante que fue SELECCIONADO para una posición.
 */
export async function sendAplicacionSeleccionada(
  toEmail: string,
  estudianteNombre: string,
  posicionTitulo: string,
  empresa?: string
): Promise<void> {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: toEmail,
      subject: `¡Felicidades! Fuiste seleccionado — ${posicionTitulo}`,
      html: `
        <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f8fafc;margin:0;padding:40px 20px;">
          <div style="max-width:560px;margin:0 auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(15,76,129,0.08);">
            <div style="background:linear-gradient(135deg,#059669 0%,#10b981 100%);padding:40px 32px;text-align:center;">
              <h1 style="color:white;margin:0;font-size:26px;font-weight:700;">Alumni U</h1>
              <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px;">Plataforma de Conexión Universitaria</p>
            </div>
            <div style="padding:40px 32px;">
              <div style="text-align:center;margin-bottom:28px;">
                <div style="width:64px;height:64px;background:#dcfce7;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:32px;margin-bottom:16px;">🎉</div>
                <h2 style="color:#059669;font-size:22px;font-weight:700;margin:0 0 8px;">¡Fuiste seleccionado!</h2>
              </div>
              <p style="color:#475569;line-height:1.6;font-size:16px;">Hola <strong style="color:#0f172a;">${estudianteNombre}</strong>,</p>
              <p style="color:#475569;line-height:1.6;font-size:16px;">
                ¡Excelentes noticias! Fuiste seleccionado para la posición <strong style="color:#059669;">"${posicionTitulo}"</strong>${empresa ? ` en <strong>${empresa}</strong>` : ""}.
              </p>
              <p style="color:#475569;line-height:1.6;font-size:16px;">
                El exalumno se pondrá en contacto contigo para los próximos pasos. Puedes revisar el estado de tu aplicación en la plataforma.
              </p>
              <div style="text-align:center;margin:32px 0;">
                <a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}/mis-aplicaciones"
                   style="background:#059669;color:white;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:15px;display:inline-block;">
                  Ver mis aplicaciones →
                </a>
              </div>
              <p style="color:#94a3b8;font-size:13px;text-align:center;">Notificación automática del sistema Alumni U.</p>
            </div>
          </div>
        </body>
      `,
    });
  } catch (error) {
    console.error("[sendAplicacionSeleccionada] Error enviando email:", error);
  }
}

/**
 * Notifica anónimamente a un estudiante que la posición fue cubierta (descartado).
 * NO revela quién fue seleccionado ni el motivo.
 */
export async function sendAplicacionDescartada(
  toEmail: string,
  estudianteNombre: string,
  posicionTitulo: string
): Promise<void> {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: toEmail,
      subject: `Actualización sobre tu aplicación — ${posicionTitulo}`,
      html: `
        <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f8fafc;margin:0;padding:40px 20px;">
          <div style="max-width:560px;margin:0 auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(15,76,129,0.08);">
            <div style="background:linear-gradient(135deg,#0f4c81 0%,#1a7abf 100%);padding:40px 32px;text-align:center;">
              <h1 style="color:white;margin:0;font-size:26px;font-weight:700;">Alumni U</h1>
              <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:14px;">Plataforma de Conexión Universitaria</p>
            </div>
            <div style="padding:40px 32px;">
              <div style="text-align:center;margin-bottom:28px;">
                <div style="width:64px;height:64px;background:#f1f5f9;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:32px;margin-bottom:16px;">📌</div>
                <h2 style="color:#334155;font-size:20px;font-weight:700;margin:0 0 8px;">Actualización sobre tu aplicación</h2>
              </div>
              <p style="color:#475569;line-height:1.6;font-size:16px;">Hola <strong style="color:#0f172a;">${estudianteNombre}</strong>,</p>
              <p style="color:#475569;line-height:1.6;font-size:16px;">
                Lamentamos informarte que la posición <strong>"${posicionTitulo}"</strong> ya fue cubierta por otro candidato.
              </p>
              <p style="color:#475569;line-height:1.6;font-size:16px;">
                Te animamos a explorar otras oportunidades disponibles en la plataforma. ¡Mucho éxito en tu búsqueda!
              </p>
              <div style="text-align:center;margin:32px 0;">
                <a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}/posiciones"
                   style="background:#0f4c81;color:white;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:15px;display:inline-block;">
                  Ver otras posiciones →
                </a>
              </div>
              <p style="color:#94a3b8;font-size:13px;text-align:center;">Notificación automática del sistema Alumni U.</p>
            </div>
          </div>
        </body>
      `,
    });
  } catch (error) {
    console.error("[sendAplicacionDescartada] Error enviando email:", error);
  }
}
