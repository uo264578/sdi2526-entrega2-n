const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const vehiculosRepository = require('../../modules/vehiculosRepository');
const SECRET_KEY = 'uo264578';

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token requerido' });
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Token inválido' });
        }
        req.user = user;
        next();
    });
}

router.get('/disponibles', authenticateToken, async (req, res) => {
    try {
        const vehiculosLibres = await vehiculosRepository.obtenerVehiculosLibres();
        res.json(vehiculosLibres);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

module.exports = router;
