import React, { createContext, useState, useEffect } from 'react';
import AuthService from '../services/AuthService';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState({ msg: '', visible: false });
    const navigate = useNavigate();

    useEffect(() => {
        // Check for user in localStorage on initial load
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const showNotification = (message) => {
        setNotification({ msg: message, visible: true });
    };

    const hideNotification = () => {
        setNotification({ msg: '', visible: false });
    };

    const login = async (email, password) => {
        try {
            const response = await AuthService.login(email, password);
            // Assuming the response includes the user object and a token
            const userData = response.data;
            localStorage.setItem('user', JSON.stringify(userData));
            if (userData.token) {
                localStorage.setItem('token', userData.token);
            }
            setUser(userData);
            navigate('/'); // Redirect to home after login
            return response;
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    };

    const register = async (userData) => {
        try {
            const response = await AuthService.register(userData);
            // Don't log in the user automatically, redirect to login page
            navigate('/login');
            return response;
        } catch (error) {
            console.error('Registration failed:', error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
        navigate('/login'); // Redirect to login after logout
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, register, notification, showNotification, hideNotification }}>
            {children}
        </AuthContext.Provider>
    );
};
