export class EventResponseDto {
  id: number;
  title: string;
  description: string;
  address: string;
  eventDate: string;
  ticketPrice: number;
  totalTickets: number;
  status: string;
  organizer?: any; // Organizer relation data
  category?: any; // Category relation data
  images?: any[]; // Event images
  bookings?: any[]; // Related bookings
  reviews?: any[]; // Related reviews

  constructor(event: any) {
    this.id = event.id;
    this.title = event.title;
    this.description = event.description;
    this.address = event.address;
    this.eventDate = event.eventDate;
    this.ticketPrice = event.ticketPrice;
    this.totalTickets = event.totalTickets;
    this.status = event.status;
    this.organizer = event.organizer ?? null;
    this.category = event.category ?? null;
    this.images = event.images ?? [];
    this.bookings = event.bookings ?? [];
    this.reviews = event.reviews ?? [];
  }
}
