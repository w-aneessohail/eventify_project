import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { RoutePath } from "@/enum/routePath";
import { UserRole } from "@/enum/userRole";

const RoleBasedRedirect = () => {
  const { user, isAuthenticated, initialized, loading } = useAuth();

  if (!initialized || loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "100vh" }}
      >
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to={RoutePath.ATTENDEE} replace />;
  }

  const rolePathMap = {
    [UserRole.ATTENDEE.toUpperCase()]: RoutePath.ATTENDEE,
    [UserRole.ORGANIZER.toUpperCase()]: RoutePath.ORGANIZER,
    [UserRole.ADMIN.toUpperCase()]: RoutePath.ADMIN,
  };

  const userRole = user?.role?.toUpperCase() || UserRole.ATTENDEE.toUpperCase();
  const redirectPath = rolePathMap[userRole] || RoutePath.ATTENDEE;

  return <Navigate to={redirectPath} replace />;
};

export default RoleBasedRedirect;
