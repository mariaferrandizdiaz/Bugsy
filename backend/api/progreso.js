const express = require('express');
const router = express.Router();
const Progreso = require('../models/Progreso');

// Obtener progreso por usuario
router.get('/:userId', async (req, res) => {
  try {
    const progreso = await Progreso.findOne({ userId: req.params.userId });
    if (!progreso) return res.status(404).json({ error: 'Progreso no encontrado' });
    res.json(progreso);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener progreso' });
  }
});

// Crear o actualizar progreso
router.post('/:userId', async (req, res) => {
  try {
    const { ejerciciosResueltos, porcentaje } = req.body;

    const actualizado = await Progreso.findOneAndUpdate(
      { userId: req.params.userId },
      { ejerciciosResueltos, porcentaje },
      { upsert: true, new: true }
    );

    res.json(actualizado);
  } catch (err) {
    res.status(500).json({ error: 'Error al guardar progreso' });
  }
});

module.exports = router;