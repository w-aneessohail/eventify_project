import * as nodemailer from "nodemailer";

const {
  MAIL_HOST = "sandbox.smtp.mailtrap.io",
  MAIL_PORT = "2525",
  MAIL_USER,
  MAIL_PASS,
  MAIL_FROM = "Clinic <no-reply@clinic.test>",
} = process.env;

export type SendMailOptions = {
  to: string;
  subject: string;
  html?: string;
};

export default class Mailer {
  private static transporter: nodemailer.Transporter | null = null;

  private static getTransporter() {
    if (!Mailer.transporter) {
      Mailer.transporter = nodemailer.createTransport({
        host: MAIL_HOST,
        port: Number(MAIL_PORT),
        auth: { user: MAIL_USER, pass: MAIL_PASS },
      });
    }
    return Mailer.transporter;
  }

  static async send({ to, subject, html }: SendMailOptions) {
    const tx = Mailer.getTransporter();
    const payload = {
      from: MAIL_FROM,
      to,
      subject,
      html,
    };
    return tx.sendMail(payload);
  }
}
