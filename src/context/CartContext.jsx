import React, { createContext, useState, useEffect, useContext } from 'react';
import CartService from '../services/CartService';
import { AuthContext } from './AuthContext'; // Assuming you have an AuthContext

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { user } = useContext(AuthContext || {}); // Gracefully handle if no AuthContext

    // Function to load cart from backend
    const loadCart = () => {
        if (!user) { // Don't load if no user
            setCartItems([]);
            return;
        }
        setLoading(true);
        CartService.getCart()
            .then(response => {
                // Handle responses where items are in a nested property (e.g., response.data.items)
                // or when the response data is the array itself.
                const items = Array.isArray(response.data) ? response.data : response.data?.items;
                setCartItems(items || []);
                setError(null);
            })
            .catch(err => {
                setError('Failed to load cart.');
                console.error("Error loading cart:", err);
                // If the user has no cart yet (404), treat it as an empty cart
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
        loadCart();
    }, [user]);

    const addToCart = async (product) => {
        if (!user) {
            alert("Por favor, inicia sesión para agregar productos al carrito.");
            return;
        }

        const existingItem = cartItems.find(item => item.producto.id === product.id);

        try {
            if (existingItem) {
                // If item exists, update quantity using its own ID
                await CartService.updateQuantity(existingItem.id, existingItem.cantidad + 1);
            } else {
                // If new item, add to cart
                await CartService.addToCart({ productoId: product.id, cantidad: 1 });
            }
            // Refresh cart from server to ensure consistency
            loadCart();
        } catch (err) {
            setError('Failed to add item to cart.');
            console.error("Error adding to cart:", err);
        }
    };

    const removeFromCart = async (itemId) => {
        try {
            await CartService.removeFromCart(itemId);
            // Optimistically update UI
            setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
        } catch (err) {
            setError('Failed to remove item from cart.');
            console.error("Error removing from cart:", err);
            loadCart(); // Re-sync with server on error
        }
    };

    const changeQuantity = async (itemId, newQuantity) => {
        if (newQuantity < 1) {
            removeFromCart(itemId);
            return;
        }
        try {
            await CartService.updateQuantity(itemId, newQuantity);
            // Optimistically update UI
            setCartItems(prevItems =>
                prevItems.map(item =>
                    item.id === itemId ? { ...item, cantidad: newQuantity } : item
                )
            );
        } catch (err) {
            setError('Failed to update quantity.');
            console.error("Error changing quantity:", err);
            loadCart(); // Re-sync with server on error
        }
    };
    
    const clearCart = async () => {
        try {
            await CartService.clearCart();
            setCartItems([]);
        } catch (err) {
            setError('Failed to clear cart.');
            console.error("Error clearing cart:", err);
            loadCart();
        }
    }

    return (
        <CartContext.Provider value={{ cartItems, loading, error, addToCart, removeFromCart, changeQuantity, clearCart, loadCart }}>
            {children}
        </CartContext.Provider>
    );
};
