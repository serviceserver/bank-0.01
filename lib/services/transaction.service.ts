// lib/services/transaction.service.ts

import prisma from "@/lib/db/prisma";
import { TransactionType, TransactionStatus, AccountStatus } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

// ─── Helpers ──────────────────────────────────────────────────────

function ensureActive(status: AccountStatus) {
  if (status !== AccountStatus.ACTIVE) {
    throw new Error("This account is not active and cannot process transactions.");
  }
}

function ensureSufficientBalance(balance: Decimal, amount: Decimal) {
  if (balance.lessThan(amount)) {
    throw new Error("Insufficient balance.");
  }
}

function toDecimal(value: number) {
  return new Decimal(value);
}

// ─── Deposit ──────────────────────────────────────────────────────

export async function deposit(
  accountId: string,
  amount: number,
  description?: string
) {
  if (amount <= 0) throw new Error("Deposit amount must be greater than zero.");

  const amt = toDecimal(amount);

  return prisma.$transaction(async (tx) => {
    const account = await tx.account.findUnique({
      where: { id: accountId },
    });

    if (!account) throw new Error("Account not found.");
    ensureActive(account.status);

    const balanceBefore = account.balance;
    const balanceAfter = balanceBefore.add(amt);

    await tx.account.update({
      where: { id: accountId },
      data: { balance: balanceAfter },
    });

    return tx.transaction.create({
      data: {
        type: TransactionType.ACH_CREDIT,
        status: TransactionStatus.SUCCESS,
        amount: amt,
        balanceBefore,
        balanceAfter,
        description: description ?? "ACH Credit",
        toAccountId: accountId,
      },
    });
  });
}
// ─── Withdrawal ───────────────────────────────────────────────────

export async function withdraw(
  accountId: string,
  userId: string,
  amount: number,
  description?: string
) {
  if (amount <= 0) throw new Error("Withdrawal amount must be greater than zero.");

  const amt = toDecimal(amount);

  return prisma.$transaction(async (tx) => {
    const account = await tx.account.findUnique({
      where: { id: accountId },
    });

    if (!account) throw new Error("Account not found.");
    if (account.userId !== userId) throw new Error("Unauthorized.");
    ensureActive(account.status);
    ensureSufficientBalance(account.balance, amt);

    const balanceBefore = account.balance;
    const balanceAfter = balanceBefore.sub(amt);

    await tx.account.update({
      where: { id: accountId },
      data: { balance: balanceAfter },
    });

    return tx.transaction.create({
      data: {
        type: TransactionType.ATM_WITHDRAWAL,
        status: TransactionStatus.SUCCESS,
        amount: amt,
        balanceBefore,
        balanceAfter,
        description: description ?? "ATM Withdrawal",
        fromAccountId: accountId,
      },
    });
  });
}
// ─── Transfer ─────────────────────────────────────────────────────

export async function transfer(
  fromAccountId: string,
  userId: string,
  toAccountNumber: string,
  amount: number,
  description?: string
) {
  if (amount <= 0) throw new Error("Transfer amount must be greater than zero.");

  const amt = toDecimal(amount);

  return prisma.$transaction(async (tx) => {
    // Load sender
    const fromAccount = await tx.account.findUnique({
      where: { id: fromAccountId },
    });

    if (!fromAccount) throw new Error("Sender account not found.");
    if (fromAccount.userId !== userId) throw new Error("Unauthorized.");
    ensureActive(fromAccount.status);
    ensureSufficientBalance(fromAccount.balance, amt);

    // Check for external recognized account first
    const externalRecipient = await tx.recognizedAccount.findFirst({
      where: { externalAccountNumber: toAccountNumber },
    });

    // Load internal recipient
    const toAccount = await tx.account.findUnique({
      where: { accountNumber: toAccountNumber },
    });

    // Determine if transfer is internal or external
    const isExternal = !!externalRecipient && !toAccount;

    if (!toAccount && !isExternal) {
      throw new Error("Recipient account not found.");
    }
    if (toAccount && toAccount.id === fromAccountId) throw new Error("Cannot transfer to the same account.");
    if (toAccount) ensureActive(toAccount.status);

    // Snapshot balances
    const senderBalanceBefore = fromAccount.balance;
    const senderBalanceAfter = senderBalanceBefore.sub(amt);

    // Debit sender
    await tx.account.update({
      where: { id: fromAccountId },
      data: { balance: senderBalanceAfter },
    });

    // Credit recipient (only for internal accounts)
    if (toAccount) {
      const recipientBalanceBefore = toAccount.balance;
      const recipientBalanceAfter = recipientBalanceBefore.add(amt);

      await tx.account.update({
        where: { id: toAccount.id },
        data: { balance: recipientBalanceAfter },
      });
    }

    // Record transaction
    return tx.transaction.create({
      data: {
        type: TransactionType.TRANSFER,
        status: TransactionStatus.SUCCESS,
        amount: amt,
        balanceBefore: senderBalanceBefore,
        balanceAfter: senderBalanceAfter,
        description: description ?? "Transfer",
        fromAccountId,
        toAccountId: toAccount?.id ?? null,
      },
    });
  });
}
// ─── Transaction History ──────────────────────────────────────────

export async function getTransactionHistory(
  accountId: string,
  userId: string,
  filters?: {
    type?: TransactionType;
    status?: TransactionStatus;
    from?: Date;
    to?: Date;
    page?: number;
    limit?: number;
  }
) {
  // Ownership check
  const account = await prisma.account.findUnique({
    where: { id: accountId },
  });

  if (!account) throw new Error("Account not found.");
  if (account.userId !== userId) throw new Error("Unauthorized.");

  const page = filters?.page ?? 1;
  const limit = filters?.limit ?? 20;
  const skip = (page - 1) * limit;

  const where = {
    OR: [{ fromAccountId: accountId }, { toAccountId: accountId }],
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
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
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