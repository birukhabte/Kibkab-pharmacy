import React, { useEffect, useState, ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import axios from "axios";

interface RequireAuthProps {
  children: ReactNode;
  requiredPermissions?: string[];
}

const RequireAuth: React.FC<RequireAuthProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    // Check auth status using backend-protected endpoint
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";
    const checkAuthUrl = apiBaseUrl.replace("/api", "/check-auth");
    
    axios
      .get(checkAuthUrl, {
        withCredentials: true,
      })
      .then(() => setIsAuthenticated(true))
      .catch(() => setIsAuthenticated(false));
  }, []);

  // Show loading state while checking
  if (isAuthenticated === null) return <div>Loading...</div>;

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated, render protected content
  return children;
};

export default RequireAuth;
