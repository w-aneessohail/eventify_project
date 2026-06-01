export class OrganizerResponseDto {
  id: number;
  organizationName: string;
  cnic: string;
  phone: string;
  address: string;
  verificationStatus: string;
  verifiedBy: number | null;
  verifiedAt: Date | null;
  user: any; // User details from relation
  events?: any[]; // Optional: Event relations

  constructor(organizer: any) {
    this.id = organizer.id;
    this.organizationName = organizer.organizationName;
    this.cnic = organizer.cnic;
    this.phone = organizer.phone;
    this.address = organizer.address;
    this.verificationStatus = organizer.verificationStatus;
    this.verifiedBy = organizer.verifiedBy ?? null;
    this.verifiedAt = organizer.verifiedAt ?? null;
    this.user = organizer.user ?? null;
    this.events = organizer.events ?? [];
  }
}
