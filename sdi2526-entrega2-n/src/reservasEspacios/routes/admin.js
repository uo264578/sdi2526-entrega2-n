const express = require('express');
const router = express.Router();
const { requireLogin, requireAdmin } = require('../modules/authMiddleware');
const usersRepository = require('../modules/usersRepository');
const vehiculosRepository = require('../modules/vehiculosRepository');
const logsRepository = require('../modules/logsRepository');
const crypto = require('crypto');
const rolesDisponibles = ['Administrador', 'Empleado Estándar'];

router.get('/admin/empleados', requireLogin, requireAdmin, async (req, res) => {
    const pagina = parseInt(req.query.pagina) || 1; // Página actual
    const empleadosPorPagina = 5; // 5 empleados por página

    const empleados = await usersRepository.findAllUsers();

    const totalEmpleados = empleados.length;
    const totalPaginas = Math.ceil(totalEmpleados / empleadosPorPagina);

    const empleadosPagina = empleados.slice((pagina - 1) * empleadosPorPagina, pagina * empleadosPorPagina);

    res.render('adminEmpleados', {
        empleados: empleadosPagina,
        paginaActual: pagina,
        totalPaginas: totalPaginas
    });
});


router.get('/admin/registrar-empleado', requireLogin, requireAdmin, (req, res) => {
    res.render('registrarEmpleado');
});

router.post('/admin/registrar-empleado', requireLogin, requireAdmin, async (req, res) => {
    let { dni, nombre, apellidos } = req.body;

    dni = dni.trim();
    nombre = nombre.trim();
    apellidos = apellidos.trim();

    const errores = [];

    if (!dni || !nombre || !apellidos) {
        errores.push('Todos los campos son obligatorios.');
    }

    const dniRegex = /^[0-9]{8}[A-Z]$/i;
    if (!dniRegex.test(dni)) {
        errores.push('El DNI no tiene un formato válido.');
    }

    const existe = await usersRepository.findUserByDni(dni);
    if (existe) {
        errores.push('Ya existe un usuario con ese DNI.');
    }

    if (errores.length > 0) {
        return res.render('registrarEmpleado', { errores, dni, nombre, apellidos });
    }

    const passwordGenerada = generarPasswordFuerte(12);

    const hashedPassword = crypto.createHmac('sha256', 'uo264578')
        .update(passwordGenerada)
        .digest('hex');

    await usersRepository.insertUser({
        dni: dni,
        nombre: nombre,
        apellidos: apellidos,
        rol: 'Empleado Estándar',
        password: hashedPassword
    });
    await logsRepository.insertarLog({
        tipo: "ALTA",
        fechaHora: new Date(),
        texto: `Alta de nuevo empleado: ${dni}`
    });
    res.render('registrarEmpleado', { mensajeExito: `Empleado registrado correctamente. Contraseña generada: ${passwordGenerada}` });
});

function generarPasswordFuerte(longitud) {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";
    let password = "";
    for (let i = 0, n = charset.length; i < longitud; ++i) {
        password += charset.charAt(Math.floor(Math.random() * n));
    }
    return password;
}

router.get('/admin/registrar-vehiculo', requireLogin, requireAdmin, (req, res) => {
    res.render('registrarVehiculo');
});

router.post('/admin/registrar-vehiculo', requireLogin, requireAdmin, async (req, res) => {
    let { matricula, bastidor, marca, modelo, combustible } = req.body;

    matricula = matricula.trim();
    bastidor = bastidor.trim();
    marca = marca.trim();
    modelo = modelo.trim();
    combustible = combustible.trim();

    const errores = [];

    if (!matricula || !bastidor || !marca || !modelo || !combustible) {
        errores.push('Todos los campos son obligatorios.');
    }

    const matriculaRegex = /^[0-9]{4}[A-Z]{3}$/i;
    const matriculaRegexAlternativa = /^[A-Z]{1}[0-9]{4}[A-Z]{2}$/i; // O1234AB
    if (!matriculaRegex.test(matricula) && !matriculaRegexAlternativa.test(matricula)) {
        errores.push('La matrícula no tiene un formato válido.');
    }

    if (bastidor.length !== 17) {
        errores.push('El número de bastidor debe tener exactamente 17 caracteres.');
    }

    const combustiblesValidos = ["Gasolina", "Diesel", "Microhíbrido", "Híbrido", "Eléctrico", "GLP", "GNL"];
    if (!combustiblesValidos.includes(combustible)) {
        errores.push('Tipo de combustible no válido.');
    }

    const matriculaExistente = await vehiculosRepository.findVehiculoByMatricula(matricula);
    if (matriculaExistente) {
        errores.push('Ya existe un vehículo con esa matrícula.');
    }

    const bastidorExistente = await vehiculosRepository.findVehiculoByBastidor(bastidor);
    if (bastidorExistente) {
        errores.push('Ya existe un vehículo con ese número de bastidor.');
    }

    if (errores.length > 0) {
        return res.render('registrarVehiculo', { errores, matricula, bastidor, marca, modelo, combustible });
    }

    await vehiculosRepository.insertVehiculo({
        matricula: matricula,
        bastidor: bastidor,
        marca: marca,
        modelo: modelo,
        combustible: combustible,
        estado: "LIBRE"
    });

    res.redirect('/admin/vehiculos');
});

router.get('/admin/editar-empleado/:id', requireLogin, requireAdmin, async (req, res) => {
    const id = req.params.id;
    const empleado = await usersRepository.findUserById(id);

    if (!empleado) {
        return res.status(404).send('Empleado no encontrado');
    }

    res.render('editarEmpleado', { empleado, rolesDisponibles });
});

router.post('/admin/editar-empleado/:id', requireLogin, requireAdmin, async (req, res) => {
    const id = req.params.id;
    let { dni, nombre, apellidos, rol } = req.body;

    dni = dni.trim();
    nombre = nombre.trim();
    apellidos = apellidos.trim();
    rol = rol.trim();

    const errores = [];

    if (!dni || !nombre || !apellidos) {
        errores.push('Todos los campos son obligatorios.');
    }

    const dniRegex = /^[0-9]{8}[A-Z]$/i;
    if (!dniRegex.test(dni)) {
        errores.push('El DNI no tiene formato válido.');
    }

    if (!rolesDisponibles.includes(rol)) {
        errores.push('Rol no válido.');
    }

    const existingUser = await usersRepository.findUserByDni(dni);
    if (existingUser && existingUser._id.toString() !== id) {
        errores.push('Ya existe un usuario con ese DNI.');
    }

    if (errores.length > 0) {
        const empleado = { _id: id, dni, nombre, apellidos, rol };
        return res.render('editarEmpleado', { errores, empleado, rolesDisponibles });
    }

    await usersRepository.updateUser(id, {
        dni: dni,
        nombre: nombre,
        apellidos: apellidos,
        rol: rol
    });

    res.redirect('/admin/empleados');
});

router.get('/admin/vehiculos', requireLogin, requireAdmin, async (req, res) => {
    const pagina = parseInt(req.query.pagina) || 1;
    const vehiculosPorPagina = 5;

    const vehiculos = (await vehiculosRepository.findAllVehiculos())
        .sort((a, b) => a.matricula.localeCompare(b.matricula));

    const totalVehiculos = vehiculos.length;
    const totalPaginas = Math.ceil(totalVehiculos / vehiculosPorPagina);

    const vehiculosPagina = vehiculos.slice((pagina - 1) * vehiculosPorPagina, pagina * vehiculosPorPagina);

    res.render('adminVehiculos', {
        vehiculos: vehiculosPagina,
        paginaActual: pagina,
        totalPaginas: totalPaginas
    });
});

router.post('/admin/vehiculos/borrar', requireLogin, requireAdmin, async (req, res) => {
    const idsAEliminar = req.body.vehiculos;

    if (!idsAEliminar) {
        return res.redirect('/admin/vehiculos');
    }

    if (Array.isArray(idsAEliminar)) {
        for (const id of idsAEliminar) {
            await vehiculosRepository.deleteVehiculoById(id);
        }
    } else {
        await vehiculosRepository.deleteVehiculoById(idsAEliminar);
    }

    res.redirect('/admin/vehiculos');
});

router.get('/admin/logs', requireLogin, requireAdmin, async (req, res) => {
    const tipoFiltro = req.query.tipo || '';
    const logs = await logsRepository.buscarLogs(tipoFiltro);

    res.render('adminLogs', {
        logs: logs,
        tipoSeleccionado: tipoFiltro
    });
});

router.post('/admin/logs/borrar', requireLogin, requireAdmin, async (req, res) => {
    const tipo = req.body.tipo;
    await logsRepository.borrarLogs(tipo);

    if (tipo) {
        return res.redirect('/admin/logs?tipo=' + tipo);
    } else {
        return res.redirect('/admin/logs');
    }
});

module.exports = router;
