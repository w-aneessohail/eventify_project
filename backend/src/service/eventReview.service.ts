import type { Repository } from "typeorm";
import type { EventReview } from "../entity/eventReview.entity";

export class EventReviewService {
  constructor(private reviewRepository: Repository<EventReview>) {}

  async findAll(
    whereParams: any = {},
    skip = 0,
    limit = 10
  ): Promise<EventReview[]> {
    return this.reviewRepository.find({
      where: { ...whereParams },
      relations: ["event", "attendee"],
      order: { createdAt: "DESC" },
      skip,
      take: limit,
    });
  }

  async findById(id: number): Promise<EventReview | null> {
    return this.reviewRepository.findOne({
      where: { id },
      relations: ["event", "attendee"],
    });
  }

  async createReview(reviewData: Partial<EventReview>): Promise<EventReview> {
    const review = this.reviewRepository.create(reviewData);
    return this.reviewRepository.save(review);
  }

  async updateReview(
    id: number,
    reviewData: { rating?: number; comment?: string }
  ): Promise<EventReview | null> {
    const review = await this.reviewRepository.findOne({ where: { id } });
    if (!review) return null;

    const allowed: Partial<EventReview> = {};
    if (reviewData.rating !== undefined) allowed.rating = reviewData.rating;
    if (reviewData.comment !== undefined) allowed.comment = reviewData.comment;

    this.reviewRepository.merge(review, allowed);
    await this.reviewRepository.save(review);
    return this.findById(id);
  }

  async deleteReview(id: number): Promise<boolean> {
    const result = await this.reviewRepository.delete({ id });
    return result.affected !== 0;
  }
}
