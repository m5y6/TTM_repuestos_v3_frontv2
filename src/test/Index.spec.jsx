import { render, screen } from '@testing-library/react';
import Index from '../pages/Index.jsx';
import React from 'react';

// 1. Mock de componentes externos para aislar la prueba.
// Esto evita errores de importación de componentes que no son el objetivo de esta prueba.
jest.mock('../organisms/Header', () => () => <header data-testid="mock-header">Header Mock</header>);
jest.mock('../organisms/Footer', () => () => <footer data-testid="mock-footer">Footer Mock</footer>);

describe('Index Component (Home Page)', () => {

    // Prueba 1: Verifica que el componente se renderice sin errores.
    it('should render the Index component successfully', () => {
        render(<Index />);
        
        // Simplemente verificar que la estructura base está presente.
        expect(screen.getByRole('heading', { name: /Truck & Trailer Melipilla/i })).toBeInTheDocument();
    });

    // Prueba 2: Verifica que las secciones principales de contenido estén presentes.
    it('should display the main description and the "Top Ventas" section', () => {
        render(<Index />);

        // Verificar el título principal
        expect(screen.getByRole('heading', { name: /Truck & Trailer Melipilla/i })).toBeInTheDocument();
        
        // Verificar un fragmento de la misión/visión
        expect(screen.getByText(/Ofrecemos repuestos de alta calidad y servicio técnico especializado/i)).toBeInTheDocument();

        // Verificar el título de la sección de productos
        expect(screen.getByRole('heading', { name: /Productos más vendidos/i })).toBeInTheDocument();
    });

    // Prueba 3: Verifica que al menos un producto de la lista se renderice correctamente.
    it('should display the featured products with name, price, and button', () => {
        render(<Index />);

        // Verificar un producto específico (e.g., Batería)
        const producto1Name = screen.getByRole('heading', { name: /Batería/i });
        const producto1Price = screen.getByText('$100.000');
        
        expect(producto1Name).toBeInTheDocument();
        expect(producto1Price).toBeInTheDocument();

        // Verificar que el botón "Añadir al Carrito" esté presente para ese producto (o al menos uno)
        const addToCartButtons = screen.getAllByRole('button', { name: /Añadir al Carrito/i });
        expect(addToCartButtons.length).toBeGreaterThanOrEqual(6); // Hay 6 productos en la lista
        expect(addToCartButtons[0]).toBeInTheDocument();
    });
    
    // Prueba 4: Verifica que el botón "Ver catálogo" esté presente.
    it('should display the "Ver catálogo" button', () => {
        render(<Index />);
        
        const verCatalogoButton = screen.getByRole('button', { name: /Ver catálogo/i });
        expect(verCatalogoButton).toBeInTheDocument();
        // Opcional: Verificar que tenga el ID correcto si se usa JavaScript
        expect(verCatalogoButton).toHaveAttribute('id', 'vercatalogo'); 
    });
});