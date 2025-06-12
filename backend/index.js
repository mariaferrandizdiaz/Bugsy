require('dotenv').config();          // Carga las variables de entorno desde .env (la api key de gpt-4.1-nano)

const express = require('express');  // Importa las dependencias necesarias
const cors = require('cors');        // Permite solicitudes CORS para el frontend 
const fs = require('fs');            // Maneja el sistema de archivos para leer los contenidos
const path = require('path');        // Maneja las rutas de los archivos
const OpenAI = require("openai");    // Importa la librería OpenAI para interactuar con la API de OpenAI

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const app = express();
const PORT = process.env.PORT || 3001; // Define el puerto del servidor

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend'))); // Sirve archivos estáticos desde la carpeta frontend

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html')); // Envía el archivo index.html al acceder a la raíz del servidor
});

// Pruebas para ver si se han abierto correctamente las variables de entorno y los archivos necesarios
console.log(`✅ Se ha cargado la API Key de OpenAI: ${process.env.OPENAI_API_KEY ? 'Sí' : 'No'}`);
console.log(`✅ Se ha leido bien el archivo .env: ${fs.existsSync('.env') ? 'Sí' : 'No'}`);
console.log(`✅ Se ha leido el archivo index.html: ${fs.existsSync(path.join(__dirname, '../frontend/index.html')) ? 'Sí' : 'No'}`);

// Almacenamos las rutas de los archivos de teoría y ejercicios para leerlos más adelante y tenerlos como constantes por si es necesario
const rutaTeoria = path.join(__dirname, 'contenido-asignatura/teoria.txt');
const rutaEjercicios = path.join(__dirname, 'contenido-asignatura/ejercicios.txt');

// Leemos los contenidos de los archivos de teoría y ejercicios
let temario = '';
let ejercicios = '';
try {
  temario = fs.readFileSync(rutaTeoria, 'utf8');
  ejercicios = fs.readFileSync(rutaEjercicios, 'utf8');
} catch (err) {
  console.error('❌ Error cargando archivos de contenido.', err.message);
}

// se le pide al usuario el nivel que tiene en programación en C
const nivel = "Básico"; // Nivel por defecto del estudiante pero se cambiará según el input del usuario

// Contexto para el modelo de IA, adaptado al nivel del estudiante y al contenido del curso

let contexto = `
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

let messages = [{ role: "system", content: contexto }];

app.post("/api/chat", async (req, res) => {
  const input = req.body.message;

  const { message, nivel } = req.body;
  // console.log(`Mensaje recibido: ${message}`);
  //imprimimos el nivel del estudiante
  // console.log(`Nivel del estudiante: ${nivel}`);

  messages.push({ role: "user", content: message });

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-nano",
      messages: messages,
    });

    const reply = completion.choices[0].message.content.trim();
    messages.push({ role: "assistant", content: reply });

    if (messages.length > 20) {
      messages = [messages[0], ...messages.slice(-18)];
    }

    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "❌ Error al conectar con la IA." });
  }
});

app.listen(PORT, () => console.log(`✅ Servidor escuchando en http://localhost:${PORT}`));
