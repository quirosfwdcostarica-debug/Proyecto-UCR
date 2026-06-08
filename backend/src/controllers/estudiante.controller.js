const EstudianteService = require('../services/estudiante.service');
const asyncHandler = require('../utils/asyncHandler');

exports.findAll = asyncHandler(async (req, res) => {
  const data = await EstudianteService.findAll();
  res.status(200).json(data);
});

exports.findById = asyncHandler(async (req, res) => {
  const data = await EstudianteService.findById(req.params.id);
  if (!data) return res.status(404).json({ message: 'Not found' });
  res.status(200).json(data);
});

exports.create = asyncHandler(async (req, res) => {
  const data = await EstudianteService.create(req.body);
  res.status(201).json(data);
});

exports.update = asyncHandler(async (req, res) => {
  const data = await EstudianteService.update(req.params.id, req.body);
  if (!data) return res.status(404).json({ message: 'Not found' });
  res.status(200).json(data);
});

exports.delete = asyncHandler(async (req, res) => {
  const deleted = await EstudianteService.delete(req.params.id);
  if (!deleted) return res.status(404).json({ message: 'Not found' });
  res.status(204).send();
});
