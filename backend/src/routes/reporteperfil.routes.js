const express = require('express');
const router = express.Router();
const controller = require('../controllers/reporteperfil.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/role.middleware');

router.get('/', controller.findAll);
router.get('/:id', controller.findById);
router.post('/', verifyToken, controller.create);
router.put('/:id', verifyToken, requireRole('ADMIN'), controller.update);
router.delete('/:id', verifyToken, requireRole('ADMIN'), controller.delete);

module.exports = router;
