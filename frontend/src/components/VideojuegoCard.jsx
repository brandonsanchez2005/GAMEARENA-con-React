export default function VideojuegoCard({
    videojuego,
    onEditar,
    onEliminar,
}) {
    return (
        <div className="col-md-6 col-lg-4">
            <div className="card videojuego-card h-100">
                <div className="card-body d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                        <h3 className="h5 card-title mb-0">
                            {videojuego.nombre}
                        </h3>

                        <span className={`badge ${videojuego.activo ? "text-bg-success" : "text-bg-secondary"}`}>
                            {videojuego.activo ? "Activo" : "Inactivo"}
                        </span>
                    </div>

                    <div className="videojuego-details flex-grow-1">
                        <p>
                            <strong>Género:</strong>
                            <span>{videojuego.genero || "Sin indicar"}</span>
                        </p>

                        <p>
                            <strong>Plataforma:</strong>
                            <span>{videojuego.plataforma}</span>
                        </p>

                        <p>
                            <strong>Clasificación:</strong>
                            <span>{videojuego.clasificacion || "Sin indicar"}</span>
                        </p>
                    </div>

                    <div className="d-flex gap-2 mt-3">
                        <button
                            className="btn btn-outline-primary btn-sm flex-grow-1"
                            onClick={() => onEditar(videojuego)}
                        >
                            Editar
                        </button>

                        <button
                            className="btn btn-outline-danger btn-sm flex-grow-1"
                            onClick={() => onEliminar(videojuego.id)}
                        >
                            Eliminar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}