# Transfer Workflow: Add Routing Number Field

## Goal
Add routing number collection to the fund transfer workflow for external bank transfers, aligning with standard US banking UX patterns.

## Current State Analysis
- The transfer page (`/dashboard/transfer`) currently only collects: account number, amount, description
- Internal transfers use `(form.toAccountNumber.length !== 10)` validation
- External transfers via recognized accounts are already supported but without routing number
- The API endpoint (`/api/accounts/[accountId]/transfer`) accepts `toAccountNumber`, `amount`, `description`
- The `transfer` service function looks up recipients by account number only

## Key Design Decisions

### 1. When to show routing number field?
**Recommendation**: Show routing number field when:
- Recipient is not found internally (account number doesn't resolve)
- For explicit "external transfer" flow

### 2. Routing number validation
**Recommendation**: US routing number format is 9 digits:
```
/^[0-9]{9}$/ 
```

### 3. Integration approach
**Recommendation**: 
- Add optional `routingNumber` field to transfer form
- Show field conditionally when account number doesn't match internal accounts
- For recognized external accounts, pre-fill from stored data if available

## Implementation Tasks

### Task 1: Update Transfer Page UI
- Add `routingNumber` to form state
- Add routing number input field below account number
- Show conditionally when `isExternal` mode is detected
- Update validation to require routing for external transfers

### Task 2: Update API Endpoint
- Add `routingNumber` parameter to POST handler
- Pass routing number to transaction service
- Handle external vs internal transfer distinction

### Task 3: Update Transaction Service
- Accept optional `routingNumber` in transfer function
- Store routing number in transaction metadata or separate field
- Validate for external transfers

### Task 4: Update Recognized Account Resolution
- When account number fails to resolve internally, check recognized accounts
- Pre-fill routing number for known external transfers

## Risks & Considerations
1. **Backward compatibility**: Existing transfers without routing numbers must still work
2. **Database schema**: May need new field in Transaction table or use metadata JSON
3. **UX clarity**: Need clear distinction between internal and external transfers

## Validation Plan
1. Unit test routing number regex validation
2. Integration test: external transfer with routing number
3. Integration test: internal transfer (routing optional)
4. UI test: routing field appears when appropriate