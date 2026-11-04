# Authentication API
| Method/path | Body | Response | Errors |
|---|---|---|---|
| POST `/auth/register` | `{email,password}` | 201 `{userId,verificationRequired}` | 400,409,429 |
| POST `/auth/login` | `{email,password}` | 200 summary + session cookie | 401,429 |
| POST `/auth/logout` | CSRF header | 204; session revoked | 401 |
| GET `/auth/me` | Cookie | User and capability summary | 401 |
| POST `/auth/verify-email` | `{token}` | Verified status | 400,410 |
| POST `/auth/password/forgot` | `{email}` | Generic accepted response | 429 |
| POST `/auth/password/reset` | `{token,newPassword}` | Success | 400,410 |

Normalize email. Hash passwords with Argon2id (bcrypt only after cost review). Store only hash of random high-entropy session/token. Rotate/revoke sessions on login, logout and password reset. Verification/reset tokens are single-use and expiring. Forgot-password responses must not reveal account existence. Rate-limit by IP and account identifier.
