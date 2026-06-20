import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

/**
 * AuthProvider - Global Security Context
 * Manages user session, registration, and role-based login state across the Modera platform.
 */
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Effect: Rehydrate the user session from local storage on page refresh
    // This allows the user to stay logged in even after closing the tab.
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                console.error("Failed to parse stored user", error);
                localStorage.removeItem('user');
                localStorage.removeItem('token');
            }
        }
        setLoading(false);
    }, []);

    /**
     * REGISTER: Hits the API to create a new user.
     * @param {string} username
     * @param {string} password
     * @param {string} role - Standard 'user' or 'admin'
     */
    const register = async (username, password, role) => {
        try {
            await api.post('/register', { username, password, role });
        } catch (error) {
            console.error("Registration Error:", error.response?.data || error.message);
            throw error; 
        }
    };

    /**
     * LOGIN: Hits the login API to verify credentials and role.
     * @param {string} username
     * @param {string} password
     * @param {string} role - Selected role (Admin or User)
     * @param {boolean} remember - If true, the backend extends session to 30 days.
     * 
     * FIXED: Integrated 'remember' parameter to handle persistent sessions accurately.
     */
    const login = async (username, password, role, remember) => {
        try {
            // Passing all 4 fields to backend to ensure role match and session duration
            const res = await api.post('/login', { username, password, role, remember });
            
            // Store the security token and user info in browser storage
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            
            // Grant access to the application by updating global state
            setUser(res.data.user);
        } catch (error) {
            console.error("Login Error:", error.response?.data || error.message);
            throw error;
        }
    };

    /**
     * LOGOUT: Wipes all session data from the browser.
     */
    const logout = () => {
        localStorage.clear(); 
        setUser(null);        
    };

    return (
        <AuthContext.Provider value={{ user, register, login, logout, loading }}>
            {/* Prevents UI flickering or redirect errors during session verification */}
            {!loading && children}
        </AuthContext.Provider>
    );
};

/**
 * useAuth Hook
 * Convenient wrapper for accessing the authentication context anywhere in the frontend.
 */
export const useAuth = () => useContext(AuthContext);