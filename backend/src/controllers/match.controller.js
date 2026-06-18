const MatchService = require('../services/match.service');
const asyncHandler = require('../utils/asyncHandler');

exports.findAll = asyncHandler(async (req, res) => {
  const data = await MatchService.findAll();
  res.status(200).json(data);
});

exports.findById = asyncHandler(async (req, res) => {
  const data = await MatchService.findById(req.params.id);
  if (!data) return res.status(404).json({ message: 'Not found' });
  res.status(200).json(data);
});

exports.findByEstudiante = asyncHandler(async (req, res) => {
  const data = await MatchService.findByEstudiante(req.params.estudianteId);
  res.status(200).json(data);
});

exports.findByExalumno = asyncHandler(async (req, res) => {
  const data = await MatchService.findByExalumno(req.params.exalumnoId);
  res.status(200).json(data);
});

exports.create = asyncHandler(async (req, res) => {
  const data = await MatchService.create(req.body);
  res.status(201).json(data);
});

exports.update = asyncHandler(async (req, res) => {
  const data = await MatchService.update(req.params.id, req.body);
  if (!data) return res.status(404).json({ message: 'Not found' });
  res.status(200).json(data);
});

exports.delete = asyncHandler(async (req, res) => {
  const deleted = await MatchService.delete(req.params.id);
  if (!deleted) return res.status(404).json({ message: 'Not found' });
  res.status(204).send();
});

// ── Transiciones de estado ────────────────────────────────────────────────────

/** SUGERIDO → CONTACTADO (lo ejecuta el estudiante) */
exports.contactar = asyncHandler(async (req, res) => {
  const data = await MatchService.transicion(req.params.id, 'SUGERIDO', 'CONTACTADO');
  res.status(200).json(data);
});

/** CONTACTADO → ACTIVO (lo ejecuta el exalumno al aceptar) */
exports.aceptar = asyncHandler(async (req, res) => {
  const data = await MatchService.transicion(req.params.id, 'CONTACTADO', 'ACTIVO');
  res.status(200).json(data);
});

/** ACTIVO → CERRADO (cualquiera de los dos) */
exports.cerrar = asyncHandler(async (req, res) => {
  const data = await MatchService.transicion(req.params.id, 'ACTIVO', 'CERRADO');
  res.status(200).json(data);
});
