import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

import Registro from '../pages/Registro.jsx';

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));


// Mock AuthContext
const mockAuthContextValue = {
    register: jest.fn().mockResolvedValue({}),
    user: null,
    showNotification: jest.fn()
};

// Mockear alert y console.log
window.alert = jest.fn();
console.log = jest.fn();

beforeEach(() => {
    mockAuthContextValue.register.mockClear();
    mockAuthContextValue.showNotification.mockClear();
    mockNavigate.mockClear();
    window.alert.mockClear();
    console.log.mockClear();
});

describe('Registro Component (BASIC TEST)', () => {
    
    // Función de utilidad para obtener inputs
    const getInputs = () => ({
        nombre: screen.getByLabelText(/Nombre \*/i),
        apellido: screen.getByLabelText(/Apellido \*/i),
        email: screen.getByLabelText(/Email \*/i),
        telefono: screen.getByLabelText(/Teléfono \*/i),
        edad: screen.getByLabelText(/Edad \*/i),
        
        // **[CORRECCIÓN APLICADA: MATCHER EXACTO PARA CONSTRASEÑA]**
        // Usamos regex con ^ y $ para buscar la cadena EXACTA y evitar colisiones.
        password: screen.getByLabelText(/^Contraseña \*$/i), 
        confirmPassword: screen.getByLabelText(/^Confirmar Contraseña \*$/i),
        
        terminos: screen.getByLabelText(/Acepto los términos y condiciones/i),
        submitButton: screen.getByRole('button', { name: /Crear mi cuenta/i }),
        form: document.querySelector('#registroForm') // Usamos querySelector por robustez
    });

    // Datos válidos de prueba
    const validFormData = {
        nombre: 'Juan',
        apellido: 'Perez',
        email: 'juan@test.com',
        telefono: '9123456789', 
        edad: '25',
        password: 'password123',
        confirmPassword: 'password123',
        terminos: true
    };
    
    // Función para llenar todos los campos requeridos con data válida
    const fillRequiredFields = (inputs, data = validFormData) => {
        // Llenar todos los campos para resolver los useEffect de errores iniciales
        fireEvent.change(inputs.nombre, { target: { value: data.nombre } });
        fireEvent.change(inputs.apellido, { target: { value: data.apellido } });
        fireEvent.change(inputs.email, { target: { value: data.email } });
        fireEvent.change(inputs.telefono, { target: { value: data.telefono } });
        fireEvent.change(inputs.edad, { target: { value: data.edad } });
        fireEvent.change(inputs.password, { target: { value: data.password } });
        fireEvent.change(inputs.confirmPassword, { target: { value: data.confirmPassword } });
    };


    // --- PRUEBA 1: RENDERIZADO BÁSICO ---
    it('should render the form title and required inputs', () => {
        render(
            <MemoryRouter>
                <AuthContext.Provider value={mockAuthContextValue}>
                    <Registro />
                </AuthContext.Provider>
            </MemoryRouter>
        );
        
        expect(screen.getByRole('heading', { name: /Crea tu cuenta para acceder a repuestos de calidad/i, level: 2 })).toBeInTheDocument();
        expect(getInputs().nombre).toBeInTheDocument();
        expect(getInputs().submitButton).toBeInTheDocument();
    });

    // --- PRUEBA 2: FLUJO EXITOSO (CORRECCIÓN DE SINCRONIZACIÓN) ---
    it('should call the register function with the correct data on successful submission', async () => {
        render(
            <MemoryRouter>
                <AuthContext.Provider value={mockAuthContextValue}>
                    <Registro />
                </AuthContext.Provider>
            </MemoryRouter>
        );

        const inputs = getInputs();

        // 1. Llenar campos requeridos
        fillRequiredFields(inputs);
        
        // 2. Aceptar términos y condiciones
        fireEvent.click(inputs.terminos); 

        // 3. Enviar formulario 
        fireEvent.submit(inputs.form);

        await waitFor(() => {
            // Verificar que la función de registro fue llamada con los datos correctos
            expect(mockAuthContextValue.register).toHaveBeenCalledWith({
                nombre: validFormData.nombre,
                apellido: validFormData.apellido,
                email: validFormData.email,
                password: validFormData.password,
                telefono: validFormData.telefono,
                edad: validFormData.edad
            });
        });
    });

    // --- PRUEBA 3: VALIDACIÓN CRUZADA ESPECÍFICA (TTM10EMPRE) ---
    // SE ELIMINA ESTA PRUEBA PORQUE LA LÓGICA NO EXISTE EN EL COMPONENTE
    /*
    it('should prevent submission if TTM10EMPRE is used without SOPROCAL', async () => {
        render(
            <MemoryRouter>
                <AuthProvider value={mockAuthContextValue}>
                    <Registro />
                </AuthProvider>
            </MemoryRouter>
        );

        // 1. Obtener los campos
        const inputs = getInputs();
        
        // 1. Llenar campos VÁLIDOS
        fillRequiredFields(inputs);
        fireEvent.click(inputs.terminos); // Aceptar términos
        
        // **[CORRECCIÓN DE SINCRONIZACIÓN APLICADA]**
        await new Promise(resolve => setTimeout(resolve, 0)); 

        // 2. Ingresar el código que requiere validación cruzada (y una empresa incorrecta)
        fireEvent.change(inputs.codigo, { target: { value: 'TTM10EMPRE' } });
        fireEvent.change(inputs.empresa, { target: { value: 'OtraEmpresa' } });
        
        // 3. Enviar formulario
        fireEvent.submit(inputs.form);

        await waitFor(() => {
            // Debe fallar la validación y mostrar el mensaje de error del `handleSubmit`
            expect(window.alert).toHaveBeenCalledWith(expect.stringContaining("Por favor corrige los errores"));
            
            // **[CORRECCIÓN DE MATCHER MÚLTIPLE APLICADA]**
            // Usamos getAllByText y verificamos que se encontró al menos uno de los errores.
            const errorElements = screen.getAllByText(/Debe ingresar el nombre de su empresa para usar este código/i);
            expect(errorElements.length).toBeGreaterThanOrEqual(1);
            
            // No debe navegar
            expect(mockNavigate).not.toHaveBeenCalled();
        });
        
        // 4. Corregir (Ingresar SOPROCAL) y verificar que el envío funciona
        fireEvent.change(inputs.empresa, { target: { value: 'SOPROCAL' } });
        
        // Esperar a que el error se limpie por los useEffect
        await waitFor(() => {
             // Debe verificar que el error ha desaparecido del DOM
             expect(screen.queryByText(/Debe ingresar el nombre de su empresa para usar este código/i)).not.toBeInTheDocument();
        });
        
        // 5. Reenviar formulario exitosamente
        fireEvent.submit(inputs.form);
        
        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/');
        });
    });
    */
});