import { Route, Routes } from 'react-router-dom'
import Index from './pages/Index'
import Registro from './pages/Registro'
import Login from './pages/Login'
import Catalogo from './pages/Catalogo'
import Cotizacion from './pages/Cotizacion'
import Administrar from './pages/Administrar'
import { AuthProvider } from './context/AuthContext.jsx'
import { CotizacionProvider } from './context/CotizacionContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import AdminRoute from './components/AdminRoute.jsx'
import GlobalNotification from './components/GlobalNotification.jsx'

function App () {
  return (
    <AuthProvider>
      <CotizacionProvider>
          <GlobalNotification />
          <Routes>
            <Route path='/' element={<Index />} />
            <Route path='/catalogo' element={<Catalogo />} />
            <Route path='/login' element={<Login />} />
            <Route path='/registro' element={<Registro />} />
            <Route path='/cotizacion' element={<Cotizacion />}/>
            <Route
              path='/administrar'
              element={
                <AdminRoute>
                  <Administrar />
                </AdminRoute>
              }
            />
          </Routes>
      </CotizacionProvider>
    </AuthProvider>
  )
}

export default App
