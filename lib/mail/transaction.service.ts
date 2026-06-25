// lib/services/transaction.service.ts  — additions only

import {
  notifyDeposit,
  notifyWithdrawal,
  notifyTransferSent,
  notifyTransferReceived,
} from "@/lib/mail/notification.service";

// - In deposit(), after prisma.$transaction resolves: -

  const account = await prisma.account.findUnique({
    where: { id: accountId },
    include: { user: true },
  });

  // Fire notification after DB write - non-blocking
  notifyDeposit({
    email: account!.user.email,
    fullName: account!.user.fullName,
    amount: Number(txn.amount),
    balanceAfter: Number(txn.balanceAfter),
    accountNumber: account!.accountNumber,
    reference: txn.reference,
    createdAt: txn.createdAt,
  });

  return txn;

// ── In withdraw(), after prisma.$transaction resolves: ──

  const account = await prisma.account.findUnique({
    where: { id: accountId },
    include: { user: true },
  });

  notifyWithdrawal({
    email: account!.user.email,
    fullName: account!.user.fullName,
    amount: Number(txn.amount),
    balanceAfter: Number(txn.balanceAfter),
    accountNumber: account!.accountNumber,
    reference: txn.reference,
    description: txn.description ?? "Withdrawal",
    createdAt: txn.createdAt,
  });

  return txn;

// ── In transfer(), after prisma.$transaction resolves: ──

  const [sender, recipient] = await Promise.all([
    prisma.account.findUnique({
      where: { id: fromAccountId },
      include: { user: true },
    }),
    prisma.account.findUnique({
      where: { id: txn.toAccountId! },
      include: { user: true },
    }),
  ]);

  notifyTransferSent({
    email: sender!.user.email,
    fullName: sender!.user.fullName,
    amount: Number(txn.amount),
    balanceAfter: Number(txn.balanceAfter),
    recipientName: recipient!.user.fullName,
    recipientAccount: recipient!.accountNumber,
    reference: txn.reference,
    createdAt: txn.createdAt,
  });

  notifyTransferReceived({
    email: recipient!.user.email,
    fullName: recipient!.user.fullName,
    amount: Number(txn.amount),
    balanceAfter: Number(txn.balanceAfter),
    senderName: sender!.user.fullName,
    reference: txn.reference,
    createdAt: txn.createdAt,
  });

  return txn;