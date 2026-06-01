export class EventReviewResponseDto {
  id: number;
  eventId: number;
  userId: number;
  rating: number;
  comment: string;
  createdAt: string;

  constructor(review: any) {
    this.id = review.id;
    this.eventId = review.eventId;
    this.userId = review.userId;
    this.rating = review.rating;
    this.comment = review.comment;
    this.createdAt = review.createdAt;
  }
}
