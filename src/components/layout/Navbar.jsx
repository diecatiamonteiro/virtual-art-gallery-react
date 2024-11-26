import { useState } from "react";
import LogoAndTitle from "./LogoAndTitle";
import BurgerMenuBtn from "./BurgerMenuBtn";
import FullScreenMenu from "./FullScreenMenu";
import { MdFavorite } from "react-icons/md";
import { FaShoppingCart } from "react-icons/fa";

export default function Navbar({ isArtistPage, isArtLoversPage }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Fixed Navbar */}
      <nav className="fixed top-0 left-0 w-full bg-transparent z-50">
        <div className="max-w-full mx-auto flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          <LogoAndTitle setIsOpen={setIsOpen} />

          {/* Icons Favourites and Cart*/}
          <div className="flex-1 flex justify-end items-center mr-14 md:mr-24 gap-4">
            {isArtLoversPage && !isOpen && (
              <>
                <button className="flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 bg-blue-700 rounded-full text-white hover:text-red-400 transition-colors">
                  <MdFavorite className="text-md lg:text-xl" />
                </button>
                <button className="flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 bg-blue-700 rounded-full text-white hover:text-blue-300 transition-colors">
                  <FaShoppingCart className="text-md lg:text-xl" />
                </button>
              </>
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
