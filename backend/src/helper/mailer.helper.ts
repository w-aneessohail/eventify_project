import { MailService } from "../service/mail.service";

export type SendMailOptions = {
  to: string;
  subject: string;
  html?: string;
};

/** @deprecated Use MailService directly. Kept for auth OTP flows. */
export default class Mailer {
  static async send({ to, subject, html }: SendMailOptions): Promise<void> {
    await MailService.send({
      to,
      subject,
      html: html ?? "",
    });
  }
}
