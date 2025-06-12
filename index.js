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
app.use(express.static(path.join(__dirname, 'public'))); // Sirve archivos estáticos desde la carpeta 'public'

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
let contexto = `Actúa como un profesor experto en programación en lenguaje C.

Si el estudiante pregunta por algo que NO esté relacionado con la programación en el lenguaje C, responde de forma clara y educada que solo puedes ayudar con temas relacionados con la programación en C.

Utiliza los saltos de línea para separar párrafos y mejorar la legibilidad en formato HTML.

Adapta tus respuestas al nivel del estudiante: ${nivel}, donde: 
Básico: Nivel básico donde solo saben los tipos de datos y variables que existen, los pasos básicos de resolución de un problema, lo que es un algoritmo, estructuras de control en C (como if, do-while, while, switch, for)
Intermedio: Nivel medio donde ya saben un poco más sobre programaciónademás de los tipos de datos y variables que existen, los pasos básicos de resolución de un problema, lo que es un algoritmo, estructuras de control en C (como if, do-while, while, switch, for). Tembién conocen las bibliotecas de funciones, Operaciones básicas de E/S, <math.h> Reales, punteros y vectores en C, Operadores para punteros.
Avanzado: Nivel avanzado donde ya tienen los conocimientos al completo de la parte de programación: los tipos de datos y variables que existen, los pasos básicos de resolución de un problema, lo que es un algoritmo, estructuras de control en C (como if, do-while, while, switch, for). Tembién conocen las bibliotecas de funciones, Operaciones básicas de E/S, <math.h> Reales, punteros y vectores en C, Operadores para punteros, struct, Funciones y procedimientos (Programación modular, Parámetros formales, Variables locales, paso de parametros a funciones, Paso por referencia, etc. SABEN TODO EL TEMARIO)

Responde de forma clara, concisa, didáctica, conversacional y motivadora.
Puedes resolver dudas sobre el temario, sintaxis, errores comunes y ayudar con ejercicios prácticos, tanto proponiendo nuevos ejercicios como resolviendo los que ya se han propuesto.

El contenido del curso es el siguiente: ${temario}
Los ejercicios que se han utilizado para esta asignatura son los siguientes: ${ejercicios}`;

let messages = [{ role: "system", content: contexto }];

app.post("/api/chat", async (req, res) => {
  const input = req.body.message;

  const { message, nivel } = req.body;
  console.log(`Mensaje recibido: ${message}`);
  //imprimimos el nivel del estudiante
  console.log(`Nivel del estudiante: ${nivel}`);


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
