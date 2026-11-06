import { ValidationError } from '../utils/errors.js';

/**
 * Higher-order middleware to validate incoming request data using Zod schema.
 * @param {import('zod').ZodSchema} schema
 * @param {'body' | 'query' | 'params'} source
 */
export function validate(schema, source = 'body') {
  return (req, _res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const details = result.error.errors.map((err) => ({
        field: err.path.join('.'),
        issue: err.message,
      }));

      return next(new ValidationError('Request validation failed', details));
    }

    // Replace request data with parsed/sanitized output
    req[source] = result.data;
    next();
  };
}

