import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function BecomeArtist() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  
  const fromArtLover = location.state?.fromArtLover || currentUser?.email;
  const userEmail = location.state?.userEmail || currentUser?.email;

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto text-center">
        {currentUser ? (
          <>
            <h1 className="text-4xl font-bold mb-4">Upgrade Your Account</h1>
            <h2 className="text-gray-600 text-lg font-semibold my-6">
              You're currently logged in as an art lover ({userEmail}).
            </h2>
            <p className="text-gray-600 text-lg mb-8">
              We're working on making it possible for art lovers to become artists.
              Check back soon! Alternatively, you can sign up as an artist with a new email.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-4xl font-bold mb-4">Coming Soon</h1>
            <p className="text-gray-600 text-lg mb-8">
              We're working on making it possible for art lovers to become artists. 
              Check back soon! Alternatively, you can sign up as an artist with a new email.
            </p>
          </>
        )}
        
        <button
          onClick={() => navigate("/")}
          className="bg-pink-600 text-white py-3 px-6 rounded-xl font-bold hover:bg-pink-700 transition-colors"
        >
          Back to Home
        </button>
      </div>
    </main>
  );
} 