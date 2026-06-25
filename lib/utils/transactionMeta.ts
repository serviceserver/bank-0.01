// lib/utils/transactionMeta.ts

type Direction = "credit" | "debit";

export function getTransactionDirection(
  transaction: {
    type: string;
    fromAccountId?: string | null;
    toAccountId?: string | null;
  },
  accountId: string
): Direction {
  switch (transaction.type) {
    case "DEPOSIT":
      return "credit";
    case "WITHDRAWAL":
      return "debit";
    case "TRANSFER":
      if (transaction.toAccountId === accountId) return "credit";
      if (transaction.fromAccountId === accountId) return "debit";
      return "debit";
    default:
      return "debit";
  }
}
