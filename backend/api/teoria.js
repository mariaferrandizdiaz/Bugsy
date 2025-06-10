const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Ruta absoluta a tu carpeta de contenido
const TEMARIO_DIR = path.join(__dirname, '../../contenido-asignatura');

router.get('/', (req, res) => {
  fs.readdir(TEMARIO_DIR, (err, files) => {
    if (err) return res.status(500).json({ error: 'Error al leer el directorio' });
    const txtFiles = files.filter(file => file.endsWith('.txt'));
    res.json(txtFiles);
  });
});

// Ruta para obtener el contenido de un tema específico
router.get('/:tema', (req, res) => {
  const tema = req.params.tema;
  const filePath = path.join(TEMARIO_DIR, tema);

  // Prevención de rutas maliciosas
  if (!filePath.startsWith(TEMARIO_DIR)) {
    return res.status(400).json({ error: 'Ruta inválida' });
  }

  fs.readFile(filePath, 'utf8', (err, content) => {
    if (err) return res.status(404).json({ error: 'Tema no encontrado' });
    res.send(content);
  });
});


module.exports = router;