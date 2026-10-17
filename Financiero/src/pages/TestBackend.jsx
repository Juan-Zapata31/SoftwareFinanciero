import { useEffect, useRef, useState } from 'react';
import axios from 'axios';

function TestBackend() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const temporizadorRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => () => clearTimeout(temporizadorRef.current), []);

  function mostrarStatus(nuevoStatus) {
    setStatus(nuevoStatus);
    clearTimeout(temporizadorRef.current);
    temporizadorRef.current = setTimeout(() => setStatus(null), 5000);
  }

  async function checkDatabaseConnection() {
    clearTimeout(temporizadorRef.current);
    setLoading(true);
    setStatus(null);

    try {
      if (!API_URL) {
        throw new Error('Falta configurar VITE_API_URL en el archivo .env del frontend.');
      }

      const respuesta = await axios.get(`${API_URL.replace(/\/+$/, '')}/health/db`);

      mostrarStatus({ type: 'success', ...respuesta.data });
    } catch (error) {
      mostrarStatus({
        type: 'error',
        message:
          error.response?.data?.message || 'No fue posible conectar con el backend.',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        maxWidth: '720px',
        margin: '0 auto',
        padding: '4rem 1.5rem',
        fontFamily: 'var(--font-body)',
        textAlign: 'center',
      }}
    >
      <h1 className="section-title" style={{ margin: '0 auto 2rem' }}>
        Conexión a la Base de Datos
      </h1>
      <button
        type="button"
        className="btn btn-primary"
        onClick={checkDatabaseConnection}
        disabled={loading}
        style={{ fontSize: '1.1rem', padding: '1rem 2.4rem' }}
      >
        {loading ? 'Probando conexión...' : 'Probar conexión'}
      </button>
      {status?.type === 'success' && (
        <p role="status" aria-live="polite" style={{ marginTop: '1rem' }}>
          <strong>{status.message}</strong>.
        </p>
      )}
      {status?.type === 'error' && (
        <p role="alert" style={{ marginTop: '1rem' }}>
          Error: {status.message}
        </p>
      )}
    </main>
  );
}

export default TestBackend;
