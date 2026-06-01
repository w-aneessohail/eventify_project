export class UserResponseDto {
  id: number;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  profileImage?: string | null;

  constructor(user: any) {
    this.id = user.id;
    this.name = user.name;
    this.email = user.email;
    this.role = user.role;
    this.isVerified = user.isVerified;
    this.profileImage = user.profileImage ?? null;
  }
}
