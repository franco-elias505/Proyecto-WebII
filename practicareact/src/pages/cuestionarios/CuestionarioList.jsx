import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import Navbar from '../../components/Navbar';
import { deleteCuestionario, getCuestionarioList } from '../../services/CuestionarioService';

const CuestionarioList = () => {
    const [cuestionarios, setCuestionarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadCuestionarios = async () => {
        setError('');
        try {
            setCuestionarios(await getCuestionarioList());
        } catch {
            setError('No se pudieron cargar los cuestionarios. Intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getCuestionarioList()
            .then((data) => setCuestionarios(data))
            .catch(() => setError('No se pudieron cargar los cuestionarios. Intenta nuevamente.'))
            .finally(() => setLoading(false));
    }, []);

    const handleDelete = async (cuestionario) => {
        if (!window.confirm(`¿Estás seguro de que deseas eliminar ${cuestionario.titulo}?`)) return;
        setError('');
        try {
            await deleteCuestionario(cuestionario.id);
            await loadCuestionarios();
        } catch {
            setError('No se pudo eliminar el cuestionario. Intenta nuevamente.');
        }
    };

    return (
        <>
            <Navbar />
            <div className="container">
                <div className="card">
                    <h2 className="card-title">Lista de Cuestionarios</h2>
                    {error && <p role="alert" className="mt-2 text-red-500">{error}</p>}
                    {loading ? (
                        <p role="status">Cargando cuestionarios...</p>
                    ) : (
                        <div className="mt-2">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Título</th>
                                        <th>Descripción</th>
                                        <th>Duración (min)</th>
                                        <th>Puntaje Máx.</th>
                                        <th></th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cuestionarios.map((item) => (
                                        <tr key={item.id}>
                                            <td>{item.titulo}</td>
                                            <td>{item.descripcion}</td>
                                            <td>{item.duracionMinutos}</td>
                                            <td>{item.puntajeMaximo}</td>
                                            <td>
                                                <Link
                                                    to={`/cuestionarios/${item.id}`}
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
                            {cuestionarios.length === 0 && <p>No hay cuestionarios registrados.</p>}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default CuestionarioList;
