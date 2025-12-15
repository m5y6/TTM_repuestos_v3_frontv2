import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import Catalogo from "../pages/Catalogo.jsx"
import React from "react"
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { MemoryRouter } from 'react-router-dom';
import ProductoService from '../services/ProductoService';

// Mock ProductoService
jest.mock('../services/ProductoService', () => ({
    getAllProductos: jest.fn(),
}));


// Mockear localStorage y sessionStorage para que getItem sea un jest.fn() desde el inicio.
const mockStorage = {
    // Definimos getItem con jest.fn() para que pueda ser reseteada y analizada.
    getItem: jest.fn((key) => null), 
    setItem: jest.fn(),
    clear: jest.fn(),
    removeItem: jest.fn(),
};

// Reemplazar la implementación de localStorage y sessionStorage
Object.defineProperty(window, 'localStorage', { value: mockStorage, configurable: true });
Object.defineProperty(window, 'sessionStorage', { value: mockStorage, configurable: true });

beforeEach(()=>{
    // Reiniciar mocks antes de cada prueba
    mockStorage.getItem.mockClear();
    mockStorage.setItem.mockClear();
    mockStorage.clear.mockClear();
    mockStorage.removeItem.mockClear();

    // Mock para simular un token de sesión
    mockStorage.getItem.mockImplementation((key) => {
        if (key === 'token') return 'fake token';
        return null;
    });

    // Mock ProductoService.getAllProductos
    ProductoService.getAllProductos.mockResolvedValue({
        data: [
            {
                id: 1,
                nombre: 'Disco de Freno Brembo',
                descripcion: 'Disco de freno de alta calidad',
                precio: 45000,
                categoria: 'frenos',
                imagen_url: 'disco_freno.jpg'
            }
        ]
    });
})

const authContextValue = {
    user: { name: 'Test User' },
    showNotification: jest.fn(),
};

const cartContextValue = {
    addToCart: jest.fn(),
    cartItems: [],
    removeFromCart: jest.fn(),
    changeQuantity: jest.fn(),
    clearCart: jest.fn(),
};



describe('Catalogo Page', ()=>{
    const productosMock = [
  {
    id: 1,
    nombre: 'Producto 1',
    descripcion: 'Descripción 1',
    precio: 1000,
    imagen: 'url_imagen_1.jpg'
  },
  // ...otros productos si quieres
];

    it('muestra catalogo correctamente', async ()=>{
        render(
            <MemoryRouter>
                <AuthContext.Provider value={authContextValue}>
                    <CartContext.Provider value={cartContextValue}>
                        <Catalogo sinHeaderFooter={true} />
                    </CartContext.Provider>
                </AuthContext.Provider>
            </MemoryRouter>
        )
        await waitFor(() => {
            expect(screen.getByText("Disco de Freno Brembo")).toBeInTheDocument()
        })
        // expect(screen.getByText("Filtro de aceite original para motores Volvo D12 y D13")).toBeInTheDocument()
        // expect(screen.getByText("45000")).toBeInTheDocument()
        // expect(screen.getByText("filtros")).toBeInTheDocument()
    })

    it('se guarda en localStorage al hacer clic en guardar',async ()=>{
        render(
            <MemoryRouter>
                <AuthContext.Provider value={authContextValue}>
                    <CartContext.Provider value={cartContextValue}>
                        <Catalogo productosActuales={productosMock} sinHeaderFooter={true} />
                    </CartContext.Provider>
                </AuthContext.Provider>
            </MemoryRouter>
        )
        const button = screen.getAllByText("Agregar al Carrito")[0]

        fireEvent.click(button)
        expect(cartContextValue.addToCart).toHaveBeenCalledWith(productosMock[0])
    })
})