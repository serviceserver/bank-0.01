// prisma/seed.ts

import { PrismaClient, AccountType, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Generate a 9-digit routing number (ABA format)
function generateRoutingNumber(): string {
  // First 2 digits: Federal Reserve routing symbol (01-12)
  // First 4 digits: Federal Reserve district
  // 5th digit: Check digit algorithm
  const fedDigits = String(Math.floor(10 + Math.random() * 99)).padStart(2, "0");
  const bankCode = String(Math.floor(10000 + Math.random() * 90000)).padStart(5, "0");
  return (fedDigits + bankCode).slice(0, 9);
}

// Generate a US-style account number (typically 8-12 digits)
async function generateAccountNumber(): Promise<string> {
  for (let i = 0; i < 10; i++) {
    const number = Math.floor(100000000 + Math.random() * 900000000).toString();
    const existing = await prisma.account.findUnique({
      where: { accountNumber: number },
    });
    if (!existing) return number;
  }
  throw new Error("Could not generate unique account number.");
}

async function main() {
  console.log("🌱 Seeding database...");

  const routingNumber = generateRoutingNumber();

  // ── Admin User ──────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash("BankAdmin#99", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@nexbank.com" },
    update: {},
    create: {
      fullName: "NexBank Admin",
      email: "admin@nexbank.com",
      phone: "+12125551234",
      passwordHash: adminPassword,
      role: Role.ADMIN,
      isVerified: true,
      address: "1200 Pennsylvania Ave NW",
      city: "Washington",
      state: "DC",
      zip: "20001",
    },
  });

  console.log(`✅ Admin created: ${admin.email}`);

  // ── Customer 1 ──────────────────────────────────────────────────
  const customer1Password = await bcrypt.hash("John#2024!", 12);

  const customer1 = await prisma.user.upsert({
    where: { email: "john@nexbank.com" },
    update: {},
    create: {
      fullName: "John Smith",
      email: "john@nexbank.com",
      phone: "+12125555678",
      passwordHash: customer1Password,
      role: Role.CUSTOMER,
      isVerified: true,
      ssn: "123456789",
      dob: "1985-03-15",
      address: "100 Financial District",
      city: "New York",
      state: "NY",
      zip: "10005",
    },
  });

  // Checking account for customer 1
  let c1Checking = await prisma.account.findFirst({
    where: { userId: customer1.id, type: AccountType.CHECKING },
  });

  if (!c1Checking) {
    c1Checking = await prisma.account.create({
      data: {
        userId: customer1.id,
        accountNumber: await generateAccountNumber(),
        routingNumber,
        type: AccountType.CHECKING,
        balance: 5420.75,
      },
    });
  }

  // Savings account for customer 1
  let c1Savings = await prisma.account.findFirst({
    where: { userId: customer1.id, type: AccountType.SAVINGS },
  });

  if (!c1Savings) {
    c1Savings = await prisma.account.create({
      data: {
        userId: customer1.id,
        accountNumber: await generateAccountNumber(),
        routingNumber,
        type: AccountType.SAVINGS,
        balance: 12850.00,
      },
    });
  }

  console.log(`✅ Customer 1 created: ${customer1.email}`);

  // ── Customer 2 ──────────────────────────────────────────────────
  const customer2Password = await bcrypt.hash("Ada#2024!", 12);

  const customer2 = await prisma.user.upsert({
    where: { email: "ada@nexbank.com" },
    update: {},
    create: {
      fullName: "Ada Johnson",
      email: "ada@nexbank.com",
      phone: "+13105559876",
      passwordHash: customer2Password,
      role: Role.CUSTOMER,
      isVerified: false,
      ssn: "987654321",
      dob: "1992-07-22",
      address: "200 Market Street",
      city: "San Francisco",
      state: "CA",
      zip: "94105",
    },
  });

  let c2Checking = await prisma.account.findFirst({
    where: { userId: customer2.id, type: AccountType.CHECKING },
  });

  if (!c2Checking) {
    c2Checking = await prisma.account.create({
      data: {
        userId: customer2.id,
        accountNumber: await generateAccountNumber(),
        routingNumber,
        type: AccountType.CHECKING,
        balance: 3200.50,
      },
    });
  }

  console.log(`✅ Customer 2 created: ${customer2.email}`);

  // ── Seed Transactions ───────────────────────────────────────────
  const existingTxns = await prisma.transaction.count();

  if (existingTxns === 0) {
    await prisma.transaction.createMany({
      data: [
        {
          type: "ACH_CREDIT",
          status: "SUCCESS",
          amount: 5420.75,
          balanceBefore: 0,
          balanceAfter: 5420.75,
          description: "Direct deposit - Payroll",
          toAccountId: c1Checking.id,
        },
        {
          type: "ACH_CREDIT",
          status: "SUCCESS",
          amount: 12850.00,
          balanceBefore: 0,
          balanceAfter: 12850.00,
          description: "Initial deposit",
          toAccountId: c1Savings.id,
        },
        {
          type: "ACH_CREDIT",
          status: "SUCCESS",
          amount: 3200.50,
          balanceBefore: 0,
          balanceAfter: 3200.50,
          description: "Direct deposit - Payroll",
          toAccountId: c2Checking.id,
        },
        {
          type: "TRANSFER",
          status: "SUCCESS",
          amount: 500.00,
          balanceBefore: 5420.75,
          balanceAfter: 4920.75,
          description: "Transfer to Ada",
          fromAccountId: c1Checking.id,
          toAccountId: c2Checking.id,
        },
        {
          type: "ATM_WITHDRAWAL",
          status: "SUCCESS",
          amount: 200.00,
          balanceBefore: 4920.75,
          balanceAfter: 4720.75,
          description: "ATM withdrawal - Chase Bank",
          fromAccountId: c1Checking.id,
        },
        {
          type: "CHECK_DEPOSIT",
          status: "SUCCESS",
          amount: 1200.00,
          balanceBefore: 4720.75,
          balanceAfter: 5920.75,
          description: "Check deposit - Client payment",
          toAccountId: c1Checking.id,
        },
      ],
    });

    // Sync balances to reflect seeded transactions
    await prisma.account.update({
      where: { id: c1Checking.id },
      data: { balance: 5920.75 },
    });
    await prisma.account.update({
      where: { id: c1Savings.id },
      data: { balance: 12850.00 },
    });
    await prisma.account.update({
      where: { id: c2Checking.id },
      data: { balance: 3700.50 },
    });

    console.log("✅ Transactions seeded");
  }

  // ── Seed Audit Logs ─────────────────────────────────────────────
  const existingLogs = await prisma.auditLog.count();

  if (existingLogs === 0) {
    await prisma.auditLog.createMany({
      data: [
        {
          action: "USER_VERIFIED",
          entity: "User",
          entityId: customer1.id,
          performedBy: admin.id,
          metadata: { note: "Verified during onboarding" },
        },
        {
          action: "MANUAL_CREDIT",
          entity: "Account",
          entityId: c1Savings.id,
          performedBy: admin.id,
          metadata: { amount: 12850.00, note: "Seed credit" },
        },
      ],
    });

    console.log("✅ Audit logs seeded");
  }

  console.log("\n🎉 Seed complete. Login credentials:");
  console.log("   Admin    → admin@nexbank.com     / BankAdmin#99");
  console.log("   Customer → john@nexbank.com      / John#2024!");
  console.log("   Customer → ada@nexbank.com       / Ada#2024!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
