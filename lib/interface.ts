interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  actor: {
    fullName: string;
    email: string;
  };
  createdAt: string;
  metadata?: Record<string, unknown> | null;
}

type Account = {
  id: string;
  type: string;
  accountNumber: string;
  routingNumber: string;
  status: "ACTIVE" | "FROZEN" | "CLOSED" | "DORMANT" | string;
  balance: number;
  createdAt?: Date;
};

type AdminUser = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  ssn?: string;
  createdAt: string;
  isVerified: boolean;
  role: "ADMIN" | "USER" | string;
  accounts: Account[];
};

interface AccountReference {
  accountNumber: string;
}

interface GetAllUsersResponse {
  users: AdminUser[];
  pagination: Pagination;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  fromAccount?: AccountReference | null;
  toAccount?: AccountReference | null;
  status: "SUCCESS" | string;
  createdAt: string;
  externalAccountNumber?: string | null;
  externalAccountHolder?: string | null;
  externalBankName?: string | null;
}

interface GetAllTransactionsResponse {
  transactions: Transaction[];
}


export type { Pagination, AuditLog, AdminUser, Account, AccountReference, GetAllUsersResponse, Transaction, GetAllTransactionsResponse };