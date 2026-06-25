// lib/mail/templates.ts

export function depositTemplate(data: {
  fullName: string;
  amount: string;
  balanceAfter: string;
  accountNumber: string;
  reference: string;
  date: string;
}) {
  return `
    <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;
                padding:32px 24px;background:#fff;border:1px solid #e5e7eb;
                border-radius:12px;">
      <h2 style="font-size:18px;font-weight:700;color:#0f172a;margin:0 0 4px">
        NexBank
      </h2>
      <p style="font-size:13px;color:#6b7280;margin:0 0 24px">
        Transaction Notification
      </p>

      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;
                  padding:16px;margin-bottom:24px;">
        <p style="margin:0;font-size:13px;color:#16a34a;font-weight:600;">
          ↓ Credit Alert
        </p>
        <p style="margin:4px 0 0;font-size:24px;font-weight:700;color:#0f172a;">
          ${data.amount}
        </p>
      </div>

      <table style="width:100%;font-size:13px;border-collapse:collapse;">
        <tr>
          <td style="padding:8px 0;color:#6b7280;border-bottom:1px solid #f3f4f6;">
            Account
          </td>
          <td style="padding:8px 0;color:#0f172a;font-weight:500;text-align:right;
                     border-bottom:1px solid #f3f4f6;font-family:monospace;">
            ${data.accountNumber}
          </td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#6b7280;border-bottom:1px solid #f3f4f6;">
            New Balance
          </td>
          <td style="padding:8px 0;color:#0f172a;font-weight:600;text-align:right;
                     border-bottom:1px solid #f3f4f6;">
            ${data.balanceAfter}
          </td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#6b7280;border-bottom:1px solid #f3f4f6;">
            Reference
          </td>
          <td style="padding:8px 0;color:#0f172a;text-align:right;
                     border-bottom:1px solid #f3f4f6;font-family:monospace;
                     font-size:11px;">
            ${data.reference}
          </td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#6b7280;">Date</td>
          <td style="padding:8px 0;color:#0f172a;text-align:right;">
            ${data.date}
          </td>
        </tr>
      </table>

      <p style="font-size:12px;color:#9ca3af;margin:24px 0 0;
                border-top:1px solid #f3f4f6;padding-top:16px;">
        If you did not authorise this transaction, contact support immediately.
      </p>
    </div>
  `;
}

export function debitTemplate(data: {
  fullName: string;
  amount: string;
  balanceAfter: string;
  accountNumber: string;
  reference: string;
  date: string;
  description: string;
}) {
  return `
    <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;
                padding:32px 24px;background:#fff;border:1px solid #e5e7eb;
                border-radius:12px;">
      <h2 style="font-size:18px;font-weight:700;color:#0f172a;margin:0 0 4px">
        NexBank
      </h2>
      <p style="font-size:13px;color:#6b7280;margin:0 0 24px">
        Transaction Notification
      </p>

      <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;
                  padding:16px;margin-bottom:24px;">
        <p style="margin:0;font-size:13px;color:#dc2626;font-weight:600;">
          ↑ Debit Alert
        </p>
        <p style="margin:4px 0 0;font-size:24px;font-weight:700;color:#0f172a;">
          ${data.amount}
        </p>
      </div>

      <table style="width:100%;font-size:13px;border-collapse:collapse;">
        <tr>
          <td style="padding:8px 0;color:#6b7280;border-bottom:1px solid #f3f4f6;">
            Account
          </td>
          <td style="padding:8px 0;color:#0f172a;font-weight:500;text-align:right;
                     border-bottom:1px solid #f3f4f6;font-family:monospace;">
            ${data.accountNumber}
          </td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#6b7280;border-bottom:1px solid #f3f4f6;">
            Description
          </td>
          <td style="padding:8px 0;color:#0f172a;text-align:right;
                     border-bottom:1px solid #f3f4f6;">
            ${data.description}
          </td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#6b7280;border-bottom:1px solid #f3f4f6;">
            New Balance
          </td>
          <td style="padding:8px 0;color:#0f172a;font-weight:600;text-align:right;
                     border-bottom:1px solid #f3f4f6;">
            ${data.balanceAfter}
          </td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#6b7280;border-bottom:1px solid #f3f4f6;">
            Reference
          </td>
          <td style="padding:8px 0;color:#0f172a;text-align:right;
                     border-bottom:1px solid #f3f4f6;font-family:monospace;
                     font-size:11px;">
            ${data.reference}
          </td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#6b7280;">Date</td>
          <td style="padding:8px 0;color:#0f172a;text-align:right;">
            ${data.date}
          </td>
        </tr>
      </table>

      <p style="font-size:12px;color:#9ca3af;margin:24px 0 0;
                border-top:1px solid #f3f4f6;padding-top:16px;">
        If you did not authorise this transaction, contact support immediately.
      </p>
    </div>
  `;
}

export function transferSentTemplate(data: {
  fullName: string;
  amount: string;
  recipientName: string;
  recipientAccount: string;
  balanceAfter: string;
  reference: string;
  date: string;
}) {
  return `
    <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;
                padding:32px 24px;background:#fff;border:1px solid #e5e7eb;
                border-radius:12px;">
      <h2 style="font-size:18px;font-weight:700;color:#0f172a;margin:0 0 4px">
        NexBank
      </h2>
      <p style="font-size:13px;color:#6b7280;margin:0 0 24px">
        Transfer Sent
      </p>

      <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;
                  padding:16px;margin-bottom:24px;">
        <p style="margin:0;font-size:13px;color:#dc2626;font-weight:600;">
          ↑ Transfer Debit
        </p>
        <p style="margin:4px 0 0;font-size:24px;font-weight:700;color:#0f172a;">
          ${data.amount}
        </p>
      </div>

      <table style="width:100%;font-size:13px;border-collapse:collapse;">
        <tr>
          <td style="padding:8px 0;color:#6b7280;border-bottom:1px solid #f3f4f6;">
            Sent To
          </td>
          <td style="padding:8px 0;color:#0f172a;font-weight:500;text-align:right;
                     border-bottom:1px solid #f3f4f6;">
            ${data.recipientName}
          </td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#6b7280;border-bottom:1px solid #f3f4f6;">
            Recipient Account
          </td>
          <td style="padding:8px 0;color:#0f172a;text-align:right;
                     border-bottom:1px solid #f3f4f6;font-family:monospace;">
            ${data.recipientAccount}
          </td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#6b7280;border-bottom:1px solid #f3f4f6;">
            New Balance
          </td>
          <td style="padding:8px 0;color:#0f172a;font-weight:600;text-align:right;
                     border-bottom:1px solid #f3f4f6;">
            ${data.balanceAfter}
          </td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#6b7280;">Reference</td>
          <td style="padding:8px 0;color:#0f172a;text-align:right;
                     font-family:monospace;font-size:11px;">
            ${data.reference}
          </td>
        </tr>
      </table>

      <p style="font-size:12px;color:#9ca3af;margin:24px 0 0;
                border-top:1px solid #f3f4f6;padding-top:16px;">
        If you did not authorise this transaction, contact support immediately.
      </p>
    </div>
  `;
}

export function transferReceivedTemplate(data: {
  fullName: string;
  amount: string;
  senderName: string;
  balanceAfter: string;
  reference: string;
  date: string;
}) {
  return `
    <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;
                padding:32px 24px;background:#fff;border:1px solid #e5e7eb;
                border-radius:12px;">
      <h2 style="font-size:18px;font-weight:700;color:#0f172a;margin:0 0 4px">
        NexBank
      </h2>
      <p style="font-size:13px;color:#6b7280;margin:0 0 24px">
        Transfer Received
      </p>

      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;
                  padding:16px;margin-bottom:24px;">
        <p style="margin:0;font-size:13px;color:#16a34a;font-weight:600;">
          ↓ Transfer Credit
        </p>
        <p style="margin:4px 0 0;font-size:24px;font-weight:700;color:#0f172a;">
          ${data.amount}
        </p>
      </div>

      <table style="width:100%;font-size:13px;border-collapse:collapse;">
        <tr>
          <td style="padding:8px 0;color:#6b7280;border-bottom:1px solid #f3f4f6;">
            From
          </td>
          <td style="padding:8px 0;color:#0f172a;font-weight:500;text-align:right;
                     border-bottom:1px solid #f3f4f6;">
            ${data.senderName}
          </td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#6b7280;border-bottom:1px solid #f3f4f6;">
            New Balance
          </td>
          <td style="padding:8px 0;color:#0f172a;font-weight:600;text-align:right;
                     border-bottom:1px solid #f3f4f6;">
            ${data.balanceAfter}
          </td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#6b7280;">Reference</td>
          <td style="padding:8px 0;color:#0f172a;text-align:right;
                     font-family:monospace;font-size:11px;">
            ${data.reference}
          </td>
        </tr>
      </table>

      <p style="font-size:12px;color:#9ca3af;margin:24px 0 0;
                border-top:1px solid #f3f4f6;padding-top:16px;">
        If you did not authorise this transaction, contact support immediately.
      </p>
    </div>
  `;
}