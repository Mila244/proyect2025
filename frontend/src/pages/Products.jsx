import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { Link } from "react-router-dom";

export default function Products() {
  const [items, setItems] = useState([]);

  const load = async () => {
    const { data } = await api.get("/products"); // 👈 correcto
    setItems(data);
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id) => {
    if (!confirm("¿Eliminar producto?")) return;
    await api.delete(`/products/${id}`);
    load();
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-black to-slate-800 text-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold tracking-wide">📦 Productos</h2>
          <Link
            to="/products/new"
            className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-md transition duration-300"
          >
            ➕ Agregar
          </Link>
        </div>

        {/* Lista */}
        {items.length === 0 ? (
          <p className="text-gray-400">No hay productos.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((p) => (
              <div
                key={p._id}
                className="bg-white/10 backdrop-blur-md p-6 rounded-xl shadow-lg border border-white/10 hover:scale-[1.02] transition duration-300"
              >
                <h3 className="font-semibold text-xl mb-2">{p.name}</h3>
                <p className="text-gray-300">
                  <b>Marca:</b> {p.brand}
                </p>
                <p className="text-gray-300">
                  <b>Precio:</b> S/.{p.price}
                </p>
                <p className="text-gray-400 line-clamp-3">
                  <b>Descripción:</b> {p.description}
                </p>
                <div className="mt-4 flex gap-3">
                  <Link
                    to={`/products/edit/${p._id}`}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition duration-300"
                  >
                    ✏️ Editar
                  </Link>
                  <button
                    onClick={() => remove(p._id)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-md transition duration-300"
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
