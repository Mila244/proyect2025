import React, { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import logo from "/logo.jpeg"; // logo en public

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", data.token);
      nav("/");
    } catch (e) {
      alert("Credenciales inválidas");
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center relative text-white">
      {/* Fondo degradado */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-900 to-indigo-900"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-purple-700/40 via-transparent to-black"></div>

      {/* Card con logo */}
      <div className="relative z-10 backdrop-blur-md bg-white/10 p-8 rounded-2xl shadow-2xl max-w-sm w-full border border-white/20 text-center">
        {/* Logo arriba */}
        <img
          src={logo}
          alt="Logo"
          className="w-20 h-20 mx-auto mb-4 rounded-full shadow-lg"
        />

        <h2 className="text-3xl font-bold mb-6 text-white drop-shadow-lg">
          Iniciar sesión
        </h2>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <input
              className="w-full px-4 py-2 border border-gray-300/20 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300 bg-white/20 text-white placeholder-gray-300"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <input
              type="password"
              className="w-full px-4 py-2 border border-gray-300/20 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300 bg-white/20 text-white placeholder-gray-300"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-md font-semibold hover:bg-indigo-700 transition duration-300 shadow-lg"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
