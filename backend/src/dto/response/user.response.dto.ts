export class UserResponseDto {
  id: number;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  profileImage?: string | null;
  organizer?: unknown;
  bookingCount?: number;
  reviewCount?: number;

  constructor(user: any) {
    this.id = user.id;
    this.name = user.name;
    this.email = user.email;
    this.role = user.role;
    this.isVerified = user.isVerified;
    this.profileImage = user.profileImage ?? null;
    if (user.organizer) {
      this.organizer = user.organizer;
    }
    if (Array.isArray(user.bookings)) {
      this.bookingCount = user.bookings.length;
    }
    if (Array.isArray(user.reviews)) {
      this.reviewCount = user.reviews.length;
    }
  }
}

/** Strip password and other sensitive fields from user entities for API responses. */
export function toSafeUser(user: any) {
  if (!user) return null;
  return new UserResponseDto(user);
}
