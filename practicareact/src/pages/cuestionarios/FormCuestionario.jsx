import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import { useNavigate, useParams } from 'react-router';
import Navbar from '../../components/Navbar';
import FormInput from '../../components/FormInput';
import Button from '../../components/Button';
import {
    getCuestionarioById,
    insertCuestionario,
    updateCuestionario,
} from '../../services/CuestionarioService';

const cuestionarioSchema = z.object({
    titulo: z.string().trim().min(1, 'El título es requerido'),
    descripcion: z.string().trim().min(1, 'La descripción es requerida'),
    duracionMinutos: z.string().min(1, 'La duración es requerida').transform(Number),
    puntajeMaximo: z.string().min(1, 'El puntaje es requerido').transform(Number),
});

const FormCuestionario = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm({ resolver: zodResolver(cuestionarioSchema) });

    useEffect(() => {
        const loadForm = async () => {
            setError('');
            try {
                if (id) {
                    const data = await getCuestionarioById(id);
                    setValue('titulo', data.titulo);
                    setValue('descripcion', data.descripcion);
                    setValue('duracionMinutos', String(data.duracionMinutos));
                    setValue('puntajeMaximo', String(data.puntajeMaximo));
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
            if (id) await updateCuestionario(id, data);
            else await insertCuestionario(data);
            navigate('/cuestionarios');
        } catch {
            setError('No se pudo guardar el cuestionario.');
        }
    };

    return (
        <>
            <Navbar />
            <div className="container">
                <div className="card">
                    <h2 className="card-title">{id ? 'Editar Cuestionario' : 'Nuevo Cuestionario'}</h2>
                    {error && <p role="alert" className="text-red-500">{error}</p>}
                    {loading ? (
                        <p role="status">Cargando formulario...</p>
                    ) : (
                        <form onSubmit={handleSubmit(processData)}>
                            <FormInput
                                labelText="Título"
                                id="txtTitulo"
                                placeholder="Título del cuestionario"
                                errorText={errors.titulo?.message}
                                {...register('titulo')}
                            />
                            <FormInput
                                labelText="Descripción"
                                id="txtDescripcion"
                                placeholder="Descripción"
                                errorText={errors.descripcion?.message}
                                {...register('descripcion')}
                            />
                            <FormInput
                                labelText="Duración (minutos)"
                                id="txtDuracion"
                                type="number"
                                min="1"
                                placeholder="Duración en minutos"
                                errorText={errors.duracionMinutos?.message}
                                {...register('duracionMinutos')}
                            />
                            <FormInput
                                labelText="Puntaje Máximo"
                                id="txtPuntaje"
                                type="number"
                                min="1"
                                placeholder="Puntaje máximo"
                                errorText={errors.puntajeMaximo?.message}
                                {...register('puntajeMaximo')}
                            />
                            <div className="mt-4">
                                <Button
                                    text={isSubmitting ? 'Guardando...' : 'Guardar'}
                                    type="submit"
                                    disabled={isSubmitting}
                                />{' '}
                                <button type="button" onClick={() => navigate('/cuestionarios')}>
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

export default FormCuestionario;
