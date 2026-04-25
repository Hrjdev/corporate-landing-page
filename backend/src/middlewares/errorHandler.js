const errorHandler = (err, req, res, next) => {
  console.error('[Global Error]:', err);
  
  const status = err.status || 500;
  const message = err.message || 'Sunucu içi bir hata oluştu.';
  
  res.status(status).json({
    success: false,
    error: message
  });
};

module.exports = errorHandler;
