import { useNavigate } from "react-router-dom";

export default function BecomeArtist() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-4">Coming Soon</h1>
        <p className="text-gray-600 text-lg mb-8">
          We're working on making it possible for art lovers to become artists. 
          Check back soon!
        </p>
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