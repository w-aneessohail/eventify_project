import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import { RoutePath } from "@/enum/routePath";
import { UserRole } from "@/enum/userRole";

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, user, loading, initialized } =
    useContext(AuthContext);

  if (!initialized || loading) {
    return (
      <div
        className="flex justify-center items-center"
        style={{ minHeight: "100vh" }}
      >
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={RoutePath.LOGIN} replace />;
  }

  if (
    requiredRole &&
    user?.role?.toUpperCase() !== requiredRole.toUpperCase()
  ) {
    return <Navigate to={RoutePath.HOME} replace />;
  }

  return children;
};

export default ProtectedRoute;
