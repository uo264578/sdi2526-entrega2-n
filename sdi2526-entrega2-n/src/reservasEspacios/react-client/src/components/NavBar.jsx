import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <nav style={{ padding: '1rem', backgroundColor: '#0d6efd', color: 'white' }}>
            <Link to="/reservas" style={{ color: 'white', marginRight: '1rem' }}>
                Mis reservas
            </Link>

            {token && (
                <>
                    <Link to="/reservas/crear" style={{ color: 'white', marginRight: '1rem' }}>
                        Crear reserva
                    </Link>

                    <button onClick={logout}>
                        Cerrar sesión
                    </button>
                </>
            )}
        </nav>
    );
}

export default Navbar;