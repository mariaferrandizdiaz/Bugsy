require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const OpenAI = require('openai');

const app = express();
const PORT = process.env.PORT || 3001;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.use(cors());
app.use(express.json());

// ✅ Sirve archivos estáticos (index.html, imágenes, etc.)
app.use(express.static(path.join(__dirname, '../frontend/')));

// ✅ Cargar temario y ejercicios
const rutaTeoria = path.join(__dirname, 'contenido-asignatura/teoria.txt');
const rutaEjercicios = path.join(__dirname, 'contenido-asignatura/ejercicios.txt');

let temario = '';
let ejercicios = '';
try {
  temario = fs.readFileSync(rutaTeoria, 'utf8');
  ejercicios = fs.readFileSync(rutaEjercicios, 'utf8');
} catch (err) {
  console.error('❌ Error cargando archivos de contenido:', err.message);
}

// ✅ Almacenamiento de sesiones
const sessions = new Map();

app.post("/api/chat", async (req, res) => {
  const { message, nivel, sessionId } = req.body;

  if (!sessionId || !message || !nivel) {
    return res.status(400).json({ reply: "❌ Faltan datos requeridos (sessionId, nivel, message)." });
  }

  // Inicializar sesión si es nueva
  if (!sessions.has(sessionId)) {
    const contexto = `
    Actúa como un profesor experto en programación en lenguaje C.

    Tu única función es ayudar con dudas relacionadas **exclusivamente** con el lenguaje C según el contenido impartido en clase.

    Si la pregunta puede interpretarse como relacionada con la programación en C aunque no mencione C explícitamente (por ejemplo: "qué es un entero, doble, largo"), asume que el estudiante está hablando dentro del contexto del curso y responde normalmente.

    Tu conocimiento debe limitarse al siguiente contenido:
    TEMARIO: ${temario}
    EJERCICIOS: ${ejercicios}

    EJEMPLOS DE PREGUNTAS QUE SÍ DEBES RESPONDER:
      ¿Cómo funciona un bucle for en C?
      ¿Qué diferencia hay entre while y do-while?
      ¿Cómo declaro un array de enteros?
      Me da error con punteros, ¿me puedes ayudar?
      ¿Qué es un entero?

    EJEMPLOS DE PREGUNTAS QUE DEBES RECHAZAR:
      ¿Cómo se dice café en alemán?
      ¿Cuándo juega la selección española?
      ¿Cómo se programa en Python?
      ¿Qué opinas del clima?
      ¿Me puedes ayudar con matemáticas?

    Cuando recibas una pregunta que no se relacione con la programación en C, responde esto:

    🚫 Solo puedo ayudarte con temas de programación en lenguaje C impartidos en clase. Estoy aquí para resolverte dudas sobre teoría, sintaxis o ejercicios de C.

    Además ten en cuenta lo siguiente:
    - Utiliza saltos de línea <br> para separar párrafos y mejorar la legibilidad en formato HTML.
    - Adapta las explicaciones al nivel del estudiante: ${nivel}
    - Sé didáctico, claro, motivador y conciso.
    - Puedes proponer ejercicios nuevos, resolver dudas de teoría, explicar errores de código o guiar paso a paso en la resolución.
      
    Recuerda: No respondas ningún contenido ajeno a la programación en **C**.
    `;

    sessions.set(sessionId, [
      { role: "system", content: contexto }
    ]);
  }

  const messages = sessions.get(sessionId);
  messages.push({ role: "user", content: message });

  try {
    const chat = await openai.chat.completions.create({
      model: "gpt-4.1-nano",
      messages,
    });

    const reply = chat.choices[0].message.content.trim();
    messages.push({ role: "assistant", content: reply });

    // Limitar historial
    if (messages.length > 20) {
      sessions.set(sessionId, [messages[0], ...messages.slice(-18)]);
    }

    res.json({ reply });
  } catch (error) {
    console.error("❌ Error al llamar a OpenAI:", error.message);
    res.status(500).json({ reply: "❌ Error al procesar la respuesta del modelo." });
  }
});

// ✅ Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor escuchando en http://localhost:${PORT}`);
});
