const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const router = express.Router();
const usersRepository = require('../../modules/usersRepository');
const { JWT_SECRET } = require('../../modules/api/jwtMiddleware');

router.post('/api/auth/login', async (req, res) => {
    const { dni, password } = req.body;

    if (!dni || !password) {
        return res.status(400).json({
            error: 'DNI y contraseña son obligatorios'
        });
    }

    const user = await usersRepository.findUserByDni(dni);

    if (!user) {
        return res.status(401).json({
            error: 'Credenciales incorrectas'
        });
    }

    const hashedPassword = crypto.createHmac('sha256', 'uo264578')
        .update(password)
        .digest('hex');

    if (user.password !== hashedPassword) {
        return res.status(401).json({
            error: 'Credenciales incorrectas'
        });
    }

    if (user.rol !== 'Usuario Estándar') {
        return res.status(403).json({
            error: 'Solo los usuarios estándar pueden usar esta API'
        });
    }

    const token = jwt.sign(
        {
            dni: user.dni,
            rol: user.rol
        },
        JWT_SECRET,
        { expiresIn: '2h' }
    );

    res.status(200).json({
        token,
        user: {
            dni: user.dni,
            nombre: user.nombre,
            apellidos: user.apellidos,
            rol: user.rol
        }
    });
});

module.exports = router;