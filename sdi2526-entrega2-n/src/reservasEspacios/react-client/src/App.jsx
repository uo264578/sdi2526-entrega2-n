import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Login from './pages/Login.jsx';
import Reservas from './pages/Reservas.jsx';
import CrearReserva from './pages/CrearReserva.jsx';
import EditarReserva from './pages/EditarReserva.jsx';
import ReservaRecurrente from './pages/ReservaRecurrente.jsx';

function App() {
  const token = localStorage.getItem('token');

  return (
      <>
        <Navbar />

        <div className="container mt-4">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
                path="/reservas"
                element={token ? <Reservas /> : <Navigate to="/login" />}
            />
            <Route
                path="/reservas/crear"
                element={token ? <CrearReserva /> : <Navigate to="/login" />}
            />
            <Route path="*" element={<Navigate to={token ? "/reservas" : "/login"} />} />
              <Route
                  path="/reservas/editar/:id"
                  element={token ? <EditarReserva /> : <Navigate to="/login" />}
              />

              <Route
                  path="/reservas/recurrente/:id"
                  element={token ? <ReservaRecurrente /> : <Navigate to="/login" />}
              />
          </Routes>
        </div>
      </>
  );
}

export default App;