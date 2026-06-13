import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function Logout() {
  const { logout } = useAuth();

  useEffect(() => {
    logout();
  }, [logout]);

  return <div className="p-6">Logging out...</div>;
}
