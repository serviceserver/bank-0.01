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
    case "ACH_CREDIT":
    case "DEPOSIT":
    case "WIRE_INCOMING":
      return "credit";
    case "ATM_WITHDRAWAL":
    case "WITHDRAWAL":
    case "WIRE_OUTGOING":
      return "debit";
    case "TRANSFER":
      if (transaction.toAccountId === accountId) return "credit";
      if (transaction.fromAccountId === accountId) return "debit";
      return "debit";
    default:
      return "debit";
  }
}
