import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { OtpPurpose } from "../enum/otpPurpose.enum";
import { User } from "./user.entity";

@Entity({ name: "otp_tokens" })
export class OtpToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "enum", enum: OtpPurpose, nullable: false })
  purpose: OtpPurpose;

  @Column({ nullable: false })
  otpCode: number;

  @Column({ type: "timestamptz", nullable: false })
  expiresAt: Date;

  @Column({ type: "timestamptz", nullable: true })
  consumedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.otpTokens, { onDelete: "CASCADE" })
  @JoinColumn()
  user: User;
}
