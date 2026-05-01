import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/api.js';

function EditarReserva() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [espacioId, setEspacioId] = useState('');
    const [inicio, setInicio] = useState('');
    const [fin, setFin] = useState('');
    const [motivo, setMotivo] = useState('');
    const [errores, setErrores] = useState([]);

    useEffect(() => {
        const cargarReserva = async () => {
            try {
                const response = await api.get('/reservas');
                const reserva = response.data.reservas.find((r) => r._id === id);

                if (!reserva) {
                    setErrores(['Reserva no encontrada o no pertenece al usuario.']);
                    return;
                }

                setEspacioId(reserva.espacioId);
                setInicio(reserva.inicio);
                setFin(reserva.fin);
                setMotivo(reserva.motivo || '');
            } catch (err) {
                setErrores(['Error al cargar la reserva.']);
            }
        };

        cargarReserva();
    }, [id]);

    const editarReserva = async (e) => {
        e.preventDefault();
        setErrores([]);

        try {
            await api.put(`/reservas/${id}`, {
                espacioId,
                inicio,
                fin,
                motivo
            });

            navigate('/reservas');
        } catch (err) {
            if (err.response?.data?.errores) {
                setErrores(err.response.data.errores);
            } else {
                setErrores([err.response?.data?.error || 'Error al editar la reserva']);
            }
        }
    };

    return (
        <div>
            <h1>Editar reserva</h1>

            {errores.length > 0 && (
                <div style={{ color: 'red' }}>
                    {errores.map((error, index) => (
                        <p key={index}>{error}</p>
                    ))}
                </div>
            )}

            <form onSubmit={editarReserva}>
                <div>
                    <label>ID del espacio</label>
                    <input
                        type="text"
                        value={espacioId}
                        onChange={(e) => setEspacioId(e.target.value)}
                    />
                </div>

                <div>
                    <label>Inicio</label>
                    <input
                        type="datetime-local"
                        value={inicio}
                        onChange={(e) => setInicio(e.target.value)}
                    />
                </div>

                <div>
                    <label>Fin</label>
                    <input
                        type="datetime-local"
                        value={fin}
                        onChange={(e) => setFin(e.target.value)}
                    />
                </div>

                <div>
                    <label>Motivo</label>
                    <textarea
                        value={motivo}
                        onChange={(e) => setMotivo(e.target.value)}
                    />
                </div>

                <button type="submit">Guardar cambios</button>
            </form>
        </div>
    );
}

export default EditarReserva;