# Recognized Accounts Management & Transfer Autocomplete

## Summary
Add admin navigation link for recognized accounts and implement autosuggest dropdown in transfer page that shows matching recognized accounts as user types. Also allows admins to add external accounts manually.

## Tasks

1. **Add navigation link** - Added "Recognized Accounts" to admin sidebar (`components/layout/Sidebar.tsx`)

2. **Create autosuggest API endpoint** - Created `/api/accounts/search-recognized` to search recognized accounts by partial account number (`app/api/accounts/search-recognized/route.ts`)

3. **Add search service function** - Added `searchRecognizedAccounts(query: string)` in `lib/services/admin.service.ts`

4. **Update transfer page autosuggest** - Modified `app/(dashboard)/dashboard/transfer/page.tsx`:
   - Added state for search results and dropdown visibility
   - Added debounced search on account number input (500ms, 3+ digits)
   - Render dropdown with matched recognized accounts below input
   - On click, populate account number and show resolved account

5. **Add LuListChecks icon** - Already imported in Sidebar, used for the nav item

6. **Run lint/type check** - Verified changes compile correctly

## Additional Changes

### Schema Updates (`prisma/schema.prisma`)
- Made `accountId` optional in `RecognizedAccount` model
- Added `externalAccountNumber`, `externalAccountHolder`, `externalBankName` fields for external accounts

### Admin Page Updates (`app/(admin)/admin/recognized-accounts/page.tsx`)
- Now supports both internal accounts (via resolve) and external accounts (manual entry)
- When account resolution fails, shows fields for account holder name and bank name
- Table displays full account number (not masked)

### API Updates
- Updated `/api/admin/recognized-accounts` POST to accept either `accountId` or `accountNumber`+`accountHolder`+`bankName`
- Updated `/api/accounts/resolve` to check external recognized accounts and return `bankName` field

## Design Decisions
- Autosuggest triggers after 3+ digits entered for responsive UX
- Dropdown shows max 5 results with full account number, holder name, and account type
- Clicking a suggestion fills the account number and triggers the existing resolve flow
- Admin can add any account (internal or external) to the recognized list