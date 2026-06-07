const express = require('express');
const Venta = require('../models/Venta');
const Producto = require('../models/Producto');
const { proteger } = require('../middleware/auth');

const router = express.Router();

// GET /api/ventas — Consultar ventas con filtros
router.get('/', proteger, async (req, res) => {
  try {
    const { fechaInicio, fechaFin, estado, clienteId } = req.query;
    const filtro = {};

    if (estado) filtro.estado = estado;
    if (clienteId) filtro.cliente = clienteId;

    if (fechaInicio || fechaFin) {
      filtro.createdAt = {};
      if (fechaInicio) filtro.createdAt.$gte = new Date(fechaInicio);
      if (fechaFin)    filtro.createdAt.$lte = new Date(fechaFin + 'T23:59:59');
    }

    const ventas = await Venta.find(filtro)
      .populate('cliente', 'nombre email')
      .populate('vendedor', 'nombre')
      .sort({ createdAt: -1 });

    res.json({ ok: true, total: ventas.length, ventas });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: error.message });
  }
});

// GET /api/ventas/reportes/resumen — Consultas MongoDB avanzadas
router.get('/reportes/resumen', proteger, async (req, res) => {
  try {
    // Total vendido (suma de todos los totales)
    const totalVendido = await Venta.aggregate([
      { $match: { estado: 'pagada' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    // Ventas mayores a $10,000
    const ventasGrandes = await Venta.countDocuments({
      total: { $gt: 10000 },
      estado: 'pagada'
    });

    // Productos más vendidos
    const productosMasVendidos = await Venta.aggregate([
      { $match: { estado: 'pagada' } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.producto',
          nombre: { $first: '$items.nombre' },
          totalUnidades: { $sum: '$items.cantidad' },
          totalIngresos: { $sum: '$items.subtotal' }
        }
      },
      { $sort: { totalUnidades: -1 } },
      { $limit: 5 }
    ]);

    // Ventas por fecha (últimos 7 días)
    const hace7Dias = new Date();
    hace7Dias.setDate(hace7Dias.getDate() - 7);

    const ventasPorFecha = await Venta.aggregate([
      { $match: { createdAt: { $gte: hace7Dias }, estado: 'pagada' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          totalDia: { $sum: '$total' },
          numVentas: { $count: {} }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      ok: true,
      resumen: {
        totalVendido: totalVendido[0]?.total || 0,
        ventasGrandes,
        productosMasVendidos,
        ventasPorFecha
      }
    });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: error.message });
  }
});

// GET /api/ventas/:id
router.get('/:id', proteger, async (req, res) => {
  try {
    const venta = await Venta.findById(req.params.id)
      .populate('cliente', 'nombre email telefono')
      .populate('vendedor', 'nombre');

    if (!venta) return res.status(404).json({ ok: false, mensaje: 'Venta no encontrada' });
    res.json({ ok: true, venta });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: error.message });
  }
});

// POST /api/ventas — Registrar venta y descontar stock
router.post('/', proteger, async (req, res) => {
  try {
    const { clienteId, items, notas } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ ok: false, mensaje: 'La venta debe tener al menos un producto' });
    }

    let total = 0;
    const itemsVenta = [];

    // Validar stock y construir items
    for (const item of items) {
      const producto = await Producto.findById(item.productoId);
      if (!producto) {
        return res.status(404).json({ ok: false, mensaje: `Producto ${item.productoId} no encontrado` });
      }
      if (producto.stock < item.cantidad) {
        return res.status(400).json({
          ok: false,
          mensaje: `Stock insuficiente para "${producto.nombre}". Disponible: ${producto.stock}`
        });
      }

      const subtotal = producto.precio * item.cantidad;
      total += subtotal;

      itemsVenta.push({
        producto: producto._id,
        nombre:   producto.nombre,
        precio:   producto.precio,
        cantidad: item.cantidad,
        subtotal
      });

      // Descontar stock
      await Producto.findByIdAndUpdate(producto._id, { $inc: { stock: -item.cantidad } });
    }

    const venta = await Venta.create({
      cliente:  clienteId,
      items:    itemsVenta,
      total,
      vendedor: req.usuario._id,
      notas:    notas || ''
    });

    const ventaPopulada = await Venta.findById(venta._id)
      .populate('cliente', 'nombre email')
      .populate('vendedor', 'nombre');

    res.status(201).json({ ok: true, mensaje: 'Venta registrada', venta: ventaPopulada });
  } catch (error) {
    res.status(400).json({ ok: false, mensaje: error.message });
  }
});

// PUT /api/ventas/:id/estado — Cambiar estado
router.put('/:id/estado', proteger, async (req, res) => {
  try {
    const { estado } = req.body;
    const venta = await Venta.findByIdAndUpdate(
      req.params.id,
      { estado },
      { new: true }
    );
    if (!venta) return res.status(404).json({ ok: false, mensaje: 'Venta no encontrada' });
    res.json({ ok: true, mensaje: 'Estado actualizado', venta });
  } catch (error) {
    res.status(400).json({ ok: false, mensaje: error.message });
  }
});

module.exports = router;
