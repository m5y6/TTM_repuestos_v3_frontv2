import React, { createContext, useState, useEffect } from 'react';

export const CotizacionContext = createContext();

const getInitialCartFromLocalStorage = () => {
    try {
        const localData = localStorage.getItem('cart');
        if (!localData) return [];
        const parsedData = JSON.parse(localData);
        // Normalizar los datos del carrito al cargar
        return parsedData.map(item => ({
            ...item,
            descuento: item.descuento ? Math.floor(item.descuento) : 0,
            producto: {
                ...item.producto,
                marca: typeof item.producto.marca === 'object' && item.producto.marca !== null 
                    ? item.producto.marca.nombre 
                    : item.producto.marca,
                categoria: typeof item.producto.categoria === 'object' && item.producto.categoria !== null 
                    ? item.producto.categoria.nombre 
                    : item.producto.categoria,
            }
        }));
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
        // Normalizar la estructura del producto antes de añadirlo al carrito
        const normalizedProduct = {
            ...product,
            marca: typeof product.marca === 'object' && product.marca !== null ? product.marca.nombre : product.marca,
            categoria: typeof product.categoria === 'object' && product.categoria !== null ? product.categoria.nombre : product.categoria
        };

        setCartItems(prevItems => {
            const existingItem = prevItems.find(item => item.producto.id === normalizedProduct.id);
            if (existingItem) {
                return prevItems.map(item =>
                    item.producto.id === normalizedProduct.id
                        ? { ...item, cantidad: item.cantidad + quantity }
                        : item
                );
            } else {
                const newItem = {
                    id: normalizedProduct.id,
                    producto: normalizedProduct,
                    cantidad: quantity,
                    descuento: Math.floor(normalizedProduct.porcentaje_descuento || 0)
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
