const mongoose = require('mongoose');

const ProgresoSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  ejerciciosResueltos: { type: [Number], default: [] },
  porcentaje: { type: Number, default: 0 }
});

module.exports = mongoose.model('Progreso', ProgresoSchema);
