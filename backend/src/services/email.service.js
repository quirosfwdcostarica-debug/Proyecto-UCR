const { sendMail } = require('../utils/mailSender');
const { getAcceptedEmailTemplate } = require('../templates/acceptedEmail');
const { getRejectedEmailTemplate } = require('../templates/rejectedEmail');

/**
 * Servicio encargado de gestionar las notificaciones de sistema por correo electrónico.
 */
class EmailService {
  /**
   * Envía un correo notificando que una solicitud fue ACEPTADA.
   * 
   * @param {string} email - Correo del usuario destino
   * @param {string} nombre - Nombre del usuario destino
   */
  async sendAcceptanceEmail(email, nombre) {
    if (!email) return;

    const date = new Date().toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    const { subject, html } = getAcceptedEmailTemplate(nombre, date);
    await sendMail(email, subject, html);
  }

  /**
   * Envía un correo notificando que una solicitud fue RECHAZADA.
   * 
   * @param {string} email - Correo del usuario destino
   * @param {string} nombre - Nombre del usuario destino
   */
  async sendRejectionEmail(email, nombre) {
    if (!email) return;

    const date = new Date().toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    const { subject, html } = getRejectedEmailTemplate(nombre, date);
    await sendMail(email, subject, html);
  }
}

module.exports = new EmailService();
