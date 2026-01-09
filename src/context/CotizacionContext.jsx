import React, { createContext, useState, useEffect } from 'react';

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

    useEffect(() => {
        try {
            localStorage.setItem('cart', JSON.stringify(cartItems));
        } catch (error) {
            console.error("Error saving cart to localStorage", error);
        }
    }, [cartItems]);

    const addToCart = (product, quantity = 1) => {
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
                    id: product.id, // Using product id as cart item id
                    producto: product,
                    cantidad: quantity,
                    descuento: product.procentaje_desc || 0
                };
                return [...prevItems, newItem];
            }
        });
    };

    const removeFromCart = (itemId) => {
        setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
    };

    const changeQuantity = (itemId, newQuantity) => {
        if (newQuantity < 1) {
            removeFromCart(itemId);
            return;
        }
        setCartItems(prevItems =>
            prevItems.map(item =>
                item.id === itemId ? { ...item, cantidad: newQuantity } : item
            )
        );
    };

    const clearCart = () => {
        setCartItems([]);
        localStorage.removeItem('cart');
    };

    return (
        <CotizacionContext.Provider value={{ cartItems, loading, error, addToCart, removeFromCart, changeQuantity, clearCart }}>
            {children}
        </CotizacionContext.Provider>
    );
};
