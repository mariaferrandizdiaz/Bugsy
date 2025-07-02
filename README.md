# 🐞 BugC - Chatbot Educativo para aprender C 

BugC es una plataforma interactiva diseñada para acompañar al alumnado de titulaciones técnicas universitarias en su proceso de aprendizaje del lenguaje de programación C. El sistema combina teoría estructurada, ejercicios prácticos y un chatbot educativo basado en inteligencia artificial que permite resolver dudas en tiempo real, todo ello en un entorno visualmente atractivo y accesible.

> Este proyecto se enmarca dentro de la línea de innovación educativa impulsada por la integración de la IA, cuyo potencial para personalizar y escalar el aprendizaje ha sido ampliamente reconocido. 

## 📖 Índice

- [Características principales](#-características-principales)
- [Requisitos Técnicos](#-requisitos-técnicos)
  - [Requisitos del sistema](#requisitos-del-sistema)
  - [Dependencias del entorno](#dependencias-del-entorno)
- [Tecnologías utilizadas](#-tecnologías-utilizadas)
- [Estructura del proyecto](#️-estructura-del-proyecto)
- [Pasos para ejecutar el proyecto](#-pasos-para-ejecutar-el-proyecto)
- [Guía de uso](#-guía-de-uso)
- [Objetivos pedagógicos](#-objetivos-pedagógicos)
- [Créditos](#-créditos)
- [Licencia](#-licencia)


## 📚 Características principales

El sistema ofrece un conjunto completo de funcionalidades para facilitar la experiencia de estudio y aprendizaje del alumnado de reciente ingreso. Entre ellas se encuentran: 

- Teoría del lenguaje C estructurada y accesible.
- Ejercicios interactivos por nivel: básico, intermedio y avanzado.
- Asistente conversacional (Bugsy) basado en IA generativa (GPT-4) y comparativa con otras herramientas como Botpress AI.
- Pistas y soluciones para cada ejercicio.
- Diseño responsive y accesible, compatible con escritorio y dispositivos móviles.
- Interfaz moderna basada en colores personalizados (violeta y naranja) adaptada a un público universitario.

## 💻 Requisitos Técnicos

A continuación, se detallan los requisitos mínimos para instalar, ejecutar y mantener el correcto funcionamiento de la plataforma **BugC**.

### Requisitos del sistema

* **Sistema operativo**: Windows 10/11, macOS, o distribución Linux (Ubuntu 20.04+, Debian, etc.)
* **Navegador web moderno**: Chrome, Firefox, Edge o Safari

### Dependencias del entorno

Para ejecutar la herramienta se necesitan ciertas dependencias o instalaciones previas: 

* **Node.js** `v16.x` o superior
* **npm** `v8.x` o superior
* Conexión a Internet (para acceso a la API de OpenAI)
* JavaScript Vanilla: Para la lógica de botones, navegación dinámica y manejo de eventos.
* `dotenv` – Para gestión de variables de entorno (clave API, configuración).
* `cors` – Middleware para manejo de solicitudes entre dominios.
* `express` – Framework ligero para servidor web.

> Todo esto se puede instalar ejecutando `sudo apt install node npm cors express dotenv`.

## 🧠 Tecnologías utilizadas

**Frontend:**

- HTML5, CSS3, JavaScript
- Framework visual personalizado (interfaz propia)
- marked.js para parsear respuestas en Markdown del chatbot

**Backend:**

- Node.js con Express
- Servidor local para gestión de archivos y peticiones
- Llamadas a la API de AirTable para ver las principales consultas del alumnado

**IA y Chatbot:**

- OpenAI (GPT-4 API)
- Botpress AI para la lógica inicial conversacional
- Contexto basado en archivos .txt del temario
- Almacenamiento de nivel seleccionado por sesión

## 🗂️ Estructura del proyecto

``` bash
BugC/
│
├── backend/
│   ├── index.js                # Servidor para el chatbot
│   ├── .env                    # incluye las claves de las APIs (GPT-4, AirTable, etc.)
│   └── contenido-asignatura/   # Archivos de teoría y ejercicios (.txt, .pdf)
│
├── frontend/
│   ├── index.html              # Página principal
│   ├── pages/
|   |   ├── temario/ 
|   |   |   └── ficheros-html.html  # Contenidos teóricos en formato html
|   |   ├── ejercicios/ 
|   |   |   └── ejercicios.json # Ejercicios para que el alumnado rellene en formato json
│   │   ├── teoria.html         # Página con teoría por secciones
│   │   ├── ejercicios.html     # Ejercicios por nivel 
│   │   ├── chatbot-bubble.html # Vista dedicada al asistente IA
│   │   └── chatbot.html        # Página para establecer una conversación con el chatbot 
│   ├── styles/         # Incluye todos los CSS para los estilos de la web, divididos por páginas de navegación
│   │   ├── main.css
│   │   ├── teoria.css
│   │   ├── ejercicios.css
│   │   └── chatbot-bubble.css
│   └── images/         # Imágenes que se utilizan en todas las páginas
│       └── icon.png, bugc-logo.png...
│
├── .gitignore
├── README.md
├── package.json
└── ...

``` 

## 🚀 Pasos para ejecutar el proyecto de manera local

1. Clonar el repositorio
``` bash
git clone https://github.com/mariaferrandizdiaz/Bugsy
cd Bugsy
``` 

2. Instalar las dependencias
``` bash
npm install 
```
3. Crear un .env como queda el .env.example y sustituir con las credenciales y keys necesarias

4. Lanzar el servidor
``` bash
npm start
``` 

Tener en cuenta que por defecto se servirá en: http://localhost:3001.

## 🧪 Guía de uso
Una vez se accede a la plataforma desde navegador, se puede navegar a través de las secciones de la teoría, ejercicios y chatbot. 

1. En el apartado de **teoría** se puede navegar entre los temas impartidos en clase que se visualizan de forma clara y accesible para el alumnado y que se podrá ir consultando según tengan dudas sobre la asignatura. 

2. En el apartado de **ejercicios** una vez se seleccione el nivel, se pueden rellenar ejercicios filtrados por los temas impartidos con el fin de repasar los contenidos de una manera práctica y dinámica, donde pueden recibir pistas o la solución según lo necesiten en su progreso.

3. En el apartado del **chatbot** se puede entablar una conversación para poder resolver dudas sobre el lenguaje C, ya que este se comporta como docente de dicho lenguaje de programación, puede ayudar a resolver dudas específicas y adapta sus respuestas según el nivel del alumnado. 

## 🎯 Objetivos pedagógicos

* Fomentar el aprendizaje autónomo del lenguaje C.
* Ofrecer una guía personalizada según el nivel del alumnado.
* Promover el uso de IA en entornos educativos.
* Evaluar progresos y detectar dificultades mediante ejercicios estructurados.

## 📌 Créditos
Este proyecto ha sido desarrollado como parte del Trabajo de Fin de Grado de María Ferrándiz Díaz en el marco de la formación en ingeniería informática y tecnología educativa.

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia Creative Commons Legal Code - consulta el archivo LICENSE para más detalles.

---
```
María Ferrándiz Díaz - Grado en Ingeniería Informática
```
