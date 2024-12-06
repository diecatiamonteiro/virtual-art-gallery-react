import { Link } from "react-router-dom";
import { GrVirtualMachine } from "react-icons/gr";

export default function LogoAndTitle({ setIsOpen, isArtLoversPage }) {
  // Don't render anything if it's the art lovers page
  if (isArtLoversPage) {
    return null;
  }

  return (
    <Link
      to="/"
      className="text-xl font-bold flex items-center"
      onClick={() => setIsOpen && setIsOpen(false)}
    >
      <GrVirtualMachine className="w-5 h-5 md:w-6 md:h-6" />
      <span className="leading-none text-left font-medium uppercase text-lg ml-2 md:text-2xl md:ml-3">
        The Frame
      </span>
    </Link>
  );
}
