/**
 * Handles requests to routes that do not match any defined endpoint.
 */
export function notFoundHandler(req, res, _next) {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.originalUrl} not found`,
    },
    meta: {
      requestId: req.requestId,
    },
  });
}

