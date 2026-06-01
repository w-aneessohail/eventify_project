import type { Repository } from "typeorm";
import type { User } from "../entity/user.entity";

export class UserService {
  constructor(private userRepository: Repository<User>) {}

  async findAll(whereParams: any = {}, skip = 0, limit = 10): Promise<User[]> {
    return this.userRepository.find({
      where: { ...whereParams },
      relations: [
        "organizers",
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
        "organizers",
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
      relations: ["organizers"],
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
      relations: ["organizers"],
    });
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await this.userRepository.delete({ id });
    return result.affected !== 0;
  }
}
