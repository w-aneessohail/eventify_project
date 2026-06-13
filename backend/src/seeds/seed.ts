import "reflect-metadata";
import * as fs from "fs";
import * as path from "path";
import dataSource from "../data-source";
import { User } from "../entity/user.entity";
import { Organizer } from "../entity/organizer.entity";
import { Category } from "../entity/category.entity";
import { Event } from "../entity/event.entity";
import { EventImage } from "../entity/eventImage.entity";
import { Booking } from "../entity/booking.entity";
import { Payment } from "../entity/payment.entity";
import { EventReview } from "../entity/eventReview.entity";
import { UserRole } from "../enum/userRole.enum";
import { VerificationStatus } from "../enum/verificationStatus.enum";
import { PaymentStatus } from "../enum/paymentStatus.enum";
import { BookingStatus } from "../enum/bookingStatus.enum";
import { PaymentMethod } from "../enum/paymentMethod.enum";

/** Shared dev password for all seeded accounts. */
export const SEED_PASSWORD = "Password123!";

const MINIMAL_JPEG = Buffer.from(
  "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=",
  "base64"
);

const CATEGORIES = [
  "Technology",
  "Music",
  "Food",
  "Sports",
  "Conference",
  "Education",
  "Business",
  "Health",
];

const ATTENDEES = [
  { name: "Ayesha Siddiqui", email: "ayesha.siddiqui@eventify.pk" },
  { name: "Omar Farooq", email: "omar.farooq@eventify.pk" },
  { name: "Zainab Hussain", email: "zainab.hussain@eventify.pk" },
  { name: "Usman Tariq", email: "usman.tariq@eventify.pk" },
  { name: "Hira Mehmood", email: "hira.mehmood@eventify.pk" },
];

const ORGANIZERS = [
  {
    name: "Ahmed Khan",
    email: "ahmed.khan@eventify.pk",
    organizationName: "Lahore Live Events",
    organizerName: "Ahmed Khan",
    cnic: "3520112345671",
    phone: "+923001234501",
    address: "Gulberg III, Lahore",
    verificationStatus: VerificationStatus.APPROVED,
  },
  {
    name: "Fatima Ali",
    email: "fatima.ali@eventify.pk",
    organizationName: "Karachi Cultural Hub",
    organizerName: "Fatima Ali",
    cnic: "4210112345672",
    phone: "+923001234502",
    address: "Clifton Block 5, Karachi",
    verificationStatus: VerificationStatus.APPROVED,
  },
  {
    name: "Hassan Raza",
    email: "hassan.raza@eventify.pk",
    organizationName: "Islamabad Experiences",
    organizerName: "Hassan Raza",
    cnic: "6110112345673",
    phone: "+923001234503",
    address: "F-7 Markaz, Islamabad",
    verificationStatus: VerificationStatus.APPROVED,
  },
  {
    name: "Sana Malik",
    email: "sana.malik@eventify.pk",
    organizationName: "Multan Arts Collective",
    organizerName: "Sana Malik",
    cnic: "3630112345674",
    phone: "+923001234504",
    address: "Cantt Area, Multan",
    verificationStatus: VerificationStatus.PENDING,
  },
  {
    name: "Bilal Sheikh",
    email: "bilal.sheikh@eventify.pk",
    organizationName: "Faisalabad Festival Co",
    organizerName: "Bilal Sheikh",
    cnic: "3310112345675",
    phone: "+923001234505",
    address: "D Ground, Faisalabad",
    verificationStatus: VerificationStatus.REJECTED,
  },
];

type EventSeed = {
  title: string;
  description: string;
  address: string;
  city: string;
  category: string;
  organizerEmail: string;
  status: VerificationStatus;
  ticketPrice: number;
  totalTickets: number;
  availableTickets: number;
  monthsAhead: number;
};

const EVENTS: EventSeed[] = [
  {
    title: "Lahore Tech Summit 2026",
    description:
      "Pakistan's growing tech community gathers for keynotes, startup pitches, and networking across software, AI, and fintech.",
    address: "Expo Centre, Johar Town",
    city: "Lahore",
    category: "Technology",
    organizerEmail: "ahmed.khan@eventify.pk",
    status: VerificationStatus.APPROVED,
    ticketPrice: 2500,
    totalTickets: 500,
    availableTickets: 420,
    monthsAhead: 2,
  },
  {
    title: "Karachi Sufi Night",
    description:
      "An evening of qawwali and classical fusion featuring renowned artists from Sindh and Punjab.",
    address: "Arts Council Auditorium",
    city: "Karachi",
    category: "Music",
    organizerEmail: "fatima.ali@eventify.pk",
    status: VerificationStatus.APPROVED,
    ticketPrice: 1800,
    totalTickets: 300,
    availableTickets: 210,
    monthsAhead: 1,
  },
  {
    title: "Islamabad Food Street Festival",
    description:
      "Sample street food from across Pakistan with live cooking demos and family-friendly stalls.",
    address: "F-9 Park Food Arena",
    city: "Islamabad",
    category: "Food",
    organizerEmail: "hassan.raza@eventify.pk",
    status: VerificationStatus.APPROVED,
    ticketPrice: 1200,
    totalTickets: 800,
    availableTickets: 650,
    monthsAhead: 3,
  },
  {
    title: "Rawalpindi Cricket Cup",
    description:
      "Local clubs compete in a one-day tournament with food courts and kids zone.",
    address: "Army Sports Complex",
    city: "Rawalpindi",
    category: "Sports",
    organizerEmail: "ahmed.khan@eventify.pk",
    status: VerificationStatus.APPROVED,
    ticketPrice: 800,
    totalTickets: 1000,
    availableTickets: 900,
    monthsAhead: 2,
  },
  {
    title: "Pakistan Business Leadership Forum",
    description:
      "Panels on SME growth, exports, and digital payments with speakers from Lahore and Karachi.",
    address: "Pearl Continental Hotel",
    city: "Lahore",
    category: "Business",
    organizerEmail: "ahmed.khan@eventify.pk",
    status: VerificationStatus.APPROVED,
    ticketPrice: 4500,
    totalTickets: 200,
    availableTickets: 145,
    monthsAhead: 4,
  },
  {
    title: "Faisalabad Education Expo",
    description:
      "Universities and training institutes showcase programs for students and professionals.",
    address: "Iqbal Stadium Hall",
    city: "Faisalabad",
    category: "Education",
    organizerEmail: "bilal.sheikh@eventify.pk",
    status: VerificationStatus.PENDING,
    ticketPrice: 500,
    totalTickets: 600,
    availableTickets: 600,
    monthsAhead: 2,
  },
  {
    title: "Multan Wellness & Health Fair",
    description:
      "Free health screenings, fitness workshops, and talks on mental wellness in South Punjab.",
    address: "Multan Expo Center",
    city: "Multan",
    category: "Health",
    organizerEmail: "sana.malik@eventify.pk",
    status: VerificationStatus.PENDING,
    ticketPrice: 600,
    totalTickets: 400,
    availableTickets: 400,
    monthsAhead: 3,
  },
  {
    title: "Karachi Jazz Under the Stars",
    description:
      "Open-air jazz performances with local and international guest musicians.",
    address: "Bay View Park",
    city: "Karachi",
    category: "Music",
    organizerEmail: "fatima.ali@eventify.pk",
    status: VerificationStatus.APPROVED,
    ticketPrice: 2200,
    totalTickets: 350,
    availableTickets: 280,
    monthsAhead: 2,
  },
  {
    title: "Lahore Startup Conference",
    description:
      "Founders share lessons on fundraising, product-market fit, and hiring in Pakistan.",
    address: "NCA Auditorium",
    city: "Lahore",
    category: "Conference",
    organizerEmail: "ahmed.khan@eventify.pk",
    status: VerificationStatus.APPROVED,
    ticketPrice: 3000,
    totalTickets: 250,
    availableTickets: 190,
    monthsAhead: 1,
  },
  {
    title: "Islamabad Trail Run",
    description:
      "5K and 10K trail routes in the Margalla foothills with hydration stations.",
    address: "Trail 5 Entrance",
    city: "Islamabad",
    category: "Sports",
    organizerEmail: "hassan.raza@eventify.pk",
    status: VerificationStatus.APPROVED,
    ticketPrice: 1500,
    totalTickets: 200,
    availableTickets: 120,
    monthsAhead: 1,
  },
  {
    title: "Karachi Biryani Championship",
    description:
      "Top chefs compete for the best Karachi-style biryani with public tasting tickets.",
    address: "Beach Luxury Hotel Lawn",
    city: "Karachi",
    category: "Food",
    organizerEmail: "fatima.ali@eventify.pk",
    status: VerificationStatus.APPROVED,
    ticketPrice: 1000,
    totalTickets: 500,
    availableTickets: 430,
    monthsAhead: 2,
  },
  {
    title: "Rawalpindi Women in Tech",
    description:
      "Workshops and mentorship sessions supporting women entering Pakistan's tech workforce.",
    address: "FAST-NUCES Campus",
    city: "Rawalpindi",
    category: "Technology",
    organizerEmail: "hassan.raza@eventify.pk",
    status: VerificationStatus.APPROVED,
    ticketPrice: 900,
    totalTickets: 180,
    availableTickets: 95,
    monthsAhead: 3,
  },
  {
    title: "Lahore Classical Music Evening",
    description:
      "A curated program of sitar, tabla, and ghazal performances in a heritage venue.",
    address: "Alhamra Arts Centre",
    city: "Lahore",
    category: "Music",
    organizerEmail: "ahmed.khan@eventify.pk",
    status: VerificationStatus.REJECTED,
    ticketPrice: 1600,
    totalTickets: 220,
    availableTickets: 220,
    monthsAhead: 2,
  },
  {
    title: "Faisalabad Textile Innovation Meet",
    description:
      "Industry leaders discuss sustainable manufacturing and export opportunities.",
    address: "Chenab Club",
    city: "Faisalabad",
    category: "Business",
    organizerEmail: "bilal.sheikh@eventify.pk",
    status: VerificationStatus.REJECTED,
    ticketPrice: 2000,
    totalTickets: 150,
    availableTickets: 150,
    monthsAhead: 4,
  },
  {
    title: "Multan Mango Festival",
    description:
      "Celebrate the mango season with tastings, cultural performances, and artisan stalls.",
    address: "Ghanta Ghar Grounds",
    city: "Multan",
    category: "Food",
    organizerEmail: "sana.malik@eventify.pk",
    status: VerificationStatus.PENDING,
    ticketPrice: 700,
    totalTickets: 700,
    availableTickets: 700,
    monthsAhead: 5,
  },
  {
    title: "Karachi Mental Health Awareness Day",
    description:
      "Talks and resource booths from counselors and NGOs serving urban communities.",
    address: "Aga Khan University Lawn",
    city: "Karachi",
    category: "Health",
    organizerEmail: "fatima.ali@eventify.pk",
    status: VerificationStatus.APPROVED,
    ticketPrice: 0,
    totalTickets: 400,
    availableTickets: 320,
    monthsAhead: 2,
  },
  {
    title: "Islamabad Cloud & DevOps Day",
    description:
      "Hands-on sessions on AWS, Azure, and CI/CD pipelines for Pakistani engineering teams.",
    address: "National Library Auditorium",
    city: "Islamabad",
    category: "Technology",
    organizerEmail: "hassan.raza@eventify.pk",
    status: VerificationStatus.APPROVED,
    ticketPrice: 2800,
    totalTickets: 180,
    availableTickets: 140,
    monthsAhead: 3,
  },
  {
    title: "Lahore Family Fun Carnival",
    description:
      "Rides, games, and food stalls designed for families on a weekend outing.",
    address: "Greater Iqbal Park",
    city: "Lahore",
    category: "Sports",
    organizerEmail: "ahmed.khan@eventify.pk",
    status: VerificationStatus.APPROVED,
    ticketPrice: 500,
    totalTickets: 1200,
    availableTickets: 1050,
    monthsAhead: 1,
  },
];

function futureDate(monthsAhead: number): Date {
  const date = new Date();
  date.setMonth(date.getMonth() + monthsAhead);
  date.setDate(15);
  return date;
}

function ensurePlaceholderImage(): string {
  const eventDir = path.join(process.cwd(), "image", "event");
  fs.mkdirSync(eventDir, { recursive: true });
  const filename = "seed-default.jpg";
  const filepath = path.join(eventDir, filename);
  if (!fs.existsSync(filepath)) {
    fs.writeFileSync(filepath, MINIMAL_JPEG);
  }
  return `/image/event/${filename}`;
}

async function clearDevData(): Promise<void> {
  await dataSource.query(`
    TRUNCATE TABLE
      payments,
      bookings,
      event_reviews,
      event_images,
      events,
      organizers,
      otp_tokens,
      auth_tokens,
      users,
      categories
    RESTART IDENTITY CASCADE
  `);
}

async function seed(): Promise<void> {
  await dataSource.initialize();

  const isDev =
    process.env.NODE_ENV !== "production" &&
    process.env.SEED_ALLOW_PRODUCTION !== "true";

  if (!isDev) {
    throw new Error(
      "Seed aborted: set NODE_ENV to development or SEED_ALLOW_PRODUCTION=true"
    );
  }

  console.log("Clearing existing dev data...");
  await clearDevData();

  const userRepo = dataSource.getRepository(User);
  const organizerRepo = dataSource.getRepository(Organizer);
  const categoryRepo = dataSource.getRepository(Category);
  const eventRepo = dataSource.getRepository(Event);
  const imageRepo = dataSource.getRepository(EventImage);
  const bookingRepo = dataSource.getRepository(Booking);
  const paymentRepo = dataSource.getRepository(Payment);
  const reviewRepo = dataSource.getRepository(EventReview);

  const imageUrl = ensurePlaceholderImage();

  console.log("Creating admin...");
  const admin = await userRepo.save(
    userRepo.create({
      name: "Admin Eventify",
      email: "admin@eventify.pk",
      password: SEED_PASSWORD,
      role: UserRole.ADMIN,
      isVerified: true,
    })
  );

  console.log("Creating attendees...");
  const attendeeUsers: User[] = [];
  for (const attendee of ATTENDEES) {
    attendeeUsers.push(
      await userRepo.save(
        userRepo.create({
          name: attendee.name,
          email: attendee.email,
          password: SEED_PASSWORD,
          role: UserRole.ATTENDEE,
          isVerified: true,
        })
      )
    );
  }

  console.log("Creating organizers...");
  const organizerByEmail = new Map<string, Organizer>();
  for (const org of ORGANIZERS) {
    const user = await userRepo.save(
      userRepo.create({
        name: org.name,
        email: org.email,
        password: SEED_PASSWORD,
        role: UserRole.ORGANIZER,
        isVerified: true,
      })
    );

    const organizer = await organizerRepo.save(
      organizerRepo.create({
        organizationName: org.organizationName,
        organizerName: org.organizerName,
        cnic: org.cnic,
        phone: org.phone,
        address: org.address,
        verificationStatus: org.verificationStatus,
        verifiedBy:
          org.verificationStatus === VerificationStatus.APPROVED
            ? admin.id
            : null,
        verifiedAt:
          org.verificationStatus === VerificationStatus.APPROVED
            ? new Date()
            : null,
        user,
      })
    );
    organizerByEmail.set(org.email, organizer);
  }

  console.log("Creating categories...");
  const categoryByName = new Map<string, Category>();
  for (const name of CATEGORIES) {
    categoryByName.set(
      name,
      await categoryRepo.save(categoryRepo.create({ name }))
    );
  }

  console.log("Creating events...");
  const createdEvents: Event[] = [];
  for (const eventSeed of EVENTS) {
    const organizer = organizerByEmail.get(eventSeed.organizerEmail);
    const category = categoryByName.get(eventSeed.category);
    if (!organizer || !category) continue;

    const event = await eventRepo.save(
      eventRepo.create({
        title: eventSeed.title,
        description: eventSeed.description,
        address: `${eventSeed.address}, ${eventSeed.city}`,
        eventDate: futureDate(eventSeed.monthsAhead),
        ticketPrice: eventSeed.ticketPrice,
        totalTickets: eventSeed.totalTickets,
        availableTickets: eventSeed.availableTickets,
        status: eventSeed.status,
        verifiedBy:
          eventSeed.status === VerificationStatus.APPROVED ? admin.id : null,
        verifiedAt:
          eventSeed.status === VerificationStatus.APPROVED ? new Date() : null,
        organizer,
        category,
      })
    );

    await imageRepo.save(
      imageRepo.create({
        imageUrl,
        caption: `${eventSeed.title} poster`,
        event,
      })
    );

    createdEvents.push(event);
  }

  const approvedEvents = createdEvents.filter(
    (e) => e.status === VerificationStatus.APPROVED
  );

  console.log("Creating bookings and payments...");
  const bookingPlans = [
    {
      attendeeIdx: 0,
      eventIdx: 0,
      quantity: 2,
      bookingStatus: BookingStatus.CONFIRMED,
      paymentStatus: PaymentStatus.SUCCESS,
      method: PaymentMethod.CARD,
    },
    {
      attendeeIdx: 1,
      eventIdx: 1,
      quantity: 1,
      bookingStatus: BookingStatus.CONFIRMED,
      paymentStatus: PaymentStatus.SUCCESS,
      method: PaymentMethod.WALLET,
    },
    {
      attendeeIdx: 2,
      eventIdx: 2,
      quantity: 3,
      bookingStatus: BookingStatus.CONFIRMED,
      paymentStatus: PaymentStatus.SUCCESS,
      method: PaymentMethod.BANK_TRANSFER,
    },
    {
      attendeeIdx: 3,
      eventIdx: 3,
      quantity: 2,
      bookingStatus: BookingStatus.PENDING,
      withPayment: false,
    },
    {
      attendeeIdx: 4,
      eventIdx: 4,
      quantity: 1,
      bookingStatus: BookingStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
      method: PaymentMethod.CARD,
    },
    {
      attendeeIdx: 0,
      eventIdx: 5,
      quantity: 2,
      bookingStatus: BookingStatus.CANCELLED,
      paymentStatus: PaymentStatus.FAILED,
      method: PaymentMethod.CARD,
    },
    {
      attendeeIdx: 1,
      eventIdx: 6,
      quantity: 1,
      bookingStatus: BookingStatus.CONFIRMED,
      paymentStatus: PaymentStatus.SUCCESS,
      method: PaymentMethod.CARD,
    },
    {
      attendeeIdx: 2,
      eventIdx: 7,
      quantity: 2,
      bookingStatus: BookingStatus.PENDING,
      withPayment: false,
    },
    {
      attendeeIdx: 3,
      eventIdx: 8,
      quantity: 1,
      bookingStatus: BookingStatus.CONFIRMED,
      paymentStatus: PaymentStatus.SUCCESS,
      method: PaymentMethod.CARD,
    },
    {
      attendeeIdx: 4,
      eventIdx: 9,
      quantity: 4,
      bookingStatus: BookingStatus.CANCELLED,
      paymentStatus: PaymentStatus.FAILED,
      method: PaymentMethod.WALLET,
    },
    {
      attendeeIdx: 0,
      eventIdx: 10,
      quantity: 2,
      bookingStatus: BookingStatus.CONFIRMED,
      paymentStatus: PaymentStatus.SUCCESS,
      method: PaymentMethod.CARD,
    },
    {
      attendeeIdx: 1,
      eventIdx: 11,
      quantity: 1,
      bookingStatus: BookingStatus.PENDING,
      withPayment: false,
    },
  ];

  const createdBookings: Booking[] = [];

  for (const plan of bookingPlans) {
    const event = approvedEvents[plan.eventIdx % approvedEvents.length];
    const attendee = attendeeUsers[plan.attendeeIdx % attendeeUsers.length];
    const totalAmount = Number(event.ticketPrice) * plan.quantity;

    const booking = await bookingRepo.save(
      bookingRepo.create({
        quantity: plan.quantity,
        totalAmount,
        bookingDate: new Date(),
        status: plan.bookingStatus,
        event,
        attendee,
      })
    );
    createdBookings.push(booking);

    if (plan.bookingStatus === BookingStatus.CONFIRMED) {
      event.availableTickets = Math.max(0, event.availableTickets - plan.quantity);
      await eventRepo.save(event);
    }

    const shouldCreatePayment = plan.withPayment !== false && plan.paymentStatus;
    if (shouldCreatePayment) {
      await paymentRepo.save(
        paymentRepo.create({
          amount: totalAmount,
          method: plan.method ?? PaymentMethod.CARD,
          status: plan.paymentStatus,
          transactionId: `SEED_${booking.id}_${Date.now()}`,
          booking,
        })
      );
    }
  }

  console.log("Creating reviews...");
  const reviewTexts = [
    {
      rating: 5,
      comment: "Smooth booking experience and a well-organized event in Lahore.",
    },
    {
      rating: 4,
      comment: "Great atmosphere and friendly staff. Would book again.",
    },
    {
      rating: 5,
      comment: "Excellent value for money. The Karachi venue was easy to find.",
    },
    {
      rating: 4,
      comment: "Good event overall. Food stalls could use more seating.",
    },
    {
      rating: 5,
      comment: "Loved the performances. Ticket pickup was quick and simple.",
    },
    {
      rating: 3,
      comment: "Decent event but parking was limited near the venue.",
    },
    {
      rating: 5,
      comment: "Very professional setup. Perfect for families.",
    },
    {
      rating: 4,
      comment: "Informative sessions and useful networking opportunities.",
    },
  ];

  for (let i = 0; i < reviewTexts.length; i++) {
    const event = approvedEvents[i % approvedEvents.length];
    const attendee = attendeeUsers[i % attendeeUsers.length];
    await reviewRepo.save(
      reviewRepo.create({
        rating: reviewTexts[i].rating,
        comment: reviewTexts[i].comment,
        event,
        attendee,
      })
    );
  }

  console.log("\n=== SEED COMPLETE ===");
  console.log(`Users: ${1 + attendeeUsers.length + ORGANIZERS.length}`);
  console.log(`Categories: ${CATEGORIES.length}`);
  console.log(`Events: ${createdEvents.length}`);
  console.log(`Bookings: ${createdBookings.length}`);
  console.log(`Reviews: ${reviewTexts.length}`);
  console.log("\nDev login password for all accounts:", SEED_PASSWORD);
  console.log("Admin: admin@eventify.pk");
  console.log("Sample attendee: ayesha.siddiqui@eventify.pk");
  console.log("Sample organizer: ahmed.khan@eventify.pk");

  await dataSource.destroy();
}

seed().catch(async (err) => {
  console.error("Seed failed:", err);
  if (dataSource.isInitialized) {
    await dataSource.destroy();
  }
  process.exit(1);
});
