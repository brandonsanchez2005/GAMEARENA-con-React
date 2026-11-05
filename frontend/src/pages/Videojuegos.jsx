
/** Componente que consulta la API */
import { useEffect, useState } from "react";
import VideojuegoCard from "../components/VideojuegoCard";

const API_URL = "http://127.0.0.1:8000/api/videojuegos/";

const formularioInicial = {
    nombre: "",
    genero: "",
    plataforma: "PC",
    clasificacion: "",
    fecha_lanzamiento: "",
    activo: true,
};

export default function Videojuegos({ token }) {
    const [videojuegos, setVideojuegos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [procesando, setProcesando] = useState(false);
    const [formulario, setFormulario] = useState(formularioInicial);
    const [editandoId, setEditandoId] = useState(null);

    useEffect(() => {
        cargarVideojuegos();
    }, []);

    // Función para consultar los videojuegos
    async function cargarVideojuegos() {
        try {
            setCargando(true);
            setError("");

            const respuesta = await fetch(API_URL);

            if (!respuesta.ok) {
                throw new Error(`Error HTTP: ${respuesta.status}`);
            }

            const datos = await respuesta.json();
            setVideojuegos(datos);

        } catch (err) {
            setError(err.message);

        } finally {
            setCargando(false);
        }
    }

    // Función para manejar los cambios del formulario
    function manejarCambio(e) {
        const { name, value, type, checked } = e.target;

        setFormulario({
            ...formulario,
            [name]: type === "checkbox" ? checked : value,
        });
    }

    // Función para crear un videojuego
    async function crearVideojuego() {
        if (!token) {
            throw new Error("Debe autenticarse antes de crear un videojuego");
        }

        const respuesta = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Token ${token}`,
            },
            body: JSON.stringify(formulario),
        });

        if (!respuesta.ok) {
            throw new Error("No se pudo crear el videojuego");
        }

        const nuevo = await respuesta.json();

        setVideojuegos((actuales) => [...actuales, nuevo]);
    }

    // Función para validar los campos obligatorios
    function validarFormulario() {
        if (!formulario.nombre.trim()) {
            setError("El nombre es obligatorio");
            return false;
        }

        if (!formulario.plataforma) {
            setError("Debe seleccionar una plataforma");
            return false;
        }

        return true;
    }

    // Función para iniciar la edición
    function iniciarEdicion(videojuego) {
        setEditandoId(videojuego.id);

        setFormulario({
            nombre: videojuego.nombre ?? "",
            genero: videojuego.genero ?? "",
            plataforma: videojuego.plataforma ?? "PC",
            clasificacion: videojuego.clasificacion ?? "",
            fecha_lanzamiento: videojuego.fecha_lanzamiento ?? "",
            activo: videojuego.activo ?? true,
        });

        setMensaje("");
        setError("");
    }

    // Función para actualizar un videojuego
    async function actualizarVideojuego() {
        const respuesta = await fetch(
            `${API_URL}${editandoId}/`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Token ${token}`,
                },
                body: JSON.stringify(formulario),
            }
        );

        if (!respuesta.ok) {
            throw new Error("No se pudo actualizar el videojuego");
        }

        const actualizado = await respuesta.json();

        setVideojuegos((actuales) =>
            actuales.map((videojuego) =>
                videojuego.id === actualizado.id
                    ? actualizado
                    : videojuego
            )
        );
    }

    // Función para guardar un videojuego
    async function guardarVideojuego(e) {
        e.preventDefault();

        if (!validarFormulario()) return;

        try {
            setProcesando(true);
            setError("");
            setMensaje("");

            if (editandoId === null) {
                await crearVideojuego();
                setMensaje("Videojuego creado correctamente");
            } else {
                await actualizarVideojuego();
                setMensaje("Videojuego actualizado correctamente");
            }

            setFormulario({ ...formularioInicial });
            setEditandoId(null);

        } catch (err) {
            setError(err.message);

        } finally {
            setProcesando(false);
        }
    }

    // Función para cancelar la edición
    function cancelarEdicion() {
        setEditandoId(null);
        setFormulario({ ...formularioInicial });
        setError("");
        setMensaje("");
    }

    // Función para eliminar un videojuego
    async function eliminarVideojuego(id) {
        const confirmar = window.confirm(
            "¿Desea eliminar este videojuego?"
        );

        if (!confirmar) return;

        try {
            setError("");
            setMensaje("");

            const respuesta = await fetch(
                `${API_URL}${id}/`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Token ${token}`,
                    },
                }
            );

            if (!respuesta.ok) {
                throw new Error("No se pudo eliminar el videojuego");
            }

            setVideojuegos((actuales) =>
                actuales.filter((videojuego) => videojuego.id !== id)
            );

            if (editandoId === id) {
                cancelarEdicion();
            }

            setMensaje("Videojuego eliminado correctamente");

        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <section className="videojuegos-page">

            {/* Encabezado del módulo */}
            <div className="module-header mb-4">
                <h1>Gestión de videojuegos</h1>
                <p>
                    Administra los videojuegos registrados en GameArena.
                </p>
            </div>

            {/* Mensajes del sistema */}
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

            {/* Formulario de videojuegos */}
            <form
                onSubmit={guardarVideojuego}
                className="card module-form mb-4"
            >
                <div className="card-body">

                    <h2>
                        {editandoId
                            ? "Editar videojuego"
                            : "Registrar videojuego"}
                    </h2>

                    <p className="text-muted small mb-4">
                        Completa los datos del videojuego.
                    </p>

                    <div className="row g-3">

                        <div className="col-md-6">
                            <label className="form-label">
                                Nombre
                            </label>

                            <input
                                type="text"
                                className="form-control"
                                name="nombre"
                                placeholder="Nombre del videojuego"
                                value={formulario.nombre}
                                onChange={manejarCambio}
                            />
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">
                                Género
                            </label>

                            <input
                                type="text"
                                className="form-control"
                                name="genero"
                                placeholder="Ej. Aventura, Acción..."
                                value={formulario.genero}
                                onChange={manejarCambio}
                            />
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">
                                Plataforma
                            </label>

                            <select
                                className="form-select"
                                name="plataforma"
                                value={formulario.plataforma}
                                onChange={manejarCambio}
                            >
                                <option value="PC">PC</option>
                                <option value="PlayStation">PlayStation</option>
                                <option value="Nintendo">Nintendo</option>
                                <option value="Xbox">Xbox</option>
                            </select>
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">
                                Clasificación
                            </label>

                            <input
                                type="text"
                                className="form-control"
                                name="clasificacion"
                                placeholder="Ej. E, E10+, T, M..."
                                value={formulario.clasificacion}
                                onChange={manejarCambio}
                            />
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">
                                Fecha de lanzamiento
                            </label>

                            <input
                                type="date"
                                className="form-control"
                                name="fecha_lanzamiento"
                                value={formulario.fecha_lanzamiento}
                                onChange={manejarCambio}
                            />
                        </div>

                        <div className="col-md-6 d-flex align-items-end">
                            <div className="form-check mb-2">
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    id="activo"
                                    name="activo"
                                    checked={formulario.activo}
                                    onChange={manejarCambio}
                                />

                                <label
                                    className="form-check-label"
                                    htmlFor="activo"
                                >
                                    Videojuego activo
                                </label>
                            </div>
                        </div>

                    </div>

                    {/* Botones del formulario */}
                    <div className="d-flex flex-wrap gap-2 mt-4">

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={procesando}
                        >
                            {procesando
                                ? "Procesando..."
                                : editandoId
                                    ? "Actualizar videojuego"
                                    : "Guardar videojuego"}
                        </button>

                        {editandoId !== null && (
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={cancelarEdicion}
                            >
                                Cancelar
                            </button>
                        )}

                    </div>
                </div>
            </form>

            {/* Listado de videojuegos */}
            <div className="module-list">

                <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
                    <h2 className="mb-0">
                        Videojuegos registrados
                    </h2>

                    <span className="badge text-bg-primary">
                        {videojuegos.length} videojuegos
                    </span>
                </div>

                {cargando ? (
                    <div className="card">
                        <div className="card-body text-center py-5">
                            <div
                                className="spinner-border text-primary mb-3"
                                role="status"
                            >
                                <span className="visually-hidden">
                                    Cargando...
                                </span>
                            </div>

                            <p className="text-muted">
                                Cargando videojuegos...
                            </p>
                        </div>
                    </div>
                ) : videojuegos.length === 0 ? (
                    <div className="card">
                        <div className="card-body text-center py-5">
                            <h3>No hay videojuegos registrados</h3>
                            <p className="text-muted">
                                Utiliza el formulario para agregar el primero.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="row g-3">

                        {videojuegos.map((videojuego) => (
                            <VideojuegoCard
                                key={videojuego.id}
                                videojuego={videojuego}
                                onEditar={iniciarEdicion}
                                onEliminar={eliminarVideojuego}
                            />
                        ))}

                    </div>
                )}

            </div>

        </section>
    );
}
