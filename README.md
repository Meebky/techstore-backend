# TechStore — Backend API REST

Sistema de ventas con Node.js, Express y MongoDB Atlas.

---

## 🚀 Instalación local

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno
Copia el archivo de ejemplo y edítalo:
```bash
cp .env.example .env
```

Abre `.env` y reemplaza `MONGODB_URI` con tu connection string de MongoDB Atlas:
```
MONGODB_URI=mongodb+srv://tuUsuario:tuPassword@cluster0.xxxxx.mongodb.net/techstore
JWT_SECRET=cualquier_clave_secreta_segura
PORT=5000
```

### 3. Ejecutar en desarrollo
```bash
npm run dev
```

### 4. Ejecutar en producción
```bash
npm start
```

---

## 📡 Endpoints disponibles

### Autenticación
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/registro` | Registrar usuario |
| POST | `/api/auth/login` | Iniciar sesión (retorna JWT) |
| GET | `/api/auth/perfil` | Ver perfil (requiere token) |

### Productos
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/productos` | Consultar todos |
| GET | `/api/productos/bajo-stock` | Stock menor a 5 |
| GET | `/api/productos/:id` | Consultar uno |
| POST | `/api/productos` | Crear producto |
| PUT | `/api/productos/:id` | Actualizar producto |
| DELETE | `/api/productos/:id` | Eliminar (soft delete) |

### Clientes
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/clientes` | Consultar todos |
| GET | `/api/clientes/:id` | Consultar uno |
| POST | `/api/clientes` | Registrar cliente |
| PUT | `/api/clientes/:id` | Editar cliente |
| DELETE | `/api/clientes/:id` | Eliminar |

### Ventas
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/ventas` | Historial de ventas |
| GET | `/api/ventas/reportes/resumen` | Reportes y estadísticas |
| GET | `/api/ventas/:id` | Ver una venta |
| POST | `/api/ventas` | Registrar venta |
| PUT | `/api/ventas/:id/estado` | Cambiar estado |

---

## 🔐 Autenticación

Todas las rutas (excepto login/registro) requieren un token JWT en el header:
```
Authorization: Bearer <tu_token>
```

---

## 📊 Consultas MongoDB implementadas

- ✅ Consultar todos los productos
- ✅ Productos con stock menor a 5 → `GET /api/productos/bajo-stock`
- ✅ Ventas mayores a $10,000 → incluido en `/api/ventas/reportes/resumen`
- ✅ Total vendido → incluido en `/api/ventas/reportes/resumen`
- ✅ Productos más vendidos (aggregation pipeline)
- ✅ Ventas por fecha (últimos 7 días)

---

## ☁️ Despliegue en Render

1. Sube el proyecto a GitHub
2. Ve a [render.com](https://render.com) → New Web Service
3. Conecta tu repositorio
4. Configura:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. En "Environment Variables" agrega las variables de tu `.env`
6. Deploy ✅

---

## 🗂️ Estructura del proyecto

```
techstore-backend/
├── src/
│   ├── config/
│   │   └── database.js       # Conexión MongoDB Atlas
│   ├── middleware/
│   │   └── auth.js           # Middleware JWT
│   ├── models/
│   │   ├── Usuario.js        # Colección usuarios
│   │   ├── Producto.js       # Colección productos
│   │   ├── Cliente.js        # Colección clientes
│   │   └── Venta.js          # Colección ventas
│   ├── routes/
│   │   ├── auth.js           # Rutas de autenticación
│   │   ├── productos.js      # CRUD productos
│   │   ├── clientes.js       # CRUD clientes
│   │   └── ventas.js         # Ventas + reportes
│   └── index.js              # Servidor principal
├── .env.example
├── package.json
└── README.md
```
