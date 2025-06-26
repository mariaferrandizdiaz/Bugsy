/*
 * Trabajo de Fin de Grado en Ingeniería Informática
 * BugC - Asistente de Programación en C
 * Autora: María Ferrándiz Díaz
 * Licencia: CC BY-NC-SA 4.0
 */

require('dotenv').config({ path: __dirname + '/.env' });   // Hay que tener un archivo .env con OPENAI_API_KEY dentro del directorio Bugsy/backend

const fs = require('fs');     // Para manejar archivos del sistema
const path = require('path'); // Para manejar rutas y archivos
const cors = require('cors'); // Para permitir peticiones desde el frontend
const { v4: uuidv4 } = require('uuid'); // Para generar IDs únicos de sesión, en algún momento se podría usar si se quiere persistir el estado de las sesiones
const OpenAI = require('openai');   // Para manejar las peticiones a la API de OpenAI
const express = require('express'); // Para crear el servidor web
const { timeStamp } = require('console');
const app = express();
const PORT = process.env.PORT || 3001;
const Airtable = require('airtable');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const airtableBase = new Airtable({ 
  apiKey: process.env.AIRTABLE_API_KEY
}).base(process.env.AIRTABLE_BASE_ID);

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
  console.log('✓ Temario cargado correctamente.');
  ejercicios = fs.readFileSync(rutaEjercicios, 'utf8');
  console.log('✓ Ejercicios cargados correctamente.');
} catch (err) {
  console.error('❌ Error cargando archivos de contenido:', err.message);
}

// Almacenamiento de sesiones para poder mantener el contexto de la conversación. Usamos un Map para almacenar las sesiones en memoria.
const sessions = new Map();

app.post("/api/chat", async (req, res) => {
  console.log(`\t${new Date().toLocaleString()} Nueva petición de chat recibida: ${req.body.message}`);
  const { message, nivel, sessionId } = req.body;

  if (!sessionId || !message || !nivel) {
    return res.status(400).json({ reply: "❌ Faltan datos requeridos (sessionId, nivel, message)." });
  }

  // Inicializar sesión si es nueva
  if (!sessions.has(sessionId)) {
    const contexto = `
    Actúa como un profesor experto en programación en lenguaje C en español castellano.

    Tu única función es ayudar con dudas relacionadas **exclusivamente** con el lenguaje C según el contenido impartido en clase.

    Si la pregunta puede interpretarse como relacionada con la programación en C aunque no mencione C explícitamente (por ejemplo: "qué es un entero, doble, largo"), asume que el estudiante está hablando dentro del contexto del curso y responde normalmente. Recibe de manera simpática saludos y agradecimientos.
    También debes aceptar preguntas formuladas de forma informal o coloquial si pueden estar relacionadas con C. Por ejemplo, si el usuario dice “¿cómo van las funciones?” o “no entiendo eso de los punteros”, asume que se refiere al contenido de C aunque no lo mencione explícitamente.
    También puedes dar consejos de mejora de código, buenas prácticas o sugerir ejercicios adicionales relacionados con el contenido del curso. en caso de que el alumnado quiera mejorar en programación. 

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

    const logEntry = {
      fecha: new Date().toISOString(),
      sessionId,
      nivel,
      pregunta: message,
      respuesta: reply
    };

    const rutaLogs = path.join(__dirname, 'logs', 'interacciones.json');

    try {
      airtableBase(process.env.AIRTABLE_TABLE_NAME).create([
        {
          fields: {
            "Fecha": new Date().toISOString(),
            "Session ID": sessionId,
            "Nivel": nivel,
            "Pregunta": message,
            "Respuesta": reply
          }
        }
      ], function(err, records) {
        if (err) {
          console.error("\t\t✗ Error al registrar en Airtable:", err);
        } else {
          console.log("\t\t✓ Registro guardado en Airtable");
        }
      });
    } catch (e) {
      console.error("❌ Error en la conexión con Airtable:", e.message);
    }
    res.json({ reply });
  } catch (error) {
    console.error("❌ Error al llamar a OpenAI:", error.message);
    res.status(500).json({ reply: "❌ Error al procesar la respuesta del modelo." });
  }
});

// Iniciar servidor para permitir peticiones desde el frontend
app.listen(PORT, () => {
  console.log(`\n✅ Servidor escuchando en http://localhost:${PORT}`);
  console.log('\nInteracciones con la herramienta:');
});
