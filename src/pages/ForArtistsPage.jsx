import { useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import { useAuth } from "../contexts/AuthContext";

export default function ForArtistsPage() {
  const { currentUser, isArtist } = useAuth();
  const navigate = useNavigate();

  const handleArtistClick = () => {
    if (!currentUser) {
      navigate("/login?type=artist");
    } else if (isArtist()) {
      navigate("/artist-dashboard");
    } else {
      navigate("/become-artist", { 
        state: { 
          fromArtLover: true,
          userEmail: currentUser.email 
        } 
      });
    }
  };

  return (
    <>
      {/* Different burger menu colors in this page only */}
      <Navbar isArtistPage={true} />

      <main className="fixed inset-0 bg-pink-600 w-screen h-screen flex flex-wrap items-center justify-between md:overflow-hidden">
        {/* Text section (left) */}
        <div className="flex flex-col w-full md:w-6/12 px-6 z-10">
          <div className="flex flex-col items-start w-full items-start pt-16 md:pt-0 xl:pl-10 2xl:pl-40 ">
            <h1
              className="text-white font-bold text-left text-6xl pb-6 md:text-8xl md:leading-none lg:text-8xl xl:text-9xl"
              style={{ fontFamily: "var(--heading-font)" }}
            >
              For Artists
            </h1>
            <h2 className="text-white text-2xl text-left md:text-4xl lg:text-5xl xl:text-5xl">
              Exhibit your art.
            </h2>
            <h2 className="text-white text-2xl text-left md:text-4xl lg:text-5xl xl:text-5xl">
              Connect with art lovers.
            </h2>
            <div className="w-full max-w-[280px] md:max-w-none md:w-5/6 lg:w-4/6 xl:w-1/2 2xl:max-w-[600px] mx-0 md:mx-0">
              <button
                onClick={handleArtistClick}
                className="bg-white text-pink-600 text-lg font-bold w-full py-4 mt-12 rounded-3xl hover:bg-pink-50 transition-colors duration-300"
              >
 {currentUser && isArtist() 
                  ? "Manage your art gallery"
                  : "Open your own art gallery"
                }              </button>
            </div>
          </div>
        </div>

        {/* Image Section */}
        <div className="relative w-full md:w-1/2 h-screen">
          {/* Gradient Overlay */}
          <div
            className="absolute inset-0 bg-gradient-to-b md:bg-gradient-to-r from-pink-600 via-pink-600/50 to-transparent z-20"
            aria-hidden="true"
          />
          {/* Main Image */}
          <img
            src="public/images/for-artist-hero.jpg"
            alt="Artist at work"
            className="absolute inset-0 w-full h-full object-cover object-center scale-100"
          />
        </div>
      </main>
    </>
  );
}
