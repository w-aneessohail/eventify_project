import { UserRole } from "../enum/userRole.enum";
import type { Booking } from "../entity/booking.entity";

/** Shared authorization rules for resource access. */
export class AccessService {
  static canModifyUser(
    actorRole: UserRole,
    actorId: number,
    targetUserId: number
  ): boolean {
    if (actorRole === UserRole.ADMIN) return true;
    return actorId === targetUserId;
  }

  static canViewBooking(
    actorRole: UserRole,
    actorId: number,
    booking: Booking
  ): boolean {
    if (actorRole === UserRole.ADMIN) return true;
    return booking.attendee?.id === actorId;
  }
}
