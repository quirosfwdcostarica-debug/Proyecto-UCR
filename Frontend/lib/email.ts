// ─── EmailJS server-side sender ──────────────────────────────────────────────
// Usa la API REST de EmailJS con autenticación por private key (server-only).
// Templates:
//   TEMPLATE_NOTIF  (template_hih689c) → {{recipient_name}}, {{title}}, {{message}}, {{action_url}}, {{action_text}}
//   TEMPLATE_AUTH   (template_zfbvncq) → {{recipient_name}}, {{title}}, {{verification_url}}

const BASE_URL      = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
const TEMPLATE_NOTIF = process.env.EMAILJS_NOTIFICATION_TEMPLATE_ID ?? "template_hih689c";
const TEMPLATE_AUTH  = process.env.EMAILJS_AUTH_TEMPLATE_ID          ?? "template_zfbvncq";

function devLog(to: string, extra?: string) {
  if (process.env.NODE_ENV !== "production") {
    console.log(`\n📧 [DEV email] → ${to}${extra ? "\n   " + extra : ""}\n`);
  }
}

async function sendEmailJS(
  toEmail: string,
  templateId: string,
  templateParams: Record<string, string>
): Promise<void> {
  devLog(toEmail, templateParams.verification_url ?? templateParams.action_url);

  const serviceId  = process.env.EMAILJS_SERVICE_ID;
  const publicKey  = process.env.EMAILJS_PUBLIC_KEY;
  const privateKey = process.env.EMAILJS_PRIVATE_KEY;

  if (!serviceId || !publicKey || !privateKey) {
    console.error("[sendEmailJS] Faltan EMAILJS_SERVICE_ID / EMAILJS_PUBLIC_KEY / EMAILJS_PRIVATE_KEY en .env.local");
    return;
  }

  try {
    const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id:  serviceId,
        template_id: templateId,
        user_id:     publicKey,
        accessToken: privateKey,
        template_params: { to_email: toEmail, ...templateParams },
      }),
    });

    if (!res.ok) {
      const txt = await res.text();
      console.error(`[sendEmailJS:${templateId}] Rechazado:`, txt);
    }
  } catch (e: any) {
    console.error(`[sendEmailJS:${templateId}] Excepción:`, e?.message ?? e);
  }
}

// ─── Auth / verificación ──────────────────────────────────────────────────────

export async function sendMagicLinkEmail(
  toEmail: string,
  link: string,
  nombre: string
): Promise<void> {
  await sendEmailJS(toEmail, TEMPLATE_AUTH, {
    recipient_name:   nombre,
    title:            "Verifica tu cuenta",
    verification_url: link,
  });
}

export async function sendAlumniPendingEmail(
  toEmail: string,
  nombre: string
): Promise<void> {
  await sendEmailJS(toEmail, TEMPLATE_NOTIF, {
    recipient_name: nombre,
    title:          "Tu perfil está en revisión",
    message:
      "Tu perfil de exalumno ha sido creado exitosamente y está siendo revisado por el equipo de la Fundación UCR. " +
      "Recibirás una notificación en máximo 48 horas cuando sea aprobado.",
    action_url:  `${BASE_URL}/login`,
    action_text: "Ir al inicio",
  });
}

export async function sendAlumniApprovedEmail(
  toEmail: string,
  nombre: string
): Promise<void> {
  await sendEmailJS(toEmail, TEMPLATE_AUTH, {
    recipient_name:   nombre,
    title:            "¡Tu perfil fue aprobado!",
    verification_url: `${BASE_URL}/login`,
  });
}

// ─── Matches ──────────────────────────────────────────────────────────────────

export async function sendMatchAceptado(
  toEmail: string,
  estudianteNombre: string,
  exalumnoNombre: string
): Promise<void> {
  await sendEmailJS(toEmail, TEMPLATE_NOTIF, {
    recipient_name: estudianteNombre,
    title:          `¡${exalumnoNombre} aceptó conectar contigo!`,
    message:
      `${exalumnoNombre} ha aceptado tu solicitud de conexión en la plataforma. ` +
      "¡Es momento de iniciar una conversación y aprovechar esta oportunidad!",
    action_url:  `${BASE_URL}/mis-matches`,
    action_text: "Ver mis Matches",
  });
}

export async function sendMatchRechazado(
  toEmail: string,
  estudianteNombre: string
): Promise<void> {
  await sendEmailJS(toEmail, TEMPLATE_NOTIF, {
    recipient_name: estudianteNombre,
    title:          "Actualización sobre tu solicitud de match",
    message:
      "La solicitud de conexión enviada no pudo concretarse en esta ocasión. " +
      "No te desanimes — completa tu perfil para mejorar tus próximos matches.",
    action_url:  `${BASE_URL}/mis-matches`,
    action_text: "Ver más matches",
  });
}

export async function sendMatchConnectionRequest(
  toEmail: string,
  receptorNombre: string,
  emisorNombre: string
): Promise<void> {
  await sendEmailJS(toEmail, TEMPLATE_NOTIF, {
    recipient_name: receptorNombre,
    title:          `${emisorNombre} quiere conectar contigo`,
    message:
      `${emisorNombre} quiere conectar contigo en la plataforma. ` +
      "Ingresa para revisar su perfil y decidir si deseas aceptar.",
    action_url:  `${BASE_URL}/mis-matches`,
    action_text: "Ver solicitud",
  });
}

export async function sendAdminNewActiveMatch(
  adminEmail: string,
  estudianteNombre: string,
  exalumnoNombre: string
): Promise<void> {
  await sendEmailJS(adminEmail, TEMPLATE_NOTIF, {
    recipient_name: "Administrador",
    title:          `Nuevo match activo: ${estudianteNombre} ↔ ${exalumnoNombre}`,
    message:
      `El match entre el estudiante ${estudianteNombre} y el exalumno ${exalumnoNombre} ` +
      "ha sido aceptado y está activo.",
    action_url:  `${BASE_URL}/admin/matches`,
    action_text: "Ver matches",
  });
}

// ─── Donaciones ───────────────────────────────────────────────────────────────

export async function sendDonacionAprobada(
  toEmail: string,
  exalumnoNombre: string,
  monto: number,
  destino: string
): Promise<void> {
  await sendEmailJS(toEmail, TEMPLATE_NOTIF, {
    recipient_name: exalumnoNombre,
    title:          "¡Tu donación fue aprobada!",
    message:
      `Tu donación de ₡${monto.toLocaleString("es-CR")} destinada a ${destino} ` +
      "ha sido verificada y aprobada. ¡Gracias por apoyar el talento de la UCR!",
    action_url:  `${BASE_URL}/mis-donaciones`,
    action_text: "Ver mis donaciones",
  });
}

// ─── Aplicaciones ─────────────────────────────────────────────────────────────

export async function sendNuevaAplicacion(
  toEmail: string,
  exalumnoNombre: string,
  posicionTitulo: string,
  estudianteNombre: string
): Promise<void> {
  await sendEmailJS(toEmail, TEMPLATE_NOTIF, {
    recipient_name: exalumnoNombre,
    title:          "¡Nueva aplicación recibida!",
    message:        `${estudianteNombre} acaba de aplicar a tu posición "${posicionTitulo}". Revisa su perfil en tu panel.`,
    action_url:     `${BASE_URL}/mis-posiciones`,
    action_text:    "Ver mis posiciones",
  });
}

export async function sendAplicacionSeleccionada(
  toEmail: string,
  estudianteNombre: string,
  posicionTitulo: string,
  empresa?: string
): Promise<void> {
  await sendEmailJS(toEmail, TEMPLATE_NOTIF, {
    recipient_name: estudianteNombre,
    title:          "¡Fuiste seleccionado!",
    message:
      `Fuiste seleccionado para la posición "${posicionTitulo}"` +
      (empresa ? ` en ${empresa}` : "") +
      ". El exalumno se pondrá en contacto contigo para los próximos pasos.",
    action_url:  `${BASE_URL}/mis-aplicaciones`,
    action_text: "Ver mis aplicaciones",
  });
}

export async function sendAplicacionDescartada(
  toEmail: string,
  estudianteNombre: string,
  posicionTitulo: string
): Promise<void> {
  await sendEmailJS(toEmail, TEMPLATE_NOTIF, {
    recipient_name: estudianteNombre,
    title:          "Actualización sobre tu aplicación",
    message:        `La posición "${posicionTitulo}" ya fue cubierta por otro candidato. Te animamos a explorar otras oportunidades.`,
    action_url:     `${BASE_URL}/posiciones`,
    action_text:    "Ver otras posiciones",
  });
}

// ─── Recuperación de contraseña ───────────────────────────────────────────────

export async function sendPasswordResetEmailJS(
  toEmail: string,
  nombre: string,
  tempPassword: string
): Promise<boolean> {
  const serviceId  = process.env.EMAILJS_SERVICE_ID;
  const publicKey  = process.env.EMAILJS_PUBLIC_KEY;
  const privateKey = process.env.EMAILJS_PRIVATE_KEY;

  if (!serviceId || !publicKey || !privateKey) {
    console.error("[sendPasswordResetEmailJS] Faltan variables EMAILJS_* en .env.local");
    return false;
  }

  devLog(toEmail, `Contraseña temporal: ${tempPassword}`);

  try {
    const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id:  serviceId,
        template_id: TEMPLATE_AUTH,
        user_id:     publicKey,
        accessToken: privateKey,
        template_params: {
          to_email:       toEmail,
          email:          toEmail,
          recipient_name: nombre,
          nombre,
          title:          "Recuperación de contraseña",
          password:       tempPassword,
          verification_url: "",
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("[sendPasswordResetEmailJS] Rechazado:", errText);
      return false;
    }
    return true;
  } catch (e: any) {
    console.error("[sendPasswordResetEmailJS] Excepción:", e?.message ?? e);
    return false;
  }
}

// Alias para compatibilidad con auth.actions.ts (llama a EmailJS internamente)
export async function sendPasswordResetEmail(
  toEmail: string,
  nombre: string,
  tempPassword: string
): Promise<boolean> {
  return sendPasswordResetEmailJS(toEmail, nombre, tempPassword);
}
