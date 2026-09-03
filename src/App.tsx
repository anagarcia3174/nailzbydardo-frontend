import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ClientsPage } from "./pages/ClientsPage";
import { ClientDetailPage } from "./pages/ClientDetailPage";
import { ServicesPage } from "./pages/ServicesPage";
import { ExpensesPage } from "./pages/ExpensesPage";
import { AppointmentsPage } from "./pages/AppointmentsPage";
import { AppointmentDetailPage } from "./pages/AppointmentDetailPage";
import { FinancialsPage } from "./pages/FinancialsPage";
import { NewAppointmentPage } from "./pages/NewAppointmenPage";
import { AppointmentReceiptPage } from "./pages/AppointmentReceiptPage";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/clients"
        element={
          <ProtectedRoute>
            <ClientsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/clients/:id"
        element={
          <ProtectedRoute>
            <ClientDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/services"
        element={
          <ProtectedRoute>
            <ServicesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/expenses"
        element={
          <ProtectedRoute>
            <ExpensesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/appointments"
        element={
          <ProtectedRoute>
            <AppointmentsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/appointments/new"
        element={
          <ProtectedRoute>
            <NewAppointmentPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/appointments/:id"
        element={
          <ProtectedRoute>
            <AppointmentDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/appointments/:id/receipt"
        element={
          <ProtectedRoute>
            <AppointmentReceiptPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/financials"
        element={
          <ProtectedRoute>
            <FinancialsPage />
          </ProtectedRoute>
        }
      />

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
