export class EventImageResponseDto {
  id: number;
  imageUrl: string;
  caption?: string | null;
  eventId: number;

  constructor(eventImage: any) {
    this.id = eventImage.id;
    this.imageUrl = eventImage.imageUrl;
    this.caption = eventImage.caption ?? null;
    this.eventId = eventImage.event?.id ?? eventImage.eventId;
  }
}
