/**
 * Lightweight request logger.
 * Sensitive data (authorization headers, cookies) is not logged.
 */
export function requestLogger(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(
      `[${req.requestId}] ${req.method} ${req.originalUrl} → ${res.statusCode} (${duration}ms)`
    );
  });

  next();
}

