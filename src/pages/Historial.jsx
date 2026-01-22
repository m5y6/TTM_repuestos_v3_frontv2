import React, { useState, useEffect } from 'react'
import HistorialService from '../services/HistorialService'
import '../styles/Historial.css'
import Header from '../organisms/Header'
import Footer from '../organisms/Footer'

const Historial = () => {
  const [historial, setHistorial] = useState([])
  const [filteredHistorial, setFilteredHistorial] = useState([])
  const [filtro, setFiltro] = useState('todos')
  const [busqueda, setBusqueda] = useState('')
  const [modalData, setModalData] = useState(null)

  useEffect(() => {
    const fetchHistorial = async () => {
      try {
        const response = await HistorialService.getHistorial();
        // The API returns an object with a 'data' property which is the array
        const data = response.data; 
        
        if (Array.isArray(data)) {
          const sortedData = data.sort((a, b) => {
            const dateA = new Date(`${a.fecha}T${a.hora}`);
            const dateB = new Date(`${b.fecha}T${b.hora}`);
            return dateB - dateA;
          });
          setHistorial(sortedData);
        } else {
          console.error("La respuesta de la API no es un array:", data);
          setHistorial([]); // Establecer un array vacío para evitar más errores
        }
      } catch (error) {
        console.error("Error al obtener el historial:", error);
        setHistorial([]); // Asegurarse de que el estado sea un array en caso de error
      }
    };
    fetchHistorial();
  }, []);

  useEffect(() => {
    let filteredData = [...historial]

    if (filtro !== 'todos') {
      filteredData = filteredData.filter(item => item.entidad.toLowerCase().includes(filtro))
    }

    if (busqueda.trim() !== '') {
      const termino = busqueda.toLowerCase().trim()
      filteredData = filteredData.filter(
        item =>
          (item.entidad && item.entidad.toLowerCase().includes(termino)) ||
          (item.accion && item.accion.toLowerCase().includes(termino)) ||
          (item.usuarioResponsable && item.usuarioResponsable.toLowerCase().includes(termino))
      )
    }

    setFilteredHistorial(filteredData)
  }, [filtro, busqueda, historial])

  const limpiarFiltros = () => {
    setFiltro('todos')
    setBusqueda('')
  }

  const handleShowDetails = (detalle) => {
    try {
      const parsedData = JSON.parse(detalle);
      setModalData(parsedData);
    } catch (error) {
      console.error("Error al parsear el JSON de detalle:", error);
    }
  };

  const closeModal = () => {
    setModalData(null);
  };

  // Función para formatear la fecha y hora sin conversiones de zona horaria
  const formatDateTime = (fecha, hora) => {
    if (!fecha) {
      return { f: '', h: '' };
    }
    
    let formattedFecha = fecha;
    try {
      // Formatear fecha de YYYY-MM-DD a DD/MM/YYYY
      const parts = fecha.split('-');
      if (parts.length === 3) {
        const [year, month, day] = parts;
        formattedFecha = `${day}/${month}/${year}`;
      }
    } catch (e) {
      console.error("Error formateando la fecha:", fecha, e);
    }

    let formattedHora = hora || '';
    try {
      // Quitar los microsegundos de la hora
      if (hora) {
        formattedHora = hora.split('.')[0];
      }
    } catch (e) {
      console.error("Error formateando la hora:", hora, e);
    }

    return { f: formattedFecha, h: formattedHora };
  };

  return (
    <>
      <Header />
      <div className='admin-container ver-productos-container'>
        <h1>Historial de Cambios</h1>
        <div className='filtros-container'>
          <input
            type='text'
            name='busqueda'
            placeholder='Buscar...'
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className='buscador-input'
          />
          <select name="filtro" value={filtro} onChange={(e) => setFiltro(e.target.value)}>
            <option value="todos">Mostrar Todos</option>
            <option value="marca">Marca</option>
            <option value="categoria">Categoría</option>
            <option value="producto">Producto</option>
            <option value="usuario">Usuario</option>
          </select>
          <button onClick={limpiarFiltros} className='btn-limpiar-filtros'>
            Limpiar Filtros
          </button>
        </div>
        <div className='admin-productos-tabla'>
          {filteredHistorial.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Fecha</th>
                  <th>Hora</th>
                  <th>Entidad</th>
                  <th>Acción</th>
                  <th>Usuario Responsable</th>
                  <th>Detalle</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistorial.map(item => {
                  const { f: formattedFecha, h: formattedHora } = formatDateTime(item.fecha, item.hora);
                  return (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{formattedFecha}</td>
                      <td>{formattedHora}</td>
                      <td>{item.entidad}</td>
                      <td>{item.accion}</td>
                      <td>{item.usuarioResponsable || 'N/A'}</td>
                      <td>
                        <button onClick={() => handleShowDetails(item.detalle)} className="historial-btn-detalle">
                          <i className="fas fa-exclamation-circle"></i>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p className='no-results'>No se encontraron resultados.</p>
          )}
        </div>
      </div>
      {modalData && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>&times;</button>
            <h2>Detalles del Cambio</h2>
            <div className="detalle-contenido">
              {Object.entries(modalData).map(([key, value]) => (
                <div key={key} className="detalle-fila">
                  <span className="detalle-clave">{key}:</span>
                  <span className="detalle-valor">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      <Footer />
    </>
  )
}

export default Historial
