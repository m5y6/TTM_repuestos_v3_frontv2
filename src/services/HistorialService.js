// Mock data for demonstration purposes
const mockHistorial = [
  {
    id: 1,
    fecha: '2024-01-01',
    hora: '10:00',
    nombre: 'Producto A',
    accion: 'creacion',
    cuenta: 'admin'
  },
  {
    id: 2,
    fecha: '2024-01-01',
    hora: '11:30',
    nombre: 'Usuario B',
    accion: 'actualizacion',
    cuenta: 'admin'
  },
  {
    id: 3,
    fecha: '2024-01-02',
    hora: '14:00',
    nombre: 'Producto C',
    accion: 'eliminacion',
    cuenta: 'otro_admin'
  },
  {
    id: 4,
    fecha: '2024-01-03',
    hora: '09:00',
    nombre: 'Usuario D',
    accion: 'creacion',
    cuenta: 'admin'
  },
  {
    id: 5,
    fecha: '2024-01-03',
    hora: '16:00',
    nombre: 'Producto E',
    accion: 'actualizacion',
    cuenta: 'otro_admin'
  }
]

const HistorialService = {
  getHistorial: async () => {
    // In a real application, this would fetch data from an API
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(mockHistorial)
      }, 500)
    })
  }
}

export default HistorialService
