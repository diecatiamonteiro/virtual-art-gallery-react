import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ForArtistsPage from "./pages/ForArtistsPage";
import FAQ from "./pages/FAQ";
import Navbar from "./components/layout/Navbar";
import LoginForm from "./components/auth/LoginForm";
import { AuthProvider } from "./contexts/AuthContext";
import PrivateRoute from "./components/auth/ProtectedRoute";
import ArtistDashboard from "./pages/ArtistDashboard";
import FavoritesPage from "./pages/FavoritesPage";
import ExhibitionsPage from "./pages/ExhibitionsPage";
import BecomeArtist from "./pages/BecomeArtist";

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
              <Route path="/exhibitions" element={<ExhibitionsPage />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/login" element={<LoginForm />} />
              <Route
                path="/artist-dashboard"
                element={
                  <PrivateRoute requiresArtist={true}>
                    <ArtistDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/favorites"
                element={
                  <PrivateRoute>
                    <FavoritesPage />
                  </PrivateRoute>
                }
              />
              <Route path="/become-artist" element={<BecomeArtist />} />
            </Routes>
          </div>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
