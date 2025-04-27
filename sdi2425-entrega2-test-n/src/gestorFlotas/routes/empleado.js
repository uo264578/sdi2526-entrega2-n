const express = require('express');
const router = express.Router();
const trayectosRepository = require('../modules/trayectosRepository');
const { requireLogin, requireEmployee } = require('../modules/authMiddleware');

router.get('/trayectos/mis-trayectos', requireLogin, requireEmployee, async (req, res) => {
    const pagina = parseInt(req.query.pagina) || 1;
    const trayectosPorPagina = 5;

    const trayectos = await trayectosRepository.findTrayectosByDni(req.session.user.dni);

    const totalTrayectos = trayectos.length;
    const totalPaginas = Math.ceil(totalTrayectos / trayectosPorPagina);

    const trayectosPagina = trayectos.slice((pagina - 1) * trayectosPorPagina, pagina * trayectosPorPagina);

    res.render('misTrayectos', {
        trayectos: trayectosPagina,
        paginaActual: pagina,
        totalPaginas: totalPaginas
    });
});

router.get('/trayectos/iniciar', requireLogin, requireEmployee, async (req, res) => {
    const vehiculosLibres = await trayectosRepository.findVehiculosLibres();
    res.render('iniciarTrayecto', { vehiculos: vehiculosLibres });
});

router.post('/trayectos/iniciar', requireLogin, requireEmployee, async (req, res) => {
    const dni = req.session.user.dni;
    const matricula = req.body.matricula;

    const trayectoEnCurso = await trayectosRepository.findTrayectoEnCursoByEmpleado(dni);
    if (trayectoEnCurso) {
        return res.render('iniciarTrayecto', { error: 'Ya tienes un trayecto en curso.', vehiculos: await trayectosRepository.findVehiculosLibres() });
    }

    const vehiculoEnUso = await trayectosRepository.findTrayectoEnCursoByVehiculo(matricula);
    if (vehiculoEnUso) {
        return res.render('iniciarTrayecto', { error: 'Este vehículo está siendo utilizado por otro empleado.', vehiculos: await trayectosRepository.findVehiculosLibres() });
    }

    const ultimoTrayectoVehiculo = await trayectosRepository.findUltimoTrayectoVehiculo(matricula);
    const odometroInicio = ultimoTrayectoVehiculo ? ultimoTrayectoVehiculo.odometroFin : 0;

    await trayectosRepository.iniciarNuevoTrayecto({
        dniEmpleado: dni,
        matriculaVehiculo: matricula,
        fechaInicio: new Date(),
        odometroInicio: odometroInicio
    });

    res.redirect('/trayectos/mis-trayectos');
});

router.get('/trayectos/finalizar', requireLogin, requireEmployee, async (req, res) => {
    const trayectoEnCurso = await trayectosRepository.findTrayectoEnCursoByEmpleado(req.session.user.dni);

    if (!trayectoEnCurso) {
        return res.render('finalizarTrayecto', { error: 'No tienes ningún trayecto en curso.', trayecto: null });
    }

    res.render('finalizarTrayecto', { trayecto: trayectoEnCurso });
});

router.post('/trayectos/finalizar', requireLogin, requireEmployee, async (req, res) => {
    const odometroFin = parseInt(req.body.odometroFin);
    const observaciones = req.body.observaciones || '';

    const trayectoEnCurso = await trayectosRepository.findTrayectoEnCursoByEmpleado(req.session.user.dni);

    if (!trayectoEnCurso) {
        return res.render('finalizarTrayecto', { error: 'No tienes ningún trayecto en curso.', trayecto: null });
    }

    if (isNaN(odometroFin) || odometroFin <= trayectoEnCurso.odometroInicio) {
        return res.render('finalizarTrayecto', { error: 'El odómetro final debe ser mayor que el de inicio.', trayecto: trayectoEnCurso });
    }

    await trayectosRepository.finalizarTrayecto(trayectoEnCurso._id, {
        odometroFin: odometroFin,
        observaciones: observaciones,
        fechaFin: new Date()
    });

    res.redirect('/trayectos/historial/' + trayectoEnCurso.matriculaVehiculo);
});

router.get('/trayectos/historial', requireLogin, requireEmployee, async (req, res) => {
    const vehiculos = await trayectosRepository.findAllVehiculos();
    res.render('historialVehiculoSeleccion', { vehiculos });
});

router.get('/trayectos/historial/:matricula', requireLogin, requireEmployee, async (req, res) => {
    const pagina = parseInt(req.query.pagina) || 1;
    const trayectosPorPagina = 5;
    const matricula = req.params.matricula;

    const trayectos = await trayectosRepository.findTrayectosByVehiculo(matricula);

    const totalTrayectos = trayectos.length;
    const totalPaginas = Math.ceil(totalTrayectos / trayectosPorPagina);

    const trayectosPagina = trayectos.slice((pagina - 1) * trayectosPorPagina, pagina * trayectosPorPagina);

    res.render('historialVehiculo', {
        trayectos: trayectosPagina,
        matricula: matricula,
        paginaActual: pagina,
        totalPaginas: totalPaginas
    });
});

module.exports = router;
