import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { PaymentStatus } from "../enum/paymentStatus.enum";
import { Payment } from "./payment.entity";
import { User } from "./user.entity";
import { Event } from "./event.entity";

@Entity({ name: "bookings" })
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "int", nullable: false })
  quantity: number;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: false })
  totalAmount: number;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  bookingDate: Date;

  @Column({
    type: "enum",
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => Payment, (payment) => payment.booking)
  payments: Payment[];

  @ManyToOne(() => User, (user) => user.bookings, { onDelete: "CASCADE" })
  @JoinColumn()
  attendee: User;

  @ManyToOne(() => Event, (event) => event.bookings, { onDelete: "CASCADE" })
  @JoinColumn()
  event: Event;
}
