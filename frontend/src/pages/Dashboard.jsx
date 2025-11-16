import React, { useState, useEffect } from "react";
import CameraScanner from "../components/CameraScanner";
import api from "../api/axios";

const brands = ["Natura", "Yanbal", "Esika", "Cyzone", "Lebel", "Maybelline"];

export default function Dashboard() {
  // Estado predicción cámara
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Estado productos
  const [products, setProducts] = useState([]);
  const [name, setName] = useState("");
  const [brand, setBrand] = useState(brands[0]);
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null);

  // Captura de cámara
  const onCapture = async (file) => {
    setLoading(true);
    const fd = new FormData();
    fd.append("image", file);
    try {
      const { data } = await api.post("/predict", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(data);
    } catch (e) {
      console.error(e);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  // Fetch productos desde backend
  const fetchProducts = async () => {
    const { data } = await api.get("/products"); // ✅ cambiar /products/list a /products
    setProducts(data);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Registrar producto
  const submitProduct = async (e) => {
    e.preventDefault();
    if (!image) return alert("Selecciona una imagen");

    const fd = new FormData();
    fd.append("name", name);
    fd.append("brand", brand);
    fd.append("price", price);
    fd.append("image", image);

    await api.post("/products/add", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    setName("");
    setPrice("");
    setImage(null);
    fetchProducts();
  };

  // Eliminar producto
  const deleteProduct = async (pname) => {
    await api.delete(`/products/delete/${pname}`);
    fetchProducts();
  };

  return (
    <div className="p-6 grid gap-6">
      {/* Cámara */}
      <div>
        <p></p>
        <h2 className="text-12xl font-extrabold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 drop-shadow-lg">
          Reconocimiento con cámara </h2>
        <CameraScanner onCapture={onCapture} />
        {loading && <p className="">Analizando...</p>}
        {result && (
          <div className="">
            <p><b>Nombre:</b> {result.name}</p>
            <p><b>Marca:</b> {result.brand}</p>
            <p><b>Precio:</b> S/.{result.price}</p>
            <p><b>Descripción:</b> {result.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}