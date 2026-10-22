/**Componente que consulta la API */
import { useEffect, useState } from "react";
import VideojuegoCard from "../components/VideojuegoCard";

const API_URL = "http://127.0.0.1:8000/api/videojuegos/";

export default function Videojuegos() {
    const [videojuegos, setVideojuegos] = useState([]);
    const [cargando, setCargando] = useState([true]);
    const [error, setError] = useState("");

    useEffect(() => {
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
        cargarVideojuegos();
    }, []);

    if (cargando) return <p>Cargando Videojuegos...</p>
    if (error) return <p>Error:{error}</p>
    return (
        <section>
            <h2>Videojuegos Disponibles</h2>
            {videojuegos.length === 0 ? (
                <p>No hay videojuegos disponibles</p>
            ) : (
                videojuegos.map((videojuego) => (
                    <VideojuegoCard
                        key={videojuego.id}
                        videojuego={videojuego}
                    />
                ))
            )}
        </section>
    );
} 