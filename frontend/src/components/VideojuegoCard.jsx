export default function VideojuegoCard({
    videojuego,
    onEditar,
    onEliminar
}) {
    return (
        <div className="col-md-4 col-lg-4">
            <div className="card h-100 shadow-sm">
                <div className="card-body">
                    <h3 className="h5 card-title">{videojuego.nombre}</h3>
                    <p className="card-text mb-3">
                        <strong>Género:</strong> {videojuego.genero}<br />
                    </p>
                    <p className="card-text mb-3">
                        <strong>Plataforma:</strong> {videojuego.plataforma}<br />
                    </p>
                    <p className="card-text mb-3">
                        <strong>Clasificación:</strong> {videojuego.clasificacion}
                    </p>
                    <button className = "btn btn-primary btn-sm"
                        onClick={() => onEditar(videojuego)}>
                        Editar
                    </button>
                    <button className = "btn btn-danger btn-sm"
                        onClick={() => onEliminar(videojuego)}>
                        Eliminar
                    </button>
                </div>
            </div>
        </div>
    );
}