import { useEffect, useState } from 'react';
import api from '../api/api.js';
import { Link } from 'react-router-dom';

function Reservas() {
    const [reservas, setReservas] = useState([]);
    const [estadoFiltro, setEstadoFiltro] = useState('');
    const [error, setError] = useState('');

    const cargarReservas = async () => {
        try {
            const response = await api.get('/reservas');

            let reservasApi = response.data.reservas;

            if (estadoFiltro) {
                reservasApi = reservasApi.filter((r) => r.estado === estadoFiltro);
            }

            setReservas(reservasApi);
        } catch (err) {
            setError('Error al cargar reservas');
        }
    };

    useEffect(() => {
        cargarReservas();
    }, [estadoFiltro]);

    const cancelarReserva = async (id) => {
        try {
            await api.delete(`/reservas/${id}`);
            cargarReservas();
        } catch (err) {
            alert(err.response?.data?.error || 'Error al cancelar reserva');
        }
    };

    return (
        <div>
            <h1>Mis reservas</h1>

            {error && <div style={{ color: 'red' }}>{error}</div>}

            <label>Filtrar por estado: </label>
            <select value={estadoFiltro} onChange={(e) => setEstadoFiltro(e.target.value)}>
                <option value="">Todas</option>
                <option value="ACTIVA">ACTIVA</option>
                <option value="CANCELADA">CANCELADA</option>
            </select>

            <table border="1" cellPadding="8" style={{ marginTop: '1rem' }}>
                <thead>
                <tr>
                    <th>Espacio</th>
                    <th>Inicio</th>
                    <th>Fin</th>
                    <th>Motivo</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                </tr>
                </thead>

                <tbody>
                {reservas.map((reserva) => (
                    <tr key={reserva._id}>
                        <td>{reserva.nombreEspacio}</td>
                        <td>{reserva.inicio}</td>
                        <td>{reserva.fin}</td>
                        <td>{reserva.motivo}</td>
                        <td>{reserva.estado}</td>
                        <td>
                            {reserva.estado === 'ACTIVA' && (
                                <>
                                    <button onClick={() => cancelarReserva(reserva._id)}>
                                        Cancelar
                                    </button>

                                    <Link to={`/reservas/editar/${reserva._id}`}>
                                        Editar
                                    </Link>

                                    <Link to={`/reservas/recurrente/${reserva._id}`}>
                                        Recurrente
                                    </Link>
                                </>
                            )}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}

export default Reservas;