const MatchRepository = require('../repositories/match.repository');
const EstudianteRepository = require('../repositories/estudiante.repository');
const ExalumnoRepository = require('../repositories/exalumno.repository');
const { calcularAfinidad } = require('../utils/matchScoring');

class MatchService {
  async findAll() {
    return await MatchRepository.findAll();
  }

  async findById(id) {
    return await MatchRepository.findById(id);
  }

  async getMyMatches(userId, role) {
    return await MatchRepository.findByUserId(userId, role);
  }

  async getAdminMetrics() {
    return await MatchRepository.getMetrics();
  }

  async generateMatches() {
    const estudiantes = await EstudianteRepository.findAll();
    const exalumnos = await ExalumnoRepository.findAll();
    
    let creados = 0;
    let actualizados = 0;

    for (const est of estudiantes) {
      for (const exa of exalumnos) {
        const { score, reasons } = calcularAfinidad(est, exa);
        
        if (score > 0) {
          const existing = await MatchRepository.findByPair(est.user_id, exa.user_id);
          if (existing) {
            await MatchRepository.update(existing.id, { 
              score_match: score, 
              match_reasons: reasons 
            });
            actualizados++;
          } else {
            await MatchRepository.create({
              estudiante_id: est.user_id,
              exalumno_id: exa.user_id,
              score_match: score,
              estado: 'SUGERIDO',
              match_reasons: reasons
            });
            creados++;
          }
        }
      }
    }
    return { creados, actualizados };
  }

  async initiateConnection(matchId, userId) {
    const match = await MatchRepository.findById(matchId);
    if (!match) throw new Error("Match no encontrado");
    if (match.estado !== 'SUGERIDO') throw new Error("Match ya no está en estado sugerido");
    
    await MatchRepository.update(matchId, {
      estado: 'CONTACTADO',
      initiated_by: userId
    });
    return await MatchRepository.findById(matchId);
  }

  async acceptConnection(matchId, userId) {
    const match = await MatchRepository.findById(matchId);
    if (!match) throw new Error("Match no encontrado");
    if (match.estado !== 'CONTACTADO') throw new Error("Solo puedes aceptar matches contactados");
    // Ensure the acceptor is not the initiator
    if (match.initiated_by === userId) throw new Error("No puedes aceptar tu propia solicitud");

    await MatchRepository.update(matchId, {
      estado: 'ACTIVO',
      accepted_at: new Date()
    });
    return await MatchRepository.findById(matchId);
  }

  async rejectConnection(matchId, userId) {
    const match = await MatchRepository.findById(matchId);
    if (!match) throw new Error("Match no encontrado");
    
    await MatchRepository.update(matchId, {
      estado: 'RECHAZADO',
      rejected_at: new Date()
    });
    return await MatchRepository.findById(matchId);
  }

  async delete(id) {
    const deleted = await MatchRepository.delete(id);
    return !!deleted;
  }
}

module.exports = new MatchService();
