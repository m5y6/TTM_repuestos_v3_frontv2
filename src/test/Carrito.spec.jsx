import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthProvider } from '../context/AuthContext';
import Carrito from '../pages/Carrito';
import CartService from '../services/CartService';

// Mock CartService
jest.mock('../services/CartService');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Carrito', () => {
  const mockStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    clear: jest.fn(),
    removeItem: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(window, 'localStorage', {
      value: mockStorage,
      configurable: true,
    });
    Object.defineProperty(window, 'sessionStorage', {
      value: mockStorage,
      configurable: true,
    });
    mockStorage.getItem.mockImplementation((key) => {
      if (key === 'token') return 'fake token';
      return null;
    });
  });
  const cartItems = [
    {
      id: 1,
      producto: { id: 1, nombre: 'Test Product 1', precio: 100, imagenUrl: 'test1.jpg' },
      cantidad: 1,
    },
    {
      id: 2,
      producto: { id: 2, nombre: 'Test Product 2', precio: 200, imagenUrl: 'test2.jpg' },
      cantidad: 2,
    },
  ];

  const cartContextValue = {
    cartItems,
    removeFromCart: jest.fn(),
    changeQuantity: jest.fn(),
    clearCart: jest.fn(),
  };

  it('should call checkout, clear cart and redirect on successful payment', async () => {
    CartService.checkout.mockResolvedValue({ status: 200, data: { orderId: '123' } });

    render(
      <Router>
        <AuthProvider>
          <CartContext.Provider value={cartContextValue}>
            <Carrito />
          </CartContext.Provider>
        </AuthProvider>
      </Router>
    );

    fireEvent.click(screen.getByText('Proceder al Pago'));

    await waitFor(() => {
      expect(CartService.checkout).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(cartContextValue.clearCart).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/compra-exitosa', {
        state: { order: { orderId: '123' } },
      });
    });
  });

  it('should show an alert on failed payment', async () => {
    CartService.checkout.mockRejectedValue(new Error('Payment failed'));
    window.alert = jest.fn();

    render(
      <Router>
        <AuthProvider>
          <CartContext.Provider value={cartContextValue}>
            <Carrito />
          </CartContext.Provider>
        </AuthProvider>
      </Router>
    );

    fireEvent.click(screen.getByText('Proceder al Pago'));

    await waitFor(() => {
      expect(CartService.checkout).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        'Hubo un error al procesar la compra. Por favor, inténtalo de nuevo.'
      );
    });

    expect(window.alert).toHaveBeenCalledTimes(1);
  });
});