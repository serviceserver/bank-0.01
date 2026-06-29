// app/api/admin/transactions/[transactionId]/route.ts

import { requireAdmin } from "@/lib/utils/getSession";
import { ok, fail } from "@/lib/utils/apiResponse";
import prisma from "@/lib/db/prisma";
import { Decimal } from "@prisma/client/runtime/library";
import { TransactionStatus } from "@prisma/client";

// GET /api/admin/transactions/:transactionId
export async function GET(
  req: Request,
  { params }: { params: Promise<{ transactionId: string }> }
) {
  try {
    await requireAdmin();
    const { transactionId } = await params;

    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        fromAccount: {
          select: { accountNumber: true, user: { select: { fullName: true } } },
        },
        toAccount: {
          select: { accountNumber: true, user: { select: { fullName: true } } },
        },
      },
    });

    if (!transaction) return fail("Transaction not found", 404);

    return ok({
      id: transaction.id,
      type: transaction.type,
      amount: transaction.amount.toNumber(),
      status: transaction.status,
      createdAt: transaction.createdAt,
      description: transaction.description,
      reference: transaction.reference,
      fromAccountId: transaction.fromAccountId,
      toAccountId: transaction.toAccountId,
      fromAccount: transaction.fromAccount,
      toAccount: transaction.toAccount,
      balanceBefore: transaction.balanceBefore.toNumber(),
      balanceAfter: transaction.balanceAfter.toNumber(),
    });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return fail("Unauthorized", 401);
    if (e.message === "FORBIDDEN") return fail("Forbidden", 403);
    return fail(e.message);
  }
}

// PATCH /api/admin/transactions/:transactionId
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ transactionId: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { transactionId } = await params;
    const { amount, description, status } = await req.json();

    return prisma.$transaction(async (tx) => {
      const txn = await tx.transaction.findUnique({
        where: { id: transactionId },
        include: {
          fromAccount: { select: { id: true, balance: true } },
          toAccount: { select: { id: true, balance: true } },
        },
      });

      if (!txn) throw new Error("Transaction not found");

      const oldAmount = txn.amount;
      const oldStatus = txn.status;
      const newAmount = amount !== undefined ? new Decimal(amount) : oldAmount;
      const newStatus = status ?? oldStatus;

      // Validate new status
      if (!Object.values(TransactionStatus).includes(newStatus)) {
        throw new Error("Invalid status value");
      }

      // Calculate balance adjustments only if amount changed
      const delta = newAmount.minus(oldAmount);
      const updates: any = {};

      if (txn.fromAccountId && delta.lessThan(0)) {
        // Credit to toAccount if amount increased
        await tx.account.update({
          where: { id: txn.toAccountId! },
          data: { balance: { increment: delta.abs() } },
        });
      } else if (txn.fromAccountId && delta.greaterThan(0)) {
        // Debit from fromAccount if amount decreased
        const fromAccount = await tx.account.findUnique({
          where: { id: txn.fromAccountId },
        });
        if (fromAccount && fromAccount.balance.lessThan(delta)) {
          throw new Error("Insufficient balance for adjustment");
        }
        await tx.account.update({
          where: { id: txn.fromAccountId },
          data: { balance: { decrement: delta.toNumber() } },
        });
      }

      const updatedTxn = await tx.transaction.update({
        where: { id: transactionId },
        data: {
          ...(amount !== undefined && { amount: newAmount }),
          ...(description !== undefined && { description }),
          ...(status !== undefined && { status: newStatus }),
          ...(amount !== undefined && {
            balanceAfter: txn.balanceBefore.plus(newAmount).minus(txn.balanceBefore as any),
          }),
        },
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          action: "TRANSACTION_EDIT",
          entity: "Transaction",
          entityId: transactionId,
          performedBy: admin.id,
          metadata: {
            ...(amount !== undefined && {
              field: "amount",
              oldValue: oldAmount.toNumber(),
              newValue: newAmount.toNumber(),
            }),
            ...(description !== undefined && {
              field: "description",
              oldValue: txn.description,
              newValue: description,
            }),
            ...(status !== undefined && {
              field: "status",
              oldValue: oldStatus,
              newValue: newStatus,
            }),
          },
        },
      });

      return ok({
        ...updatedTxn,
        amount: updatedTxn.amount.toNumber(),
        balanceBefore: updatedTxn.balanceBefore.toNumber(),
        balanceAfter: updatedTxn.balanceAfter.toNumber(),
      });
    });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return fail("Unauthorized", 401);
    if (e.message === "FORBIDDEN") return fail("Forbidden", 403);
    return fail(e.message);
  }
}