import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogOut, Home, Package } from "lucide-react";

export default function Sidebar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const Item = ({ to, label, icon: Icon }) => (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300
      ${
        pathname === to
          ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg scale-[1.02]"
          : "text-gray-300 hover:bg-white/10 hover:text-white"
      }`}
    >
      <Icon className="w-5 h-5" />
      {label}
    </Link>
  );

  return (
    <div className="w-64 h-screen p-6 flex flex-col border-r border-white/10 
      bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-gray-200">
      
      {/* Logo */}
      <h1 className="text-2xl font-bold mb-8 text-indigo-400 text-center tracking-wide">
        BeautyStock AI
      </h1>

      {/* Navegación */}
      <nav className="space-y-3 flex-1">
        <Item to="/" label="Inicio (Reconocimiento)" icon={Home} />
        <Item to="/products" label="Productos (CRUD)" icon={Package} />
      </nav>

      {/* Botón de cerrar sesión */}
      <button
        onClick={logout}
        className="flex items-center justify-center gap-2 bg-red-500/90 hover:bg-red-600 
        text-white font-medium py-3 rounded-lg transition-all duration-300 shadow-lg hover:scale-[1.03]"
      >
        <LogOut className="w-5 h-5" />
        Cerrar sesión
      </button>
    </div>
  );
}
