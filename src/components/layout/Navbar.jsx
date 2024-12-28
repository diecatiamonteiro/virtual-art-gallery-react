import { useState } from "react";
import LogoAndTitle from "./LogoAndTitle";
import BurgerMenuBtn from "./BurgerMenuBtn";
import FullScreenMenu from "./FullScreenMenu";
import { MdFavorite } from "react-icons/md";
import { BsCartFill } from "react-icons/bs";
import { FaUser } from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Navbar({
  isArtistPage,
  isArtLoversPage,
  isHomePage,
  isArtistDashboard,
  isDashboard,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser, cart, isArtist } = useAuth();
  const navigate = useNavigate();

  const handleFavoritesClick = () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    navigate("/favorites");
  };

  return (
    <>
      {/* Fixed Navbar */}
      <nav className="fixed top-0 left-0 w-full bg-white bg-opacity-20 shadow z-50">
        <div className="max-w-full mx-auto flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          <LogoAndTitle setIsOpen={setIsOpen} />

          {/* Icons container */}
          <div className="flex-1 flex justify-end items-center mr-14 md:mr-24 gap-4">
            {/* Favorites */}
            <button
              data-testid="favorites-button"
              onClick={handleFavoritesClick}
              className="flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 border border-black border-2 text-black-700 hover:bg-black hover:text-white active:text-green-500 transition-all"
            >
              <MdFavorite className="text-md lg:text-xl" />
            </button>

            {/* Cart */}
            <button
              data-testid="cart-button"
              onClick={() => navigate("/cart")}
              className="flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 border border-black border-2 hover:bg-black hover:text-white relative p-2 active:text-green-500 transition-all"
            >
              <BsCartFill className="text-md lg:text-xl" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-3 bg-green-300 text-black border border-black text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {cart.reduce(
                    (total, item) => total + (item.quantity || 1),
                    0
                  )}
                </span>
              )}
            </button>

            {/* User */}
            <button
              data-testid="user-button"
              onClick={() => {
                if (!currentUser) {
                  navigate("/login");
                  return;
                }
                // Route to appropriate dashboard based on user type
                if (isArtist()) {
                  navigate("/artist-dashboard");
                } else {
                  navigate("/dashboard");
                }
              }}
              className="flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 border border-black border-2 hover:bg-black hover:text-white active:text-green-500 transition-all"
            >
              <FaUser className="text-md lg:text-xl" />
            </button>
          </div>

          {/* Burger Menu */}
          <BurgerMenuBtn
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            isArtistPage={isArtistPage}
            isArtLoversPage={isArtLoversPage}
            isHomePage={isHomePage}
            isArtistDashboard={isArtistDashboard}
            isDashboard={isDashboard}
          />
        </div>
      </nav>

      {/* Full-screen Menu */}
      <FullScreenMenu isOpen={isOpen} setIsOpen={setIsOpen} />
    </>
  );
}
