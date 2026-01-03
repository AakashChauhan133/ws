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
          </Route>

        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
