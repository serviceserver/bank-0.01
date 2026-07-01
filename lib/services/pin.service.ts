// lib/services/pin.service.ts

import prisma from "@/lib/db/prisma";
import bcrypt from "bcryptjs";

export async function setTransferPin(userId: string, pin: string): Promise<void> {
  if (!/^\d{4,6}$/.test(pin)) {
    throw new Error("PIN must be 4-6 digits.");
  }

  const pinHash = await bcrypt.hash(pin, 12);

  await prisma.user.update({
    where: { id: userId },
    data: { transferPin: pinHash },
  });
}

export async function verifyTransferPin(userId: string, pin: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { transferPin: true },
  });

  if (!user?.transferPin) {
    return false;
  }

  return bcrypt.compare(pin, user.transferPin);
}

export async function hasTransferPin(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { transferPin: true },
  });

  return !!user?.transferPin;
}