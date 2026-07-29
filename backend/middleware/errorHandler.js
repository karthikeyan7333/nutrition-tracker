export function notFound(req, res) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(error, _req, res, _next) {
  console.error(error);
  if (error.name === 'CastError') return res.status(404).json({ error: 'Resource not found' });
  if (error.code === 11000) return res.status(400).json({ error: 'Email is already registered' });
  res.status(error.statusCode || 500).json({ error: error.message || 'Internal server error' });
}
