require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const conectarDB = require('./config/database');

// Conectar a MongoDB Atlas
conectarDB();

const app = express();

// ── Middlewares ──────────────────────────────────────────
app.use(cors({ origin: "*, methods: [GET,POST,PUT,DELETE,OPTIONS], allowedHeaders: [Content-Type,Authorization] }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Rutas ────────────────────────────────────────────────
app.use('/api/auth',      require('./routes/auth'));
app.use('/api/productos', require('./routes/productos'));
app.use('/api/clientes',  require('./routes/clientes'));
app.use('/api/ventas',    require('./routes/ventas'));

// ── Ruta raíz ────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    mensaje: '🛒 TechStore API funcionando',
    version: '1.0.0',
    endpoints: {
      auth:      '/api/auth',
      productos: '/api/productos',
      clientes:  '/api/clientes',
      ventas:    '/api/ventas'
    }
  });
});

// ── Manejo de rutas no encontradas ───────────────────────
app.use((req, res) => {
  res.status(404).json({ ok: false, mensaje: `Ruta ${req.originalUrl} no encontrada` });
});

// ── Manejo global de errores ─────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
});

// ── Iniciar servidor ─────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
