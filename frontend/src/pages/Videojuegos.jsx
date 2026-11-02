/**Componente que consulta la API */
import { useEffect, useState } from "react";
import VideojuegoCard from "../components/VideojuegoCard";

const API_URL = "http://127.0.0.1:8000/api/videojuegos/";
const TOKEN_URL = "http://127.0.0.1:8000/api/token/"

const formularioInicial = {
    nombre: "",
    genero: "",
    plataforma: "PC",
    clasificacion: "",
    fecha_lanzamiento: "",
    activo: true,
};
//----------------------------------------------------------------

export default function Videojuegos() {
    const [videojuegos, setVideojuegos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [procesando, setProcesando] = useState(false);
    const [formulario, setFormulario] = useState(formularioInicial);
    const [editandoId, setEditandoId] = useState(null);

    const [credenciales, setCredenciales] = useState({
        username: "",
        password: "",
    });
    const [token, setToken] = useState("");
    const [autenticando, setAutenticando] = useState(false);


    useEffect(() => {
        cargarVideojuegos();
    }, []);

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

    if (cargando) return <p>Cargando Videojuegos...</p>
    if (error) return <p>Error:{error}</p>
    /*------------ Función para actualizar credenciales ------------*/
    function manejarCambioCredenciales(e) {
        setCredenciales({
            ...credenciales,
            [e.target.name]: e.target.value,
        });
    }
    /*----------------- Función para iniciar sesión ----------------*/
    async function iniciarSesion(e) {
        e.preventDefault();
        try {
            setAutenticando(true);
            setError("");
            setMensaje("");

            const datosLogin = new URLSearchParams();
            datosLogin.append("username", credenciales.username);
            datosLogin.append("password", credenciales.password);

            const respuesta = await fetch(TOKEN_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: datosLogin,
            });

            if (!respuesta.ok) {
                throw new Error("Usuario o contraseña incorrectos");
            }
            const datos = await respuesta.json();
            setToken(datos.token);
            setCredenciales((actuales) => ({
                ...actuales,
                password: "",
            }));
            setMensaje("Autenticación correcta");

        } catch (err) {
            setError(err.message);
        } finally {
            setAutenticando(false);
        }
    }
    /*------------ Función manejar cambio en el formulario ------------ */
    function manejarCambioFormulario(e) {
        const { name, value, type, checked } = e.target;
        /**name indica qué propiedad va a cambiar *
         * value contiene el texto o valor seleccionado
         * checked se utiliza para el checkbox activo
         * ...formulario conserva los demás campos
        */
        setFormulario({
            ...formulario,
            [name]: type === "checkbox" ? checked : value,
        });
    }
    /*--------- Función asincrónica de crear videojuegos -------------- */
    async function crearVideojuego(e) {
        if (!token) {
            throw new Error("Debe autenticarse antes de crear un videojuego");
        }

        const respuesta = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Token ${token}`
            },
            body: JSON.stringify(formulario)
        });
        if (!respuesta.ok) {
            throw new Error("No se pudo crear el videojuego");
        }
        const nuevo = await respuesta.json();
        setVideojuegos((actuales) => [...actuales, nuevo]);
    }
    /*------------ Función para validar campos mixtos ---------------- */
    function validarCampos() {
        if (!formulario.nombre.trim()) {
            setError("El nombre es obligatorio");
            return false;
        }
        if (!formulario.plataforma.trim()) {
            setError("La plataforma es obligatoria");
            return false;
        }
        return true;
    }

    /*----------------- Función para iniciar edición ---------------- */
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
    /*----------------- Función para actualizar videojuego ---------------- */
    async function actualizarVideojuego(e) {
        const respuesta = await fetch(
            `${API_URL}${editandoId}/`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Token ${token}`
            },
            body: JSON.stringify(formulario)
        });
        if (!respuesta.ok) {
            throw new Error("No se pudo actualizar el videojuego");
        }
        const actualizando = await respuesta.json();

        setVideojuegos((actuales) =>
            actuales.map((videojuego) =>
                videojuego.id === actualizando.id
                    ? actualizando
                    : videojuego
            )
        );
    }
    /*-- Función para guardar un videojuego (Creándolo o actualizándolo) -- */
    async function guardarVideojuego(e) {
        e.preventDefault();

        if (!validarCampos()) return;

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
            setFormulario(formularioInicial);
            setEditandoId(null);

        } catch (err) {
            setError(err.message);
        } finally {
            setProcesando(false);
        }
    }
    /*----------------- Función para cancelar la edición ------------------ */
    function cancelarEdicion() {
        setEditandoId(null);
        setFormulario(formularioInicial);
        setMensaje("");
    }
    /*--------------- Función assyn para eliminar con delete --------------- */
    async function eliminarVideojuego(id) {
        const confirmar = window.confirm("¿Está seguro de eliminar este videojuego?");
        if (!confirmar) return;
        try {
            setError("");
            setMensaje("");

            const respuesta = await fetch(
                `${API_URL}${id}/`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Token ${token}`
                }
            });
            if (!respuesta.ok) {
                throw new Error("No se pudo eliminar el videojuego");
            }
            const actualizado = await respuesta.json();

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
    /*----------------------------------------------------------------------- */
    return (
        <section className="container py-4">
            <h1 className="mb-4">GameArena</h1>
            {!token ? (
                <form onSubmit={iniciarSesion} className="card card-body mb-4">
                    <h2 className="h4 mb-3">Autenticación</h2>
                    <div className="mb-3">
                        <label className="form-label">Usuario</label>
                        <input className="form-control"
                            name="username"
                            value={credenciales.username}
                            onChange={manejarCambioCredenciales}
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Contraseña</label>
                        <input type="password"
                            className="form-control"
                            name="password"
                            value={credenciales.password}
                            onChange={manejarCambioCredenciales}
                        />
                    </div>
                    <button className="btn btn-dark" disabled={autenticando}>
                        {autenticando ? "Autenticando..." : "Obtener token"}
                    </button>
                </form>
            ) : (
                <div className="alert alert-info">
                    Usuario autenticado.El token se enviará en POST, PATH y DELETE
                </div>
            )}
            {mensaje && <div className="alert alert-success">{mensaje}</div>}
            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={guardarVideojuego} className="card card-body mb-4">
                <h2 className="h4 mb-3">{editandoId ? "Editar videojuego" : "Nuevo videojuego"}</h2>
                <div className="mb-3">
                    <label className="form-label">Nombre</label>
                    <input className="form-control"
                        name="nombre"
                        value={formulario.nombre}
                        onChange={manejarCambioFormulario} />
                </div>

                <div className="mb-3">
                    <label className="form-label">Género</label>
                    <input className="form-control"
                        name="genero"
                        value={formulario.genero}
                        onChange={manejarCambioFormulario} />
                </div>

                <div className="mb-3">
                    <label className="form-label">Plataforma</label>
                    <select className="form-control"
                        name="plataforma"
                        value={formulario.plataforma}
                        onChange={manejarCambioFormulario}>
                        <option value="PC">PC</option>
                        <option value="PlayStation">PlayStation</option>
                        <option value="Xbox">Xbox</option>
                        <option value="Nintendo Switch">Nintendo Switch</option>
                    </select>
                </div>

                <div className="mb-3">
                    <label className="form-label">Clasificación</label>
                    <input className="form-control"
                        name="clasificacion"
                        value={formulario.clasificacion}
                        onChange={manejarCambioFormulario} />
                </div>

                <div className="mb-3">
                    <label className="form-label">Fecha de lanzamiento</label>
                    <input type="date"
                        className="form-control"
                        name="fechaLanzamiento"
                        value={formulario.fechaLanzamiento}
                        onChange={manejarCambioFormulario} />
                </div>

                <div className="form-check mb-3">
                    <input type="checkbox"
                        className="form-check-input"
                        name="activo"
                        checked={formulario.activo}
                        onChange={manejarCambioFormulario} />
                    <label className="form-check-label">Activo</label>
                </div>

                <div className="d-flex gap-2">
                    <button className="btn-primary" disabled={procesando}>
                        {procesando
                            ? "Procesando..."
                            : editandoId
                                ? "Actualizar videojuego"
                                : "Guardar videojuego"}
                    </button>
                    {editandoId && (
                        <button className="btn btn-secondary" type="button" onClick={cancelarEdicion}>
                            Cancelar
                        </button>
                    )}
                </div>
            </form>
            <div className="row g-3">
                {videojuegos.map((videojuego) => (
                    <VideojuegoCard
                        key={videojuego.id}
                        videojuego={videojuego}
                        onEditar={iniciarEdicion}
                        onEliminar={eliminarVideojuego} />
                ))}
            </div>
        </section >
    )
}
