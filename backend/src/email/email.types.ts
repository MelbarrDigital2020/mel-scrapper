export type EmailTemplate =
  | "REGISTER_OTP"
  | "LOGIN_OTP"
  | "PASSWORD_RESET"
  | "GENERIC"
  | "WELCOME";

export interface SendEmailPayload {
  to: string;
  template: EmailTemplate;
  subject?: string;
  data: Record<string, any>;
}
