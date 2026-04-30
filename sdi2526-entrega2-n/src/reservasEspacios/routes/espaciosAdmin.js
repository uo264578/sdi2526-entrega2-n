const express = require('express');
const router = express.Router();
const { requireLogin, requireAdmin } = require('../modules/authMiddleware');
const espaciosRepository = require('../modules/espaciosRepository');

function validarEspacio(nombre, capacidad) {
    const errores = [];

    if (!nombre || nombre.trim() === '') {
        errores.push('El nombre no puede estar vacío.');
    }

    if (!capacidad || parseInt(capacidad) < 1) {
        errores.push('La capacidad debe ser un número entero mayor o igual que 1.');
    }

    return errores;
}

router.get('/admin/espacios', requireLogin, requireAdmin, async (req, res) => {
    const espacios = await espaciosRepository.findAllEspacios();
    res.render('adminEspacios', { espacios });
});

router.get('/admin/espacios/add', requireLogin, requireAdmin, (req, res) => {
    res.render('addEspacio');
});

router.post('/admin/espacios/add', requireLogin, requireAdmin, async (req, res) => {
    const { nombre, tipo, ubicacion, capacidad, descripcion } = req.body;
    const errores = validarEspacio(nombre, capacidad);

    const existe = await espaciosRepository.findEspacioByNombre(nombre);
    if (existe) {
        errores.push('Ya existe un espacio activo con ese nombre.');
    }

    if (errores.length > 0) {
        return res.render('addEspacio', {
            errores,
            espacio: { nombre, tipo, ubicacion, capacidad, descripcion }
        });
    }

    await espaciosRepository.insertEspacio({
        nombre: nombre.trim(),
        tipo,
        ubicacion,
        capacidad: parseInt(capacidad),
        descripcion,
        activo: true
    });

    res.redirect('/admin/espacios');
});

router.get('/admin/espacios/edit/:id', requireLogin, requireAdmin, async (req, res) => {
    const espacio = await espaciosRepository.findEspacioById(req.params.id);

    if (!espacio) {
        return res.status(404).send('Espacio no encontrado');
    }

    res.render('editEspacio', { espacio });
});

router.post('/admin/espacios/edit/:id', requireLogin, requireAdmin, async (req, res) => {
    const { nombre, tipo, ubicacion, capacidad, descripcion } = req.body;
    const errores = validarEspacio(nombre, capacidad);

    const existente = await espaciosRepository.findEspacioByNombre(nombre);
    if (existente && existente._id.toString() !== req.params.id) {
        errores.push('Ya existe otro espacio activo con ese nombre.');
    }

    if (errores.length > 0) {
        return res.render('editEspacio', {
            errores,
            espacio: {
                _id: req.params.id,
                nombre,
                tipo,
                ubicacion,
                capacidad,
                descripcion
            }
        });
    }

    await espaciosRepository.updateEspacio(req.params.id, {
        nombre: nombre.trim(),
        tipo,
        ubicacion,
        capacidad: parseInt(capacidad),
        descripcion
    });

    res.redirect('/admin/espacios');
});

router.post('/admin/espacios/desactivar/:id', requireLogin, requireAdmin, async (req, res) => {
    await espaciosRepository.changeActivo(req.params.id, false);
    res.redirect('/admin/espacios');
});

router.post('/admin/espacios/activar/:id', requireLogin, requireAdmin, async (req, res) => {
    await espaciosRepository.changeActivo(req.params.id, true);
    res.redirect('/admin/espacios');
});

module.exports = router;