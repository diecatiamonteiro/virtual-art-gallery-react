import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function LoginForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const { signup, login } = useAuth();
  const navigate = useNavigate();
  const typeFromUrl = searchParams.get("type");
  const [isArtist, setIsArtist] = useState(typeFromUrl === "artist");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isLogin) {
        const response = await login(email, password);
        if (response && response.userData) {
          if (response.userData.isArtist) {
            navigate("/for-artists");
          } else {
            navigate("/for-art-lovers");
          }
        }
      } else {
        await signup(email, password, firstName, lastName, isArtist);
        navigate(isArtist ? "/for-artists" : "/for-art-lovers");
      }
    } catch (error) {
      console.error("Form submission error:", error);
      // Map Firebase error codes to user-friendly messages
      const errorMessage = {
        'auth/invalid-credential': 'Invalid email or password',
        'auth/user-not-found': 'No account found with this email',
        'auth/wrong-password': 'Incorrect password',
        'auth/email-already-in-use': 'An account with this email already exists',
        'auth/weak-password': 'Password should be at least 6 characters',
        'auth/invalid-email': 'Please enter a valid email address'
      }[error.code] || 'An error occurred during login/signup';
      
      setError(errorMessage);
    }
    setLoading(false);
  }

  return (
    <main className="relative min-h-screen w-full pt-20 pb-8 px-4">
      <div className="w-full max-w-md mx-auto p-8 bg-white/90 backdrop-blur-sm rounded-3xl">
        <h2 className="text-2xl font-bold mb-8">
          {isLogin ? "Login to your account" : "Create your account"}
        </h2>

        {error && (
          <div className="bg-red-100/80 border border-red-400 text-red-700 px-4 py-3 rounded-2xl mb-6">
            {error}
          </div>
        )}

        {!isLogin && (
          <div className="mb-6">
            <label id="user-type-label" className="block text-gray-700 mb-2">
              I am an:
            </label>
            <div 
              role="radiogroup" 
              aria-labelledby="user-type-label"
              className="space-y-2"
            >
              <button
                type="button"
                data-testid="open-art-gallery-button"
                onClick={() => setIsArtist(true)}
                role="radio"
                aria-checked={isArtist}
                className={`w-full p-3 rounded-2xl border-2 transition-colors ${
                  isArtist ? "border-pink-600 bg-pink-50" : "border-gray-200"
                }`}
              >
                Artist and want to open my art gallery
              </button>
              <button
                type="button"
                data-testid="purchase-artwork-button"
                onClick={() => setIsArtist(false)}
                role="radio"
                aria-checked={!isArtist}
                className={`w-full p-3 rounded-2xl border-2 transition-colors ${
                  !isArtist ? "border-pink-600 bg-pink-50" : "border-gray-200"
                }`}
              >
                Art lover and want to purchase artwork
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <>
              {/* First Name */}
              <div>
                <label htmlFor="firstName" className="block text-gray-700 mb-2 ml-2 font-medium">
                  First Name
                </label>
                <input
                  id="firstName"
                  type="text"
                  className="w-full p-3 border-2 border-gray-200 rounded-2xl bg-white/50 backdrop-blur-sm focus:border-blue-500 focus:outline-none transition-colors"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>

              {/* Last Name */}
              <div>
                <label htmlFor="lastName" className="block text-gray-700 mb-2 font-medium">
                  Last Name
                </label>
                <input
                  id="lastName"
                  type="text"
                  className="w-full p-3 border-2 border-gray-200 rounded-2xl bg-white/50 backdrop-blur-sm focus:border-blue-500 focus:outline-none transition-colors"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-gray-700 mb-2 font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="w-full p-3 border-2 border-gray-200 rounded-2xl bg-white/50 backdrop-blur-sm focus:border-blue-500 focus:outline-none transition-colors"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-gray-700 mb-2 font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="w-full p-3 border-2 border-gray-200 rounded-2xl bg-white/50 backdrop-blur-sm focus:border-blue-500 focus:outline-none transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Login/Signup Button */}
          <button
            type="submit"
            className={`w-full py-4 px-6 rounded-3xl text-white text-lg font-bold transition-all duration-200 ${
              isLogin
                ? "bg-green-500 hover:bg-green-600"
                : "bg-green-500 hover:bg-green-600"
            } disabled:opacity-50`}
            disabled={loading}
          >
            {isLogin ? "Login" : "Create Account"}
          </button>
        </form>

        {/* Toggle Login/Signup */}
        <button
          className="w-full text-center mt-6 text-gray-600 hover:text-gray-800 transition-colors"
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin
            ? "Need an account? Sign up"
            : "Already have an account? Login"}
        </button>

        {/* Continue as Guest */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("/")}
            className="text-gray-500 hover:text-gray-700 transition-colors text-sm"
          >
            Continue as Guest
          </button>
        </div>
      </div>
    </main>
  );
}
