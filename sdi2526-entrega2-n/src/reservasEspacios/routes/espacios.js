const express = require('express');
const router = express.Router();

const { requireLogin, requireStandardUser } = require('../modules/authMiddleware');
const espaciosRepository = require('../modules/espaciosRepository');
const reservasRepository = require('../modules/reservasRepository');
const bloqueosRepository = require('../modules/bloqueosRepository');

router.get('/espacios', requireLogin, requireStandardUser, async (req, res) => {
    const tipoFiltro = req.query.tipo || '';
    const capacidadMinima = req.query.capacidadMinima || '';

    let espacios = await espaciosRepository.findEspaciosActivos();

    if (tipoFiltro) {
        espacios = espacios.filter(e => e.tipo === tipoFiltro);
    }

    if (capacidadMinima) {
        espacios = espacios.filter(e => parseInt(e.capacidad) >= parseInt(capacidadMinima));
    }

    res.render('espacios', {
        espacios,
        tipoFiltro,
        capacidadMinima
    });
});

router.get('/espacios/:id', requireLogin, requireStandardUser, async (req, res) => {
    const espacio = await espaciosRepository.findEspacioById(req.params.id);

    if (!espacio || !espacio.activo) {
        return res.status(404).send('Espacio no encontrado');
    }

    res.render('detalleEspacio', { espacio });
});

router.get('/espacios/:id/disponibilidad', requireLogin, requireStandardUser, async (req, res) => {
    const espacio = await espaciosRepository.findEspacioById(req.params.id);

    if (!espacio || !espacio.activo) {
        return res.status(404).send('Espacio no encontrado');
    }

    const fechaInicio = req.query.fechaInicio || '';
    const fechaFin = req.query.fechaFin || '';

    let reservas = [];
    let bloqueos = [];

    if (fechaInicio && fechaFin) {
        const inicioConsulta = new Date(fechaInicio);
        const finConsulta = new Date(fechaFin);

        const reservasActivas = await reservasRepository.findReservasActivasByEspacio(req.params.id);
        reservas = reservasActivas.filter(r =>
            new Date(r.inicio) < finConsulta && new Date(r.fin) > inicioConsulta
        );

        const bloqueosActivos = await bloqueosRepository.findBloqueosByEspacio(req.params.id);
        bloqueos = bloqueosActivos.filter(b =>
            new Date(b.inicio) < finConsulta && new Date(b.fin) > inicioConsulta
        );
    }

    res.render('disponibilidadEspacio', {
        espacio,
        fechaInicio,
        fechaFin,
        reservas,
        bloqueos
    });
});

module.exports = router;