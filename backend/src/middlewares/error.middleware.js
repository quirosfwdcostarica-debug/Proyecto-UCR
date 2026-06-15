exports.errorHandler = (err, req, res, next) => {
  // Errores intencionales del servicio: throw { status: 4xx, message: '...' }
  if (err.status && err.status < 500) {
    return res.status(err.status).json({ message: err.message });
  }

  // Errores inesperados: loggear con detalle
  console.error('[ErrorHandler]', err.stack || err.message || err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? (err.stack || err) : {}
  });
};
