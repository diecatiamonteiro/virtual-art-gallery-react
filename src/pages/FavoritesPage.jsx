import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { FaTrash } from "react-icons/fa";
import { toast } from 'react-hot-toast';
import { MdArrowBack } from "react-icons/md";

export default function FavoritesPage() {
  const { currentUser, toggleFavorite } = useAuth();
  const navigate = useNavigate();

  const handleRemoveFavorite = async (artwork) => {
    try {
      await toggleFavorite(artwork);
      toast.success('Removed from favourites');
    } catch (error) {
      toast.error('Error removing from favourites');
    }
  };

  if (!currentUser?.favorites || currentUser.favorites.length === 0) {
    return (
      <div className="pt-12 pb-20 px-4 container mx-auto min-h-screen">
        <h1 className="text-3xl font-bold mb-8">My Favourites</h1>
        <div className="text-center py-12">
          <p className="text-gray-500">No favourites yet</p>
          <button
            onClick={() => navigate('/for-art-lovers')}
            className="mt-4 bg-blue-700 text-white px-6 py-2 rounded-lg hover:bg-blue-800"
          >
            Explore Gallery
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-12 pb-20 px-4 container mx-auto min-h-screen">
      <h1 className="text-3xl font-bold mb-8">My Favourites</h1>
      
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentUser.favorites.map((artwork) => (
          <div 
            key={artwork.id}
            className="relative bg-white rounded-lg shadow-md overflow-hidden"
          >
            <img
              src={artwork.imageUrl}
              alt={artwork.title}
              className="w-full h-64 object-cover cursor-pointer"
              onClick={() => navigate(`/artwork/${artwork.id}`, {
                state: {
                  size: artwork.size,
                  price: artwork.price,
                  fromFavorites: true
                }
              })}
            />
            
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">{artwork.title}</h2>
              <p className="text-gray-600">{artwork.artist}</p>
              <div className="flex justify-between items-center mt-4">
                <span className="text-lg font-bold">€{artwork.price}</span>
                <button
                  onClick={() => handleRemoveFavorite(artwork)}
                  className="text-red-500 hover:text-red-700 p-2"
                  title="Remove from favorites"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
