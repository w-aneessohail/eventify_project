import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { VerificationStatus } from "../enum/verificationStatus.enum";
import { User } from "./user.entity";
import { Event } from "./event.entity";

@Entity({ name: "organizers" })
export class Organizer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  organizationName: string;

  @Column({ nullable: false })
  organizerName: string;

  @Column({ nullable: false })
  cnic: string;

  @Column({ nullable: false })
  phone: string;

  @Column({ nullable: false })
  address: string;

  @Column({
    type: "enum",
    enum: VerificationStatus,
    default: VerificationStatus.PENDING,
  })
  verificationStatus: VerificationStatus;

  @Column({ nullable: true })
  verifiedBy: number;

  @Column({ type: "timestamp", nullable: true })
  verifiedAt: Date;

  @Column({ type: "text", nullable: true })
  rejectionReason: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Event, (event) => event.organizer)
  events: Event[];

  @OneToOne(() => User, (user) => user.organizer, { onDelete: "CASCADE" })
  @JoinColumn()
  user: User;
}
