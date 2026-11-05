
import { useState } from "react";

const TOKEN_URL = "http://127.0.0.1:8000/api/token/";

export default function Login({ onLogin }) {
  const [credenciales, setCredenciales] = useState({
    username: "",
    password: ""
  });

  const [error, setError] = useState("");
  const [autenticando, setAutenticando] = useState(false);

  function manejarCambio(e) {
    setCredenciales({
      ...credenciales,
      [e.target.name]: e.target.value
    });
  }

  async function iniciarSesion(e) {
    e.preventDefault();

    try {
      setAutenticando(true);
      setError("");

      const datosLogin = new URLSearchParams();
      datosLogin.append("username", credenciales.username);
      datosLogin.append("password", credenciales.password);

      const respuesta = await fetch(TOKEN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: datosLogin,
      });

      if (!respuesta.ok) {
        throw new Error("Usuario o contraseña incorrectos");
      }

      const datos = await respuesta.json();

      onLogin(datos.token);

      setCredenciales({
        username: credenciales.username,
        password: ""
      });

    } catch (err) {
      setError(err.message);

    } finally {
      setAutenticando(false);
    }
  }

  return (
    <section className="login-page">

      <div className="login-card">

        {/* Encabezado */}
        <div className="login-header">
          <h1>
            Game<span>Arena</span>
          </h1>

          <p>Sistema de gestión de videojuegos y torneos</p>
        </div>

        {/* Formulario */}
        <form onSubmit={iniciarSesion}>

          <h2>Iniciar sesión</h2>

          <p className="login-description">
            Ingresa tus credenciales para continuar.
          </p>

          {error && (
            <div className="alert alert-danger">
              {error}
            </div>
          )}

          <div className="mb-3">
            <label className="form-label">
              Usuario
            </label>

            <input
              type="text"
              className="form-control"
              name="username"
              placeholder="Ingresa tu usuario"
              value={credenciales.username}
              onChange={manejarCambio}
              autoComplete="username"
              required
            />
          </div>

          <div className="mb-4">
            <label className="form-label">
              Contraseña
            </label>

            <input
              type="password"
              className="form-control"
              name="password"
              placeholder="Ingresa tu contraseña"
              value={credenciales.password}
              onChange={manejarCambio}
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary login-button"
            disabled={autenticando}
          >
            {autenticando ? "Autenticando..." : "Iniciar sesión"}
          </button>

        </form>

        {/* Pie de tarjeta */}
        <div className="login-footer">
          GameArena © 2026
        </div>

      </div>

    </section>
  );
}
