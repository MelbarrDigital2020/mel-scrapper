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
      (req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
      req.ip;

    const data = await authService.loginUser(req.body, ip);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message
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

    // 🔐 SET COOKIE HERE
    res.cookie("access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
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



