// lib/services/auth.service.ts

import bcrypt from "bcryptjs";
import prisma from "@/lib/db/prisma";
import { RegisterInput } from "@/lib/validators/auth.validators";
import { createAccount } from "@/lib/services/account.service";
import { AccountType } from "@prisma/client";

export async function registerUser(input: RegisterInput) {
  // Check for existing email or phone
  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ email: input.email }, { phone: input.phone }],
    },
  });

  if (existing) {
    if (existing.email === input.email) {
      throw new Error("An account with this email already exists.");
    }
    throw new Error("An account with this phone number already exists.");
  }

  const passwordHash = await bcrypt.hash(input.password, 12);

  // Create user and their default savings account atomically
  const user = await prisma.$transaction(async (tx: any) => {
    const newUser = await tx.user.create({
      data: {
        fullName: input.fullName,
        email: input.email,
        phone: input.phone,
        passwordHash,
        ssn: input.ssn ?? null,
        dob: input.dob ?? null,
        address: input.address ?? null,
        city: input.city ?? null,
        state: input.state ?? null,
        zip: input.zip ?? null,
      },
    });

    return newUser;
  });

  // Create a default savings account for every new user
  await createAccount(user.id, AccountType.CHECKING);

  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
  };
}