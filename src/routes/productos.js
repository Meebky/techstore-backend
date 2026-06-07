const express = require('express');
const Producto = require('../models/Producto');
const { proteger } = require('../middleware/auth');

const router = express.Router();

// GET /api/productos — Consultar todos los productos
router.get('/', proteger, async (req, res) => {
  try {
    const { categoria, estado } = req.query;
    const filtro = { activo: true };

    if (categoria) filtro.categoria = categoria;

    // Consulta MongoDB: productos con stock menor a 5
    if (estado === 'stock_bajo') filtro.stock = { $gt: 0, $lt: 5 };
    if (estado === 'sin_stock')  filtro.stock = 0;
    if (estado === 'disponible') filtro.stock = { $gte: 5 };

    const productos = await Producto.find(filtro).sort({ createdAt: -1 });

    res.json({ ok: true, total: productos.length, productos });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: error.message });
  }
});

// GET /api/productos/bajo-stock — Productos con stock < 5
router.get('/bajo-stock', proteger, async (req, res) => {
  try {
    const productos = await Producto.find({ stock: { $lt: 5 }, activo: true }).sort({ stock: 1 });
    res.json({ ok: true, total: productos.length, productos });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: error.message });
  }
});

// GET /api/productos/:id — Consultar un producto
router.get('/:id', proteger, async (req, res) => {
  try {
    const producto = await Producto.findById(req.params.id);
    if (!producto) return res.status(404).json({ ok: false, mensaje: 'Producto no encontrado' });
    res.json({ ok: true, producto });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: error.message });
  }
});

// POST /api/productos — Registrar producto
router.post('/', proteger, async (req, res) => {
  try {
    const producto = await Producto.create(req.body);
    res.status(201).json({ ok: true, mensaje: 'Producto creado', producto });
  } catch (error) {
    res.status(400).json({ ok: false, mensaje: error.message });
  }
});

// PUT /api/productos/:id — Actualizar producto
router.put('/:id', proteger, async (req, res) => {
  try {
    const producto = await Producto.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!producto) return res.status(404).json({ ok: false, mensaje: 'Producto no encontrado' });
    res.json({ ok: true, mensaje: 'Producto actualizado', producto });
  } catch (error) {
    res.status(400).json({ ok: false, mensaje: error.message });
  }
});

// DELETE /api/productos/:id — Eliminar producto (soft delete)
router.delete('/:id', proteger, async (req, res) => {
  try {
    const producto = await Producto.findByIdAndUpdate(
      req.params.id,
      { activo: false },
      { new: true }
    );
    if (!producto) return res.status(404).json({ ok: false, mensaje: 'Producto no encontrado' });
    res.json({ ok: true, mensaje: 'Producto eliminado' });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: error.message });
  }
});

module.exports = router;
