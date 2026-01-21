
export interface RegisterStartDTO {
  firstName: string;
  lastName: string;
  email: string;
}

export interface RegisterVerifyOtpDTO {
  userId: string;
  otp: string;
}

export interface RegisterCompleteDTO {
  userId: string;
  password: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export type LoginResponse =
  | {
      twoFaRequired: true;
      userId: string;
    }
  | {
      twoFaRequired: false;
      accessToken: string;
    };

