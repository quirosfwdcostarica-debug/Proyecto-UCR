import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = "Alumni U <noreply@alumni.ucr.ac.cr>";

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
