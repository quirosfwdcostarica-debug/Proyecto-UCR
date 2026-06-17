const express = require('express');
const router  = express.Router();
const c       = require('../controllers/match.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

// CRUD base
router.get('/',                          c.findAll);
router.get('/:id',                       c.findById);
router.get('/estudiante/:estudianteId',  c.findByEstudiante);
router.get('/exalumno/:exalumnoId',      c.findByExalumno);
router.post('/',    /* verifyToken, */   c.create);
router.put('/:id',  /* verifyToken, */   c.update);
router.delete('/:id', /* verifyToken, */ c.delete);

// Transiciones de estado
router.patch('/:id/contactar', /* verifyToken, */ c.contactar); // SUGERIDO   → CONTACTADO
router.patch('/:id/aceptar',   /* verifyToken, */ c.aceptar);   // CONTACTADO → ACTIVO
router.patch('/:id/cerrar',    /* verifyToken, */ c.cerrar);    // ACTIVO     → CERRADO

module.exports = router;
