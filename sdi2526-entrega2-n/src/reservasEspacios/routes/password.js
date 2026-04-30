const express = require('express');
const crypto = require('crypto');
const router = express.Router();

const { requireLogin, requireStandardUser } = require('../modules/authMiddleware');
const usersRepository = require('../modules/usersRepository');

router.get('/usuarios/password', requireLogin, requireStandardUser, (req, res) => {
    res.render('changePassword');
});

router.post('/usuarios/password', requireLogin, requireStandardUser, async (req, res) => {
    const { password, passwordConfirm } = req.body;
    const errores = [];

    if (!password || password.trim() === '') {
        errores.push('La nueva contraseña no puede estar vacía.');
    }

    if (password !== passwordConfirm) {
        errores.push('Las contraseñas no coinciden.');
    }

    if (errores.length > 0) {
        return res.render('changePassword', { errores });
    }

    const hashedPassword = crypto.createHmac('sha256', 'uo264578')
        .update(password)
        .digest('hex');

    await usersRepository.updatePasswordByDni(req.session.user.dni, hashedPassword);

    res.render('changePassword', {
        mensaje: 'Contraseña modificada correctamente.'
    });
});

module.exports = router;