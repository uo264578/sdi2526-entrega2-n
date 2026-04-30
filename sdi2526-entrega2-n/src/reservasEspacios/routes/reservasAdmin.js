const express = require('express');
const router = express.Router();
const { requireLogin, requireAdmin } = require('../modules/authMiddleware');

const reservasRepository = require('../modules/reservasRepository');
const espaciosRepository = require('../modules/espaciosRepository');

router.get('/admin/reservas', requireLogin, requireAdmin, async (req, res) => {
    const pagina = parseInt(req.query.pagina) || 1;
    const reservasPorPagina = 5;

    const espacioId = req.query.espacioId || '';
    const fechaInicio = req.query.fechaInicio || '';
    const fechaFin = req.query.fechaFin || '';

    let filtro = {};

    if (espacioId) {
        filtro.espacioId = espacioId;
    }

    if (fechaInicio || fechaFin) {
        filtro.inicio = {};

        if (fechaInicio) {
            filtro.inicio.$gte = fechaInicio;
        }

        if (fechaFin) {
            filtro.inicio.$lte = fechaFin;
        }
    }

    const reservas = await reservasRepository.findReservasFiltradas(filtro);
    const espacios = await espaciosRepository.findAllEspacios();

    const totalReservas = reservas.length;
    const totalPaginas = Math.ceil(totalReservas / reservasPorPagina);

    const reservasPagina = reservas.slice(
        (pagina - 1) * reservasPorPagina,
        pagina * reservasPorPagina
    );

    res.render('adminReservas', {
        reservas: reservasPagina,
        espacios,
        paginaActual: pagina,
        totalPaginas,
        espacioId,
        fechaInicio,
        fechaFin
    });
});

module.exports = router;