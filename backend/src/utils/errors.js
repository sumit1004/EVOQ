export class AppError extends Error {
  constructor(message, code = 'INTERNAL_ERROR', statusCode = 500, details = null) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Request validation failed', details = null) {
    super(message, 'VALIDATION_ERROR', 400, details);
  }
}

export class UnauthenticatedError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 'UNAUTHENTICATED', 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Access forbidden') {
    super(message, 'FORBIDDEN', 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 'NOT_FOUND', 404);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(message, 'CONFLICT', 409);
  }
}

export class InvalidStateError extends AppError {
  constructor(message = 'Invalid operation for current state') {
    super(message, 'INVALID_STATE', 409);
  }
}

export class RateLimitedError extends AppError {
  constructor(message = 'Too many requests. Please try again later.') {
    super(message, 'RATE_LIMITED', 429);
  }
}

