const express = require('express');
const router = express.Router();

const { verifyToken } = require('../../modules/api/jwtMiddleware');

const reservasRepository = require('../../modules/reservasRepository');
const espaciosRepository = require('../../modules/espaciosRepository');
const bloqueosRepository = require('../../modules/bloqueosRepository');

function seSolapan(inicioA, finA, inicioB, finB) {
    return inicioA < finB && finA > inicioB;
}

async function validarReserva(espacioId, inicio, fin) {
    const errores = [];

    if (!espacioId || !inicio || !fin) {
        errores.push('Espacio, inicio y fin son obligatorios.');
        return errores;
    }

    const espacio = await espaciosRepository.findEspacioById(espacioId);

    if (!espacio) {
        errores.push('El espacio seleccionado no existe.');
        return errores;
    }

    if (!espacio.activo) {
        errores.push('No se puede reservar un espacio desactivado.');
    }

    const fechaInicio = new Date(inicio);
    const fechaFin = new Date(fin);

    if (isNaN(fechaInicio.getTime()) || isNaN(fechaFin.getTime())) {
        errores.push('Las fechas no tienen un formato válido.');
        return errores;
    }

    if (fechaInicio >= fechaFin) {
        errores.push('La fecha de inicio debe ser anterior a la fecha de fin.');
        return errores;
    }

    if (fechaInicio < new Date()) {
        errores.push('No se pueden crear reservas en el pasado.');
    }

    const reservasActivas = await reservasRepository.findReservasActivasByEspacio(espacioId);

    for (const reserva of reservasActivas) {
        if (fechaInicio < new Date(reserva.fin) && fechaFin > new Date(reserva.inicio)) {
            errores.push('La reserva se solapa con otra reserva activa.');
            break;
        }
    }

    const bloqueosActivos = await bloqueosRepository.findBloqueosByEspacio(espacioId);

    for (const bloqueo of bloqueosActivos) {
        if (fechaInicio < new Date(bloqueo.fin) && fechaFin > new Date(bloqueo.inicio)) {
            errores.push('La reserva se solapa con un bloqueo de mantenimiento activo.');
            break;
        }
    }

    return errores;
}

async function validarReservaEditando(espacioId, inicio, fin, reservaIdEditada) {
    const errores = [];

    if (!espacioId || !inicio || !fin) {
        errores.push('Espacio, inicio y fin son obligatorios.');
        return errores;
    }

    const espacio = await espaciosRepository.findEspacioById(espacioId);

    if (!espacio) {
        errores.push('El espacio seleccionado no existe.');
        return errores;
    }

    if (!espacio.activo) {
        errores.push('No se puede reservar un espacio desactivado.');
    }

    const fechaInicio = new Date(inicio);
    const fechaFin = new Date(fin);

    if (isNaN(fechaInicio.getTime()) || isNaN(fechaFin.getTime())) {
        errores.push('Las fechas no tienen un formato válido.');
        return errores;
    }

    if (fechaInicio >= fechaFin) {
        errores.push('La fecha de inicio debe ser anterior a la fecha de fin.');
        return errores;
    }

    if (fechaInicio < new Date()) {
        errores.push('No se pueden crear reservas en el pasado.');
    }

    const reservasActivas = await reservasRepository.findReservasActivasByEspacio(espacioId);

    for (const reserva of reservasActivas) {
        if (reserva._id.toString() === reservaIdEditada) {
            continue;
        }

        if (fechaInicio < new Date(reserva.fin) && fechaFin > new Date(reserva.inicio)) {
            errores.push('La reserva se solapa con otra reserva activa.');
            break;
        }
    }

    const bloqueosActivos = await bloqueosRepository.findBloqueosByEspacio(espacioId);

    for (const bloqueo of bloqueosActivos) {
        if (fechaInicio < new Date(bloqueo.fin) && fechaFin > new Date(bloqueo.inicio)) {
            errores.push('La reserva se solapa con un bloqueo de mantenimiento activo.');
            break;
        }
    }

    return errores;
}

function sumarFrecuencia(fecha, frecuencia) {
    const nuevaFecha = new Date(fecha);

    if (frecuencia === 'DIARIA') {
        nuevaFecha.setDate(nuevaFecha.getDate() + 1);
    } else if (frecuencia === 'SEMANAL') {
        nuevaFecha.setDate(nuevaFecha.getDate() + 7);
    } else if (frecuencia === 'MENSUAL') {
        nuevaFecha.setMonth(nuevaFecha.getMonth() + 1);
    } else if (frecuencia === 'ANUAL') {
        nuevaFecha.setFullYear(nuevaFecha.getFullYear() + 1);
    }

    return nuevaFecha;
}

function formatoDatetimeLocal(fecha) {
    return fecha.toISOString().slice(0, 16);
}

router.post('/api/reservas', verifyToken, async (req, res) => {
    try {
        const { espacioId, inicio, fin, motivo } = req.body;

        const errores = await validarReserva(espacioId, inicio, fin);

        if (errores.length > 0) {
            return res.status(400).json({ errores });
        }

        const espacio = await espaciosRepository.findEspacioById(espacioId);

        if (!espacio) {
            return res.status(400).json({
                errores: ['El espacio seleccionado no existe.']
            });
        }

        const nuevaReserva = {
            dniUsuario: req.user.dni,
            espacioId,
            nombreEspacio: espacio.nombre,
            inicio,
            fin,
            motivo: motivo || '',
            estado: 'ACTIVA'
        };

        const resultado = await reservasRepository.insertReserva(nuevaReserva);

        res.status(201).json({
            mensaje: 'Reserva creada correctamente',
            reserva: {
                _id: resultado.insertedId,
                ...nuevaReserva
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Error interno al crear la reserva'
        });
    }
});

router.get('/api/reservas', verifyToken, async (req, res) => {
    const reservas = await reservasRepository.findReservasByUsuario(req.user.dni);

    res.status(200).json({
        reservas
    });
});

router.delete('/api/reservas/:id', verifyToken, async (req, res) => {
    const reserva = await reservasRepository.findReservaById(req.params.id);

    if (!reserva) {
        return res.status(404).json({
            error: 'Reserva no encontrada'
        });
    }

    if (reserva.dniUsuario !== req.user.dni) {
        return res.status(403).json({
            error: 'No puedes cancelar una reserva de otro usuario'
        });
    }

    if (reserva.estado !== 'ACTIVA') {
        return res.status(400).json({
            error: 'Solo se pueden cancelar reservas activas'
        });
    }

    await reservasRepository.cancelarReserva(req.params.id);

    res.status(200).json({
        mensaje: 'Reserva cancelada correctamente'
    });
});

router.put('/api/reservas/:id', verifyToken, async (req, res) => {
    try {
        const reserva = await reservasRepository.findReservaById(req.params.id);

        if (!reserva) {
            return res.status(404).json({
                error: 'Reserva no encontrada'
            });
        }

        if (reserva.dniUsuario !== req.user.dni) {
            return res.status(403).json({
                error: 'No puedes editar una reserva de otro usuario'
            });
        }

        if (reserva.estado !== 'ACTIVA') {
            return res.status(400).json({
                error: 'Solo se pueden editar reservas activas'
            });
        }

        const { espacioId, inicio, fin, motivo } = req.body;

        const errores = await validarReservaEditando(
            espacioId,
            inicio,
            fin,
            req.params.id
        );

        if (errores.length > 0) {
            return res.status(400).json({ errores });
        }

        const espacio = await espaciosRepository.findEspacioById(espacioId);

        const datosReserva = {
            espacioId,
            nombreEspacio: espacio.nombre,
            inicio,
            fin,
            motivo: motivo || ''
        };

        await reservasRepository.updateReserva(req.params.id, datosReserva);

        res.status(200).json({
            mensaje: 'Reserva editada correctamente',
            reserva: {
                _id: req.params.id,
                dniUsuario: req.user.dni,
                ...datosReserva,
                estado: 'ACTIVA'
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Error interno al editar la reserva'
        });
    }
});

router.post('/api/reservas/:id/recurrentes', verifyToken, async (req, res) => {
    try {
        const { frecuencia, fechaFinRecurrencia } = req.body;

        const reservaBase = await reservasRepository.findReservaById(req.params.id);

        if (!reservaBase) {
            return res.status(404).json({
                error: 'Reserva base no encontrada'
            });
        }

        if (reservaBase.dniUsuario !== req.user.dni) {
            return res.status(403).json({
                error: 'No puedes crear recurrencias sobre una reserva ajena'
            });
        }

        if (reservaBase.estado !== 'ACTIVA') {
            return res.status(400).json({
                error: 'La reserva base debe estar activa'
            });
        }

        const frecuenciasValidas = ['DIARIA', 'SEMANAL', 'MENSUAL', 'ANUAL'];

        if (!frecuenciasValidas.includes(frecuencia)) {
            return res.status(400).json({
                error: 'Frecuencia no válida. Debe ser DIARIA, SEMANAL, MENSUAL o ANUAL'
            });
        }

        if (!fechaFinRecurrencia) {
            return res.status(400).json({
                error: 'La fecha de fin de recurrencia es obligatoria'
            });
        }

        const finRecurrencia = new Date(fechaFinRecurrencia);

        if (isNaN(finRecurrencia.getTime())) {
            return res.status(400).json({
                error: 'La fecha de fin de recurrencia no tiene formato válido'
            });
        }

        const reservasNuevas = [];

        let inicioNueva = sumarFrecuencia(new Date(reservaBase.inicio), frecuencia);
        let finNueva = sumarFrecuencia(new Date(reservaBase.fin), frecuencia);

        while (inicioNueva <= finRecurrencia) {
            const inicioStr = formatoDatetimeLocal(inicioNueva);
            const finStr = formatoDatetimeLocal(finNueva);

            const errores = await validarReserva(
                reservaBase.espacioId,
                inicioStr,
                finStr
            );

            if (errores.length > 0) {
                return res.status(400).json({
                    error: 'No se han creado reservas recurrentes por existir un solape o error de validación.',
                    errores
                });
            }

            reservasNuevas.push({
                dniUsuario: req.user.dni,
                espacioId: reservaBase.espacioId,
                nombreEspacio: reservaBase.nombreEspacio,
                inicio: inicioStr,
                fin: finStr,
                motivo: reservaBase.motivo || '',
                estado: 'ACTIVA',
                recurrente: true,
                reservaBaseId: req.params.id,
                frecuencia
            });

            inicioNueva = sumarFrecuencia(inicioNueva, frecuencia);
            finNueva = sumarFrecuencia(finNueva, frecuencia);
        }

        if (reservasNuevas.length === 0) {
            return res.status(400).json({
                error: 'No se ha generado ninguna reserva recurrente.'
            });
        }

        const resultado = await reservasRepository.insertManyReservas(reservasNuevas);

        res.status(201).json({
            mensaje: 'Reservas recurrentes creadas correctamente',
            total: reservasNuevas.length,
            reservas: reservasNuevas.map((reserva, index) => ({
                _id: Object.values(resultado.insertedIds)[index],
                ...reserva
            }))
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Error interno al crear reservas recurrentes'
        });
    }
});

module.exports = router;