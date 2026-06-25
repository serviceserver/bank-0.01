markdown# NexBank

A full-stack banking simulation built with Next.js 16, Prisma, and PostgreSQL.
Clean architecture with service-layer isolation, atomic transactions, audit
logging, email notifications, and a complete admin panel.

---

## Tech Stack

| Layer         | Technology                        |
|---------------|-----------------------------------|
| Framework     | Next.js 16 (App Router)           |
| Language      | TypeScript                        |
| Database      | PostgreSQL (Neon)                 |
| ORM           | Prisma                            |
| Auth          | NextAuth.js v4 (Credentials)      |
| Email         | Resend                            |
| Styling       | Tailwind CSS                      |
| Validation    | Zod                               |
| Password Hash | bcryptjs                          |

---

## Features

### Customer
- Register and log in securely
- Open multiple account types (Savings, Current, Fixed Deposit)
- Deposit, withdraw, and transfer funds
- Real-time account number resolution before transfers
- Full transaction history with pagination
- Email alerts on every transaction

### Admin
- View all users and their accounts
- Manually credit or debit any account
- Freeze and unfreeze accounts
- Verify users (KYC)
- System-wide transaction log
- Full audit log with expandable metadata

---

## Project Structure
/

├── app/

│   ├── api/

│   │   ├── auth/

│   │   │   ├── [...nextauth]/route.ts

│   │   │   └── register/route.ts

│   │   ├── accounts/

│   │   │   ├── route.ts

│   │   │   ├── resolve/route.ts

│   │   │   └── [accountId]/

│   │   │       ├── deposit/route.ts

│   │   │       ├── withdraw/route.ts

│   │   │       ├── transfer/route.ts

│   │   │       └── transactions/route.ts

│   │   └── admin/

│   │       ├── users/

│   │       │   ├── route.ts

│   │       │   └── [userId]/route.ts

│   │       ├── accounts/

│   │       │   └── [accountId]/

│   │       │       ├── credit/route.ts

│   │       │       ├── debit/route.ts

│   │       │       └── status/route.ts

│   │       ├── transactions/route.ts

│   │       └── audit-logs/route.ts

│   ├── (auth)/

│   │   ├── login/page.tsx

│   │   └── register/page.tsx

│   ├── (dashboard)/

│   │   └── dashboard/

│   │       ├── page.tsx

│   │       ├── accounts/page.tsx

│   │       ├── transactions/page.tsx

│   │       └── transfer/page.tsx

│   └── (admin)/

│       └── admin/

│           ├── page.tsx

│           ├── users/

│           │   └── [userId]/page.tsx

│           └── audit-logs/page.tsx

│

├── components/

│   ├── ui/

│   │   ├── Button.tsx

│   │   ├── Input.tsx

│   │   ├── Card.tsx

│   │   ├── Badge.tsx

│   │   ├── Spinner.tsx

│   │   └── EmptyState.tsx

│   ├── layout/

│   │   ├── Sidebar.tsx

│   │   ├── TopBar.tsx

│   │   └── PageWrapper.tsx

│   └── shared/

│       ├── StatCard.tsx

│       ├── AccountCard.tsx

│       └── TransactionRow.tsx

│

├── lib/

│   ├── auth/

│   │   └── authOptions.ts

│   ├── db/

│   │   └── prisma.ts

│   ├── mail/

│   │   ├── resend.ts

│   │   ├── templates.ts

│   │   └── notification.service.ts

│   ├── services/

│   │   ├── account.service.ts

│   │   ├── auth.service.ts

│   │   ├── transaction.service.ts

│   │   └── admin.service.ts

│   ├── validators/

│   │   └── auth.validators.ts

│   └── utils/

│       ├── apiResponse.ts

│       ├── formatCurrency.ts

│       ├── formatDate.ts

│       ├── generateAccountNumber.ts

│       ├── getSession.ts

│       └── transactionMeta.ts

│

├── prisma/

│   ├── schema.prisma

│   └── seed.ts

│

├── types/

│   └── next-auth.d.ts

│

├── middleware.ts

├── .env

└── package.json

---

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/your-username/nexbank.git
cd nexbank
npm install
```

### 2. Configure environment variables

Create a `.env` file in the root:

```bash
# Database (Neon or any PostgreSQL connection string)
DATABASE_URL="postgresql://user:password@host/nexbank?sslmode=require"

# NextAuth
NEXTAUTH_SECRET="your-secret-here"   # openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"

# Resend (email notifications)
RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxxxx"
```

Generate a strong `NEXTAUTH_SECRET`:

```bash
openssl rand -base64 32
```

### 3. Set up the database

```bash
# Run migrations
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate
```

### 4. Seed the database

```bash
npx prisma db seed
```

This creates the following accounts:

| Role     | Email                  | Password        |
|----------|------------------------|-----------------|
| Admin    | admin@nexbank.com      | Admin@1234      |
| Customer | john@nexbank.com       | Customer@1234   |
| Customer | ada@nexbank.com        | Customer@1234   |

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Architecture
Request

└── middleware.ts              ← authentication + role-based access

└── app/api/route.ts     ← thin handler: validate input, call service

└── lib/services/  ← all business logic lives here

└── lib/db/prisma.ts  ← single Prisma instance

└── Neon PostgreSQL

### Key principles

**Service layer isolation** — No raw Prisma queries in route handlers or
components. Every database operation goes through a service function.

**Atomic transactions** — Every money operation (deposit, withdrawal,
transfer, manual credit/debit) runs inside `prisma.$transaction`. If any
step fails, the entire operation rolls back. Balance updates and transaction
records are always in sync.

**Immutable ledger** — Every transaction stores `balanceBefore` and
`balanceAfter` at the time of the operation. History is self-contained and
does not require recalculation.

**Audit trail** — Every admin action (freeze, credit, debit, verify) writes
an `AuditLog` record inside the same `$transaction` as the action itself.
The two are always consistent.

**Fire-and-forget notifications** — Email alerts are sent after the database
write resolves, never inside the transaction. A failed email never rolls
back a successful transaction.

**Ownership checks** — Withdrawal, transfer, and transaction history
endpoints verify that the requesting user owns the account before proceeding.
These checks happen inside the Prisma transaction to eliminate race conditions.

---

## API Reference

### Auth

| Method | Endpoint              | Description          | Auth     |
|--------|-----------------------|----------------------|----------|
| POST   | /api/auth/register    | Register new user    | Public   |
| POST   | /api/auth/[...nextauth] | Login / session    | Public   |

### Accounts

| Method | Endpoint                              | Description                  | Auth       |
|--------|---------------------------------------|------------------------------|------------|
| GET    | /api/accounts                         | Get user's accounts          | Customer   |
| POST   | /api/accounts                         | Open new account             | Customer   |
| GET    | /api/accounts/resolve?accountNumber=  | Resolve account number       | Customer   |
| POST   | /api/accounts/:id/deposit             | Deposit funds                | Customer   |
| POST   | /api/accounts/:id/withdraw            | Withdraw funds               | Customer   |
| POST   | /api/accounts/:id/transfer            | Transfer to another account  | Customer   |
| GET    | /api/accounts/:id/transactions        | Transaction history          | Customer   |

### Admin

| Method | Endpoint                              | Description                  | Auth  |
|--------|---------------------------------------|------------------------------|-------|
| GET    | /api/admin/users                      | List all users               | Admin |
| GET    | /api/admin/users/:id                  | Get user detail              | Admin |
| PATCH  | /api/admin/users/:id                  | Verify user (KYC)            | Admin |
| POST   | /api/admin/accounts/:id/credit        | Manual credit                | Admin |
| POST   | /api/admin/accounts/:id/debit         | Manual debit                 | Admin |
| PATCH  | /api/admin/accounts/:id/status        | Freeze / unfreeze account    | Admin |
| GET    | /api/admin/transactions               | All transactions system-wide | Admin |
| GET    | /api/admin/audit-logs                 | All audit logs               | Admin |

---

## Email Notifications

Powered by Resend. The following events trigger an email to the
account holder:

| Event             | Recipient(s)                  |
|-------------------|-------------------------------|
| Deposit           | Account holder                |
| Withdrawal        | Account holder                |
| Transfer sent     | Sender                        |
| Transfer received | Recipient                     |

Notifications are fire-and-forget. Email failures are logged to the
console but never surface to the user or affect the transaction.

---

## Database Models
User

├── id, fullName, email, phone, passwordHash

├── role (CUSTOMER | ADMIN)

├── nin (optional, KYC)

├── isVerified

└── accounts[]
Account

├── id, accountNumber, type, status, balance, currency

├── userId → User

├── sentTransactions[]

└── receivedTransactions[]
Transaction

├── id, reference, type, status

├── amount, balanceBefore, balanceAfter

├── description

├── fromAccountId? → Account

└── toAccountId?   → Account
AuditLog

├── id, action, entity, entityId

├── metadata (JSON)

└── performedBy → User

---

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run start        # Start production server
npx prisma studio    # Open Prisma database GUI
npx prisma db seed   # Seed database with demo data
npx prisma migrate dev --name <name>   # Create and run a new migration
```

---

## License

MIT