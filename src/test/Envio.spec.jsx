import { fireEvent, render, screen } from '@testing-library/react';
import React from "react"
import Envio from '../pages/Envio.jsx'; // Asegúrate de que esta ruta sea correcta

// 1. Mock de componentes externos para aislar la prueba
jest.mock('../organisms/Header', () => () => <div data-testid="mock-header">Header Mock</div>);
jest.mock('../organisms/Footer', () => () => <div data-testid="mock-footer">Footer Mock</div>);

// Mockear scrollIntoView, ya que Jest no lo soporta en el entorno Node
window.HTMLElement.prototype.scrollIntoView = jest.fn();

describe('Envio Component', () => {

    // **[CORRECCIÓN APLICADA AQUÍ]**
    // 1. Habilitar los timers falsos de Jest para controlar setTimeout
    beforeAll(() => {
        jest.useFakeTimers();
    });

    // 2. Restaurar los timers después de que termine la suite de pruebas
    afterAll(() => {
        jest.useRealTimers();
    });
    // **[FIN DE LA CORRECCIÓN]**

    // Prueba 1: Verifica que el componente se renderice correctamente
    it('should render the tracking search form and results section', () => {
        render(<Envio />);

        // Verificar encabezados
        expect(screen.getByRole('heading', { name: /Seguimiento de Envío/i })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /Información del Pedido/i })).toBeInTheDocument();

        // Verificar el botón de búsqueda
        expect(screen.getByRole('button', { name: /Buscar/i })).toBeInTheDocument();

        // Verificar que los inputs están en el documento
        expect(screen.getByLabelText(/Número de Pedido/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Email de Confirmación/i)).toBeInTheDocument();
    });

    // Prueba 2: Verifica la validación de campos vacíos
    it('should display error messages when "Buscar" is clicked with empty fields', () => {
        // Renderiza el componente con estados iniciales (que tienen valores por defecto)
        render(<Envio />);

        // Limpiamos los inputs
        const inputPedido = screen.getByLabelText(/Número de Pedido/i);
        const inputEmail = screen.getByLabelText(/Email de Confirmación/i);
        const buttonBuscar = screen.getByRole('button', { name: /Buscar/i });

        fireEvent.change(inputPedido, { target: { value: '' } });
        fireEvent.change(inputEmail, { target: { value: '' } });

        // Simular el alert() para evitar que la prueba falle en el entorno de Jest
        window.alert = jest.fn();

        // Ejecutar la acción
        fireEvent.click(buttonBuscar);

        // Verificar mensajes de error
        expect(screen.getByText(/El número de pedido es obligatorio/i)).toBeInTheDocument();
        expect(screen.getByText(/El email es obligatorio/i)).toBeInTheDocument();

        // Verificar que la función de búsqueda principal NO se llama (solo se llama el alert)
        expect(window.alert).toHaveBeenCalledWith("Por favor corrige los errores antes de buscar el pedido");
    });
    
    // Prueba 3: Verifica la validación de formato incorrecto del número de pedido
    it('should display error for invalid order number format', () => {
        render(<Envio />);

        const inputPedido = screen.getByLabelText(/Número de Pedido/i);
        const inputEmail = screen.getByLabelText(/Email de Confirmación/i);
        const buttonBuscar = screen.getByRole('button', { name: /Buscar/i });

        fireEvent.change(inputPedido, { target: { value: 'TT-9999-ABCDEF' } }); // Formato incorrecto
        fireEvent.change(inputEmail, { target: { value: 'valido@email.com' } }); // Formato válido

        window.alert = jest.fn();
        fireEvent.click(buttonBuscar);

        // Verificar mensaje de error del pedido
        expect(screen.getByText(/Formato inválido. Use: TT-YYYY-NNNNNN/i)).toBeInTheDocument();
        // Verificar que NO haya error de email
        expect(screen.queryByText(/Formato de email inválido/i)).not.toBeInTheDocument();
    });

    // Prueba 4: Verifica que la búsqueda se ejecuta con datos válidos
    it('should execute search and show results with valid data', () => {
        render(<Envio />);

        // Mockeamos el alert para asegurar que no se llame
        window.alert = jest.fn();

        // Los estados iniciales ya tienen datos válidos:
        // numeroPedido: 'TT-2025-001234'
        // emailTracking: 'cliente@email.com'

        const buttonBuscar = screen.getByRole('button', { name: /Buscar/i });
        fireEvent.click(buttonBuscar);

        // 1. Verificar que el alert no se llamó (validación pasó)
        expect(window.alert).not.toHaveBeenCalled();
        
        // **[CORRECCIÓN APLICADA AQUÍ]**
        // 2. Avanzar el reloj de Jest para ejecutar el setTimeout de 100ms
        jest.advanceTimersByTime(100); 
        
        // 3. Verificar que AHORA sí se llamó a scrollIntoView
        expect(window.HTMLElement.prototype.scrollIntoView).toHaveBeenCalled();
        
        // Opcional: Verificar que se llamó con el argumento correcto
        expect(window.HTMLElement.prototype.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
        // **[FIN DE LA CORRECCIÓN]**
        
        // Verificar un texto que solo aparece en la sección de resultados
        expect(screen.getByText(/03 de Septiembre, 2025/i)).toBeInTheDocument();
    });
});