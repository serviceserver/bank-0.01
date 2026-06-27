# Recognized Accounts Management & Transfer Autocomplete

## Summary
Add admin navigation link for recognized accounts and implement autosuggest dropdown in transfer page that shows matching recognized accounts as user types.

## Tasks

1. **Add navigation link** - Add "Recognized Accounts" to admin sidebar (`components/layout/Sidebar.tsx` line 27)

2. **Create autosuggest API endpoint** - New `/api/accounts/search-recognized` to search recognized accounts by partial account number (`app/api/accounts/search-recognized/route.ts`)

3. **Add search service function** - `searchRecognizedAccounts(query: string)` in `lib/services/admin.service.ts`

4. **Update transfer page autosuggest** - Modify `app/(dashboard)/dashboard/transfer/page.tsx`:
   - Add state for search results and dropdown visibility
   - Add debounced search on account number input
   - Render dropdown with matched recognized accounts below input
   - On click, populate account number and show resolved account

5. **Add LuListChecks icon** - Already imported in Sidebar, no changes needed

6. **Run lint/type check** - Verify changes compile correctly

## Design Decisions

- Autosuggest triggers after 3+ digits entered for responsive UX
- Dropdown shows max 5 results with account number (last 4), holder name, and account type
- Clicking a suggestion fills the account number and triggers the existing resolve flow
- Admin page already supports add/remove operations via modal (lines 210-261)