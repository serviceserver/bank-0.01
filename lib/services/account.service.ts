// lib/services/account.service.ts

import prisma from "@/lib/db/prisma";
import { generateAccountNumber } from "@/lib/utils/generateAccountNumber";
import { AccountType, AccountStatus } from "@prisma/client";

// ─── Create Account ────────────────────────────────────────────────

export async function createAccount(userId: string, type: AccountType) {
  // A user can only have one account per type
  const existing = await prisma.account.findFirst({
    where: { userId, type },
  });

  if (existing) {
    throw new Error(`You already have a ${type} account.`);
  }

  const accountNumber = await generateAccountNumber();

  return prisma.account.create({
    data: {
      userId,
      type,
      accountNumber,
    },
  });
}

// ─── Get All Accounts for a User ──────────────────────────────────

export async function getUserAccounts(userId: string) {
  return prisma.account.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });
}

// ─── Get Single Account (with ownership check) ────────────────────

export async function getAccountById(accountId: string, userId: string) {
  const account = await prisma.account.findUnique({
    where: { id: accountId },
  });

  if (!account) throw new Error("Account not found.");
  if (account.userId !== userId) throw new Error("Unauthorized.");

  return account;
}

// ─── Get Account by Account Number (for transfers) ────────────────

export async function getAccountByNumber(accountNumber: string) {
  const account = await prisma.account.findUnique({
    where: { accountNumber },
    include: { user: { select: { fullName: true } } },
  });

  if (!account) throw new Error("Account number not found.");
  if (account.status !== AccountStatus.ACTIVE) {
    throw new Error("This account is not active.");
  }

  return account;
}

// ─── Freeze / Unfreeze (Admin only) ───────────────────────────────

export async function setAccountStatus(
  accountId: string,
  status: AccountStatus,
  adminId: string
) {
  const account = await prisma.account.findUnique({
    where: { id: accountId },
  });

  if (!account) throw new Error("Account not found.");

  const [updated] = await prisma.$transaction([
    prisma.account.update({
      where: { id: accountId },
      data: { status },
    }),
    prisma.auditLog.create({
      data: {
        action: status === AccountStatus.FROZEN ? "ACCOUNT_FROZEN" : "ACCOUNT_UNFROZEN",
        entity: "Account",
        entityId: accountId,
        performedBy: adminId,
        metadata: { previousStatus: account.status },
      },
    }),
  ]);

  return updated;
}