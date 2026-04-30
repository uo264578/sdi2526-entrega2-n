const express = require('express');
const router = express.Router();
const { requireLogin, requireAdmin } = require('../modules/authMiddleware');

const bloqueosRepository = require('../modules/bloqueosRepository');
const espaciosRepository = require('../modules/espaciosRepository');
const reservasRepository = require('../modules/reservasRepository');

function seSolapan(inicioA, finA, inicioB, finB) {
    return inicioA < finB && finA > inicioB;
}

function validarBloqueo(inicio, fin, motivo) {
    const errores = [];

    if (!inicio || !fin || !motivo || motivo.trim() === '') {
        errores.push('Inicio, fin y motivo son obligatorios.');
    }

    const fechaInicio = new Date(inicio);
    const fechaFin = new Date(fin);

    if (fechaInicio >= fechaFin) {
        errores.push('La fecha de inicio debe ser anterior a la fecha de fin.');
    }

    return errores;
}

router.get('/admin/bloqueos', requireLogin, requireAdmin, async (req, res) => {
    const bloqueos = await bloqueosRepository.findAllBloqueos();
    res.render('adminBloqueos', { bloqueos });
});

router.get('/admin/bloqueos/add', requireLogin, requireAdmin, async (req, res) => {
    const espacios = await espaciosRepository.findAllEspacios();
    res.render('addBloqueo', { espacios });
});

router.post('/admin/bloqueos/add', requireLogin, requireAdmin, async (req, res) => {
    const { espacioId, inicio, fin, motivo } = req.body;

    const espacios = await espaciosRepository.findAllEspacios();
    const espacio = await espaciosRepository.findEspacioById(espacioId);

    let errores = validarBloqueo(inicio, fin, motivo);

    if (!espacio) {
        errores.push('El espacio seleccionado no existe.');
    }

    const fechaInicio = new Date(inicio);
    const fechaFin = new Date(fin);

    if (errores.length === 0) {
        const bloqueosActivos = await bloqueosRepository.findBloqueosByEspacio(espacioId);

        for (const bloqueo of bloqueosActivos) {
            if (seSolapan(fechaInicio, fechaFin, new Date(bloqueo.inicio), new Date(bloqueo.fin))) {
                errores.push('El bloqueo se solapa con otro bloqueo activo.');
                break;
            }
        }

        const reservasActivas = await reservasRepository.findReservasActivasByEspacio(espacioId);

        for (const reserva of reservasActivas) {
            if (seSolapan(fechaInicio, fechaFin, new Date(reserva.inicio), new Date(reserva.fin))) {
                errores.push('El bloqueo se solapa con una reserva activa.');
                break;
            }
        }
    }

    if (errores.length > 0) {
        return res.render('addBloqueo', {
            errores,
            espacios,
            bloqueo: { espacioId, inicio, fin, motivo }
        });
    }

    await bloqueosRepository.insertBloqueo({
        espacioId,
        nombreEspacio: espacio.nombre,
        inicio,
        fin,
        motivo,
        estado: 'ACTIVO'
    });

    res.redirect('/admin/bloqueos');
});

router.post('/admin/bloqueos/cancelar/:id', requireLogin, requireAdmin, async (req, res) => {
    await bloqueosRepository.cancelarBloqueo(req.params.id);
    res.redirect('/admin/bloqueos');
});

module.exports = router;