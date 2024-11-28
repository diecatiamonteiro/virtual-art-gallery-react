import { useState } from "react";
import LogoAndTitle from "./LogoAndTitle";
import BurgerMenuBtn from "./BurgerMenuBtn";
import FullScreenMenu from "./FullScreenMenu";
import { MdFavorite, MdShoppingCart } from "react-icons/md";
import { FaShoppingCart, FaUser } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-hot-toast';

export default function Navbar({ isArtistPage, isArtLoversPage }) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isArtworkPage = location.pathname.includes('/artwork/');
  const { currentUser, cart, addToCart, removeFromCart, updateCartItemQuantity } = useAuth();
  const navigate = useNavigate();

  const handleFavoritesClick = () => {
    if (!currentUser) {
      toast.error('Please sign in to view favourites');
      navigate('/login');
      return;
    }
    navigate('/favorites');
  };


  const handleCartClick = async () => {
    navigate('/cart');
  
  }

  return (
    <>
      {/* Fixed Navbar */}
      <nav className="fixed top-0 left-0 w-full bg-transparent z-50">
        <div className="max-w-full mx-auto flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          <LogoAndTitle setIsOpen={setIsOpen} />

          {/* Icons container */}
          <div className="flex-1 flex justify-end items-center mr-14 md:mr-24 gap-4">
            {/* Existing Favorites and Cart icons - keep untouched */}
            {(isArtLoversPage || isArtworkPage) && !isOpen && (
              <>
                <button 
                  onClick={handleFavoritesClick}
                  className="flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 bg-blue-700 text-white hover:text-red-400 transition-colors"
                >
                  <MdFavorite className="text-md lg:text-xl" />
                </button>
                <button 
                  onClick={() => navigate('/cart')}
                  className="flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 bg-blue-700 text-white hover:text-blue-300 transition-colors relative p-2"
                >
                  <MdShoppingCart className="text-2xl" />
                  {cart.length > 0 && (
                    <span className="absolute -top-1 -right-3 bg-green-500 text-black text-xs w-5 h-5 rounded-full flex items-center justify-center">
                      {cart.reduce((total, item) => total + (item.quantity || 1), 0)}
                    </span>
                  )}
                </button>
              </>
            )}
            
            {/* Add user icon for logged in users */}
            {currentUser && (
              <button 
                onClick={() => navigate('/dashboard')}
                className="flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 border border-black border-2 text-black-700 hover:bg-green-500 transition-colors"
              >
                <FaUser className="text-md lg:text-xl" />
              </button>
            )}
          </div>

          <BurgerMenuBtn
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            isArtistPage={isArtistPage}
            isArtLoversPage={isArtLoversPage}
          />
        </div>
      </nav>

      {/* Full-screen Menu */}
      <FullScreenMenu isOpen={isOpen} setIsOpen={setIsOpen} />
    </>
  );
}
