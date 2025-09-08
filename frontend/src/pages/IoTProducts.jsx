import { useEffect, useState } from "react";
import axios from "../api/axios";

export default function IoTProducts() {
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const res = await axios.get("/api/productos"); // Endpoint MongoDB IoT
        setProductos(res.data);
      } catch (error) {
        console.error("Error al obtener productos IoT:", error);
      }
    };

    fetchProductos();
    const interval = setInterval(fetchProductos, 5000); // Actualiza cada 5s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-indigo-400">Productos Detectados (IoT)</h1>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="px-4 py-2">ID Registro</th>
            <th className="px-4 py-2">ID Producto</th>
            <th className="px-4 py-2">Nombre</th>
            <th className="px-4 py-2">Marca</th>
            <th className="px-4 py-2">Precio</th>
            <th className="px-4 py-2">Fecha/Hora</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((p, i) => (
            <tr key={i} className="border-b border-gray-700">
              <td className="px-4 py-2">{p.idRegistro}</td>
              <td className="px-4 py-2">{p.idProducto}</td>
              <td className="px-4 py-2">{p.name}</td>         {/* nombre corregido */}
              <td className="px-4 py-2">{p.brand}</td>        {/* marca corregida */}
              <td className="px-4 py-2">S/.{p.price}</td>     {/* precio corregido */}
              <td className="px-4 py-2">{p.fechaHora}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
