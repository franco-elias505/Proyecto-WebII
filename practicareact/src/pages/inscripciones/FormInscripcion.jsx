import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import { useNavigate, useParams } from 'react-router';
import Navbar from '../../components/Navbar';
import FormInput from '../../components/FormInput';
import Button from '../../components/Button';
import {
    getInscripcionById,
    insertInscripcion,
    updateInscripcion,
} from '../../services/InscripcionService';
import { getCuestionarioList } from '../../services/CuestionarioService';

const inscripcionSchema = z.object({
    estudiante: z.string().trim().min(1, 'El nombre del estudiante es requerido'),
    estado: z.enum(['activa', 'completada', 'cancelada']),
    fechaInscripcion: z.string().min(1, 'La fecha es requerida'),
    cuestionarioId: z.string().min(1, 'El cuestionario es requerido').transform(Number),
});

const FormInscripcion = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [cuestionarios, setCuestionarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(inscripcionSchema),
        defaultValues: {
            estado: 'activa',
            fechaInscripcion: new Date().toISOString().split('T')[0],
        },
    });

    useEffect(() => {
        const loadForm = async () => {
            setError('');
            try {
                const list = await getCuestionarioList();
                setCuestionarios(list);
                if (id) {
                    const data = await getInscripcionById(id);
                    setValue('estudiante', data.estudiante);
                    setValue('estado', data.estado);
                    setValue('fechaInscripcion', String(data.fechaInscripcion).split('T')[0]);
                    setValue('cuestionarioId', String(data.cuestionarioId));
                }
            } catch {
                setError('No se pudieron cargar los datos del formulario.');
            } finally {
                setLoading(false);
            }
        };
        loadForm();
    }, [id, setValue]);

    const processData = async (data) => {
        setError('');
        try {
            if (id) await updateInscripcion(id, data);
            else await insertInscripcion(data);
            navigate('/inscripciones');
        } catch {
            setError('No se pudo guardar la inscripción.');
        }
    };

    return (
        <>
            <Navbar />
            <div className="container">
                <div className="card">
                    <h2 className="card-title">{id ? 'Editar Inscripción' : 'Nueva Inscripción'}</h2>
                    {error && <p role="alert" className="text-red-500">{error}</p>}
                    {loading ? (
                        <p role="status">Cargando formulario...</p>
                    ) : (
                        <form onSubmit={handleSubmit(processData)}>
                            <FormInput
                                labelText="Estudiante"
                                id="txtEstudiante"
                                placeholder="Nombre del estudiante"
                                errorText={errors.estudiante?.message}
                                {...register('estudiante')}
                            />
                            <div>
                                <label htmlFor="estado">Estado</label>
                                <select
                                    id="estado"
                                    className="w-full rounded-md border border-solid border-gray-300 bg-white px-3 py-1.5"
                                    {...register('estado')}
                                >
                                    <option value="activa">Activa</option>
                                    <option value="completada">Completada</option>
                                    <option value="cancelada">Cancelada</option>
                                </select>
                            </div>
                            <FormInput
                                labelText="Fecha de Inscripción"
                                id="txtFecha"
                                type="date"
                                errorText={errors.fechaInscripcion?.message}
                                {...register('fechaInscripcion')}
                            />
                            <div className="mt-2">
                                <label htmlFor="cuestionarioId">Cuestionario</label>
                                <select
                                    id="cuestionarioId"
                                    className="w-full rounded-md border border-solid border-gray-300 bg-white px-3 py-1.5"
                                    defaultValue=""
                                    {...register('cuestionarioId')}
                                >
                                    <option value="" disabled>
                                        Selecciona un cuestionario
                                    </option>
                                    {cuestionarios.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.titulo}
                                        </option>
                                    ))}
                                </select>
                                {errors.cuestionarioId && (
                                    <span className="text-red-500">{errors.cuestionarioId.message}</span>
                                )}
                            </div>
                            <div className="mt-4">
                                <Button
                                    text={isSubmitting ? 'Guardando...' : 'Guardar'}
                                    type="submit"
                                    disabled={isSubmitting}
                                />{' '}
                                <button type="button" onClick={() => navigate('/inscripciones')}>
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </>
    );
};

export default FormInscripcion;
