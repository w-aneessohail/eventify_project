import { Repository } from "typeorm";
import { EventImage } from "../entity/eventImage.entity";

export class EventImageService {
  constructor(private eventImageRepository: Repository<EventImage>) {}

  async addImages(
    eventId: number,
    images: { imageUrl: string; caption?: string }[]
  ) {
    const imageEntities = images.map((img) =>
      this.eventImageRepository.create({ ...img, event: { id: eventId } })
    );
    return this.eventImageRepository.save(imageEntities);
  }

  async deleteImagesByEvent(eventId: number): Promise<void> {
    await this.eventImageRepository.delete({ event: { id: eventId } });
  }

  async findAllByEvent(eventId: number): Promise<EventImage[]> {
    return this.eventImageRepository.find({
      where: { event: { id: eventId } },
      relations: ["event"],
    });
  }

  async findById(imageId: number): Promise<EventImage | null> {
    return this.eventImageRepository.findOne({
      where: { id: imageId },
      relations: ["event"],
    });
  }

  async updateImage(
    imageId: number,
    updateData: Partial<{ imageUrl: string; caption: string }>
  ): Promise<EventImage | null> {
    const existingImage = await this.eventImageRepository.findOne({
      where: { id: imageId },
    });

    if (!existingImage) {
      return null;
    }

    const updatedImage = this.eventImageRepository.merge(
      existingImage,
      updateData
    );
    return this.eventImageRepository.save(updatedImage);
  }
}
