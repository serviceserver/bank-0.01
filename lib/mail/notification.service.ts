// lib/mail/notification.service.ts

import resend from "@/lib/mail/resend";
import {
  depositTemplate,
  debitTemplate,
  transferSentTemplate,
  transferReceivedTemplate,
} from "@/lib/mail/templates";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import { formatDate } from "@/lib/utils/formatDate";

const FROM = "NexBank <notifications@nexbank.com>";

// Fire-and-forget - never let email failure break a transaction
async function send(to: string, subject: string, html: string) {
  try {
    await resend.emails.send({ from: FROM, to, subject, html });
  } catch (err) {
    console.error("[mail] Failed to send notification:", err);
  }
}

export async function notifyDeposit(data: {
  email: string;
  fullName: string;
  amount: number;
  balanceAfter: number;
  accountNumber: string;
  reference: string;
  createdAt: Date;
}) {
  await send(
    data.email,
    `Credit Alert: ${formatCurrency(data.amount)} received`,
    depositTemplate({
      fullName: data.fullName,
      amount: formatCurrency(data.amount),
      balanceAfter: formatCurrency(data.balanceAfter),
      accountNumber: data.accountNumber,
      reference: data.reference,
      date: formatDate(data.createdAt),
    })
  );
}

export async function notifyWithdrawal(data: {
  email: string;
  fullName: string;
  amount: number;
  balanceAfter: number;
  accountNumber: string;
  reference: string;
  description: string;
  createdAt: Date;
}) {
  await send(
    data.email,
    `Debit Alert: ${formatCurrency(data.amount)} debited`,
    debitTemplate({
      fullName: data.fullName,
      amount: formatCurrency(data.amount),
      balanceAfter: formatCurrency(data.balanceAfter),
      accountNumber: data.accountNumber,
      reference: data.reference,
      description: data.description,
      date: formatDate(data.createdAt),
    })
  );
}

export async function notifyTransferSent(data: {
  email: string;
  fullName: string;
  amount: number;
  balanceAfter: number;
  recipientName: string;
  recipientAccount: string;
  reference: string;
  createdAt: Date;
}) {
  await send(
    data.email,
    `Debit Alert: ${formatCurrency(data.amount)} transfer sent`,
    transferSentTemplate({
      fullName: data.fullName,
      amount: formatCurrency(data.amount),
      balanceAfter: formatCurrency(data.balanceAfter),
      recipientName: data.recipientName,
      recipientAccount: data.recipientAccount,
      reference: data.reference,
      date: formatDate(data.createdAt),
    })
  );
}

export async function notifyTransferReceived(data: {
  email: string;
  fullName: string;
  amount: number;
  balanceAfter: number;
  senderName: string;
  reference: string;
  createdAt: Date;
}) {
  await send(
    data.email,
    `Credit Alert: ${formatCurrency(data.amount)} received`,
    transferReceivedTemplate({
      fullName: data.fullName,
      amount: formatCurrency(data.amount),
      balanceAfter: formatCurrency(data.balanceAfter),
      senderName: data.senderName,
      reference: data.reference,
      date: formatDate(data.createdAt),
    })
  );
}