import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import Login from '../pages/Login.jsx';
import React from 'react';

// **1. Mock de dependencias mínimas (SOLO Link)**
jest.mock('react-router-dom', () => ({
    Link: ({ to, children }) => <a href={to}>{children}</a>,
}));

// **2. Mockear ALERT y Funciones de Entorno (sin interacciones complejas con JSDOM)**
window.alert = jest.fn();

// **[CORRECCIÓN APLICADA AQUÍ]**
// 3. Mockear localStorage y sessionStorage para que getItem sea un jest.fn() desde el inicio.
const mockStorage = {
    // Definimos getItem con jest.fn() para que pueda ser reseteada y analizada.
    getItem: jest.fn((key) => null), 
    setItem: jest.fn(),
    clear: jest.fn(),
    removeItem: jest.fn(),
};

// Reemplazar la implementación de localStorage y sessionStorage
Object.defineProperty(window, 'localStorage', { value: mockStorage });
Object.defineProperty(window, 'sessionStorage', { value: mockStorage });

// **Reiniciar el mock de getItem antes de cada prueba**
beforeEach(() => {
    window.alert.mockClear();
    // Aseguramos que el componente Login.jsx siempre comience sin sesión guardada
    mockStorage.getItem.mockReturnValue(null); 
    mockStorage.setItem.mockClear();
    mockStorage.clear.mockClear();
});
// **[FIN DE LA CORRECCIÓN]**


describe('Login Component (BASIC TEST)', () => {

    // Función de utilidad para obtener los inputs
    const getInputs = () => ({
        email: screen.getByLabelText(/Email \*/i),
        password: screen.getByLabelText(/Contraseña \*/i),
        submitButton: screen.getByRole('button', { name: /Iniciar Sesión/i }),
    });

    // --- PRUEBA 1: RENDERIZADO BÁSICO ---
    it('should render the login form elements', () => {
        render(<Login />);

        expect(screen.getByRole('heading', { name: /Bienvenido de Vuelta/i })).toBeInTheDocument();
        expect(getInputs().email).toBeInTheDocument();
        expect(getInputs().password).toBeInTheDocument();
        expect(getInputs().submitButton).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Registrarse/i })).toBeInTheDocument();
    });

  // --- PRUEBA 2: VALIDACIÓN DE CAMPOS VACÍOS ---
    it('should show "obligatorio" errors when submitting empty fields', async () => {
        render(<Login />);
        const { email, password, submitButton } = getInputs();

        // 1. Asegurar que los campos están vacíos
        fireEvent.change(email, { target: { value: '' } });
        fireEvent.change(password, { target: { value: '' } });
        
        // **[CORRECCIÓN APLICADA AQUÍ: Usamos getElementById o querySelector]**
        // Obtenemos la referencia al formulario por su ID.
        // screen.getByRole('form') falla, usamos querySelector.
        const form = document.querySelector('#loginForm'); // Usamos el ID del DOM

        // 2. Disparamos el evento SUBMIT directamente en el formulario.
        fireEvent.submit(form); 
        // **[FIN DE LA CORRECCIÓN]**

        // 3. Esperar que los mensajes de error se muestren
        await waitFor(() => {
            // Se espera que los mensajes de error se muestren
            expect(screen.getByText(/El email es obligatorio/i)).toBeInTheDocument();
            expect(screen.getByText(/La contraseña es obligatoria/i)).toBeInTheDocument();
        });
        
        // 4. Verificar que no hubo intento de login (no hubo alert)
        expect(window.alert).not.toHaveBeenCalled();
    });
    
    // --- PRUEBA 3: VALIDACIÓN DE FORMATO DE EMAIL (onBlur) ---
    it('should show email format error on blur when @ is missing', async () => {
        render(<Login />);
        const { email } = getInputs();

        // 1. Escribir email no válido
        fireEvent.change(email, { target: { value: 'invalid.email' } });
        
        // 2. Disparar el evento onBlur para activar la validación en tiempo real
        fireEvent.blur(email);

        // 3. Esperar que el mensaje de error se muestre
        await waitFor(() => {
            expect(screen.getByText(/Debe contener @/i)).toBeInTheDocument();
        });
        
        // 4. Corregir y verificar que el error desaparece
        fireEvent.change(email, { target: { value: 'valid@email.com' } });
        fireEvent.blur(email);
        
        await waitFor(() => {
            expect(screen.queryByText(/Debe contener @/i)).not.toBeInTheDocument();
        });
    });
});