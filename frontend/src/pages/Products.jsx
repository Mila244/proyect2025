import { useState, useEffect } from "react";
import api from "../api/axios";
import { Link } from "react-router-dom";

export default function Products() {
  const [items, setItems] = useState([]);

  const load = async () => {
    const { data } = await api.get("/products");
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
    <div className="products-container">
      <div className="products-wrapper">
        <div className="products-header">
          <h2 className="products-title">📦 Productos</h2>

          <Link to="/products/new" className="btn-add">
            ➕ Agregar
          </Link>
        </div>

        {items.length === 0 ? (
          <p className="products-empty">No hay productos registrados.</p>
        ) : (
          <div className="products-grid">
            {items.map((p) => (
              <div key={p._id} className="product-card">
                <h3 className="product-title">{p.name}</h3>

                <p className="product-text">
                  <b className="product-label">Marca:</b> {p.brand}
                </p>

                <p className="product-text">
                  <b className="product-label">Precio:</b> S/. {p.price}
                </p>

                <p className="product-desc">
                  <b className="product-label">Descripción:</b> {p.description}
                </p>

                <div className="product-buttons">
                  <Link to={`/products/edit/${p._id}`} className="btn-edit">
                    ✏️   Editar
                  </Link>

                  <button onClick={() => remove(p._id)} className="btn-delete">
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
