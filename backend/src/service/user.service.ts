import type { Repository } from "typeorm";
import type { User } from "../entity/user.entity";
import { UserRole } from "../enum/userRole.enum";
import { AccessService } from "./access.service";

export type UserUpdateResult =
  | { user: User; error?: undefined }
  | { user?: undefined; error: "not_found" | "forbidden" };

export class UserService {
  constructor(private userRepository: Repository<User>) {}

  async findAll(whereParams: any = {}, skip = 0, limit = 10): Promise<User[]> {
    return this.userRepository.find({
      where: { ...whereParams },
      relations: [
        "organizer",
        "bookings",
        "reviews",
        "authTokens",
        "otpTokens",
      ],
      order: { createdAt: "DESC" },
      skip,
      take: limit,
    });
  }

  async findById(id: number): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
      relations: [
        "organizer",
        "bookings",
        "reviews",
        "authTokens",
        "otpTokens",
      ],
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      relations: ["organizer"],
    });
  }

  async createUser(userData: Partial<User>): Promise<User> {
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) return null;

    this.userRepository.merge(user, userData);
    await this.userRepository.save(user);

    return this.userRepository.findOne({
      where: { id },
      relations: ["organizer"],
    });
  }

  async updateUserForActor(
    targetId: number,
    actorId: number,
    actorRole: UserRole,
    userData: Partial<User>
  ): Promise<UserUpdateResult> {
    if (!AccessService.canModifyUser(actorRole, actorId, targetId)) {
      return { error: "forbidden" };
    }

    const updated = await this.updateUser(targetId, userData);
    if (!updated) return { error: "not_found" };
    return { user: updated };
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await this.userRepository.delete({ id });
    return result.affected !== 0;
  }
}
