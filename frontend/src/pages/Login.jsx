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
    <div>
  {/* Card con logo */}
  <div className="login-card">
    <img src={logo} alt="Logo" />
    <h2>Iniciar sesión</h2>
    <form onSubmit={submit}>
      <div>
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <button type="submit">Entrar</button>
    </form>
  </div>
</div>
  );
}
