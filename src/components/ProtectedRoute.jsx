import { Navigate } from "react-router-dom";
import api from "../api/api";

function ProtectedRoute({ children }) {
  if (!api.isLoggedIn()) {
    return <Navigate to="/admin-login" replace />;
  }
  return children;
}

export default ProtectedRoute;