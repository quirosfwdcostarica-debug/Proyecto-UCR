const express = require('express');
const router = express.Router();

router.use('/users', require('./user.routes'));
router.use('/exalumnos', require('./exalumno.routes'));
router.use('/estudiantes', require('./estudiante.routes'));
router.use('/matches', require('./match.routes'));
router.use('/donaciones', require('./donacion.routes'));
router.use('/reportes-perfil', require('./reporteperfil.routes'));
router.use('/curriculum', require('./curriculum.routes'));
router.use('/curriculum-experiencia', require('./curriculumexperiencia.routes'));
router.use('/curriculum-certificacion', require('./curriculumcertificacion.routes'));
router.use('/posiciones', require('./posicion.routes'));
router.use('/curriculum-versiones', require('./curriculumversion.routes'));
router.use('/aplicaciones', require('./aplicacion.routes'));

module.exports = router;
