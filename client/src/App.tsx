import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import theme from "./theme";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Inventory from "./pages/Inventory";
import Sales from "./pages/Sales";
import Reports from "./pages/Reports";
import Customers from "./pages/Customers";
import Prescriptions from "./pages/Prescriptions";
import CreditPayments from "./pages/CreditPayments";
import Commissions from "./pages/Commissions";
import Login from "./pages/auth/login/Login";
import RequireAuth from "./components/RequireAuth";
import RolesPage from "./pages/RoleManagment/RolesPage";
import ErrorBoundary from "./components/ErrorBoundary";
import NotFound from "./pages/NotFound";
import ServerError from "./pages/ServerError";
import StocksPage from "./pages/stock/StocksPage";
// Create a query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/server-error" element={<ServerError />} />

              {/* Protected routes wrapped in Layout */}
              <Route path="/" element={<Layout />}>
                {/* Default redirect to dashboard */}
                <Route index element={<Navigate to="/dashboard" replace />} />

                {/* Main Application Routes */}
                <Route
                  path="dashboard"
                  element={
                    <RequireAuth>
                      <Dashboard />
                    </RequireAuth>
                  }
                />

                <Route
                  path="inventory"
                  element={
                    <RequireAuth requiredPermissions={["inventory:view"]}>
                      <Inventory />
                    </RequireAuth>
                  }
                />

                <Route
                  path="stocks"
                  element={
                    <RequireAuth requiredPermissions={["stocks:view"]}>
                      <StocksPage />
                    </RequireAuth>
                  }
                />

                <Route
                  path="sales"
                  element={
                    <RequireAuth requiredPermissions={["sales:view"]}>
                      <Sales />
                    </RequireAuth>
                  }
                />

                <Route
                  path="commissions"
                  element={
                    <RequireAuth requiredPermissions={["commissions:view"]}>
                      <Commissions />
                    </RequireAuth>
                  }
                />

                <Route
                  path="employees"
                  element={
                    <RequireAuth requiredPermissions={["employees:view"]}>
                      <Employees />
                    </RequireAuth>
                  }
                />

                <Route
                  path="customers"
                  element={
                    <RequireAuth requiredPermissions={["customers:view"]}>
                      <Customers />
                    </RequireAuth>
                  }
                />

                <Route
                  path="prescriptions"
                  element={
                    <RequireAuth requiredPermissions={["prescriptions:manage"]}>
                      <Prescriptions />
                    </RequireAuth>
                  }
                />

                <Route
                  path="credit-payments"
                  element={
                    <RequireAuth requiredPermissions={["payments:view"]}>
                      <CreditPayments />
                    </RequireAuth>
                  }
                />

                <Route
                  path="reports"
                  element={
                    <RequireAuth requiredPermissions={["reports:view"]}>
                      <Reports />
                    </RequireAuth>
                  }
                />

                {/* Admin Panel Routes */}
                <Route path="admin">
                  <Route
                    path="roles"
                    element={
                      <RequireAuth requiredPermissions={["roles:manage"]}>
                        <RolesPage />
                      </RequireAuth>
                    }
                  />
                  <Route index element={<Navigate to="roles" replace />} />
                </Route>
              </Route>

              {/* Fallback route for 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;


