import * as nodemailer from "nodemailer";
import { logger } from "../config/logger";

export type SendMailOptions = {
  to: string;
  subject: string;
  html: string;
};

function getMailFrom(): string {
  return process.env.MAIL_FROM?.trim() || "Eventify <no-reply@eventify.test>";
}

/** Lightweight SMTP mail abstraction — synchronous sends, no queues. */
export class MailService {
  private static transporter: nodemailer.Transporter | null = null;
  private static disabledWarningLogged = false;

  static isEnabled(): boolean {
    const user = process.env.MAIL_USER?.trim();
    const pass = process.env.MAIL_PASS?.trim();
    return Boolean(user && pass);
  }

  private static getTransporter(): nodemailer.Transporter {
    if (!MailService.transporter) {
      MailService.transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST?.trim() || "sandbox.smtp.mailtrap.io",
        port: Number(process.env.MAIL_PORT || "2525"),
        auth: {
          user: process.env.MAIL_USER?.trim(),
          pass: process.env.MAIL_PASS?.trim(),
        },
      });
    }
    return MailService.transporter;
  }

  /** Sends email; throws on SMTP failure. */
  static async send(options: SendMailOptions): Promise<void> {
    if (!MailService.isEnabled()) {
      throw new Error("Email is not configured (MAIL_USER / MAIL_PASS missing)");
    }

    await MailService.getTransporter().sendMail({
      from: getMailFrom(),
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
  }

  /**
   * Sends email without throwing — domain actions must not fail because of email.
   * Returns true when delivery succeeded.
   */
  static async sendSafe(options: SendMailOptions): Promise<boolean> {
    if (!MailService.isEnabled()) {
      if (!MailService.disabledWarningLogged) {
        logger.warn(
          "Email notifications disabled — set MAIL_USER and MAIL_PASS to enable SMTP"
        );
        MailService.disabledWarningLogged = true;
      }
      return false;
    }

    try {
      await MailService.send(options);
      logger.info(
        { to: options.to, subject: options.subject },
        "Email sent"
      );
      return true;
    } catch (err) {
      logger.warn(
        { err, to: options.to, subject: options.subject },
        "Email send failed"
      );
      return false;
    }
  }
}
