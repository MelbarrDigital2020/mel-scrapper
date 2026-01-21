export type User = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;

  role?: string;
  is_active?: boolean;
  email_is_verified?: boolean;

  two_fa_enabled?: boolean;

  last_login?: string | null;
  last_login_ip?: string | null;

  created_at?: string;
  updated_at?: string;

  avatar_url?: string | null;
  contact_number?: string | null;
  bio?: string | null;
  timezone?: string | null;
};
