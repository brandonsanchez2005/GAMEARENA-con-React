
import { useState } from "react";
import Login from "./pages/Login";
import Videojuegos from "./pages/Videojuegos";
import Jugadores from "./pages/Jugadores";
import Torneos from "./pages/Torneos";

export default function App() {
  const [token, setToken] = useState("");
  const [pagina, setPagina] = useState("videojuegos");

  function cerrarSesion() {
    setToken("");
    setPagina("videojuegos");
  }

  if (!token) return <Login onLogin={setToken} />;

  return (
    <main className="min-vh-100">

      {/* Barra de navegación */}
      <nav className="navbar navbar-expand navbar-dark shadow">
        <div className="container d-flex flex-wrap justify-content-between gap-3">

          {/* Nombre del sistema */}
          <span className="navbar-brand mb-0">
            Game<span className="text-info">Arena</span>
          </span>

          {/* Opciones de navegación */}
          <div className="d-flex flex-wrap align-items-center gap-2">

            <button
              className={`btn ${
                pagina === "videojuegos"
                  ? "btn-light active"
                  : "btn-outline-light"
              }`}
              onClick={() => setPagina("videojuegos")}
            >
              Videojuegos
            </button>

            <button
              className={`btn ${
                pagina === "jugadores"
                  ? "btn-light active"
                  : "btn-outline-light"
              }`}
              onClick={() => setPagina("jugadores")}
            >
              Jugadores
            </button>

            <button
              className={`btn ${
                pagina === "torneos"
                  ? "btn-light active"
                  : "btn-outline-light"
              }`}
              onClick={() => setPagina("torneos")}
            >
              Torneos
            </button>

            <button
              className="btn btn-outline-danger ms-md-2"
              onClick={cerrarSesion}
            >
              Cerrar sesión
            </button>

          </div>
        </div>
      </nav>

      {/* Contenido principal */}
      <div className="container py-4">

        {pagina === "videojuegos" && (
          <Videojuegos token={token} />
        )}

        {pagina === "jugadores" && (
          <Jugadores token={token} />
        )}

        {pagina === "torneos" && (
          <Torneos token={token} />
        )}

      </div>

      {/* Pie de página */}
      <footer className="text-center text-secondary py-4 mt-4 border-top">
        <small>
          GameArena © 2026 | Sistema de gestión de videojuegos y torneos
        </small>
      </footer>

    </main>
  );
}
