import { BrowserRouter, Route, Navigate, Routes } from "react-router-dom";
import AdminLogin from "../pages/auth/adminLogin";
import ProtectedRoute from "../common/protectedRoute";
import Dashboard from "../pages/dashboard/dashboard";
// import GenerateReceipt from "../pages/receipt/generateReceipt";
// import ViewReceipts from "../pages/receipt/viewReceipt";
import CreateServices from "../pages/services/services";
import IndividualService from "../pages/services/individualService";
const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/admin/login" />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/services"
          element={
            <ProtectedRoute>
              <CreateServices />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/services/:id"
          element={
            <ProtectedRoute>
              <IndividualService />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
