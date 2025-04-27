const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const usersRepository = require('../../modules/usersRepository');
const jwt = require('jsonwebtoken');

const SECRET_KEY = 'uo264578';

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Faltan datos de email o contraseña.' });
    }

    const user = await usersRepository.findUserByEmail(email);

    if (!user) {
        return res.status(401).json({ error: 'Email o contraseña incorrectos.' });
    }

    const hashedPassword = crypto.createHmac('sha256', 'claveSecreta')
        .update(password.trim())
        .digest('hex');

    if (user.password !== hashedPassword) {
        return res.status(401).json({ error: 'Email o contraseña incorrectos.' });
    }

    const token = jwt.sign(
        { userId: user._id, email: user.email, rol: user.rol },
        SECRET_KEY,
        { expiresIn: '1h' }
    );

    res.json({
        token: token,
        message: 'Inicio de sesión correcto.'
    });
});

module.exports = router;
