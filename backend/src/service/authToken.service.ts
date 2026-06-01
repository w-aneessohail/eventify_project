import { Repository, LessThan } from "typeorm";
import { AuthToken } from "../entity/authToken.entity";
import { User } from "../entity/user.entity";

export class AuthTokenService {
  constructor(private authRepository: Repository<AuthToken>) {}

  async findAll(): Promise<AuthToken[]> {
    return this.authRepository.find({
      relations: ["user"],
    });
  }

  async findById(id: number): Promise<AuthToken | null> {
    return this.authRepository.findOne({
      where: { id },
      relations: ["user"],
    });
  }

  async findByUser(userId: number): Promise<AuthToken[]> {
    return this.authRepository.find({
      where: { user: { id: userId } },
      relations: ["user"],
    });
  }

  async findByToken(refreshToken: string): Promise<AuthToken | null> {
    return this.authRepository.findOne({
      where: { refreshToken },
      relations: ["user"],
    });
  }

  async createAuthToken(data: {
    user: User;
    refreshToken: string;
    expiresAt: Date;
  }): Promise<AuthToken> {
    const token = this.authRepository.create({
      user: data.user,
      refreshToken: data.refreshToken,
      expiresAt: data.expiresAt,
      isRevoked: false,
    });
    return this.authRepository.save(token);
  }

  async revokeToken(tokenId: number): Promise<AuthToken | null> {
    const token = await this.authRepository.findOneBy({ id: tokenId });
    if (!token) return null;
    token.isRevoked = true;
    return this.authRepository.save(token);
  }

  async revokeUserTokens(userId: number): Promise<void> {
    const tokens = await this.findByUser(userId);
    for (const token of tokens) {
      token.isRevoked = true;
      await this.authRepository.save(token);
    }
  }

  async deleteExpiredTokens(): Promise<void> {
    await this.authRepository.delete({
      expiresAt: LessThan(new Date()),
    });
  }

  async deleteByUser(userId: number): Promise<void> {
    await this.authRepository.delete({
      user: { id: userId },
    });
  }
}
