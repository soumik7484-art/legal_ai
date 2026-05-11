'use client';
import { createContext, useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import api from '../lib/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            setUser(JSON.parse(userInfo));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        setUser(data);
        localStorage.setItem('userInfo', JSON.stringify(data));
        router.push('/dashboard');
    };

    const signup = async (name, email, password) => {
        const { data } = await api.post('/auth/signup', { name, email, password });
        setUser(data);
        localStorage.setItem('userInfo', JSON.stringify(data));
        router.push('/dashboard');
    };

    const logout = () => {
        localStorage.removeItem('userInfo');
        setUser(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
