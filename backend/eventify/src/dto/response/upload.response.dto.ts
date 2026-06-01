import { UserResponseDto } from "./user.response.dto";

export class ProfileImageUploadResponseDto {
  filename: string;
  url: string;
  size: number;
  user: UserResponseDto;

  constructor(data: any) {
    this.filename = data.filename;
    this.url = data.url;
    this.size = data.size;
    this.user = new UserResponseDto(data.user);
  }
}

export class EventImageUploadResponseDto {
  id: number;
  eventId: number;
  filename: string;
  url: string;
  caption?: string | null;
  size: number;

  constructor(data: any) {
    this.id = data.id;
    this.eventId = data.eventId;
    this.filename = data.filename;
    this.url = data.url;
    this.caption = data.caption ?? null;
    this.size = data.size;
  }
}

export class MultipleEventImagesUploadResponseDto {
  eventId: number;
  count: number;
  images: EventImageUploadResponseDto[];

  constructor(data: any) {
    this.eventId = data.eventId;
    this.count = data.count;
    this.images = data.images.map(
      (img: any) => new EventImageUploadResponseDto(img)
    );
  }
}
