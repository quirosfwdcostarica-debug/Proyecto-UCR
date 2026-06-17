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

exports.getMyMatches = asyncHandler(async (req, res) => {
  // Using Prisma token or dbUser
  const userId = req.user?.id || req.dbUser?.id;
  const role = req.dbUser?.tipo;
  if (!userId || !role) return res.status(401).json({ message: 'No autenticado o rol indefinido' });
  const data = await MatchService.getMyMatches(userId, role);
  res.status(200).json(data);
});

exports.getAdminMetrics = asyncHandler(async (req, res) => {
  const data = await MatchService.getAdminMetrics();
  res.status(200).json(data);
});

exports.generateMatches = asyncHandler(async (req, res) => {
  const data = await MatchService.generateMatches();
  res.status(200).json({ message: 'Generación completada', ...data });
});

exports.initiateConnection = asyncHandler(async (req, res) => {
  const userId = req.user?.id || req.dbUser?.id;
  try {
    const data = await MatchService.initiateConnection(req.params.id, userId);
    res.status(200).json(data);
  } catch(e) {
    res.status(400).json({ message: e.message });
  }
});

exports.acceptConnection = asyncHandler(async (req, res) => {
  const userId = req.user?.id || req.dbUser?.id;
  try {
    const data = await MatchService.acceptConnection(req.params.id, userId);
    res.status(200).json(data);
  } catch(e) {
    res.status(400).json({ message: e.message });
  }
});

exports.rejectConnection = asyncHandler(async (req, res) => {
  const userId = req.user?.id || req.dbUser?.id;
  try {
    const data = await MatchService.rejectConnection(req.params.id, userId);
    res.status(200).json(data);
  } catch(e) {
    res.status(400).json({ message: e.message });
  }
});

exports.delete = asyncHandler(async (req, res) => {
  const deleted = await MatchService.delete(req.params.id);
  if (!deleted) return res.status(404).json({ message: 'Not found' });
  res.status(204).send();
});
