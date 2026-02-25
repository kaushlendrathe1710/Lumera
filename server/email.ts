import nodemailer from "nodemailer";
import dns from "dns/promises";

let transporter: nodemailer.Transporter;

async function createTransporter(): Promise<nodemailer.Transporter> {
  const smtpHost = process.env.SMTP_HOST as string;

  // Resolve IPv4 explicitly
  const { address } = await dns.lookup(smtpHost, { family: 4 });

  return nodemailer.createTransport({
    host: address, // resolved IP
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_PORT === "465",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      servername: smtpHost, // IMPORTANT for certificate validation
    },
  });
}

export async function verifySmtpConfig(): Promise<void> {
  try {
    const transporter = await createTransporter();
    await transporter.verify();
    console.log("SMTP configuration is valid and ready to send emails.");
  } catch (error) {
    console.error("SMTP configuration verification failed:", error);
  }
}

export async function sendOtpEmail(email: string, otp: string): Promise<boolean> {
  if (!transporter) {
    transporter = await createTransporter();
  }
  const mailOptions = {
    from: `"Lumera" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Your Login Code - Lumera",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
          <div style="max-width: 480px; margin: 0 auto; background-color: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <div style="text-align: center; margin-bottom: 5px;">
              <div style="width: 150px; height: 150px; display: flex; align-items: center; justify-content: center; margin: 0 auto;">
                <img src="https://www.kumarhoney.com/logo.png" alt="Lumera Logo" />
              </div>
              <h1 style="color: #1f2937; font-size: 24px; margin: 0;">Lumera</h1>
            </div>

            <h2 style="color: #374151; text-align: center; font-size: 20px; margin-bottom: 20px;">Your Verification Code</h2>

            <div style="background-color: #FEF3C7; border: 2px solid #D97706; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 25px;">
              <p style="font-size: 36px; font-weight: bold; color: #92400E; letter-spacing: 8px; margin: 0;">${otp}</p>
            </div>

            <p style="color: #6b7280; text-align: center; margin-bottom: 10px;">
              This code will expire in <strong>10 minutes</strong>.
            </p>

            <p style="color: #9ca3af; text-align: center; font-size: 14px;">
              If you didn't request this code, please ignore this email.
            </p>

            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

            <p style="color: #9ca3af; text-align: center; font-size: 12px; margin: 0;">
              &copy; 2026 Lumera. All rights reserved.<br>
              Based in India — perfumery & sourcing network
            </p>
          </div>
        </body>
      </html>
    `,
  };
  if (process.env.NODE_ENV === "development") {
    console.log(`[DEV] Sending OTP email to ${email} with code: ${otp}`);
    return true;
  }

  try {
    const info = await transporter.sendMail(mailOptions);
    const anyAccepted = Array.isArray((info as any).accepted)
      ? (info as any).accepted.length > 0
      : Boolean((info as any).messageId || (info as any).response);
    if (anyAccepted) {
      console.log(`OTP email sent to ${email}: `, info);
      return true;
    }
    console.error(`OTP email not accepted for ${email}:`, info);
    return false;
  } catch (err) {
    console.error("sendOtpEmail error:", err);
    return false;
  }
}

export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
