import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import Navbar from '../../components/Navbar';
import { deleteProgreso, getProgresoList } from '../../services/ProgresoService';

const ProgresoList = () => {
    const [progresos, setProgresos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadProgresos = async () => {
        setError('');
        try {
            setProgresos(await getProgresoList());
        } catch {
            setError('No se pudieron cargar los progresos.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getProgresoList()
            .then((data) => setProgresos(data))
            .catch(() => setError('No se pudieron cargar los progresos.'))
            .finally(() => setLoading(false));
    }, []);

    const handleDelete = async (progreso) => {
        if (!window.confirm(`¿Estás seguro de que deseas eliminar este progreso?`)) return;
        setError('');
        try {
            await deleteProgreso(progreso.id);
            await loadProgresos();
        } catch {
            setError('No se pudo eliminar el progreso.');
        }
    };

    return (
        <>
            <Navbar />
            <div className="container">
                <div className="card">
                    <h2 className="card-title">Lista de Progresos</h2>
                    {error && <p role="alert" className="mt-2 text-red-500">{error}</p>}
                    {loading ? (
                        <p role="status">Cargando progresos...</p>
                    ) : (
                        <div className="mt-2">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Inscripción (Estudiante)</th>
                                        <th>Porcentaje</th>
                                        <th>Calificación</th>
                                        <th>Completado</th>
                                        <th>Fecha Actualización</th>
                                        <th></th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {progresos.map((item) => (
                                        <tr key={item.id}>
                                            <td>{item.inscripcion?.estudiante ?? `Inscripción #${item.inscripcionId}`}</td>
                                            <td>
                                                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 max-w-[120px]">
                                                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${item.porcentaje}%` }}></div>
                                                </div>
                                                <span className="text-xs">{item.porcentaje}%</span>
                                            </td>
                                            <td>{item.calificacion}</td>
                                            <td>
                                                {item.completado ? (
                                                    <span className="text-green-600 font-semibold">Sí</span>
                                                ) : (
                                                    <span className="text-yellow-600">En curso</span>
                                                )}
                                            </td>
                                            <td>{String(item.fechaActualizacion).split('T')[0]}</td>
                                            <td>
                                                <Link
                                                    to={`/progresos/${item.id}`}
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
                            {progresos.length === 0 && <p>No hay progresos registrados.</p>}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default ProgresoList;
