import "./App.css";
import Navbar from "./Navbar";
import WeatherBanner from "./WeatherBanner";
import ForgotPassword from "./ForgotPassword";
import LiveData from "./LiveData";
import Fungus from "./Fungus/Fungus";
import Disease from "./Disease/Disease";
import Pest from "./Pest/Pest";
import Spray from "./Spray/Spray";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Export from "./Export";
import Logout from "./Logout";
import { AuthProvider } from "./AuthProvider";
import WeeklyOverview from "./WeeklyOverview";
import User from "./User";
import KisanChatbot from "./kesanAI/kesan";

function Layout() {
  const location = useLocation();
  const path = location.pathname;

  const showNavbar =
    path === "/" || path === "/forgotpassword" || path === "/logout";
  const showSidebar = !showNavbar;

  return (
    <>
      {showNavbar && (
        <>
          <Navbar />
          <Routes>
            <Route path="/" element={<WeatherBanner />} />
            <Route path="/forgotpassword" element={<ForgotPassword />} />
            <Route path="/logout" element={<Logout />} />
          </Routes>
        </>
      )}

      {showSidebar && (
        <>
          {/* <Sidebar /> */}

          <div className="">
            <Routes>
              <Route path="/livedata" element={<LiveData />} />
              <Route path="/kisan" element={< KisanChatbot />} />
              <Route path="/export" element={<Export />} />
              <Route path="/weekly" element={<WeeklyOverview />} />
              <Route path="/user" element={<User />} />
              <Route path="/fungus" element={<Fungus />} />
              <Route path="/disease" element={<Disease />} />
              <Route path="/pest" element={<Pest />} />
              <Route path="/spray" element={<Spray />} />
            </Routes>
          </div>
        </>
      )}
    </>
  );
}

function App() {
  return (
    <Router basename="/station">
      <AuthProvider>
        <Layout />
      </AuthProvider>
    </Router>
  );
}

export default App;
