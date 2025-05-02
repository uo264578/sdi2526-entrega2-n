const express = require('express');
const router = express.Router();
const trayectosRepository = require('../../modules/trayectosRepository');
const vehiculosRepository = require('../../modules/vehiculosRepository');
const { verifyToken } = require('../../modules/authMiddleware');

router.post('/iniciar', verifyToken, async (req, res) => {
    const matricula = req.body.matricula;
    const dniEmpleado = req.user.dni; // viene del token

    try {
        const trayectoEnCurso = await trayectosRepository.findTrayectoEnCursoByEmpleado(dniEmpleado);
        if (trayectoEnCurso) {
            return res.status(400).json({ error: "Ya tienes un trayecto en curso." });
        }

        const vehiculoEnUso = await trayectosRepository.findTrayectoEnCursoByVehiculo(matricula);
        if (vehiculoEnUso) {
            return res.status(400).json({ error: "Este vehículo ya está en uso por otro empleado." });
        }

        const ultimoTrayecto = await trayectosRepository.findUltimoTrayectoVehiculo(matricula);
        const odometroInicio = ultimoTrayecto ? ultimoTrayecto.odometroFin : 0;

        const trayecto = {
            dniEmpleado: dniEmpleado,
            matriculaVehiculo: matricula,
            fechaInicio: new Date(),
            odometroInicio: odometroInicio
        };

        await trayectosRepository.iniciarNuevoTrayecto(trayecto);

        await vehiculosRepository.marcarVehiculoOcupado(matricula);

        res.status(201).json({ message: "Trayecto iniciado correctamente." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al iniciar el trayecto." });
    }
});

router.get('/vehiculo/:matricula', verifyToken, async (req, res) => {
    const matricula = req.params.matricula;

    try {
        const trayectos = await trayectosRepository.findTrayectosByVehiculo(matricula);
        res.status(200).json(trayectos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener trayectos del vehículo." });
    }
});

router.get('/mis-trayectos', verifyToken, async (req, res) => {
    const dniEmpleado = req.user.dni;

    try {
        const trayectos = await trayectosRepository.findTrayectosByDni(dniEmpleado);
        res.status(200).json(trayectos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error obteniendo trayectos del usuario." });
    }
});

router.post('/finalizar', verifyToken, async (req, res) => {
    const { idTrayecto, odometroFin, observaciones } = req.body;
    const dniEmpleado = req.user.dni;

    if (!idTrayecto || odometroFin == null) {
        return res.status(400).json({ error: "Faltan datos obligatorios." });
    }

    try {
        const trayecto = await trayectosRepository.findTrayectoById(idTrayecto);

        if (!trayecto) {
            return res.status(404).json({ error: "Trayecto no encontrado." });
        }

        if (trayecto.fechaFin) {
            return res.status(400).json({ error: "El trayecto ya fue finalizado." });
        }

        if (trayecto.dniEmpleado !== dniEmpleado) {
            return res.status(403).json({ error: "No autorizado para finalizar este trayecto." });
        }

        await trayectosRepository.finalizarTrayecto(idTrayecto, {
            fechaFin: new Date(),
            odometroFin: odometroFin,
            observaciones: observaciones || ""
        });

        await vehiculosRepository.marcarVehiculoLibre(trayecto.matriculaVehiculo);

        res.status(200).json({ message: "Trayecto finalizado correctamente." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al finalizar el trayecto." });
    }
});


module.exports = router;
