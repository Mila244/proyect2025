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
    <div className="product-form-page">
      <div className="product-form-card animate-form">
        <h2 className="product-form-title">
          {editing ? "✏️ Editar producto" : "➕ Nuevo producto"}
        </h2>

        <form className="product-form" onSubmit={submit}>
          <input
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            placeholder="Nombre"
            className="pf-input"
          />

          <select
            value={form.brand}
            onChange={e => setForm({ ...form, brand: e.target.value })}
            className="pf-input"
          >
            {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
          </select>

          <input
            type="number"
            value={form.price}
            onChange={e => setForm({ ...form, price: e.target.value })}
            placeholder="Precio"
            className="pf-input"
          />

          <textarea
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            placeholder="Descripción"
            className="pf-input pf-textarea"
          />

          <input
            type="file"
            onChange={e => setForm({ ...form, image: e.target.files[0] })}
            accept="image/*"
            className="pf-input pf-file"
          />

          <button type="submit" className="pf-btn">
            {editing ? "💾 Guardar cambios" : "🚀 Crear"}
          </button>
        </form>
      </div>
    </div>
  );
}
