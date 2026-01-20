import nodemailer from "nodemailer";
import { SendEmailPayload } from "./email.types";
import { emailTemplates } from "./email.templates";
import { renderTemplate } from "./email.utils";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

export const sendEmail = async ({
  to,
  template,
  data,
  subject
}: SendEmailPayload) => {
  const templateConfig = emailTemplates[template];

  if (!templateConfig) {
    throw new Error("Email template not found");
  }

  const finalSubject = subject
    ? subject
    : renderTemplate(templateConfig.subject, data);

  const html = renderTemplate(templateConfig.html, data);

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: finalSubject,
    html
  });
};
