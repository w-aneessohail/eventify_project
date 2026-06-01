import { Repository } from "typeorm";
import { Organizer } from "../entity/organizer.entity";

export class OrganizerService {
  constructor(private organizerRepository: Repository<Organizer>) {}

  async findAll(): Promise<Organizer[]> {
    return this.organizerRepository.find({
      relations: ["user", "events"],
    });
  }

  async findById(id: number): Promise<Organizer | null> {
    return this.organizerRepository.findOne({
      where: { id },
      relations: ["user", "events"],
    });
  }

  async createOrganizer(organizerData: Partial<Organizer>): Promise<Organizer> {
    const organizer = this.organizerRepository.create(organizerData);
    return this.organizerRepository.save(organizer);
  }

  async updateOrganizerByUserId(
    userId: number,
    organizerData: Partial<Organizer>
  ) {
    const organizer = await this.organizerRepository.findOne({
      where: { user: { id: userId } },
      relations: ["user"],
    });

    if (!organizer) return null;

    this.organizerRepository.merge(organizer, organizerData);
    return this.organizerRepository.save(organizer);
  }

  async deleteOrganizer(id: number): Promise<boolean> {
    const result = await this.organizerRepository.delete({ id });
    return result.affected !== 0;
  }
}
