import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/api.js';

function ReservaRecurrente() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [frecuencia, setFrecuencia] = useState('SEMANAL');
    const [fechaFinRecurrencia, setFechaFinRecurrencia] = useState('');
    const [errores, setErrores] = useState([]);
    const [mensaje, setMensaje] = useState('');

    const crearRecurrentes = async (e) => {
        e.preventDefault();
        setErrores([]);
        setMensaje('');

        try {
            const response = await api.post(`/reservas/${id}/recurrentes`, {
                frecuencia,
                fechaFinRecurrencia
            });

            setMensaje(`Reservas recurrentes creadas correctamente: ${response.data.total}`);
            setTimeout(() => navigate('/reservas'), 1000);
        } catch (err) {
            if (err.response?.data?.errores) {
                setErrores(err.response.data.errores);
            } else {
                setErrores([err.response?.data?.error || 'Error al crear reservas recurrentes']);
            }
        }
    };

    return (
        <div>
            <h1>Crear reservas recurrentes</h1>

            {mensaje && <div style={{ color: 'green' }}>{mensaje}</div>}

            {errores.length > 0 && (
                <div style={{ color: 'red' }}>
                    {errores.map((error, index) => (
                        <p key={index}>{error}</p>
                    ))}
                </div>
            )}

            <form onSubmit={crearRecurrentes}>
                <div>
                    <label>Frecuencia</label>
                    <select
                        value={frecuencia}
                        onChange={(e) => setFrecuencia(e.target.value)}
                    >
                        <option value="DIARIA">Diaria</option>
                        <option value="SEMANAL">Semanal</option>
                        <option value="MENSUAL">Mensual</option>
                        <option value="ANUAL">Anual</option>
                    </select>
                </div>

                <div>
                    <label>Fecha fin recurrencia</label>
                    <input
                        type="datetime-local"
                        value={fechaFinRecurrencia}
                        onChange={(e) => setFechaFinRecurrencia(e.target.value)}
                    />
                </div>

                <button type="submit">Crear recurrentes</button>
            </form>
        </div>
    );
}

export default ReservaRecurrente;