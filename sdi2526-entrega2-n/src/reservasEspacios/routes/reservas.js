const express = require('express');
const router = express.Router();

const { requireLogin, requireStandardUser } = require('../modules/authMiddleware');
const reservasRepository = require('../modules/reservasRepository');
const espaciosRepository = require('../modules/espaciosRepository');
const bloqueosRepository = require('../modules/bloqueosRepository');

function seSolapan(inicioA, finA, inicioB, finB) {
    return inicioA < finB && finA > inicioB;
}

router.get('/reservas/mis-reservas', requireLogin, requireStandardUser, async (req, res) => {
    let reservas = await reservasRepository.findReservasByUsuario(req.session.user.dni);

    res.render('misReservas', {
        reservas
    });
});

router.get('/reservas/add/:espacioId', requireLogin, requireStandardUser, async (req, res) => {
    const espacio = await espaciosRepository.findEspacioById(req.params.espacioId);

    res.render('addReserva', { espacio });
});

router.post('/reservas/add/:espacioId', requireLogin, requireStandardUser, async (req, res) => {
    const { inicio, fin, motivo } = req.body;
    const espacioId = req.params.espacioId;

    const espacio = await espaciosRepository.findEspacioById(espacioId);

    const fechaInicio = new Date(inicio);
    const fechaFin = new Date(fin);

    let errores = [];

    if (fechaInicio >= fechaFin) {
        errores.push('La fecha de inicio debe ser anterior a la de fin.');
    }

    const reservasActivas = await reservasRepository.findReservasActivasByEspacio(espacioId);
    for (const r of reservasActivas) {
        if (seSolapan(fechaInicio, fechaFin, new Date(r.inicio), new Date(r.fin))) {
            errores.push('Se solapa con otra reserva.');
        }
    }

    const bloqueos = await bloqueosRepository.findBloqueosByEspacio(espacioId);
    for (const b of bloqueos) {
        if (seSolapan(fechaInicio, fechaFin, new Date(b.inicio), new Date(b.fin))) {
            errores.push('Se solapa con un bloqueo.');
        }
    }

    if (errores.length > 0) {
        return res.render('addReserva', {
            errores,
            espacio,
            reserva: { inicio, fin, motivo }
        });
    }

    await reservasRepository.insertReserva({
        dniUsuario: req.session.user.dni,
        espacioId,
        nombreEspacio: espacio.nombre,
        inicio,
        fin,
        motivo,
        estado: 'ACTIVA'
    });

    res.redirect('/reservas/mis-reservas');
});

router.post('/reservas/cancelar/:id', requireLogin, requireStandardUser, async (req, res) => {
    await reservasRepository.cancelarReserva(req.params.id);
    res.redirect('/reservas/mis-reservas');
});

module.exports = router;