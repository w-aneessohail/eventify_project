export const RoutePath = Object.freeze({
  // Public routes
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  VERIFY_OTP: "/verify-otp",
  RESET_PASSWORD: "/reset-password",

  // Attendee routes
  ATTENDEE: "/attendee",
  ATTENDEE_CATEGORIES: "/attendee/categories",
  ATTENDEE_ALL_EVENTS: "/attendee/events",
  ATTENDEE_CATEGORY_EVENTS: "/attendee/events/:categoryId",
  ATTENDEE_EVENT_DETAILS: "/attendee/event/:id",
  ATTENDEE_PROFILE: "/attendee/profile",
  ATTENDEE_CONTACT: "/attendee/contact",
  ATTENDEE_ABOUT: "/attendee/about",
  ATTENDEE_REVIEWS: "/attendee/reviews",
  ATTENDEE_MY_BOOKINGS: "/attendee/my-bookings",
  ATTENDEE_PAYMENT: "/attendee/payment/:bookingId",

  // Organizer routes
  ORGANIZER: "/organizer",
  ORGANIZER_DASHBOARD: "/organizer/dashboard",
  ORGANIZER_POST_EVENT: "/organizer/post-event",
  ORGANIZER_BOOKINGS: "/organizer/bookings",
  ORGANIZER_REVIEWS: "/organizer/reviews",
  ORGANIZER_PROFILE: "/organizer/profile",
  ORGANIZER_LOGOUT: "/organizer/logout",

  // Admin routes
  ADMIN: "/admin",
  ADMIN_DASHBOARD: "/admin/dashboard",
  ADMIN_ORGANIZERS: "/admin/organizers",
  ADMIN_EVENTS: "/admin/events",
  ADMIN_BOOKINGS: "/admin/bookings",
  ADMIN_USERS: "/admin/users",
  ADMIN_PAYMENTS: "/admin/payments",
  ADMIN_REVIEWS: "/admin/reviews",
  ADMIN_PROFILE: "/admin/profile",
  ADMIN_LOGOUT: "/admin/logout",
});
