export class AuthTokenResponseDto {
  id: number;
  userId: number;
  refreshToken: string;
  expiresAt: string;

  constructor(token: any) {
    this.id = token.id;
    this.userId = token.userId;
    this.refreshToken = token.refreshToken;
    this.expiresAt = token.expiresAt;
  }
}
