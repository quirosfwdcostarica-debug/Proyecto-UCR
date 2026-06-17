const express = require('express');
const router = express.Router();
const controller = require('../controllers/match.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/role.middleware');

router.get('/my', verifyToken, requireRole('ESTUDIANTE', 'EXALUMNO'), controller.getMyMatches);
router.get('/admin', verifyToken, requireRole('ADMINISTRADOR', 'ADMIN'), controller.findAll);
router.get('/admin/metrics', verifyToken, requireRole('ADMINISTRADOR', 'ADMIN'), controller.getAdminMetrics);
router.post('/admin/generate', verifyToken, requireRole('ADMINISTRADOR', 'ADMIN'), controller.generateMatches);

router.post('/request/:id', verifyToken, requireRole('ESTUDIANTE', 'EXALUMNO'), controller.initiateConnection);
router.put('/accept/:id', verifyToken, requireRole('ESTUDIANTE', 'EXALUMNO'), controller.acceptConnection);
router.put('/reject/:id', verifyToken, requireRole('ESTUDIANTE', 'EXALUMNO'), controller.rejectConnection);

router.get('/:id', controller.findById);
router.delete('/:id', verifyToken, requireRole('ADMINISTRADOR', 'ADMIN'), controller.delete);

module.exports = router;
