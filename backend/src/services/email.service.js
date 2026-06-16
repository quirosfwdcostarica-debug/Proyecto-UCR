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
}

module.exports = new EmailService();
