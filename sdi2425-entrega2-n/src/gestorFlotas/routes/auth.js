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
        return res.redirect('/admin/empleados');
    } else {
        return res.redirect('/trayectos/mis-trayectos');
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
            return res.redirect('/admin/empleados');
        } else {
            return res.redirect('/trayectos/mis-trayectos');
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
