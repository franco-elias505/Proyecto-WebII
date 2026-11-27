import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import Navbar from '../../components/Navbar';
import { deleteInscripcion, getInscripcionList } from '../../services/InscripcionService';

const InscripcionList = () => {
    const [inscripciones, setInscripciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadInscripciones = async () => {
        setError('');
        try {
            setInscripciones(await getInscripcionList());
        } catch {
            setError('No se pudieron cargar las inscripciones.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getInscripcionList()
            .then((data) => setInscripciones(data))
            .catch(() => setError('No se pudieron cargar las inscripciones.'))
            .finally(() => setLoading(false));
    }, []);

    const handleDelete = async (inscripcion) => {
        if (!window.confirm(`¿Estás seguro de que deseas eliminar la inscripción de ${inscripcion.estudiante}?`)) return;
        setError('');
        try {
            await deleteInscripcion(inscripcion.id);
            await loadInscripciones();
        } catch {
            setError('No se pudo eliminar la inscripción.');
        }
    };

    return (
        <>
            <Navbar />
            <div className="container">
                <div className="card">
                    <h2 className="card-title">Lista de Inscripciones</h2>
                    {error && <p role="alert" className="mt-2 text-red-500">{error}</p>}
                    {loading ? (
                        <p role="status">Cargando inscripciones...</p>
                    ) : (
                        <div className="mt-2">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Estudiante</th>
                                        <th>Estado</th>
                                        <th>Fecha</th>
                                        <th>Cuestionario</th>
                                        <th></th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {inscripciones.map((item) => (
                                        <tr key={item.id}>
                                            <td>{item.estudiante}</td>
                                            <td>
                                                <span className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${
                                                    item.estado === 'activa' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {item.estado}
                                                </span>
                                            </td>
                                            <td>{String(item.fechaInscripcion).split('T')[0]}</td>
                                            <td>{item.cuestionario?.titulo ?? item.cuestionarioId}</td>
                                            <td>
                                                <Link
                                                    to={`/inscripciones/${item.id}`}
                                                    className="cursor-pointer rounded-full bg-blue-500 px-5 py-2 text-white hover:bg-blue-600"
                                                >
                                                    Editar
                                                </Link>
                                            </td>
                                            <td>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(item)}
                                                    className="cursor-pointer rounded-full bg-red-500 px-5 py-2 text-white hover:bg-red-600"
                                                >
                                                    Eliminar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {inscripciones.length === 0 && <p>No hay inscripciones registradas.</p>}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default InscripcionList;
