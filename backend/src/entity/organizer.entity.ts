import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Event, (event) => event.organizer)
  events: Event[];

  @ManyToOne(() => User, (user) => user.organizers, { onDelete: "CASCADE" })
  @JoinColumn()
  user: User;
}
