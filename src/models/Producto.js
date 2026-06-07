const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre del producto es requerido'],
    trim: true
  },
  descripcion: {
    type: String,
    trim: true,
    default: ''
  },
  categoria: {
    type: String,
    required: [true, 'La categoría es requerida'],
    enum: ['Smartphones', 'Laptops', 'Tablets', 'Audio', 'Accesorios', 'Otro']
  },
  precio: {
    type: Number,
    required: [true, 'El precio es requerido'],
    min: [0, 'El precio no puede ser negativo']
  },
  stock: {
    type: Number,
    required: [true, 'El stock es requerido'],
    min: [0, 'El stock no puede ser negativo'],
    default: 0
  },
  activo: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Virtual: estado del stock
productoSchema.virtual('estadoStock').get(function () {
  if (this.stock === 0) return 'sin_stock';
  if (this.stock < 5) return 'stock_bajo';
  return 'disponible';
});

productoSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Producto', productoSchema);
