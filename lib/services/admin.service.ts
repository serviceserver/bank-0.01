// lib/services/admin.service.ts

import prisma from "@/lib/db/prisma";
import { TransactionType, TransactionStatus } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

import bcrypt from "bcryptjs";

// ─── Update User Account Info ─────────────────────────────────────

export async function updateUserInfo(
  userId: string,
  adminId: string,
  data: {
    fullName: string;
    email: string;
    phone: string;
    dob?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
  }
) {
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, phone: true },
  });

  if (!existingUser) throw new Error("User not found.");

  if (existingUser.email !== data.email) {
    const emailTaken = await prisma.user.findUnique({
      where: { email: data.email },
      select: { id: true },
    });
    if (emailTaken && emailTaken.id !== userId) {
      throw new Error("Email is already in use by another account.");
    }
  }

  if (existingUser.phone !== data.phone) {
    const phoneTaken = await prisma.user.findUnique({
      where: { phone: data.phone },
      select: { id: true },
    });
    if (phoneTaken && phoneTaken.id !== userId) {
      throw new Error("Phone number is already in use by another account.");
    }
  }

  const updated = await prisma.$transaction(async (tx) => {
    const user = await tx.user.update({
      where: { id: userId },
      data: {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        ...(data.dob !== undefined && { dob: data.dob }),
        ...(data.address !== undefined && { address: data.address }),
        ...(data.city !== undefined && { city: data.city }),
        ...(data.state !== undefined && { state: data.state }),
        ...(data.zip !== undefined && { zip: data.zip }),
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        ssn: true,
        dob: true,
        address: true,
        city: true,
        state: true,
        zip: true,
        isVerified: true,
        createdAt: true,
      },
    });

    await tx.auditLog.create({
      data: {
        action: "USER_INFO_UPDATED",
        entity: "User",
        entityId: userId,
        performedBy: adminId,
        metadata: {
          updatedFields: Object.keys(data),
          previousEmail: existingUser.email,
          previousPhone: existingUser.phone,
        },
      },
    });

    return user;
  });

  return {
    ...updated,
    createdAt: updated.createdAt.toISOString(),
  };
}

// ─── Reset User Password ──────────────────────────────────────────

export async function resetUserPassword(
  userId: string,
  adminId: string,
  newPassword: string
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!user) throw new Error("User not found.");

  const passwordHash = await bcrypt.hash(newPassword, 10);

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    await tx.auditLog.create({
      data: {
        action: "USER_PASSWORD_RESET",
        entity: "User",
        entityId: userId,
        performedBy: adminId,
        metadata: {
          resetAt: new Date(),
        },
      },
    });
  });
}

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
        dob: true,
        address: true,
        city: true,
        state: true,
        zip: true,
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

// ─── Get Admin Account By ID ────────────────────────────────────────

export async function getAdminAccountById(accountId: string) {
  const account = await prisma.account.findUnique({
    where: { id: accountId },
    select: {
      id: true,
      accountNumber: true,
      routingNumber: true,
      type: true,
      status: true,
      balance: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
    },
  });

  if (!account) throw new Error("Account not found.");
  return {
    ...account,
    balance: account.balance.toNumber(),
    createdAt: account.createdAt.toISOString(),
  };
}

// ─── Get Account Transactions (Admin) ────────────────────────────────

export async function getAccountTransactions(
  accountId: string,
  page = 1,
  limit = 20
) {
  const skip = (page - 1) * limit;

  const [transactions, total] = await prisma.$transaction([
    prisma.transaction.findMany({
      where: {
        OR: [{ fromAccountId: accountId }, { toAccountId: accountId }],
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        fromAccount: { select: { accountNumber: true } },
        toAccount: { select: { accountNumber: true } },
      },
    }),
    prisma.transaction.count({
      where: {
        OR: [{ fromAccountId: accountId }, { toAccountId: accountId }],
      },
    }),
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

// ─── Recognizable Accounts ────────────────────────────────────────────

export async function getRecognizedAccounts() {
  const accounts = await prisma.recognizedAccount.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      createdAt: true,
      externalAccountNumber: true,
      externalAccountHolder: true,
      externalBankName: true,
      account: {
        select: {
          id: true,
          accountNumber: true,
          type: true,
          status: true,
          user: {
            select: {
              fullName: true,
              email: true,
            },
          },
        },
      },
    },
  });

  return accounts.map((ra) => ({
    ...ra,
    createdAt: ra.createdAt.toISOString(),
    isExternal: !ra.account,
  }));
}

export async function addRecognizedAccount(accountId: string, adminId: string) {
  const account = await prisma.account.findUnique({
    where: { id: accountId },
  });

  if (!account) throw new Error("Account not found.");

  const existing = await prisma.recognizedAccount.findFirst({
    where: {
      OR: [
        { accountId },
        { externalAccountNumber: account.accountNumber },
      ],
    },
  });

  if (existing) throw new Error("Account already recognized.");

  const created = await prisma.recognizedAccount.create({
    data: {
      accountId,
      addedBy: adminId,
    },
    select: {
      id: true,
      createdAt: true,
      externalAccountNumber: true,
      externalAccountHolder: true,
      externalBankName: true,
      account: {
        select: {
          id: true,
          accountNumber: true,
          type: true,
          status: true,
          user: {
            select: {
              fullName: true,
              email: true,
            },
          },
        },
      },
    },
  });

  return {
    ...created,
    createdAt: created.createdAt.toISOString(),
    isExternal: false,
  };
}

export async function addExternalRecognizedAccount(
  accountNumber: string,
  accountHolder: string,
  bankName: string | undefined,
  adminId: string
) {
  const existingInternal = await prisma.account.findUnique({
    where: { accountNumber },
  });

  const existingRecognized = await prisma.recognizedAccount.findFirst({
    where: {
      OR: [
        existingInternal ? { accountId: existingInternal.id } : undefined,
        { externalAccountNumber: accountNumber },
      ].filter(Boolean) as any[],
    },
  });

  if (existingRecognized) throw new Error("Account already recognized.");

  if (existingInternal) {
    return addRecognizedAccount(existingInternal.id, adminId);
  }

  const created = await prisma.recognizedAccount.create({
    data: {
      externalAccountNumber: accountNumber,
      externalAccountHolder: accountHolder,
      externalBankName: bankName || "Titan Bank",
      addedBy: adminId,
    },
    select: {
      id: true,
      createdAt: true,
      externalAccountNumber: true,
      externalAccountHolder: true,
      externalBankName: true,
    },
  });

  return {
    ...created,
    createdAt: created.createdAt.toISOString(),
    isExternal: true,
  };
}

export async function removeRecognizedAccount(id: string) {
  const existing = await prisma.recognizedAccount.findUnique({
    where: { id },
  });

  if (!existing) throw new Error("Recognized account not found.");

  await prisma.recognizedAccount.delete({
    where: { id },
  });
}

// ─── Search Recognized Accounts ────────────────────────────────────────

export async function searchRecognizedAccounts(query: string, limit = 5) {
  if (query.length < 3) return [];

  const accounts = await prisma.recognizedAccount.findMany({
    where: {
      OR: [
        {
          account: {
            accountNumber: { contains: query },
          },
        },
        {
          externalAccountNumber: { contains: query },
        },
      ],
    },
    take: limit,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      createdAt: true,
      externalAccountNumber: true,
      externalAccountHolder: true,
      externalBankName: true,
      account: {
        select: {
          id: true,
          accountNumber: true,
          type: true,
          user: {
            select: {
              fullName: true,
            },
          },
        },
      },
    },
  });

  return accounts.map((ra) => ({
    id: ra.id,
    accountNumber: ra.account?.accountNumber || ra.externalAccountNumber || "",
    type: ra.account?.type || "EXTERNAL",
    accountHolder: ra.account?.user?.fullName || ra.externalAccountHolder || "",
    isExternal: !ra.account,
    bankName: ra.externalBankName,
  }));
}