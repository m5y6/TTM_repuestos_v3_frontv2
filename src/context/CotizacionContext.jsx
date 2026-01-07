import React, { createContext, useState, useEffect, useContext } from 'react';
import CotizacionService from '../services/CotizacionService';
import { AuthContext } from './AuthContext'; // Assuming you have an AuthContext

export const CotizacionContext = createContext();

const getInitialCartFromLocalStorage = () => {
    try {
        const localData = localStorage.getItem('cart');
        return localData ? JSON.parse(localData) : [];
    } catch (error) {
        console.error("Error parsing cart from localStorage", error);
        return [];
    }
};

export const CotizacionProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(getInitialCartFromLocalStorage);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { user } = useContext(AuthContext); // Gracefully handle if no AuthContext

    // Function to load cart from backend
    const loadCartFromServer = () => {
        if (!user) return;
        setLoading(true);
        CotizacionService.getCart()
            .then(response => {
                const items = Array.isArray(response.data) ? response.data : response.data?.items;
                setCartItems(items || []);
                setError(null);
            })
            .catch(err => {
                setError('Failed to load cart.');
                console.error("Error loading cart:", err);
                if (err.response && err.response.status === 404) {
                    setCartItems([]);
                }
            })
            .finally(() => {
                setLoading(false);
            });
    };

    // Load cart on initial mount or when user changes
    useEffect(() => {
        if (user) {
            loadCartFromServer();
        } else {
            setCartItems(getInitialCartFromLocalStorage());
        }
    }, [user]);

    // Save cart to localStorage whenever it changes for a guest user
    useEffect(() => {
        if (!user) {
            localStorage.setItem('cart', JSON.stringify(cartItems));
        }
    }, [cartItems, user]);


    const addToCart = async (product, quantity = 1) => {
        if (!user) {
            setCartItems(prevItems => {
                const existingItem = prevItems.find(item => item.producto.id === product.id);
                if (existingItem) {
                    return prevItems.map(item =>
                        item.producto.id === product.id
                            ? { ...item, cantidad: item.cantidad + quantity }
                            : item
                    );
                } else {
                    const newItem = {
                        id: product.id, // Using product id as cart item id for guest
                        producto: product,
                        cantidad: quantity
                    };
                    return [...prevItems, newItem];
                }
            });
            return;
        }

        const existingItem = cartItems.find(item => item.producto.id === product.id);

        try {
            if (existingItem) {
                await CotizacionService.updateQuantity(existingItem.id, existingItem.cantidad + quantity);
            } else {
                await CotizacionService.addToCart({ productoId: product.id, cantidad: quantity });
            }
            loadCartFromServer();
        } catch (err) {
            setError('Failed to add item to cart.');
            console.error("Error adding to cart:", err);
        }
    };

    const removeFromCart = async (itemId) => {
        if (!user) {
            setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
            return;
        }

        try {
            await CotizacionService.removeFromCart(itemId);
            setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
        } catch (err) {
            setError('Failed to remove item from cart.');
            console.error("Error removing from cart:", err);
            loadCartFromServer(); // Re-sync with server on error
        }
    };

    const changeQuantity = async (itemId, newQuantity) => {
        if (!user) {
            if (newQuantity < 1) {
                setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
                return;
            }
            setCartItems(prevItems =>
                prevItems.map(item =>
                    item.id === itemId ? { ...item, cantidad: newQuantity } : item
                )
            );
            return;
        }


        if (newQuantity < 1) {
            removeFromCart(itemId);
            return;
        }
        try {
            await CotizacionService.updateQuantity(itemId, newQuantity);
            setCartItems(prevItems =>
                prevItems.map(item =>
                    item.id === itemId ? { ...item, cantidad: newQuantity } : item
                )
            );
        } catch (err) {
            setError('Failed to update quantity.');
            console.error("Error changing quantity:", err);
            loadCartFromServer(); // Re-sync with server on error
        }
    };

    const clearCart = async () => {
        if (user) {
            try {
                await CotizacionService.clearCart();
                setCartItems([]);
            } catch (err) {
                setError('Failed to clear cart.');
                console.error("Error clearing cart:", err);
                loadCartFromServer();
            }
        } else {
            setCartItems([]);
            localStorage.removeItem('cart');
        }
    }

    return (
        <CotizacionContext.Provider value={{ cartItems, loading, error, addToCart, removeFromCart, changeQuantity, clearCart }}>
            {children}
        </CotizacionContext.Provider>
    );
};
