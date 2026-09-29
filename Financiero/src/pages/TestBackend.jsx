import { useEffect, useState } from 'react';

function TestBackend() {
  const [status, setStatus] = useState('');
  const [items, setItems] = useState([]);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetch(`${API_URL}/health`)
      .then((res) => res.json())
      .then((data) => setStatus(data.message))
      .catch((err) => console.error('Error de conexión:', err));

    fetch(`${API_URL}/items`)
      .then((res) => res.json())
      .then((data) => setItems(data))
      .catch((err) => console.error('Error al obtener datos:', err));
  }, [API_URL]);

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1>React (Vite) + Express</h1>
      <p><strong>Estado del Backend:</strong> {status || 'Cargando...'}</p>

      <h2>Tareas Pendientes</h2>
      <ul>
        {items.map((item) => (
          <li key={item.id}>{item.title}</li>
        ))}
      </ul>
    </div>
  );
}

export default TestBackend;