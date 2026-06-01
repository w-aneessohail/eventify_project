import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import AttendeeLayout from "./layouts/attendeeLayout";
import OrganizerLayout from "./layouts/organizerLayout";
import AdminLayout from "./layouts/adminLayout";
import ProtectedRoute from "./route/ProtectedRoute";
import RoleBasedRedirect from "./route/RoleBasedRedirect";
import { RoutePath } from "./enum/routePath";
import { UserRole } from "./enum/userRole";

// Pages
import Index from "./pages/attendeePages/Index";
import ProfilePage from "./pages/attendeePages/ProfilePage";
import Login from "./pages/authPages/Login";
import Register from "./pages/authPages/Register";
import ForgotPassword from "./pages/authPages/ForgotPassword";
import VerifyOTP from "./pages/authPages/VerifyOTP";
import ResetPassword from "./pages/authPages/ResetPassword";
import Contact from "./pages/attendeePages/Contact";
import About from "./pages/attendeePages/About";
import ReviewsPage from "./pages/attendeePages/Reviews";
import Categories from "./pages/attendeePages/Categories";
import CategoryEvents from "./pages/attendeePages/CategoryEvents";
import Events from "./pages/attendeePages/Events";
import EventDetails from "./pages/attendeePages/EventDetails";
import NotFound from "./pages/NotFound";
import PaymentPage from "./pages/attendeePages/PaymentPage";

// Dashboard pages
import Dashboard from "./pages/dashBoardPages/dashboard";
import PostEvent from "./pages/dashBoardPages/postEvent";
import Bookings from "./pages/dashBoardPages/bookings";
import DashboardEventReviews from "./pages/dashBoardPages/dashboardReviews";
import Logout from "./pages/dashBoardPages/logout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Toaster />
    <Sonner />
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Root path - redirects based on auth status and role */}
            <Route path={RoutePath.HOME} element={<RoleBasedRedirect />} />

            {/* Auth routes - public access */}
            <Route path={RoutePath.LOGIN} element={<Login />} />
            <Route path={RoutePath.REGISTER} element={<Register />} />
            <Route
              path={RoutePath.FORGOT_PASSWORD}
              element={<ForgotPassword />}
            />
            <Route path={RoutePath.VERIFY_OTP} element={<VerifyOTP />} />
            <Route
              path={RoutePath.RESET_PASSWORD}
              element={<ResetPassword />}
            />

            {/* Attendee Routes - Public access for browsing */}
            <Route path={RoutePath.ATTENDEE} element={<AttendeeLayout />}>
              <Route index element={<Index />} />
              <Route path="categories" element={<Categories />} />
              <Route path="events" element={<Events />} />
              <Route path="events/:categoryId" element={<CategoryEvents />} />
              <Route path="event/:id" element={<EventDetails />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="contact" element={<Contact />} />
              <Route path="about" element={<About />} />
              <Route path="reviews" element={<ReviewsPage />} />
              <Route
                path="payment/:bookingId"
                element={
                  <ProtectedRoute requiredRole={UserRole.ATTENDEE}>
                    <PaymentPage />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Organizer Routes - Protected with role check */}
            <Route
              path={RoutePath.ORGANIZER}
              element={
                <ProtectedRoute requiredRole={UserRole.ORGANIZER}>
                  <OrganizerLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="post-event" element={<PostEvent />} />
              <Route path="bookings" element={<Bookings />} />
              <Route path="reviews" element={<DashboardEventReviews />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="logout" element={<Logout />} />
            </Route>

            {/* Admin Routes - Protected with role check */}
            <Route
              path={RoutePath.ADMIN}
              element={
                <ProtectedRoute requiredRole={UserRole.ADMIN}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="bookings" element={<Bookings />} />
              <Route path="reviews" element={<DashboardEventReviews />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="logout" element={<Logout />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
