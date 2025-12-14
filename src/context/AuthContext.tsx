import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { USERS } from '../auth/credentials';

interface AuthContextType {
    user: User | null;
    login: (username: string, password: string) => Promise<boolean>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Hydrate from localStorage
        const storedUser = localStorage.getItem('clover_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setIsLoading(false);
    }, []);

    const login = async (username: string, password: string): Promise<boolean> => {
        const foundUser = USERS.find(u => u.username === username && u.password === password);
        if (foundUser) {
            // Remove sensitive data before storing if this was real, but for now it's fine or we strip password
            const userToStore = { ...foundUser };
            delete userToStore.password;

            setUser(userToStore);
            localStorage.setItem('clover_user', JSON.stringify(userToStore));
            return true;
        }
        return false;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('clover_user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
