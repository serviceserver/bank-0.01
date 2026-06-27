# Functional Requirement: Admin Recognizable Accounts

## Overview
Enable administrators to manage a whitelist of trusted recipient accounts. When users initiate transfers, the system displays bank and holder information for recognized accounts.

## User Story
As an admin, I want to maintain a list of trusted/recognized accounts so that users can quickly identify them during transfers.

## Features

### Admin Side
- **View Recognized Accounts**: List all pre-approved accounts with status badges
- **Add Account**: Search by account number and add to recognized list (supports internal and external accounts)
- **Remove Account**: Delete accounts from the recognized list
- **Account Details Display**: Name, full account number, bank, type, date added

### User Side
- **Auto-detection**: When 10-digit account entered, system fetches details
- **Bank Name Display**: Shows "Titan Bank" for internal accounts
- **Holder Name Recognition**: Displays account holder immediately on successful lookup
- **Visual Indicator**: Green checkmark + highlighted background for recognized accounts

## API Endpoints
```
GET /api/admin/recognized-accounts     # List all recognized accounts
POST /api/admin/recognized-accounts   # Add account to list
DELETE /api/admin/recognized-accounts/:id  # Remove account
GET /api/accounts/resolve            # Resolve account (existing)
```

## Database
Add `RecognizedAccount` model with fields:
- `id`, `accountId` (FK, optional), `addedBy` (FK), `createdAt`
- `externalAccountNumber`, `externalAccountHolder`, `externalBankName` (for external accounts)

## Acceptance Criteria
1. Admin can view all recognized accounts in a table
2. Admin can add accounts by account number (internal) or with holder name and bank (external)
3. Admin sees account holder name during add flow for internal accounts
4. User sees bank name and holder when typing recognized account
5. Non-recognized accounts show only holder name (no special indicator)