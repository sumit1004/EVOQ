import { UnauthenticatedError, ForbiddenError } from '../utils/errors.js';

/**
 * Reusable middleware to require a specific account type (e.g. 'GAMER' or 'ORGANIZER').
 * Must be preceded by `authenticate` middleware in the route chain.
 */
export function requireAccountType(requiredType) {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new UnauthenticatedError('Authentication required'));
    }

    const userAccountType = req.user.accountType || 'GAMER';

    if (userAccountType !== requiredType) {
      const message =
        requiredType === 'GAMER'
          ? 'Access restricted to Gamer accounts. Organizer accounts cannot access Gamer resources.'
          : 'Access restricted to Organizer accounts. Gamer accounts cannot access Organizer resources.';
      return next(new ForbiddenError(message));
    }

    next();
  };
}

export const requireGamer = requireAccountType('GAMER');
export const requireOrganizer = requireAccountType('ORGANIZER');

