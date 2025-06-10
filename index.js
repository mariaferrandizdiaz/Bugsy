require('dotenv').config();   // Cargar variables de entorno desde .env
const fs = require('fs');     // Módulo para manejar el sistema de archivos
const path = require('path'); // Módulo para manejar rutas de archivos
const readline = require('readline-sync'); // Módulo para leer la entrada del usuario desde la consola
const OpenAI = require("openai");          // Módulo para interactuar con la API de OpenAI

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Ruta relativa al archivo
const rutaTeoria = path.join(__dirname, 'contenido-asignatura/teoria.txt');
const rutaEjercicios = path.join(__dirname, 'contenido-asignatura/ejercicios.txt');

let temario = '';
try {
  temario = fs.readFileSync(rutaTeoria, 'utf8');
  ejercicios = fs.readFileSync(rutaEjercicios, 'utf8');
  // console.log('✅ Archivos leídos correctamente.');
} catch (err) {
  console.error('❌ No se pudo leer el archivo temario.txt:', err.message);
  process.exit(1);
}

// 🟢 Mensaje de bienvenida
console.log(`
🎉 ¡Hola! Bienvenido/a al Chatbot de C 👨‍🏫👩‍💻
Estoy aquí para ayudarte a aprender programación en lenguaje C de forma sencilla y entretenida.
Puedes preguntarme sobre teoría, ejercicios, errores, trucos... ¡lo que necesites!

👇 Primero dime cuál es tu nivel para adaptarme mejor a ti:
`);

const nivel = readline.question("¿Cuál es tu nivel en programación en C? (básico/intermedio/avanzado): ").toLowerCase();

let contexto = `Actúa como un profesor experto en programación en lenguaje C.
Adapta tus respuestas al nivel del estudiante: ${nivel}.
Donde: 
Básico: Nivel básico donde solo saben los tipos de datos y variables que existen, los pasos básicos de resolución de un problema, lo que es un algoritmo, estructuras de control en C (como if, do-while, while, switch, for)
Intermedio: Nivel medio donde ya saben un poco más sobre programaciónademás de los tipos de datos y variables que existen, los pasos básicos de resolución de un problema, lo que es un algoritmo, estructuras de control en C (como if, do-while, while, switch, for). Tembién conocen las bibliotecas de funciones, Operaciones básicas de E/S, <math.h> Reales, punteros y vectores en C, Operadores para punteros.
Avanzado: Nivel avanzado donde ya tienen los conocimientos al completo de la parte de programación: los tipos de datos y variables que existen, los pasos básicos de resolución de un problema, lo que es un algoritmo, estructuras de control en C (como if, do-while, while, switch, for). Tembién conocen las bibliotecas de funciones, Operaciones básicas de E/S, <math.h> Reales, punteros y vectores en C, Operadores para punteros, struct, Funciones y procedimientos (Programación modular, Parámetros formales, Variables locales, paso de parametros a funciones, Paso por referencia, etc. SABEN TODO EL TEMARIO)
Responde de forma clara, didáctica, conversacional y motivadora.
Puedes resolver dudas sobre el temario, sintaxis, errores comunes y ayudar con ejercicios prácticos.
Sé paciente y guía paso a paso si el nivel es bajo.
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

  // TODO: REVISAR CON JEZA Y ANDREA
  // const palabrasClaveC = [
  //  "c ", "c.", "lenguaje c", "printf", "scanf", "int", "char", "float", "struct",
  //  "puntero", "punteros", "malloc", "memoria", "compilar", "gcc", "array", "for", "while",
  //  "switch", "if", "else", "variable", "función", "main", "código", "ejercicio", "programa", 
  //  "error", "debug", "bucle", "vector", "matriz", "biblioteca", "include", "header",
  //  "algoritmo", "sintaxis", "compilador", "estructura de control", "tipos de datos",
  //  "operador", "constante", "cadena", "carácter", "lógica", "condicional", "iteración",
  //  "recursión", "parámetro", "argumento", "función recursiva", "prototipo", "declaración",
  //  "definición", "scope", "alcance", "variable local", "variable global", "typedef",
  //];

  while (true) {
    const input = readline.question("\tTú: ");
    if (input.toLowerCase() === "salir") break;

    // Verifica si el input parece relevante al lenguaje C
    // const esRelacionado = palabrasClaveC.some(palabra => input.toLowerCase().includes(palabra));

    // if (!esRelacionado) {
    //  console.log("\n\t⚠️ Parece que tu mensaje no está relacionado con la programación en C.\n\t¡Recuerda que estoy aquí para ayudarte con ese tema! 😊\n");
    //  continue;
    // }

    // Comprobamos con GPT-4 si la duda del usuario está relacionada con el lenguaje C
    const filtroTematico = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Eres un asistente que responde únicamente 'sí' o 'no'." },
        { role: "user", content: `¿Este mensaje está relacionado con la programación en lenguaje C?: "${input}"` }
      ]
    });

    const respuestaFiltro = filtroTematico.choices[0].message.content.trim().toLowerCase();

    if (respuestaFiltro !== "sí") {
      console.log("\n⚠️ Parece que tu mensaje no está relacionado con la programación en C. ¡Recuerda que estoy aquí para ayudarte con ese tema! 😊\n");
      continue;
    }
    messages.push({ role: "user", content: input });

    try {
      // Llamada a la API de OpenAI para obtener una respuesta
      const chatCompletion = await openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: messages,
      });

      // Extrae la respuesta del modelo
      const reply = chatCompletion.choices[0].message.content.trim();
      console.log(`\n\tAsistente de C: ${reply}\n`);

      messages.push({ role: "assistant", content: reply });

      // Limita el historial de mensajes a las últimas 20 interacciones para evitar sobrecargar la conversación
      // Mantiene el contexto relevante sin perder información importante
      if (messages.length > 20) {
        messages = [messages[0], ...messages.slice(-18)];
      }

    } catch (error) {
      console.error("❌ Error al conectar con la API:", error.message);
    }
  }
}

chatLoop();
