
import { useEffect, useState } from "react";

const API_URL = "http://127.0.0.1:8000/api/jugadores/";

const formularioInicial = {
    nickname: "",
    nombre: "",
    email: "",
    pais: "",
    nivel: 1,
    activo: true,
};

export default function Jugadores({ token }) {
    const [jugadores, setJugadores] = useState([]);
    const [pagina, setPagina] = useState(1);
    const [totalPaginas, setTotalPaginas] = useState(1);
    const [formulario, setFormulario] = useState(formularioInicial);
    const [editandoId, setEditandoId] = useState(null);
    const [error, setError] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [procesando, setProcesando] = useState(false);

    useEffect(() => {
        cargarJugadores(pagina);
    }, [pagina]);

    async function cargarJugadores(numero = pagina) {
        try {
            setError("");

            const respuesta = await fetch(`${API_URL}?page=${numero}`);

            if (!respuesta.ok) {
                throw new Error("No se pudieron cargar los jugadores");
            }

            const datos = await respuesta.json();

            setJugadores(datos.resultados);
            setTotalPaginas(datos.total_paginas);
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

    function iniciarEdicion(jugador) {
        setEditandoId(jugador.id);

        setFormulario({
            nickname: jugador.nickname,
            nombre: jugador.nombre,
            email: jugador.email,
            pais: jugador.pais,
            nivel: jugador.nivel,
            activo: jugador.activo,
        });

        setError("");
        setMensaje("");
    }

    function cancelarEdicion() {
        setEditandoId(null);
        setFormulario({ ...formularioInicial });
        setError("");
        setMensaje("");
    }

    async function guardarJugador(e) {
        e.preventDefault();

        try {
            setProcesando(true);
            setError("");
            setMensaje("");

            const respuesta = await fetch(
                editandoId === null ? API_URL : `${API_URL}${editandoId}/`,
                {
                    method: editandoId === null ? "POST" : "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Token ${token}`,
                    },
                    body: JSON.stringify(formulario),
                }
            );

            if (!respuesta.ok) {
                const datos = await respuesta.json();
                throw new Error(JSON.stringify(datos));
            }

            setMensaje(
                editandoId === null
                    ? "Jugador creado correctamente"
                    : "Jugador actualizado correctamente"
            );

            setEditandoId(null);
            setFormulario({ ...formularioInicial });

            await cargarJugadores(pagina);
        } catch (err) {
            setError(err.message);
        } finally {
            setProcesando(false);
        }
    }

    async function eliminarJugador(id) {
        if (!window.confirm("¿Desea eliminar este jugador?")) return;

        try {
            setError("");
            setMensaje("");

            const respuesta = await fetch(`${API_URL}${id}/`, {
                method: "DELETE",
                headers: {
                    Authorization: `Token ${token}`,
                },
            });

            if (!respuesta.ok) {
                throw new Error("No se pudo eliminar el jugador");
            }

            cancelarEdicion();
            setMensaje("Jugador eliminado correctamente");

            if (jugadores.length === 1 && pagina > 1) {
                setPagina(pagina - 1);
            } else {
                await cargarJugadores(pagina);
            }
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <section className="container py-4 jugadores-page">

            <div className="module-header mb-4">
                <h1>Jugadores</h1>
                <p>Administra los jugadores registrados en GameArena.</p>
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

            <form onSubmit={guardarJugador} className="card module-form mb-4">
                <div className="card-body">

                    <h2 className="h4">
                        {editandoId === null ? "Nuevo jugador" : "Editar jugador"}
                    </h2>

                    <p className="text-secondary mb-4">
                        Completa la información del jugador.
                    </p>

                    <div className="row g-3">

                        <div className="col-md-6">
                            <label className="form-label">Nickname</label>
                            <input
                                className="form-control"
                                type="text"
                                name="nickname"
                                value={formulario.nickname}
                                onChange={manejarCambio}
                                placeholder="Ej. PlayerOne"
                                required
                            />
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">Nombre completo</label>
                            <input
                                className="form-control"
                                type="text"
                                name="nombre"
                                value={formulario.nombre}
                                onChange={manejarCambio}
                                placeholder="Nombre del jugador"
                                required
                            />
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">Correo electrónico</label>
                            <input
                                className="form-control"
                                type="email"
                                name="email"
                                value={formulario.email}
                                onChange={manejarCambio}
                                placeholder="correo@ejemplo.com"
                                required
                            />
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">País</label>
                            <input
                                className="form-control"
                                type="text"
                                name="pais"
                                value={formulario.pais}
                                onChange={manejarCambio}
                                placeholder="País del jugador"
                                required
                            />
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">Nivel</label>
                            <input
                                className="form-control"
                                type="number"
                                min="1"
                                name="nivel"
                                value={formulario.nivel}
                                onChange={manejarCambio}
                                required
                            />
                        </div>

                        <div className="col-md-6 d-flex align-items-end">
                            <div className="form-check mb-2">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    name="activo"
                                    checked={formulario.activo}
                                    onChange={manejarCambio}
                                />
                                <label className="form-check-label">
                                    Jugador activo
                                </label>
                            </div>
                        </div>

                    </div>

                    <div className="d-flex gap-2 mt-4">
                        <button
                            className="btn btn-primary"
                            disabled={procesando}
                        >
                            {procesando
                                ? "Procesando..."
                                : editandoId === null
                                    ? "Guardar jugador"
                                    : "Actualizar jugador"}
                        </button>

                        {editandoId !== null && (
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={cancelarEdicion}
                            >
                                Cancelar
                            </button>
                        )}
                    </div>

                </div>
            </form>

            <div className="module-list">

                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h2>Jugadores registrados</h2>

                    <span className="badge text-bg-primary">
                        {jugadores.length} en esta página
                    </span>
                </div>

                {jugadores.length === 0 ? (
                    <div className="card card-body text-center py-5">
                        <h3 className="h5">No hay jugadores registrados</h3>
                        <p className="text-secondary mb-0">
                            Los jugadores que registres aparecerán aquí.
                        </p>
                    </div>
                ) : (
                    <div className="row g-3">
                        {jugadores.map(jugador => (
                            <div className="col-md-6 col-lg-4" key={jugador.id}>
                                <div className="card jugador-card h-100">
                                    <div className="card-body d-flex flex-column">

                                        <div className="d-flex justify-content-between align-items-start mb-3">
                                            <h3 className="h5 mb-0">
                                                {jugador.nickname}
                                            </h3>

                                            <span className={`badge ${jugador.activo ? "text-bg-success" : "text-bg-secondary"}`}>
                                                {jugador.activo ? "Activo" : "Inactivo"}
                                            </span>
                                        </div>

                                        <div className="jugador-details flex-grow-1">
                                            <p>
                                                <strong>Nombre:</strong>
                                                <span>{jugador.nombre}</span>
                                            </p>

                                            <p>
                                                <strong>Correo:</strong>
                                                <span>{jugador.email}</span>
                                            </p>

                                            <p>
                                                <strong>País:</strong>
                                                <span>{jugador.pais}</span>
                                            </p>

                                            <p>
                                                <strong>Nivel:</strong>
                                                <span>{jugador.nivel}</span>
                                            </p>
                                        </div>

                                        <div className="d-flex gap-2 mt-3">
                                            <button
                                                className="btn btn-outline-primary btn-sm flex-grow-1"
                                                onClick={() => iniciarEdicion(jugador)}
                                            >
                                                Editar
                                            </button>

                                            <button
                                                className="btn btn-outline-danger btn-sm flex-grow-1"
                                                onClick={() => eliminarJugador(jugador.id)}
                                            >
                                                Eliminar
                                            </button>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="jugadores-pagination d-flex justify-content-center align-items-center gap-3 mt-4">

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
