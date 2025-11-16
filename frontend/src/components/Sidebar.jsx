import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogOut, Home, Package, Menu } from "lucide-react";

export default function Sidebar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false); // estado de colapso

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const Item = ({ to, label, icon: Icon }) => (
    <Link to={to} className="sidebar-item">
      <Icon />
      {!collapsed && label}
    </Link>
  );

  return (
    <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      {/* Botón para colapsar */}
      <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
        <Menu />
      </button>

      {/* Logo / Título */}
      {!collapsed && <h1>BeautyStock AI</h1>}

      {/* Navegación */}
      <nav>
        <Item to="/" label="Inicio (Reconocimiento)" icon={Home} />
        <Item to="/products" label="Productos (CRUD)" icon={Package} />
        <Item to="/iot" label="Productos IoT" icon={Package} />
      </nav>

      {/* Botón de cerrar sesión */}
      <button onClick={logout} className="logout-btn">
        <LogOut />
        {!collapsed && "Cerrar sesión"}
      </button>
    </div>
  );
}
