# Admin User Account Editing & Password Reset

## Functional Requirements

1. **Edit User Account Information**
   - Admin can update the following user fields:
     - `fullName` (string, min 3 chars)
     - `email` (valid email, must be unique)
     - `phone` (valid US phone format, must be unique)
     - `dob` (optional, YYYY-MM-DD)
     - `address` (optional)
     - `city` (optional)
     - `state` (optional, 2-letter code)
     - `zip` (optional, 5 or 9 digit format)
   - Admin cannot modify user `role`, `ssn`, `passwordHash`, `isVerified`, or `id`
   - Email and phone uniqueness must be enforced server-side

2. **Reset User Password**
   - Admin can set a new password without requiring the current password
   - New password must meet active password policy (min 8 chars, 1 uppercase, 1 number)
   - Password must be hashed via bcrypt before storage
   - Password change must be logged with full audit trail

3. **Audit Logging**
   - Every successful update or password reset must create an `AuditLog` entry with:
     - `action`: `USER_INFO_UPDATED` or `USER_PASSWORD_RESET`
     - `entity`: `User`
     - `entityId`: affected user ID
     - `performedBy`: admin user ID
     - `metadata`: changed fields and, for password, confirmation that it was reset (without storing plaintext)
   - Failed authorization attempts must not be logged for audit purposes due to lack of validated admin identity (403 from `requireAdmin` is pre-identity)

4. **Access Control**
   - All endpoints are protected by `requireAdmin()` middleware
   - Non-admin users receive `401` if unauthenticated or `403` if authenticated but not admin
   - Endpoints are read-only to GET requests

5. **Data Validation**
   - All inputs validated server-side using Zod schemas
   - Client-side validation mirrors server-side rules
   - Unique constraint violations (email, phone) return clear error messages

## User Stories

- **US-1**: As an admin, I want to correct or update a user's personal and contact information so that the user record remains accurate and communications are delivered to the right person.
- **US-2**: As an admin, I want to reset a user's password when they are locked out or as part of a security response so that the user can regain access without knowing their current password.
- **US-3**: As an admin, I want every modification I make to a user account to be permanently recorded in an audit log so that compliance reviewers can trace who changed what and when.
- **US-4**: As a security auditor, I want audit logs to capture whether a password reset or profile update occurred and by which admin so that I can investigate suspicious activity.

## API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| PATCH | `/api/admin/users/:userId/info` | Update user account information |
| POST | `/api/admin/users/:userId/password` | Reset user password |

## Security Considerations

- **Authentication**: All requests require a valid NextAuth session with `role: "ADMIN"`
- **Authorization**: `requireAdmin()` ensures only admins can access endpoints
- **Secrets**: Never return `passwordHash` in any API response
- **Audit Integrity**: Write audit logs within Prisma transactions that include the state change, or create the log immediately after the update to reduce the risk of partial state
- **Input Sanitization**: Zod validation blocks malformed or malicious input before database interaction
- **Error Handling**: Generic error messages returned to client; detailed validation errors sent back for form display
- **CSRF**: Mitigated by NextAuth credential-based session strategy

## Non-Functional Requirements

- Response time for updates: < 500ms
- Audit logs are immutable (no delete/update endpoints exposed)
- Passwords are hashed with bcrypt (cost factor consistent with registration flow)
- Admin UI must disable submit buttons during in-flight requests
- Frontend must not display password hashes
