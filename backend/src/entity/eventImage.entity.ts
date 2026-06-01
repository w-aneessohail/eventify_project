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

@Entity({ name: "event_images" })
export class EventImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "text", nullable: false })
  imageUrl: string;

  @Column({ nullable: true })
  caption: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Event, (event) => event.images, { onDelete: "CASCADE" })
  @JoinColumn()
  event: Event;
}
