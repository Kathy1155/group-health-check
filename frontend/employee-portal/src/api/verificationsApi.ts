// src/api/verificationsApi.ts

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

export type RequestOtpDto = {
  groupCode: string;
  idNumber: string;
};

export type RequestOtpRes = {
  verificationId: string;
};

export async function requestOtp(dto: RequestOtpDto): Promise<RequestOtpRes> {
  const res = await fetch(`${API_BASE_URL}/employee/verifications/request`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });

  if (!res.ok) {
    throw new Error("REQUEST_OTP_FAILED");
  }

  return (await res.json()) as RequestOtpRes;
}

export type VerifyOtpRes = {
  verificationToken: string;
};

export async function verifyOtp(
  verificationId: string,
  otp: string
): Promise<VerifyOtpRes> {
  const res = await fetch(`${API_BASE_URL}/employee/verifications/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ verificationId, otp }),
  });

  if (!res.ok) {
    throw new Error("VERIFY_OTP_FAILED");
  }

  return (await res.json()) as VerifyOtpRes;
}