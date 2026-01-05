import { Route, Routes } from 'react-router-dom'
import Index from './pages/Index'
import Registro from './pages/Registro'
import Login from './pages/Login'
import Catalogo from './pages/Catalogo'
import Carrito from './pages/Carrito'
import Administrar from './pages/Administrar'

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
        <Route path='/carrito' element={<Carrito />}/>
        <Route element={<AdminRoute />}>
          <Route path='/administrar' element={<Administrar />}/>
        </Route>
      </Routes>
      <GlobalNotification />
    </>
  )
}

export default App
