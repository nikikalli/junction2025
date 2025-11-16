import { useNavigate } from "react-router-dom";
import logo from "../img/sephira_logo.png";
import { Button } from "./ui/button";

export function Nav() {
  const navigate = useNavigate();
  return (
    <nav className="w-full py-4 px-8 backdrop-blur-xl flex flex-wrap md:flex-nowrap md:justify-between bg-black gap-4">
      <img src={logo} className="w-40 h-fit" alt="Sephira Logo" />

      <div className="flex items-center flex-wrap gap-4 text-white">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
          Home
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/sas-viya-case-study")}
        >
          <span className="word-wrap">SAS Viya case study</span>
        </Button>
        <span className="text-sm text-gray-400">ImpaktiRyhäm</span>
      </div>
    </nav>
  );
}
