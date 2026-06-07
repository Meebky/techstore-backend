const mongoose = require('mongoose');

// Sub-documento: cada línea de producto en la venta
const itemVentaSchema = new mongoose.Schema({
  producto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Producto',
    required: true
  },
  nombre: { type: String, required: true },   // snapshot del nombre
  precio:  { type: Number, required: true },   // snapshot del precio
  cantidad:{ type: Number, required: true, min: 1 },
  subtotal:{ type: Number, required: true }
}, { _id: false });

const ventaSchema = new mongoose.Schema({
  folio: {
    type: String,
    unique: true
  },
  cliente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cliente',
    required: [true, 'El cliente es requerido']
  },
  items: {
    type: [itemVentaSchema],
    validate: {
      validator: v => v.length > 0,
      message: 'La venta debe tener al menos un producto'
    }
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  estado: {
    type: String,
    enum: ['pendiente', 'pagada', 'cancelada'],
    default: 'pagada'
  },
  vendedor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario'
  },
  notas: {
    type: String,
    default: ''
  }
}, { timestamps: true });

// Auto-generar folio antes de guardar
ventaSchema.pre('save', async function (next) {
  if (this.isNew) {
    const count = await mongoose.model('Venta').countDocuments();
    this.folio = `V-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Venta', ventaSchema);
