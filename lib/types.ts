type Account = {
  id: string;
  type: string;
  accountNumber: string;
  routingNumber: string;
  status: "ACTIVE" | "FROZEN" | "CLOSED" | "DORMANT" | string;
  balance: number;
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

export type { AdminUser, Account };