import type { DataSource } from "typeorm";
import { Organizer } from "../src/entity/organizer.entity";
import { Event } from "../src/entity/event.entity";
import { User } from "../src/entity/user.entity";
import { VerificationStatus } from "../src/enum/verificationStatus.enum";

/** Resets known seed entities to expected verification states. */
export async function repairSeedState(dataSource: DataSource): Promise<void> {
  const userRepo = dataSource.getRepository(User);
  const organizerRepo = dataSource.getRepository(Organizer);
  const eventRepo = dataSource.getRepository(Event);

  const sana = await userRepo.findOne({
    where: { email: "sana.malik@eventify.pk" },
    relations: ["organizer"],
  });
  if (sana?.organizer) {
    await organizerRepo.update(sana.organizer.id, {
      verificationStatus: VerificationStatus.PENDING,
      verifiedBy: null,
      verifiedAt: null,
      rejectionReason: null,
    });
  }

  const bilal = await userRepo.findOne({
    where: { email: "bilal.sheikh@eventify.pk" },
    relations: ["organizer"],
  });
  if (bilal?.organizer) {
    await organizerRepo.update(bilal.organizer.id, {
      verificationStatus: VerificationStatus.REJECTED,
      rejectionReason: bilal.organizer.rejectionReason ?? "Seed rejection",
    });
  }

  const pendingEventTitles = [
    "Faisalabad Education Expo",
    "Multan Wellness & Health Fair",
    "Multan Mango Festival",
  ];
  for (const title of pendingEventTitles) {
    await eventRepo.update(
      { title },
      { status: VerificationStatus.PENDING, rejectionReason: null }
    );
  }

  const rejectedEventTitles = [
    "Lahore Classical Music Evening",
    "Faisalabad Textile Innovation Meet",
  ];
  for (const title of rejectedEventTitles) {
    await eventRepo.update({ title }, { status: VerificationStatus.REJECTED });
  }

  await eventRepo.update(
    { title: "Lahore Tech Summit 2026" },
    { status: VerificationStatus.APPROVED, rejectionReason: null }
  );
}
