import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Navbar from "../components/layout/Navbar";
export default function HomePage() {
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
          userEmail: currentUser.email,
        },
      });
    }
  };

  const handleArtLoverClick = () => {
    navigate("/for-art-lovers");
  };

  return (
    <>
      {/* Navbar */}
      <Navbar isHomePage={true} />

      <main className="fixed inset-0 w-screen  h-screen flex flex-col items-center justify-center md:overflow-hidden">
        {/* Background Video */}
        <video
          poster="public/images/home-poster-hero.png"
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-0 left-0 min-w-full min-h-full w-full h-full object-cover -z-10"
        >
          <source src="public/videos/home-video-hero.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Video overlay (adds a blue layer to video)*/}
        <div className="absolute inset-0 bg-blue-500/20 -z-10"></div>

        {/* Content Section */}
        <div className="flex flex-col max-w-8xl px-6">
          {/* Header Section */}
          <div className="flex flex-col items-start md:items-center lg:items-center xl:items-start w-full">
            <h1
              className="text-gray-600 font-bold text-left md:text-center lg:text-center xl:text-left text-6xl md:text-8xl lg:text-9xl xl:text-9xl"
              style={{ fontFamily: "var(--heading-font)" }}
            >
              The Frame
            </h1>
            <h2 className="text-gray-600 text-2xl text-left md:text-center lg:text-center xl:text-left font-normal md:text-4xl lg:text-5xl xl:text-5xl">
              Your Online Art Gallery
            </h2>
          </div>

          {/* Options Section */}
          <div className="flex flex-col md:flex-row flex-wrap gap-12 justify-center mt-12">
            {/* For artists */}
            <div className="flex flex-col flex-wrap items-start md:items-center lg:items-center xl:items-start max-w-xs md:max-w-xl lg:max-w-xl">
              <h3 className="text-white font-bold text-2xl lg:text-4xl text-left md:text-center lg:text-center xl:text-left [text-shadow:_2px_2px_8px_rgb(0_0_0_/_40%)]">
                For artists
              </h3>
              <p className="text-white text-lg my-4 text-left md:text-center lg:text-center xl:text-left md:text-2xl md:mb-8 [text-shadow:_1px_1px_6px_rgb(0_0_0_/_40%)]">
                Exhibit your unique creations and gain exposure to a wider
                audience. Sell your art directly.
              </p>
              <div className="w-full md:w-1/2">
                <button
                  onClick={handleArtistClick}
                  className="bg-pink-600 text-white text-lg font-bold w-full py-4 rounded-3xl hover:bg-pink-700 transition-colors duration-300"
                >
                  {currentUser && isArtist()
                    ? "Manage your art gallery"
                    : "Open your own art gallery"}
                </button>
              </div>
              <p className="text-white text-xs mt-2 pl-12 md:pl-0 lg:pl-0 xl:pl-12 md:text-lg [text-shadow:_1px_1px_4px_rgb(0_0_0_/_40%)]">
                Sign up for free.
              </p>
            </div>
            {/* For art lovers */}
            <div className="flex flex-col flex-wrap items-start md:items-center lg:items-center xl:items-start max-w-xs md:max-w-xl lg:max-w-xl">
              <h3 className="text-white font-bold text-2xl lg:text-4xl text-left md:text-center lg:text-center xl:text-left [text-shadow:_2px_2px_8px_rgb(0_0_0_/_40%)]">
                For art lovers
              </h3>
              <p className="text-white text-lg my-4 text-left md:text-center lg:text-center xl:text-left md:text-2xl md:mb-8 [text-shadow:_1px_1px_6px_rgb(0_0_0_/_40%)]">
                Visit art exhibitions from the comfort of your browser. Buy art
                directly from the artist.
              </p>
              <div className="w-full md:w-1/2">
                <button
                  onClick={handleArtLoverClick}
                  className="bg-blue-700 text-white text-lg font-bold w-full py-4 rounded-3xl hover:bg-blue-800 transition-colors duration-300"
                >
                  Discover art exhibitions
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
