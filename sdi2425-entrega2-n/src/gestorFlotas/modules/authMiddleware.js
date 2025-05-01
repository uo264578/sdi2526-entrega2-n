const jwt = require('jsonwebtoken');
function requireLogin(req, res, next) {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    next();
}

function requireAdmin(req, res, next) {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    if (req.session.user.rol !== 'Administrador') {
        return res.status(403).send('Acceso denegado.');
    }
    next();
}

function requireEmployee(req, res, next) {
    if (req.session.user && req.session.user.rol === 'Empleado Estándar') {
        next();
    } else {
        res.redirect('/login');
    }
}
function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(401).json({ error: 'Token no proporcionado.' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token no válido.' });
    }

    jwt.verify(token, 'uo264578', (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Token inválido o expirado.' });
        }
        req.user = user;
        next();
    });
}


module.exports = {
    requireLogin,
    requireAdmin,
    requireEmployee,
    verifyToken
};
