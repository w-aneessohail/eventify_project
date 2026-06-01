import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Event } from "./event.entity";
import { User } from "./user.entity";

@Entity({ name: "event_reviews" })
export class EventReview {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "int", nullable: false })
  rating: number;

  @Column({ type: "text", nullable: true })
  comment: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Event, (event) => event.reviews, { onDelete: "CASCADE" })
  @JoinColumn()
  event: Event;

  @ManyToOne(() => User, (user) => user.reviews, { onDelete: "CASCADE" })
  @JoinColumn()
  attendee: User;
}
