# Transfer PIN Feature Plan

## Overview
Add a transfer PIN that customers must enter to authorize transfers, providing additional security for fund transfers.

## Changes Required

### 1. Database Schema (`prisma/schema.prisma`)
- Add `transferPin` field to `User` model (encrypted string, nullable)
- Migration will be required after schema change

### 2. API Endpoints
- **POST `/api/users/transfer-pin`** - Set/update transfer PIN
- **Modify `/api/accounts/[accountId]/transfer`** - Require PIN verification

### 3. Transfer Flow (`app/(dashboard)/dashboard/transfer/page.tsx`)
- Add Step 3 (between confirm and success) for PIN entry
- Add state for `pin` and `pinError`
- Verify PIN before submitting transfer

### 4. PIN Management Page (`app/(dashboard)/dashboard/settings/page.tsx`)
- Create new page or add to existing settings for PIN setup
- Form with 4-6 digit PIN input and confirmation
- Hash PIN before storing (use bcrypt)

### 5. Transfer PIN Service (`lib/services/pin.service.ts`)
- Create new service with:
  - `setTransferPin(userId, pin)` - Hash and store PIN
  - `verifyTransferPin(userId, pin)` - Compare hashed PIN
  - `hasTransferPin(userId)` - Check if PIN is set

## Security Considerations
- PIN must be hashed (bcrypt) before storage
- PIN should be 4-6 digits numeric
- PIN verification happens server-side
- Failed attempts could trigger rate limiting (future enhancement)

## Validation Plan
1. User can set PIN in settings page
2. Transfer requires PIN verification on confirmation step
3. Invalid PIN shows error, allows retry
4. PIN is stored securely (hashed)
5. Admin transfers unaffected (skip PIN requirement)

## Open Questions
- Should admin users have transfer PINs? (Currently admins don't do transfers via mobile nav)
- Should there be a max retry limit for PIN verification?