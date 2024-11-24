import { Link } from "react-router-dom";
import { GrVirtualMachine } from "react-icons/gr";

export default function LogoAndTitle({ setIsOpen }) {
  return (
    <Link
      to="/"
      className="text-xl font-bold flex items-center transform transition-all duration-200 hover:scale-105"
      onClick={() => setIsOpen && setIsOpen(false)}
    >
      <GrVirtualMachine className="w-5 h-5 md:w-6 md:h-6 transition-transform duration-200 hover:rotate-12" />
      <span className="leading-none text-left font-medium uppercase text-lg ml-2 md:text-2xl md:ml-3">
        The Frame
      </span>
    </Link>
  );
}
