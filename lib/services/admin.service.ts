// lib/services/admin.service.ts

import prisma from "@/lib/db/prisma";
import { TransactionType, TransactionStatus } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

// ─── Get All Users ─────────────────────────────────────────────────

export async function getAllUsers(page = 1, limit = 20) {
  const skip = (page - 1) * limit;

  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        isVerified: true,
        createdAt: true,
        accounts: {
          select: {
            id: true,
            accountNumber: true,
            routingNumber: true,
            type: true,
            status: true,
            balance: true,
          },
        },
      },
    }),
    prisma.user.count(),
  ]);

  return {
    users: users.map((u) => ({
      ...u,
      createdAt: u.createdAt.toISOString(),
      accounts: u.accounts.map((acc) => ({
        ...acc,
        balance: acc.balance.toNumber(),
      })),
    })),
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// ─── Get Single User ───────────────────────────────────────────────

export async function getUserById(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      role: true,
      ssn: true,
      isVerified: true,
      createdAt: true,
      accounts: {
        select: {
          id: true,
          accountNumber: true,
          routingNumber: true,
          type: true,
          status: true,
          balance: true,
          createdAt: true,
        },
      },
    },
  });

  if (!user) throw new Error("User not found.");
  return {
    ...user,
    createdAt: user.createdAt.toISOString(),
    accounts: user.accounts.map((acc) => ({
      ...acc,
      balance: acc.balance.toNumber(),
    })),
  };
}

// ─── Get All Transactions (system-wide) ───────────────────────────

export async function getAllTransactions(
  page = 1,
  limit = 20,
  filters?: {
    type?: TransactionType;
    status?: TransactionStatus;
    from?: Date;
    to?: Date;
  }
) {
  const skip = (page - 1) * limit;

  const where = {
    ...(filters?.type && { type: filters.type }),
    ...(filters?.status && { status: filters.status }),
    ...(filters?.from || filters?.to
      ? {
          createdAt: {
            ...(filters.from && { gte: filters.from }),
            ...(filters.to && { lte: filters.to }),
          },
        }
      : {}),
  };

  const [transactions, total] = await prisma.$transaction([
    prisma.transaction.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        fromAccount: {
          select: {
            accountNumber: true,
            user: { select: { fullName: true } },
          },
        },
        toAccount: {
          select: {
            accountNumber: true,
            user: { select: { fullName: true } },
          },
        },
      },
    }),
    prisma.transaction.count({ where }),
  ]);

  return {
    transactions: transactions.map((t) => ({
      ...t,
      createdAt: t.createdAt.toISOString(),
      amount: t.amount.toNumber(),
      balanceBefore: t.balanceBefore.toNumber(),
      balanceAfter: t.balanceAfter.toNumber(),
    })),
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// ─── Manual Credit ─────────────────────────────────────────────────

export async function manualCredit(
  accountId: string,
  amount: number,
  adminId: string,
  description?: string
) {
  if (amount <= 0) throw new Error("Amount must be greater than zero.");

  const amt = new Decimal(amount);

  return prisma.$transaction(async (tx) => {
    const account = await tx.account.findUnique({
      where: { id: accountId },
    });

    if (!account) throw new Error("Account not found.");

    const balanceBefore = account.balance;
    const balanceAfter = balanceBefore.add(amt);

    await tx.account.update({
      where: { id: accountId },
      data: { balance: balanceAfter },
    });

    const transaction = await tx.transaction.create({
      data: {
        type: TransactionType.ACH_CREDIT,
        status: TransactionStatus.SUCCESS,
        amount: amt,
        balanceBefore,
        balanceAfter,
        description: description ?? "Manual credit by admin",
        toAccountId: accountId,
      },
    });

    await tx.auditLog.create({
      data: {
        action: "MANUAL_CREDIT",
        entity: "Account",
        entityId: accountId,
        performedBy: adminId,
        metadata: { amount, balanceBefore, balanceAfter },
      },
    });

    return transaction;
  });
}

// ─── Manual Debit ──────────────────────────────────────────────────

export async function manualDebit(
  accountId: string,
  amount: number,
  adminId: string,
  description?: string
) {
  if (amount <= 0) throw new Error("Amount must be greater than zero.");

  const amt = new Decimal(amount);

  return prisma.$transaction(async (tx) => {
    const account = await tx.account.findUnique({
      where: { id: accountId },
    });

    if (!account) throw new Error("Account not found.");

    if (account.balance.lessThan(amt)) {
      throw new Error("Account has insufficient balance for this debit.");
    }

    const balanceBefore = account.balance;
    const balanceAfter = balanceBefore.sub(amt);

    await tx.account.update({
      where: { id: accountId },
      data: { balance: balanceAfter },
    });

    const transaction = await tx.transaction.create({
      data: {
        type: TransactionType.ATM_WITHDRAWAL,
        status: TransactionStatus.SUCCESS,
        amount: amt,
        balanceBefore,
        balanceAfter,
        description: description ?? "Manual debit by admin",
        fromAccountId: accountId,
      },
    });

    await tx.auditLog.create({
      data: {
        action: "MANUAL_DEBIT",
        entity: "Account",
        entityId: accountId,
        performedBy: adminId,
        metadata: { amount, balanceBefore, balanceAfter },
      },
    });

    return transaction;
  });
}

// ─── Verify User (KYC) ─────────────────────────────────────────────

export async function verifyUser(userId: string, adminId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) throw new Error("User not found.");
  if (user.isVerified) throw new Error("User is already verified.");

  const [updated] = await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { isVerified: true },
    }),
    prisma.auditLog.create({
      data: {
        action: "USER_VERIFIED",
        entity: "User",
        entityId: userId,
        performedBy: adminId,
        metadata: { verifiedAt: new Date() },
      },
    }),
  ]);

  return updated;
}

// ─── Get Audit Logs ────────────────────────────────────────────────

export async function getAuditLogs(page = 1, limit = 20) {
  const skip = (page - 1) * limit;

  const [logs, total] = await prisma.$transaction([
    prisma.auditLog.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        actor: {
          select: { fullName: true, email: true },
        },
      },
    }),
    prisma.auditLog.count(),
  ]);

  return {
    logs: logs.map((l) => ({
      ...l,
      createdAt: l.createdAt.toISOString(),
    })),
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}