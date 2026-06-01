import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./user.entity";

@Entity({ name: "auth_tokens" })
export class AuthToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  refreshToken: string;

  @Column({ type: "timestamptz", nullable: false })
  expiresAt: Date;

  @Column({ default: false })
  isRevoked: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.authTokens, { onDelete: "CASCADE" })
  @JoinColumn()
  user: User;
}
