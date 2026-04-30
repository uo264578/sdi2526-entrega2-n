const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const usersRepository = require('../modules/usersRepository');
const logsRepository = require('../modules/logsRepository');
const log4js = require('log4js');
const logger = log4js.getLogger('app');

router.get('/', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    if (req.session.user.rol === 'Administrador') {
        return res.redirect('/admin/reservas');
    } else {
        return res.redirect('/espacios');
    }
});

router.get('/login', (req, res) => {
    let mensaje = null;
    if (req.query.logout === 'true') {
        mensaje = 'Ha cerrado sesión correctamente.';
    }
    res.render('login', { mensaje: mensaje });
});

router.post('/login', async (req, res) => {
    const { dni, password } = req.body;
    const hashedPassword = crypto.createHmac('sha256', 'uo264578')
        .update(password.trim())
        .digest('hex');

    const user = await usersRepository.findUserByDni(dni);

    if (user && user.password === hashedPassword) {
        req.session.user = { dni: user.dni, rol: user.rol };
        await logsRepository.insertarLog({
            tipo: "LOGIN-EX",
            fechaHora: new Date(),
            texto: `Inicio de sesión exitoso para usuario: ${dni}`
        });
        if (user.rol === 'Administrador') {
            return res.redirect('/admin/reservas');
        } else {
            return res.redirect('/espacios');
        }
    } else {
        await logsRepository.insertarLog({
            tipo: "LOGIN-ERR",
            fechaHora: new Date(),
            texto: `Intento fallido de login para usuario: ${dni}`
        });

        return res.render('login', { mensaje: "Credenciales incorrectas." });
    }
});

router.get('/signup', (req, res) => {
    res.render('signup');
});

router.post('/signup', async (req, res) => {
    let { dni, nombre, apellidos, password, passwordConfirm } = req.body;

    dni = dni.trim();
    nombre = nombre.trim();
    apellidos = apellidos.trim();

    const errores = [];

    if (!dni || !nombre || !apellidos || !password || !passwordConfirm) {
        errores.push('Todos los campos son obligatorios.');
    }

    const dniRegex = /^[0-9]{8}[A-Z]$/i;
    if (!dniRegex.test(dni)) {
        errores.push('El DNI no tiene un formato válido.');
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])\S{12,20}$/;
    if (!passwordRegex.test(password)) {
        errores.push('La contraseña debe tener entre 12 y 20 caracteres, una mayúscula, una minúscula, un dígito, un carácter especial y no contener espacios.');
    }

    if (password !== passwordConfirm) {
        errores.push('Las contraseñas no coinciden.');
    }

    const existe = await usersRepository.findUserByDni(dni);
    if (existe) {
        errores.push('Ya existe un usuario con ese DNI.');
    }

    if (errores.length > 0) {
        return res.render('signup', { errores, dni, nombre, apellidos });
    }

    const hashedPassword = crypto.createHmac('sha256', 'uo264578')
        .update(password)
        .digest('hex');

    await usersRepository.insertUser({
        dni,
        nombre,
        apellidos,
        password: hashedPassword,
        rol: 'Usuario Estándar'
    });

    req.session.user = { dni, rol: 'Usuario Estándar' };

    res.redirect('/espacios');
});

router.get('/logout', (req, res) => {
    const username = req.session.user ? req.session.user.dni : 'Anónimo';

    req.session.destroy(async (err) => {
        if (err) {
            console.error("Error cerrando sesión:", err);
            return res.redirect('/');
        }
        await logsRepository.insertarLog({
            tipo: "LOGOUT",
            fechaHora: new Date(),
            texto: `Cierre de sesión de usuario: ${username}`
        });

        res.redirect('/login?logout=true');
    });
});



module.exports = router;
