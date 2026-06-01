import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { UserRole } from "../enum/userRole.enum";
import { Organizer } from "./organizer.entity";
import { Booking } from "./booking.entity";
import { EventReview } from "./eventReview.entity";
import { OtpToken } from "./otpToken.entity";
import { AuthToken } from "./authToken.entity";
import * as bcrypt from "bcrypt";
import * as dotenv from "dotenv";

dotenv.config();
const { SALT_ROUNDS = "10" } = process.env;

@Entity({ name: "users" })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false, unique: true })
  email: string;

  @Column({ nullable: false })
  password: string;

  @Column({ nullable: true })
  profileImage?: string | null;

  @Column({ type: "enum", enum: UserRole, default: UserRole.ATTENDEE })
  role: UserRole;

  @Column({ default: false })
  isVerified: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => Organizer, (organizer) => organizer.user)
  organizers: Organizer;

  @OneToMany(() => Booking, (booking) => booking.attendee)
  bookings: Booking[];

  @OneToMany(() => EventReview, (review) => review.attendee)
  reviews: EventReview[];

  @OneToMany(() => OtpToken, (otp) => otp.user)
  otpTokens: OtpToken[];

  @OneToOne(() => AuthToken, (token) => token.user)
  authTokens: AuthToken;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(): Promise<void> {
    if (this.password && !this.password.startsWith("$2b$")) {
      const salt = await bcrypt.genSalt(Number(SALT_ROUNDS));
      this.password = await bcrypt.hash(this.password, salt);
    }
  }
}
