require('dotenv').config();   // Cargar variables de entorno desde .env
const fs = require('fs');     // Módulo para manejar el sistema de archivos
const path = require('path'); // Módulo para manejar rutas de archivos
const readline = require('readline-sync'); // Módulo para leer la entrada del usuario desde la consola
const OpenAI = require("openai");          // Módulo para interactuar con la API de OpenAI

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Ruta relativa al archivo
const rutaTeoria = path.join(__dirname, '../contenido-asignatura/completos/teoria.txt');
const rutaEjercicios = path.join(__dirname, '../contenido-asignatura/completos/ejercicios.txt');

let temario = '';
try {
  temario = fs.readFileSync(rutaTeoria, 'utf8');
  ejercicios = fs.readFileSync(rutaEjercicios, 'utf8');
  // console.log('✅ Archivos leídos correctamente.');
} catch (err) {
  console.error('❌ No se han podido leer los archivos.', err.message);
  process.exit(1);
}

// 🟢 Mensaje de bienvenida
console.log(`
\n\t🎉 ¡Hola! Bienvenido/a al Chatbot de C 👨‍🏫👩‍💻
\n\tEstoy aquí para ayudarte a aprender programación en lenguaje C de forma sencilla y entretenida.
\n\tPuedes preguntarme sobre teoría, ejercicios, errores, preparación de examen... ¡lo que necesites!

\n\t👇 Primero dime cuál es tu nivel para adaptarme mejor a ti\t
`);

const nivel = readline.question("¿Cuál es tu nivel en programación en C? (básico/intermedio/avanzado): ").toLowerCase();

let contexto = `Actúa como un profesor experto en programación en lenguaje C.

Si el estudiante pregunta por algo que NO esté relacionado con la programación en el lenguaje C, responde de forma clara y educada que solo puedes ayudar con temas relacionados con la programación en C.

Adapta tus respuestas al nivel del estudiante: ${nivel}, donde: 
Básico: Nivel básico donde solo saben los tipos de datos y variables que existen, los pasos básicos de resolución de un problema, lo que es un algoritmo, estructuras de control en C (como if, do-while, while, switch, for)
Intermedio: Nivel medio donde ya saben un poco más sobre programaciónademás de los tipos de datos y variables que existen, los pasos básicos de resolución de un problema, lo que es un algoritmo, estructuras de control en C (como if, do-while, while, switch, for). Tembién conocen las bibliotecas de funciones, Operaciones básicas de E/S, <math.h> Reales, punteros y vectores en C, Operadores para punteros.
Avanzado: Nivel avanzado donde ya tienen los conocimientos al completo de la parte de programación: los tipos de datos y variables que existen, los pasos básicos de resolución de un problema, lo que es un algoritmo, estructuras de control en C (como if, do-while, while, switch, for). Tembién conocen las bibliotecas de funciones, Operaciones básicas de E/S, <math.h> Reales, punteros y vectores en C, Operadores para punteros, struct, Funciones y procedimientos (Programación modular, Parámetros formales, Variables locales, paso de parametros a funciones, Paso por referencia, etc. SABEN TODO EL TEMARIO)
Responde de forma clara, concisa, didáctica, conversacional y motivadora.
Puedes resolver dudas sobre el temario, sintaxis, errores comunes y ayudar con ejercicios prácticos.

El contenido del curso es el siguiente: ${temario}
Los ejercicios que se pueden realizar son los siguientes: ${ejercicios}

Si el estudiante pregunta por un ejercicio, proporciona una breve descripción y guía para resolverlo.
Si el estudiante pregunta por un error, proporciona una breve descripción del error y cómo solucionarlo.
Si el estudiante pregunta por un truco o consejo, proporciona una breve descripción y cómo aplicarlo.
Si el estudiante pregunta por un concepto o algo de teoría, proporciona una breve descripción y ejemplos si es necesario.`;

// Mensaje de contexto para el modelo
// Este mensaje define el rol del modelo y su enfoque gracias a la variable del contexto
let messages = [
  { role: "system", content: contexto }
];

async function chatLoop() {
  console.log("\n💬 ¿Con qué puedo ayudarte?. Escribe 'salir' para terminar.\n");

  while (true) {
    const input = readline.question("\tTú: ");
    if (input.toLowerCase() === "salir") break;

    // Agrega el mensaje del usuario al historial de mensajes, lo que permite mantener el contexto de la conversación y proporciona una experiencia más fluida y coherente. Aseguramos una buena interacción.
    messages.push({ role: "user", content: input });

    try {
      // Llamada a la API de OpenAI para obtener una respuesta
      const chatCompletion = await openai.chat.completions.create({
        model: "gpt-4.1-nano",
        messages: messages,
      });

      // Extrae la respuesta del modelo
      const reply = chatCompletion.choices[0].message.content.trim();
      console.log(`\n\tAsistente de C: ${reply}\n`);

      messages.push({ role: "assistant", content: reply });

      // Limita el historial de mensajes a las últimas 20 interacciones para evitar sobrecargar la conversación
      // Mantiene el contexto relevante sin perder información importante
      if (messages.length > 20) {
        messages = [messages[0], ...messages.slice(-18)]; // almacena el primer mensaje del sistema y los últimos 18 mensajes
      }

    } catch (error) {
      console.error("❌ Error al conectar con la API:", error.message);
    }
  }
}

chatLoop();