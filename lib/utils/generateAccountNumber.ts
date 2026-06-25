// lib/utils/generateAccountNumber.ts

import prisma from "@/lib/db/prisma";

export async function generateAccountNumber(): Promise<string> {
  const max = 10; // max retries
  
  for (let attempt = 0; attempt < max; attempt++) {
    // Generate a random 10-digit number (US bank account style)
    const number = Math.floor(1000000000 + Math.random() * 9000000000).toString();
    
    const existing = await prisma.account.findUnique({
      where: { accountNumber: number },
    });

    if (!existing) return number;
  }

  throw new Error("Could not generate a unique account number. Please try again.");
}