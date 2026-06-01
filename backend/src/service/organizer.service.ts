import { Repository } from "typeorm";
import { Organizer } from "../entity/organizer.entity";

/** Map API/frontend payload to entity columns (avoids stray fields breaking TypeORM). */
export function normalizeOrganizerPayload(
  data: Record<string, unknown> & { user?: unknown }
): Partial<Organizer> {
  const organizationName = String(
    data.organizationName ?? data.organizerName ?? ""
  ).trim();
  const organizerName = String(
    data.organizerName ?? data.organizationName ?? organizationName
  ).trim();

  return {
    organizationName,
    organizerName,
    cnic: String(data.cnic ?? "").trim(),
    phone: String(data.phone ?? "").trim(),
    address: String(data.address ?? "").trim(),
    ...(data.user ? { user: data.user as Organizer["user"] } : {}),
  };
}

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
    const organizer = this.organizerRepository.create(
      normalizeOrganizerPayload(organizerData as Record<string, unknown>)
    );
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

    this.organizerRepository.merge(
      organizer,
      normalizeOrganizerPayload(organizerData as Record<string, unknown>)
    );
    return this.organizerRepository.save(organizer);
  }

  async deleteOrganizer(id: number): Promise<boolean> {
    const result = await this.organizerRepository.delete({ id });
    return result.affected !== 0;
  }
}
