const express = require('express');
const router = express.Router();

const { requireLogin, requireAdmin } = require('../modules/authMiddleware');
const usersRepository = require('../modules/usersRepository');

router.get('/admin/usuarios', requireLogin, requireAdmin, async (req, res) => {
    const pagina = parseInt(req.query.pagina) || 1;
    const usuariosPorPagina = 5;

    const totalUsuarios = await usersRepository.countUsers();
    const totalPaginas = Math.ceil(totalUsuarios / usuariosPorPagina);

    const usuarios = await usersRepository.findUsersPaginated(
        (pagina - 1) * usuariosPorPagina,
        usuariosPorPagina
    );

    res.render('adminUsuarios', {
        usuarios,
        paginaActual: pagina,
        totalPaginas
    });
});

module.exports = router;