import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ForArtistsPage from "./pages/ForArtistsPage";
import ForArtLoversPage from "./pages/ForArtLoversPage";
import FAQ from "./pages/FAQ";
import Navbar from "./components/layout/Navbar";
import LoginForm from "./components/auth/LoginForm";
import { AuthProvider } from "./contexts/AuthContext";

export default function Routing() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="pt-16 px-4 sm:px-6 lg:px-8">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/forartists" element={<ForArtistsPage />} />
              <Route path="/forartlovers" element={<ForArtLoversPage />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/login" element={<LoginForm />} />
            </Routes>
          </div>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
