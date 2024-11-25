export default function BurgerMenuBtn({ isOpen, setIsOpen, isArtistPage }) {
  return (
    <button
      onClick={() => setIsOpen(!isOpen)}
      className={`fixed top-3 right-4 sm:right-6 lg:right-8 z-50 w-8 h-8 md:w-10 md:h-10 ${
        isArtistPage && !isOpen ? "backdrop-blur-sm" : ""
      }`}
    >
      <div
        className={`relative w-8 h-8 md:w-10 md:h-10 border-2 transition-all duration-300 ${
          isOpen
            ? "bg-green-500 hover:bg-white border-black"
            : isArtistPage
            ? "border-white bg-white/30 hover:bg-pink-600"
            : "border-black hover:bg-white"
        }`}
      >
        {/* Top bar */}
        <span
          className={`absolute h-0.5 w-5 md:w-6 transform transition-all duration-300 ease-in-out ${
            isOpen ? "bg-black" : isArtistPage ? "bg-white" : "bg-black"
          } ${
            isOpen
              ? "rotate-45 top-[13px] md:top-[18px] left-[4px] md:left-[6px]"
              : "rotate-0 top-[10px] md:top-[13px] left-[4px] md:left-[6px]"
          }`}
        />

        {/* Bottom bar */}
        <span
          className={`absolute h-0.5 w-5 md:w-6 transform transition-all duration-300 ease-in-out ${
            isOpen ? "bg-black" : isArtistPage ? "bg-white" : "bg-black"
          } ${
            isOpen
              ? "-rotate-45 top-[13px] md:top-[17px] left-[4px] md:left-[6px]"
              : "rotate-0 top-[16px] md:top-[21px] left-[4px] md:left-[6px]"
          }`}
        />
      </div>
    </button>
  );
}
