
import { useEffect, useState } from "react";

const API_URL = "http://127.0.0.1:8000/api/torneos/";
const VIDEOJUEGOS_URL = "http://127.0.0.1:8000/api/videojuegos/";

const formularioInicial = {
    nombre: "",
    videoJuego: "",
    fecha_inicio: "",
    fecha_fin: "",
    cupo_maximo: 2,
    estado: "ABIERTO",
    premio: "0",
    activo: true,
};

export default function Torneos({ token }) {
    const [torneos, setTorneos] = useState([]);
    const [videojuegos, setVideojuegos] = useState([]);
    const [pagina, setPagina] = useState(1);
    const [totalPaginas, setTotalPaginas] = useState(1);
    const [formulario, setFormulario] = useState(formularioInicial);
    const [error, setError] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [procesando, setProcesando] = useState(false);

    useEffect(() => {
        cargarTorneos(pagina);
    }, [pagina]);

    useEffect(() => {
        cargarVideojuegos();
    }, []);

    async function cargarTorneos(numero = pagina) {
        try {
            setError("");

            const respuesta = await fetch(`${API_URL}?page=${numero}`);

            if (!respuesta.ok) {
                throw new Error("No se pudieron cargar los torneos");
            }

            const datos = await respuesta.json();

            setTorneos(datos.resultados);
            setTotalPaginas(datos.total_paginas);
        } catch (err) {
            setError(err.message);
        }
    }

    async function cargarVideojuegos() {
        try {
            const respuesta = await fetch(VIDEOJUEGOS_URL);

            if (!respuesta.ok) {
                throw new Error("No se pudieron cargar los videojuegos");
            }

            setVideojuegos(await respuesta.json());
        } catch (err) {
            setError(err.message);
        }
    }

    function manejarCambio(e) {
        const { name, value, type, checked } = e.target;

        setFormulario({
            ...formulario,
            [name]: type === "checkbox" ? checked : value,
        });
    }

    async function crearTorneo(e) {
        e.preventDefault();

        try {
            setProcesando(true);
            setError("");
            setMensaje("");

            const respuesta = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Token ${token}`,
                },
                body: JSON.stringify(formulario),
            });

            if (!respuesta.ok) {
                throw new Error(JSON.stringify(await respuesta.json()));
            }

            setMensaje("Torneo creado correctamente");
            setFormulario({ ...formularioInicial });

            await cargarTorneos(pagina);
        } catch (err) {
            setError(err.message);
        } finally {
            setProcesando(false);
        }
    }

    return (
        <section className="container py-4 torneos-page">

            <div className="module-header mb-4">
                <h1>Torneos</h1>
                <p>Organiza y administra los torneos de GameArena.</p>
            </div>

            {mensaje && (
                <div className="alert alert-success">
                    {mensaje}
                </div>
            )}

            {error && (
                <div className="alert alert-danger">
                    {error}
                </div>
            )}

            <form onSubmit={crearTorneo} className="card module-form mb-4">
                <div className="card-body">

                    <h2 className="h4">Nuevo torneo</h2>

                    <p className="text-secondary mb-4">
                        Completa la información para registrar un torneo.
                    </p>

                    <div className="row g-3">

                        <div className="col-md-6">
                            <label className="form-label">Nombre del torneo</label>
                            <input
                                className="form-control"
                                type="text"
                                name="nombre"
                                value={formulario.nombre}
                                onChange={manejarCambio}
                                placeholder="Ej. Campeonato GameArena"
                                required
                            />
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">Videojuego</label>
                            <select
                                className="form-select"
                                name="videoJuego"
                                value={formulario.videoJuego}
                                onChange={manejarCambio}
                                required
                            >
                                <option value="">Seleccione un videojuego</option>

                                {videojuegos.map(videojuego => (
                                    <option
                                        key={videojuego.id}
                                        value={videojuego.id}
                                    >
                                        {videojuego.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">Fecha de inicio</label>
                            <input
                                type="datetime-local"
                                className="form-control"
                                name="fecha_inicio"
                                value={formulario.fecha_inicio}
                                onChange={manejarCambio}
                                required
                            />
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">Fecha de finalización</label>
                            <input
                                type="datetime-local"
                                className="form-control"
                                name="fecha_fin"
                                value={formulario.fecha_fin}
                                onChange={manejarCambio}
                                required
                            />
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">Cupo máximo</label>
                            <input
                                type="number"
                                min="2"
                                className="form-control"
                                name="cupo_maximo"
                                value={formulario.cupo_maximo}
                                onChange={manejarCambio}
                                required
                            />
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">Estado</label>
                            <select
                                className="form-select"
                                name="estado"
                                value={formulario.estado}
                                onChange={manejarCambio}
                            >
                                <option value="ABIERTO">Abierto</option>
                                <option value="EN_CURSO">En curso</option>
                                <option value="FINALIZADO">Finalizado</option>
                                <option value="CANCELADO">Cancelado</option>
                            </select>
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">Premio</label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                className="form-control"
                                name="premio"
                                value={formulario.premio}
                                onChange={manejarCambio}
                                required
                            />
                        </div>

                        <div className="col-md-6 d-flex align-items-end">
                            <div className="form-check mb-2">
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    name="activo"
                                    checked={formulario.activo}
                                    onChange={manejarCambio}
                                />
                                <label className="form-check-label">
                                    Torneo activo
                                </label>
                            </div>
                        </div>

                    </div>

                    <div className="mt-4">
                        <button
                            className="btn btn-primary"
                            disabled={procesando}
                        >
                            {procesando ? "Procesando..." : "Crear torneo"}
                        </button>
                    </div>

                </div>
            </form>

            <div className="module-list">

                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h2>Torneos registrados</h2>

                    <span className="badge text-bg-primary">
                        {torneos.length} en esta página
                    </span>
                </div>

                {torneos.length === 0 ? (
                    <div className="card card-body text-center py-5">
                        <h3 className="h5">No hay torneos registrados</h3>
                        <p className="text-secondary mb-0">
                            Los torneos creados aparecerán aquí.
                        </p>
                    </div>
                ) : (
                    <div className="row g-3">

                        {torneos.map(torneo => (
                            <div className="col-md-6 col-lg-4" key={torneo.id}>
                                <div className="card torneo-card h-100">
                                    <div className="card-body d-flex flex-column">

                                        <div className="d-flex justify-content-between align-items-start mb-3">
                                            <h3 className="h5 mb-0">
                                                {torneo.nombre}
                                            </h3>

                                            <span className={`badge ${torneo.estado === "ABIERTO"
                                                ? "text-bg-success"
                                                : torneo.estado === "EN_CURSO"
                                                    ? "text-bg-primary"
                                                    : torneo.estado === "FINALIZADO"
                                                        ? "text-bg-secondary"
                                                        : "text-bg-danger"
                                                }`}>
                                                {torneo.estado.replace("_", " ")}
                                            </span>
                                        </div>

                                        <div className="torneo-details flex-grow-1">

                                            <p>
                                                <strong>Videojuego:</strong>
                                                <span>{torneo.videojuego}</span>
                                            </p>

                                            <p>
                                                <strong>Inicio:</strong>
                                                <span>{torneo.fecha_inicio}</span>
                                            </p>

                                            <p>
                                                <strong>Finalización:</strong>
                                                <span>{torneo.fecha_fin}</span>
                                            </p>

                                            <p>
                                                <strong>Cupo máximo:</strong>
                                                <span>{torneo.cupo_maximo}</span>
                                            </p>

                                            <p>
                                                <strong>Premio:</strong>
                                                <span>{torneo.premio}</span>
                                            </p>

                                            <p>
                                                <strong>Estado:</strong>
                                                <span>{torneo.activo ? "Activo" : "Inactivo"}</span>
                                            </p>

                                        </div>

                                    </div>
                                </div>
                            </div>
                        ))}

                    </div>
                )}

                <div className="torneos-pagination d-flex justify-content-center align-items-center gap-3 mt-4">

                    <button
                        className="btn btn-outline-primary"
                        disabled={pagina <= 1}
                        onClick={() => setPagina(pagina - 1)}
                    >
                        Anterior
                    </button>

                    <span>
                        Página {pagina} de {totalPaginas}
                    </span>

                    <button
                        className="btn btn-outline-primary"
                        disabled={pagina >= totalPaginas}
                        onClick={() => setPagina(pagina + 1)}
                    >
                        Siguiente
                    </button>

                </div>

            </div>

        </section>
    );
}
