import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate, useParams } from "react-router-dom";

const BRANDS = ["Natura", "Yanbal", "Ésika", "Cyzone", "L'Bel", "Maybelline"];

export default function ProductForm() {
  const nav = useNavigate();
  const { id } = useParams();
  const editing = Boolean(id);

  const [form, setForm] = useState({
    name: "",
    brand: BRANDS[0],
    price: "",
    description: "",
    image: null
  });

  useEffect(() => {
    const load = async () => {
      if (!editing) return;
      const { data } = await api.get("/products");
      const item = data.find(d => d._id === id);
      if (item) {
        setForm({
          name: item.name,
          brand: item.brand,
          price: item.price,
          description: item.description,
          image: null
        });
      }
    };
    load();
  }, [id]);

  const submit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("brand", form.brand);
    fd.append("price", form.price);
    fd.append("description", form.description);
    if (form.image) fd.append("image", form.image);

    try {
      if (editing) {
        await api.put(`/products/${id}`, fd, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      } else {
        await api.post("/products", fd, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      }
      nav("/products");
    } catch (err) {
      console.error(err);
      alert("Error al guardar el producto");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-slate-800 text-gray-100 p-6">
      <div className="w-full max-w-lg bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-xl border border-white/10">
        <h2 className="text-3xl font-bold mb-6 text-center">
          {editing ? "✏️ Editar producto" : "➕ Nuevo producto"}
        </h2>
        <form onSubmit={submit} className="space-y-4">
          <input
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            placeholder="Nombre"
            className="w-full bg-gray-800 text-gray-100 border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 rounded-lg p-3 outline-none"
          />
          <select
            value={form.brand}
            onChange={e => setForm({ ...form, brand: e.target.value })}
            className="w-full bg-gray-800 text-gray-100 border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 rounded-lg p-3 outline-none"
          >
            {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <input
            type="number"
            value={form.price}
            onChange={e => setForm({ ...form, price: e.target.value })}
            placeholder="Precio"
            className="w-full bg-gray-800 text-gray-100 border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 rounded-lg p-3 outline-none"
          />
          <textarea
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            placeholder="Descripción"
            className="w-full bg-gray-800 text-gray-100 border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 rounded-lg p-3 outline-none"
          />
          <input
            type="file"
            onChange={e => setForm({ ...form, image: e.target.files[0] })}
            accept="image/*"
            className="w-full text-gray-300 bg-gray-900 border border-gray-700 rounded-lg p-2 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
          />
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow-md transition duration-300">
            {editing ? "💾 Guardar cambios" : "🚀 Crear"}
          </button>
        </form>
      </div>
    </div>
  );
}
