import { Request, Response } from "express";
import * as authService from "./auth.service";

export const registerStart = async (req: Request, res: Response) => {
  try {
    const data = await authService.startRegistration(req.body);

    res.status(200).json({
      success: true,
      message: "OTP sent to your email",
      data
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

export const registerVerifyOtp = async (req: Request, res: Response) => {
  try {
    const { userId, otp } = req.body;

    await authService.verifyRegistrationOtp(userId, otp);

    res.status(200).json({
      success: true,
      message: "Email verified successfully"
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

export const registerComplete = async (req: Request, res: Response) => {
  try {
    const { userId, password } = req.body;

    await authService.completeRegistration(userId, password);

    res.status(200).json({
      success: true,
      message: "Account created successfully"
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

export const registerResendOtp = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    await authService.resendRegistrationOtp(email);

    res.status(200).json({
      success: true,
      message: "OTP resent successfully"
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const ip =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0] || req.ip;

    const data = await authService.loginUser(req.body, ip);
    const isProd = process.env.NODE_ENV === "production";

    // ✅ Narrow the union properly
    if (data.twoFaRequired === false) {
      res.cookie("access_token", data.accessToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: "lax",
        path: "/", 
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.status(200).json({
        success: true,
        message: "Login successful",
        data: {
          twoFaRequired: false,
          accessToken: data.accessToken,
        },
      });
    }

    // 2FA required
    return res.status(200).json({
      success: true,
      message: "OTP sent",
      data: {
        twoFaRequired: true,
        userId: data.userId,
      },
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

export const loginVerifyOtp = async (req: Request, res: Response) => {
  try {
    const ip =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0] || req.ip;

    const { userId, otp } = req.body;

    const { accessToken } = await authService.verifyLoginOtp(
      userId,
      otp,
      ip
    );


    res.cookie("access_token", accessToken, {
      httpOnly: true,
      secure: false,      // ✅ MUST be false in localhost
      sameSite: "lax",    // ✅ correct
      path: "/", 
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });


    res.json({
      success: true,
      message: "Login successful",
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

export const loginResendOtp = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    await authService.resendLoginOtp(userId);

    res.status(200).json({
      success: true,
      message: "OTP resent successfully"
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};


export const googleStart = async (req: Request, res: Response) => {
  try {
    const url = authService.getGoogleAuthUrl();
    return res.redirect(url);
  } catch (err: any) {
    return res.redirect(`${process.env.APP_URL}/login?error=google_start_failed`);
  }
};

export const googleCallback = async (req: Request, res: Response) => {
  try {
    const code = String(req.query.code || "");
    if (!code) {
      return res.redirect(`${process.env.APP_URL}/login?error=google_no_code`);
    }

    const ip =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0] || req.ip;

    const { accessToken } = await authService.loginWithGoogle(code, ip);

    // ✅ SAME cookie name as your normal login
    res.cookie("access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.redirect(`${process.env.APP_URL}/app/dashboard`);
  } catch (err: any) {
    return res.redirect(`${process.env.APP_URL}/login?error=google_failed`);
  }
};



