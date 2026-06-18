const { Resend } = require('resend');
const { getAcceptedEmailTemplate } = require('../templates/acceptedEmail');
const { getRejectedEmailTemplate } = require('../templates/rejectedEmail');

// Instancia Resend usando la clave del .env
const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.FROM_EMAIL || 'no-reply@alumni.ucr.ac.cr';

class EmailService {
  /** Send acceptance email via Resend */
  async sendAcceptanceEmail(email, nombre) {
    if (!email) return false;
    const date = new Date().toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    const { subject, html } = getAcceptedEmailTemplate(nombre, date);
    try {
      await resend.emails.send({
        from: FROM,
        to: email,
        subject,
        html,
      });
      return true;
    } catch (err) {
      console.error('[EmailService] Error sending acceptance email:', err);
      return false;
    }
  }

  /** Send rejection email via Resend */
  async sendRejectionEmail(email, nombre) {
    if (!email) return false;
    const date = new Date().toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    const { subject, html } = getRejectedEmailTemplate(nombre, date);
    try {
      await resend.emails.send({
        from: FROM,
        to: email,
        subject,
        html,
      });
      return true;
    } catch (err) {
      console.error('[EmailService] Error sending rejection email:', err);
      return false;
    }
  }

  /** Send connection request email using EmailJS */
  async sendConnectionRequestEmail(email, receptorNombre, emisorNombre) {
    const SERVICE_ID = process.env.MENTOR_EMAILJS_SERVICE_ID || "service_d5bz6g6";
    const TEMPLATE_ID = process.env.MENTOR_EMAILJS_TEMPLATE_ID || "template_hih689c";
    const PUBLIC_KEY = process.env.MENTOR_EMAILJS_PUBLIC_KEY || "aHutWhaN4ipX-uMVq";
    const PRIVATE_KEY = process.env.MENTOR_EMAILJS_PRIVATE_KEY || "LDmRXwb-nBjwRzCXAMGIE";

    try {
      const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          service_id: SERVICE_ID,
          template_id: TEMPLATE_ID,
          user_id: PUBLIC_KEY,
          accessToken: PRIVATE_KEY,
          template_params: {
            email,
            name: receptorNombre,
            nombre_emisor: emisorNombre,
          },
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        console.error("[EmailService EmailJS] Error sending email:", text);
        return false;
      }
      return true;
    } catch (error) {
      console.error("[EmailService EmailJS] Exception sending email:", error);
      return false;
    }
  }
}

module.exports = new EmailService();
