export class AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    isVerified: boolean;
  };

  constructor(data: any) {
    this.accessToken = data.accessToken;
    this.refreshToken = data.refreshToken;
    this.user = {
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      role: data.user.role,
      isVerified: data.user.isVerified,
    };
  }
}

export class VerifyOtpResponseDto {
  success: boolean;
  message: string;
  verifiedUserId?: number;

  constructor(data: any) {
    this.success = data.success;
    this.message = data.message;
    this.verifiedUserId = data.verifiedUserId ?? undefined;
  }
}

export class ResetPasswordResponseDto {
  success: boolean;
  message: string;

  constructor(data: any) {
    this.success = data.success;
    this.message = data.message;
  }
}
