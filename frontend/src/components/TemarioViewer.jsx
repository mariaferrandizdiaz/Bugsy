import React, { useState, useEffect } from 'react';

function TemarioViewer() {
  const [temas, setTemas] = useState([]);
  const [contenido, setContenido] = useState('');
  const [temaSeleccionado, setTemaSeleccionado] = useState(null);

  // Cargar lista de archivos
  useEffect(() => {
    fetch('http://localhost:3001/api/teoria')
      .then(res => res.json())
      .then(data => setTemas(data))
      .catch(err => console.error('Error al cargar el teoría', err));
  }, []);

  // Cargar contenido de un tema
  const verTema = (nombreArchivo) => {
    fetch(`http://localhost:3001/api/teoria/${nombreArchivo}`)
      .then(res => res.text())
      .then(data => {
        setContenido(data);
        setTemaSeleccionado(nombreArchivo);
      })
      .catch(err => console.error('Error al cargar el tema', err));
  };

  return (
    <div>
      <ul className="mb-4">
        {temas.map((tema, i) => (
          <li key={i} className="mb-2">
            <button
              onClick={() => verTema(tema)}
              className="text-blue-600 hover:underline"
            >
              {tema}
            </button>
          </li>
        ))}
      </ul>

      {temaSeleccionado && (
        <div>
          <h3 className="font-semibold text-lg mb-2">{temaSeleccionado}</h3>
          <pre className="bg-gray-100 p-4 rounded max-h-96 overflow-auto whitespace-pre-wrap">
            {contenido}
          </pre>
        </div>
      )}
    </div>
  );
}

export default TemarioViewer;
