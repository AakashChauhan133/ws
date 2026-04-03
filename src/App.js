import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./AuthProvider";
import ProtectedRoute from "./ProtectedRoute";

import PublicLayout from "./publicLayout";
import DashboardLayout from "./DashboardLayout";

import WeatherBanner from "./WeatherBanner";
import ForgotPassword from "./ForgotPassword";
import Logout from "./Logout";

import LiveData from "./LiveData";
import KisanChatbot from "./kesanAI/kesan";
import WeeklyOverview from "./WeeklyOverview";
import Export from "./Export";
import Fungus from "./Fungus/Fungus";
import Disease from "./Disease/Disease";
import Pest from "./Pest/Pest";
import Spray from "./Spray/Spray";
import User from "./User";

import { SidebarProvider } from "./context/SidebarContext";

// --- Admin Imports ---
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import DeviceManager from "./pages/admin/DeviceManager";
import UserManager from "./pages/admin/UserManager";
import SensorManager from "./pages/admin/SensorManager"; // <-- Added import

function App() {
  return (
    <Router basename="/station">
      <AuthProvider>
        <Routes>
          {/* PUBLIC ROUTES */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<WeatherBanner />} />
            <Route path="/forgotpassword" element={<ForgotPassword />} />
            <Route path="/logout" element={<Logout />} />
          </Route>

          {/* PROTECTED ROUTES */}
          <Route element={<ProtectedRoute />}>
            {/* --- FARMER / REGULAR USER ROUTES --- */}
            <Route
              element={
                <SidebarProvider>
                  <DashboardLayout />
                </SidebarProvider>
              }
            >
              <Route path="/livedata" element={<LiveData />} />
              <Route path="/kisan" element={<KisanChatbot />} />
              <Route path="/weekly" element={<WeeklyOverview />} />
              <Route path="/export" element={<Export />} />
              <Route path="/fungus" element={<Fungus />} />
              <Route path="/disease" element={<Disease />} />
              <Route path="/pest" element={<Pest />} />
              <Route path="/spray" element={<Spray />} />
              <Route path="/user" element={<User />} />
            </Route>

            {/* --- ADMIN ROUTES --- */}
            <Route
              element={
                <SidebarProvider>
                  <AdminLayout />
                </SidebarProvider>
              }
            >
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/devices" element={<DeviceManager />} />
              <Route path="/admin/sensors" element={<SensorManager />} />{" "}
              {/* <-- Added route */}
              <Route path="/admin/users" element={<UserManager />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
