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

module.exports = { requireLogin, requireAdmin, requireEmployee };


module.exports = {
    requireLogin,
    requireAdmin,
    requireEmployee
};
