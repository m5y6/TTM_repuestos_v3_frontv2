import { Route, Routes } from 'react-router-dom'
import Index from './pages/Index'
import Registro from './pages/Registro'
import Login from './pages/Login'
import Catalogo from './pages/Catalogo'
import Carrito from './pages/Carrito'
import Pedido from './pages/Pedido'
import Envio from './pages/Envio'
import Administrar from './pages/Administrar'
import Ventas from './pages/Ventas'
import CompraExitosa from './pages/CompraExitosa'
import GlobalNotification from './components/GlobalNotification'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import './styles/App.css'

function App() {
  return (
    <>
      <Routes>
        <Route path='/' element={<Index />}/>
        <Route path='/registro' element={<Registro />}/>
        <Route path='/login' element={<Login />}/>
        <Route path='/catalogo' element={<Catalogo />}/>
        <Route element={<ProtectedRoute />}>
          <Route path='/carrito' element={<Carrito />}/>
          <Route path='/pedido' element={<Pedido />}/>
          <Route path='/envio' element={<Envio />}/>
          <Route path='/compra-exitosa' element={<CompraExitosa />}/>
        </Route>
        <Route element={<AdminRoute />}>
          <Route path='/administrar' element={<Administrar />}/>
          <Route path='/ventas' element={<Ventas />}/>
        </Route>
      </Routes>
      <GlobalNotification />
    </>
  )
}

export default App
