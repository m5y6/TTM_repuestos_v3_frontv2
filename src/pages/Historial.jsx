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

  useEffect(() => {
    const fetchHistorial = async () => {
      const data = await HistorialService.getHistorial()
      const sortedData = data.sort((a, b) => {
        const dateA = new Date(`${a.fecha}T${a.hora}`);
        const dateB = new Date(`${b.fecha}T${b.hora}`);
        return dateB - dateA;
      });
      setHistorial(sortedData)
    }
    fetchHistorial()
  }, [])

  useEffect(() => {
    let filteredData = [...historial]

    if (filtro !== 'todos') {
      filteredData = filteredData.filter(item => item.nombre.toLowerCase().includes(filtro))
    }

    if (busqueda.trim() !== '') {
      const termino = busqueda.toLowerCase().trim()
      filteredData = filteredData.filter(
        item =>
          item.nombre.toLowerCase().includes(termino) ||
          item.accion.toLowerCase().includes(termino) ||
          item.cuenta.toLowerCase().includes(termino)
      )
    }

    setFilteredHistorial(filteredData)
  }, [filtro, busqueda, historial])

  const limpiarFiltros = () => {
    setFiltro('todos')
    setBusqueda('')
  }

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
            <option value="usuario">Usuarios</option>
            <option value="producto">Productos</option>
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
                  <th>Nombre</th>
                  <th>Acción</th>
                  <th>Cuenta</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistorial.map(item => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.fecha}</td>
                    <td>{item.hora}</td>
                    <td>{item.nombre}</td>
                    <td>{item.accion}</td>
                    <td>{item.cuenta}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className='no-results'>No se encontraron resultados.</p>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}

export default Historial
