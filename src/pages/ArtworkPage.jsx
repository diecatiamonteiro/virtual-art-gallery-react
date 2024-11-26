import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { FaRegHeart } from "react-icons/fa";
import { MdAddShoppingCart, MdArrowBack } from "react-icons/md";

export default function ArtworkPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [artwork, setArtwork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchArtwork() {
      try {
        const response = await fetch(`https://api.unsplash.com/photos/${id}`, {
          headers: {
            Authorization: `Client-ID ${
              import.meta.env.VITE_UNSPLASH_ACCESS_KEY
            }`,
          },
        });

        if (!response.ok) {
          throw new Error("Artwork not found");
        }

        const data = await response.json();
        setArtwork(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchArtwork();
  }, [id]);

  if (loading) return <div className="text-center mt-10">Loading...</div>;
  if (error)
    return <div className="text-center mt-10 text-red-600">{error}</div>;
  if (!artwork)
    return <div className="text-center mt-10">Artwork not found</div>;

  // Get size and price from location state (from ForArtLoversPage), if not available, generate random values
  const size = location.state?.size || {
    width: Math.floor(Math.random() * (150 - 50) + 50),
    height: Math.floor(Math.random() * (200 - 70) + 70),
  };

  const price =
    location.state?.price || Math.floor(Math.random() * (4000 - 1000) + 500);

  return (
    <div className="container mx-auto px-4 py-10">
      <button
        onClick={() => {
          navigate('/for-art-lovers', {
            state: { 
              returnToPosition: location.state?.scrollPosition,
              fromArtwork: true
            }
          });
        }}
        className="flex items-center gap-2 mb-6 text-gray-600 hover:text-gray-900"
      >
        <MdArrowBack /> Back to Gallery
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image Section */}
        <div className="relative">
          <img
            src={artwork.urls.regular}
            alt={artwork.alt_description || "Untitled Artwork"}
            className="w-full rounded-lg shadow-lg"
          />
          <div className="absolute top-4 right-4 flex gap-3">
            <button
              className="bg-white/90 p-3 rounded-full shadow-lg hover:scale-110 hover:bg-white hover:text-red-500 transition-all duration-300 hover:scale-110"
              aria-label="Add to favourites" // for screen readers
              title="Add to favourites"
            >
              <FaRegHeart className="text-xl" />
            </button>
          </div>
        </div>

        {/* Artwork title */}
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">
            {artwork.alt_description.charAt(0).toUpperCase() +
              artwork.alt_description.slice(1).toLowerCase() ||
              "Untitled Artwork"}
          </h1>

          {/* Artist info */}
          <div className="flex items-center space-x-4">
            <img
              src={artwork.user.profile_image.medium}
              alt={artwork.user.name}
              className="w-12 h-12 rounded-full"
            />
            <div>
              <h2 className="font-semibold">
                {artwork.user.name || "Unknown Artist"}
              </h2>
              <p className="text-gray-600">
                {artwork.user.location || "Unknown Artist Location"}
              </p>
            </div>
          </div>

          {/* Price and size */}
          <div className="space-y-2">
            <p className="text-2xl font-bold">€{price}</p>
            <p className="text-gray-600">
              W {size.width}cm × H {size.height}cm
            </p>
            <p className="text-gray-600">
              {new Date(artwork.created_at).toLocaleDateString()}
            </p>
            <p className="flex items-center gap-2 pt-4">
              <FaRegHeart className="text-lg" />
              {artwork.user.total_likes} likes
            </p>
          </div>

          <button className="w-1/3 w-max-[200px] text-white py-3 rounded-lg bg-green-500 hover:bg-green-600 transition-colors">
            Add to Cart
          </button>
        </div>

        <div>
          {artwork.description && (
            <div>
              <h3 className="font-semibold mb-2">About this artwork</h3>
              <p className="text-gray-700 mb-8">{artwork.description}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            {artwork.tags?.map((tag, index) => (
              <span
                key={index}
                className="bg-gray-200 px-3 py-1 rounded-full text-sm"
              >
                #{tag.title}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}