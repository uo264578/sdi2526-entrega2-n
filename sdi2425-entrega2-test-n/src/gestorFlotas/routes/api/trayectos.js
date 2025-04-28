const express = require('express');
const router = express.Router();
const trayectosRepository = require('../../modules/trayectosRepository');
const vehiculosRepository = require('../../modules/vehiculosRepository');
const { verifyToken } = require('../../modules/authMiddleware');

router.post('/trayectos/iniciar', verifyToken, async (req, res) => {
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

router.get('/trayectos/vehiculo/:matricula', verifyToken, async (req, res) => {
    const matricula = req.params.matricula;

    try {
        const trayectos = await trayectosRepository.findTrayectosByVehiculo(matricula);
        res.status(200).json(trayectos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener trayectos del vehículo." });
    }
});

router.get('/trayectos/mis-trayectos', verifyToken, async (req, res) => {
    const dniEmpleado = req.user.dni;

    try {
        const trayectos = await trayectosRepository.findTrayectosByDni(dniEmpleado);
        res.status(200).json(trayectos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error obteniendo trayectos del usuario." });
    }
});


module.exports = router;
