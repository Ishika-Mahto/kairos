import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedLayout from "./components/ProtectedLayout";
import { AuthProvider } from "./context/AuthContext";
import DashboardPage from "./pages/DashboardPage";
import InsightsPage from "./pages/InsightsPage";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import TrackerPage from "./pages/TrackerPage";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { initTheme } from "./utils/features";

function App() {
  useKeyboardShortcuts();

  useEffect(() => {
    initTheme();
  }, []);

  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route element={<ProtectedLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/tracker" element={<TrackerPage />} />
          <Route path="/insights" element={<InsightsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;