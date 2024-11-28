import { useEffect, useState, useCallback } from "react";
import Navbar from "../components/layout/Navbar";
import { FaRegHeart, FaHeart } from "react-icons/fa";
import { MdAddShoppingCart } from "react-icons/md";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-hot-toast"; // for notifications
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";

export default function ForArtLoversPage() {
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastScrollPosition, setLastScrollPosition] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, toggleFavorite, isArtworkFavorited, cart, addToCart } =
    useAuth();

  // Add useCallback to memoize the fetch function
  const fetchArtworks = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch published artist artworks from Firestore
      const artworksRef = collection(db, "artworks");
      const q = query(artworksRef, where("isPublished", "==", true));
      const querySnapshot = await getDocs(q);
      const publishedArtworks = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
        date: doc.data().date,
      }));
      // Fetch Unsplash artworks
      const response = await fetch(
        "https://api.unsplash.com/search/photos?" +
          "query=contemporary+modern+fine+art+painting+exhibition+gallery+-photo+-artist+-camera+-supplies+-brushes+-pencil+-crayons&" +
          "per_page=30&" +
          "orientation=landscape",
        {
          headers: {
            Authorization: `Client-ID ${
              import.meta.env.VITE_UNSPLASH_ACCESS_KEY
            }`,
          },
        }
      );
      const data = await response.json();
      // Add random price to each Unsplash artwork
      const unsplashArtworks = data.results.map((artwork) => ({
        ...artwork,
        price: (Math.floor(Math.random() * 500) + 1) * 5,
      }));
      // Combine both sources of artworks
      const combinedArtworks = [...publishedArtworks, ...unsplashArtworks];
      setArtworks(combinedArtworks);
    } catch (error) {
      console.error("Error fetching artworks:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []); // ********** end of useCallback

  useEffect(() => {
    fetchArtworks();
  }, [fetchArtworks]);

  // Scroll to the position where the user was before clicking on an artwork
  useEffect(() => {
    if (location.state?.fromArtwork && location.state?.returnToPosition) {
      setTimeout(() => {
        window.scrollTo({
          top: location.state.returnToPosition,
          behavior: "instant",
        });
      }, 100);
    }
  }, [location]);

  const handleFavoriteClick = async (e, artwork) => {
    e.stopPropagation();
    try {
      if (!currentUser) {
        toast.error("Please sign in to save favourites");
        return;
      }
      const isNowFavorited = await toggleFavorite({
        id: artwork.id,
        alt_description: artwork.alt_description,
        title: artwork.title,
        urls: artwork.urls,
        user: artwork.user,
        price: artwork.price,
        size: artwork.size,
        created_at: artwork.created_at,
        description: artwork.description,
        tags: artwork.tags,
      });
      toast.success(
        isNowFavorited ? "Added to favourites" : "Removed from favourites"
      );
    } catch (error) {
      console.error("Error toggling favourite:", error);
      toast.error(error.message || "Error updating favourites");
    }
  };

  const handleAddtoCart = async (e, artwork) => {
    e.stopPropagation();
    await addToCart({
      id: artwork.id,
      alt_description: artwork.alt_description,
      title: artwork.title,
      urls: artwork.urls,
      user: artwork.user,
      price: artwork.price,
      size: artwork.size,
    });
  };

  return (
    <div className="overflow-x-hidden">
      <Navbar isArtLoversPage={true} />

      {/* Hero Section */}
      <div className="w-[100vw] h-[100vh] flex flex-wrap items-center justify-between -mt-[80px]">
        <div className="flex flex-col w-full px-6 mt-[30px]">
          <div className="flex flex-col items-start w-full pt-16 pl-0 md:pt-0 xl:pl-10">
            <h1
              className="text-blue-700 font-bold text-left text-6xl pb-6 md:text-8xl md:leading-none lg:text-8xl xl:text-9xl"
              style={{ fontFamily: "var(--heading-font)" }}
            >
              For Art Lovers
            </h1>
            <h2 className="text-blue-700 text-2xl text-left md:text-4xl lg:text-5xl xl:text-5xl">
              Discover unique artworks.
            </h2>
            <h2 className="text-blue-700 text-2xl text-left md:text-4xl lg:text-5xl xl:text-5xl">
              Support independent artists.
            </h2>
            <div className="w-full max-w-[300px] md:w-5/6 lg:w-4/6 xl:w-1/3 2xl: mx-0">
              <button
                className="bg-blue-700 text-white text-lg font-bold w-full py-4 mt-12 rounded-3xl"
                onClick={() => {
                  document
                    .getElementById("gallery")
                    .scrollIntoView({ behavior: "smooth" });
                }}
              >
                Explore Gallery
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Section - Position it below the viewport */}
      <div className="relative mt-20">
        <section id="gallery" className="w-full bg-white py-20">
          <div className="container mx-auto px-4 md:px-12 2xl:px-24">
            {/* Loading State */}
            {loading && (
              <div className="text-center">
                <p>Loading artworks...</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center text-red-600">
                <p>{error}</p>
              </div>
            )}

            {/* Gallery Grid */}
            {!loading && !error && artworks.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {artworks.map((artwork) => {
                  return (
                    <div
                      key={artwork.id}
                      className="rounded-lg overflow-hidden shadow-lg bg-white hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                      onClick={() => {
                        setLastScrollPosition(window.scrollY);
                        navigate(`/artwork/${artwork.id}`, {
                          state: {
                            size: artwork.size,
                            price: artwork.price,
                            scrollPosition: window.scrollY,
                          },
                        });
                      }}
                    >
                      {/* Image container with icons */}
                      <div className="relative h-64 bg-slate-100">
                        <img
                          src={artwork.urls.regular}
                          alt={artwork.alt_description}
                          className="w-full h-full object-cover"
                        />
                        {/* Icons - Stop propagation to prevent navigation when clicking icons */}
                        <div
                          className="absolute top-0 right-0 p-4 flex gap-3"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            className="bg-white/90 hover:bg-white p-2 rounded-full text-gray-700 hover:text-red-400 transition-all duration-300 hover:scale-110"
                            onClick={(e) => handleFavoriteClick(e, artwork)}
                            aria-label={
                              isArtworkFavorited(artwork.id)
                                ? "Remove from favourites"
                                : "Add to favourites"
                            }
                            title={
                              isArtworkFavorited(artwork.id)
                                ? "Remove from favourites"
                                : "Add to favourites"
                            }
                          >
                            {isArtworkFavorited(artwork.id) ? (
                              <FaHeart className="text-xl text-red-500" />
                            ) : (
                              <FaRegHeart className="text-xl" />
                            )}
                          </button>
                          <button
                            className="bg-white/90 hover:bg-white p-2 rounded-full text-gray-700 hover:text-blue-500 transition-all duration-300 hover:scale-110"
                            aria-label="Add to cart"
                            title="Add to cart"
                            onClick={(e) => handleAddtoCart(e, artwork)}
                          >
                            <MdAddShoppingCart className="text-xl" />
                          </button>
                        </div>
                        {/* Price and size tags */}
                        <div className="absolute bottom-0 left-0 m-4 flex gap-2">
                          <span className="bg-black/70 text-white px-3 py-1 rounded-full">
                            €
                            {artwork.price
                              ? parseFloat(artwork.price).toFixed(2)
                              : "25.00"}
                          </span>
                        </div>
                      </div>

                      {/* Art info container */}
                      <div className="p-4">
                        <h2 className="text-xl font-semibold mb-2">
                          {artwork.title || artwork.alt_description}
                        </h2>
                        <p className="text-gray-600">{artwork.user.name}</p>
                        <p className="text-gray-600">
                          {artwork.date ? new Date(artwork.date).getFullYear() : "Unknown Year"}
                        </p>
                        <p className="text-gray-400 py-1">
                          W {artwork.size?.width}cm × H {artwork.size?.height}cm
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
