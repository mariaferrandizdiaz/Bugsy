const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB (solo si usas progreso persistente)
mongoose.connect('mongodb://localhost:27017/c-plataforma')
  .then(() => console.log('✅ Conectado a MongoDB'))
  .catch(err => console.error('❌ Error al conectar a MongoDB:', err));
// Servir archivos estáticos (opcional, si tienes frontend)
app.use(express.static(path.join(__dirname, 'public')));

// Rutas de la plataforma (no incluye chatbot)
const teoriaRouter = require('./api/teoria');
const ejerciciosRouter = require('./api/ejercicios');
const progresoRouter = require('./api/progreso');

app.use('/api/teoria', teoriaRouter);
// app.use('/api/ejercicios', ejerciciosRouter);
app.use('/api/progreso', progresoRouter);

// Ruta raíz
app.get('/', (req, res) => {
  res.send('Plataforma de programación en Cooperativa 🚀');
});

app.listen(PORT, () => {
  console.log(`✅ Servidor escuchando en http://localhost:${PORT}`);
});
