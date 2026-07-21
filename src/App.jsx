import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { FaWhatsapp } from "react-icons/fa";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import Buy from "./pages/Buy";
import ViewBuy from "./pages/ViewBuy";
import Rent from "./pages/Rent";
import Projects from "./pages/Projects";
import About from "./pages/About";
import Contact from "./pages/Contact";
import AdminTeam from "./pages/AdminTeam";
import AdminBuy from "./pages/AdminBuy";
import ManagePropertyByAdmin from "./pages/ManagePropertyByAdmin";
import AdminAddRent from "./pages/AdminAddRent";
import AdminAddProject from "./pages/AdminAddProject";
import AdminLogin from "./pages/AdminLogin";
import ProtectedRoute from "./components/ProtectedRoute";
import ManagerentByAdmin from "./pages/ManagerentByAdmin";
import ManageProjects from "./pages/manageprojects";
import ViewProperty from "./pages/viewproperty";
import ViewRent from "./pages/ViewRent";

const whatsappStyle = {
  position: "fixed",
  bottom: "28px",
  right: "28px",
  width: "60px",
  height: "60px",
  borderRadius: "50%",
  background: "#ffffff",
  color: "#000000",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "36px",
  boxShadow: "0 6px 18px rgba(0, 0, 0, 0.12)",
  zIndex: 9999,
  textDecoration: "none",
};

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function WhatsAppButton() {
  const { pathname } = useLocation();

  const hideOnPages = [
    "/admin-team",
    "/admin-buy",
    "/admin-rent",
    "/admin-project",
  ];

  if (hideOnPages.includes(pathname)) {
    return null;
  }

  return (
    <a
      href="https://wa.me/123456789"
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      style={whatsappStyle}
    >
      <FaWhatsapp />
    </a>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />

      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/buy" element={<Buy />} />
          <Route path="/rent" element={<Rent />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Route>

        {/* No navbar/footer for the property detail pages */}
        <Route path="/buy/:slug" element={<ViewBuy />} />
        <Route path="/rent/:slug" element={<ViewRent />} />
        <Route path="/property/:slug" element={<ViewProperty />} />

        <Route path="/admin-login" element={<AdminLogin />} />

        <Route
          path="/admin-team"
          element={
            <ProtectedRoute>
              <AdminTeam />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin-buy"
          element={
            <ProtectedRoute>
              <AdminBuy />
            </ProtectedRoute>
          }
        />

        <Route
          path="/manage-rent-admin"
          element={
            <ProtectedRoute>
              <ManagerentByAdmin />
            </ProtectedRoute>
          }
        />

        <Route
          path="/manage-property-admin"
          element={
            <ProtectedRoute>
              <ManagePropertyByAdmin />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin-rent"
          element={
            <ProtectedRoute>
              <AdminAddRent />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin-project"
          element={
            <ProtectedRoute>
              <AdminAddProject />
            </ProtectedRoute>
          }
        />

        <Route
          path="/manageprojects"
          element={
            <ProtectedRoute>
              <ManageProjects />
            </ProtectedRoute>
          }
        />
      </Routes>

      <WhatsAppButton />
    </BrowserRouter>
  );
}

export default App;