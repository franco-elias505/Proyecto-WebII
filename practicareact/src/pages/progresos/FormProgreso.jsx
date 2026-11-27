import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import { useNavigate, useParams } from 'react-router';
import Navbar from '../../components/Navbar';
import FormInput from '../../components/FormInput';
import Button from '../../components/Button';
import {
    getProgresoById,
    insertProgreso,
    updateProgreso,
} from '../../services/ProgresoService';
import { getInscripcionList } from '../../services/InscripcionService';

const progresoSchema = z.object({
    porcentaje: z.string().min(1, 'El porcentaje es requerido').transform(Number),
    calificacion: z.string().min(1, 'La calificación es requerida').transform(Number),
    completado: z.boolean().default(false),
    fechaActualizacion: z.string().min(1, 'La fecha es requerida'),
    inscripcionId: z.string().min(1, 'La inscripción es requerida').transform(Number),
});

const FormProgreso = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [inscripciones, setInscripciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(progresoSchema),
        defaultValues: {
            completado: false,
            fechaActualizacion: new Date().toISOString().split('T')[0],
        },
    });

    useEffect(() => {
        const loadForm = async () => {
            setError('');
            try {
                const list = await getInscripcionList();
                setInscripciones(list);
                if (id) {
                    const data = await getProgresoById(id);
                    setValue('porcentaje', String(data.porcentaje));
                    setValue('calificacion', String(data.calificacion));
                    setValue('completado', Boolean(data.completado));
                    setValue('fechaActualizacion', String(data.fechaActualizacion).split('T')[0]);
                    setValue('inscripcionId', String(data.inscripcionId));
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
            if (id) await updateProgreso(id, data);
            else await insertProgreso(data);
            navigate('/progresos');
        } catch {
            setError('No se pudo guardar el progreso.');
        }
    };

    return (
        <>
            <Navbar />
            <div className="container">
                <div className="card">
                    <h2 className="card-title">{id ? 'Editar Progreso' : 'Registrar Progreso'}</h2>
                    {error && <p role="alert" className="text-red-500">{error}</p>}
                    {loading ? (
                        <p role="status">Cargando formulario...</p>
                    ) : (
                        <form onSubmit={handleSubmit(processData)}>
                            <div className="mb-2">
                                <label htmlFor="inscripcionId">Inscripción (Estudiante)</label>
                                <select
                                    id="inscripcionId"
                                    className="w-full rounded-md border border-solid border-gray-300 bg-white px-3 py-1.5"
                                    defaultValue=""
                                    {...register('inscripcionId')}
                                >
                                    <option value="" disabled>
                                        Selecciona una inscripción
                                    </option>
                                    {inscripciones.map((ins) => (
                                        <option key={ins.id} value={ins.id}>
                                            #{ins.id} - {ins.estudiante} ({ins.cuestionario?.titulo ?? 'Cuestionario'})
                                        </option>
                                    ))}
                                </select>
                                {errors.inscripcionId && (
                                    <span className="text-red-500">{errors.inscripcionId.message}</span>
                                )}
                            </div>
                            <FormInput
                                labelText="Porcentaje de avance (0 - 100)"
                                id="txtPorcentaje"
                                type="number"
                                min="0"
                                max="100"
                                placeholder="Ej: 50"
                                errorText={errors.porcentaje?.message}
                                {...register('porcentaje')}
                            />
                            <FormInput
                                labelText="Calificación obtenida"
                                id="txtCalificacion"
                                type="number"
                                step="any"
                                min="0"
                                placeholder="Ej: 85"
                                errorText={errors.calificacion?.message}
                                {...register('calificacion')}
                            />
                            <div className="mb-2 flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="chkCompletado"
                                    className="h-4 w-4"
                                    {...register('completado')}
                                />
                                <label htmlFor="chkCompletado" className="cursor-pointer">
                                    Marcar como completado
                                </label>
                            </div>
                            <FormInput
                                labelText="Fecha de Actualización"
                                id="txtFecha"
                                type="date"
                                errorText={errors.fechaActualizacion?.message}
                                {...register('fechaActualizacion')}
                            />
                            <div className="mt-4">
                                <Button
                                    text={isSubmitting ? 'Guardando...' : 'Guardar'}
                                    type="submit"
                                    disabled={isSubmitting}
                                />{' '}
                                <button type="button" onClick={() => navigate('/progresos')}>
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

export default FormProgreso;
