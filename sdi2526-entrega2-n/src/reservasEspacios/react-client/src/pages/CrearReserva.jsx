import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api.js';

function CrearReserva() {
    const [espacioId, setEspacioId] = useState('');
    const [inicio, setInicio] = useState('');
    const [fin, setFin] = useState('');
    const [motivo, setMotivo] = useState('');
    const [errores, setErrores] = useState([]);

    const navigate = useNavigate();

    const crearReserva = async (e) => {
        e.preventDefault();
        setErrores([]);

        try {
            await api.post('/reservas', {
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
                setErrores([err.response?.data?.error || 'Error al crear la reserva']);
            }
        }
    };

    return (
        <div>
            <h1>Crear reserva</h1>

            {errores.length > 0 && (
                <div style={{ color: 'red' }}>
                    {errores.map((error, index) => (
                        <p key={index}>{error}</p>
                    ))}
                </div>
            )}

            <form onSubmit={crearReserva}>
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

                <button type="submit">Crear reserva</button>
            </form>
        </div>
    );
}

export default CrearReserva;