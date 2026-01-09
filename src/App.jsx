import { Route, Routes } from 'react-router-dom'
import Index from './pages/Index'
import Login from './pages/Login'
import Catalogo from './pages/Catalogo'
import Cotizacion from './pages/Cotizacion'
import Administrar from './pages/Administrar'
import { AuthProvider } from './context/AuthContext.jsx'
import { CotizacionProvider } from './context/CotizacionContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import AdminRoute from './components/AdminRoute.jsx'
import GlobalNotification from './components/GlobalNotification.jsx'
import AdminLayout from './pages/admin/AdminLayout.jsx'
import VerProductos from './pages/admin/VerProductos.jsx'
import EditarProducto from './pages/admin/EditarProducto.jsx'
import CrearProducto from './pages/admin/CrearProducto.jsx'
import AdministrarCuentas from './pages/admin/AdministrarCuentas.jsx'
import DashboardCotizaciones from './pages/admin/DashboardCotizaciones.jsx'

function App () {
  return (
    <AuthProvider>
      <CotizacionProvider>
        <GlobalNotification />
        <Routes>
          <Route path='/' element={<Index />} />
          <Route path='/catalogo' element={<Catalogo />} />
          <Route path='/login' element={<Login />} />

          <Route path='/cotizacion' element={<Cotizacion />} />

          <Route
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route path='/administrar' element={<Administrar />} />
            <Route path='/admin/ver-productos' element={<VerProductos />} />
            <Route
              path='/admin/editar-producto/:id'
              element={<EditarProducto />}
            />
            <Route path='/admin/crear-producto' element={<CrearProducto />} />
            <Route
              path='/admin/administrar-cuentas'
              element={<AdministrarCuentas />}
            />
            <Route
              path='/admin/dashboard-cotizaciones'
              element={<DashboardCotizaciones />}
            />
          </Route>
        </Routes>
      </CotizacionProvider>
    </AuthProvider>
  )
}

export default App

