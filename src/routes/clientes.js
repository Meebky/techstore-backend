const express = require('express');
const Cliente = require('../models/Cliente');
const { proteger } = require('../middleware/auth');

const router = express.Router();

// GET /api/clientes — Consultar todos los clientes
router.get('/', proteger, async (req, res) => {
  try {
    const { buscar } = req.query;
    const filtro = { activo: true };

    if (buscar) {
      filtro.$or = [
        { nombre: { $regex: buscar, $options: 'i' } },
        { email:  { $regex: buscar, $options: 'i' } }
      ];
    }

    const clientes = await Cliente.find(filtro).sort({ createdAt: -1 });
    res.json({ ok: true, total: clientes.length, clientes });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: error.message });
  }
});

// GET /api/clientes/:id
router.get('/:id', proteger, async (req, res) => {
  try {
    const cliente = await Cliente.findById(req.params.id);
    if (!cliente) return res.status(404).json({ ok: false, mensaje: 'Cliente no encontrado' });
    res.json({ ok: true, cliente });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: error.message });
  }
});

// POST /api/clientes — Registrar cliente
router.post('/', proteger, async (req, res) => {
  try {
    const cliente = await Cliente.create(req.body);
    res.status(201).json({ ok: true, mensaje: 'Cliente registrado', cliente });
  } catch (error) {
    res.status(400).json({ ok: false, mensaje: error.message });
  }
});

// PUT /api/clientes/:id — Editar cliente
router.put('/:id', proteger, async (req, res) => {
  try {
    const cliente = await Cliente.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!cliente) return res.status(404).json({ ok: false, mensaje: 'Cliente no encontrado' });
    res.json({ ok: true, mensaje: 'Cliente actualizado', cliente });
  } catch (error) {
    res.status(400).json({ ok: false, mensaje: error.message });
  }
});

// DELETE /api/clientes/:id — Soft delete
router.delete('/:id', proteger, async (req, res) => {
  try {
    const cliente = await Cliente.findByIdAndUpdate(
      req.params.id,
      { activo: false },
      { new: true }
    );
    if (!cliente) return res.status(404).json({ ok: false, mensaje: 'Cliente no encontrado' });
    res.json({ ok: true, mensaje: 'Cliente eliminado' });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: error.message });
  }
});

module.exports = router;
