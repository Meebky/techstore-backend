const express = require('express');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
const { proteger } = require('../middleware/auth');

const router = express.Router();

// Generar JWT
const generarToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// POST /api/auth/registro
router.post('/registro', async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;

    const existe = await Usuario.findOne({ email });
    if (existe) {
      return res.status(400).json({ ok: false, mensaje: 'El email ya está registrado' });
    }

    const usuario = await Usuario.create({ nombre, email, password, rol });
    const token = generarToken(usuario._id);

    res.status(201).json({
      ok: true,
      token,
      usuario: { id: usuario._id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol }
    });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: error.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ ok: false, mensaje: 'Email y contraseña son requeridos' });
    }

    const usuario = await Usuario.findOne({ email }).select('+password');
    if (!usuario || !(await usuario.compararPassword(password))) {
      return res.status(401).json({ ok: false, mensaje: 'Credenciales incorrectas' });
    }

    if (!usuario.activo) {
      return res.status(401).json({ ok: false, mensaje: 'Usuario desactivado' });
    }

    const token = generarToken(usuario._id);

    res.json({
      ok: true,
      token,
      usuario: { id: usuario._id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol }
    });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: error.message });
  }
});

// GET /api/auth/perfil  (ruta protegida de prueba)
router.get('/perfil', proteger, (req, res) => {
  res.json({ ok: true, usuario: req.usuario });
});

module.exports = router;
