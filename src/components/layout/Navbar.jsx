import { useState } from "react";
import LogoAndTitle from "./LogoAndTitle";
import BurgerMenuBtn from "./BurgerMenuBtn";
import FullScreenMenu from "./FullScreenMenu";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Fixed Navbar */}
      <nav className="fixed top-0 left-0 w-full bg-transparent z-50">
        <div className="max-w-full mx-auto flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          <LogoAndTitle setIsOpen={setIsOpen} />
          <BurgerMenuBtn isOpen={isOpen} setIsOpen={setIsOpen} />
        </div>
      </nav>

      {/* Full-screen Menu */}
      <FullScreenMenu isOpen={isOpen} setIsOpen={setIsOpen} />
    </>
  );
}
