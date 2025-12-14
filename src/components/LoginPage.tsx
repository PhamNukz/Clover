import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, User, Eye, EyeOff } from 'lucide-react';
import logo from '../assets/cropped-logo-clover-integral-.svg';
import { USERS } from '../auth/credentials';

const LoginPage: React.FC = () => {
    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isRotating, setIsRotating] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        // Periodic rotation every 10 seconds
        const interval = setInterval(() => {
            setIsRotating(true);
            setTimeout(() => setIsRotating(false), 2000); // Rotate for 2 seconds
        }, 10000); // Every 10 seconds

        // Initial rotation on mount
        setTimeout(() => {
            setIsRotating(true);
            setTimeout(() => setIsRotating(false), 2000);
        }, 500);

        return () => clearInterval(interval);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Pre-validate to trigger animation before actual login state change
        const validUser = USERS.find(u => u.username === username && u.password === password);

        if (validUser) {
            setIsSuccess(true);
            // Wait for animation to finish before updating global auth state
            setTimeout(async () => {
                await login(username, password);
                // No need to set loading false as component will unmount
            }, 1000);
        } else {
            // Simulate network delay for realistic feel on error
            setTimeout(() => {
                setError('Credenciales inválidas');
                setIsLoading(false);
            }, 500);
        }
    };

    return (
        <div className="min-h-screen bg-clover-50 flex items-center justify-center p-4 overflow-hidden relative">
            <style>{`
                @keyframes expandShrink {
                    0% { transform: scale(1); opacity: 0; }
                    10% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.5); opacity: 1; }
                    100% { transform: scale(0); opacity: 0; }
                }
                .animate-expand-shrink {
                    animation: expandShrink 1.2s forwards cubic-bezier(0.4, 0, 0.2, 1);
                }
            `}</style>

            {/* Green Background Fade In */}
            <div
                className={`fixed inset-0 bg-clover-600 z-50 transition-all duration-1000 ease-in-out pointer-events-none ${isSuccess ? 'opacity-100' : 'opacity-0'
                    }`}
            >
            </div>

            {/* Floating Logo with Expand-Then-Shrink Animation */}
            <div className={`fixed inset-0 z-[60] flex items-center justify-center pointer-events-none ${isSuccess ? 'animate-expand-shrink' : 'opacity-0'}`}>
                <div className="bg-white p-3 rounded-full shadow-lg w-32 h-32 flex items-center justify-center">
                    <img src={logo} alt="Clover Logo" className="w-24 h-24 object-contain animate-spin-slow" />
                </div>
            </div>

            {/* Main Card - Fades out */}
            <div className={`bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transition-all duration-700 transform ${isSuccess ? 'scale-90 opacity-0' : 'scale-100 opacity-100'}`}>
                <div className="bg-clover-600 p-8 text-center flex flex-col items-center relative overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-clover-500 to-clover-700 opacity-50 z-0"></div>

                    <div className={`bg-white p-3 rounded-full mb-4 shadow-lg w-24 h-24 flex items-center justify-center z-10 transition-all duration-1000 ease-in-out ${isRotating ? 'rotate-[360deg] scale-110' : ''}`}>
                        <img src={logo} alt="Clover Logo" className="w-20 h-20 object-contain" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-1 z-10">Bienvenido a Clover</h1>
                    <p className="text-clover-100 text-sm z-10">Sistema de Gestión Integral</p>
                </div>

                <div className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center border border-red-100 animate-pulse">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 ml-1">Usuario</label>
                            <div className="relative group">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-clover-500 transition-colors" size={20} />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-clover-500 focus:border-transparent outline-none transition-all hover:border-clover-300"
                                    placeholder="Ingresa tu usuario"
                                    required
                                    disabled={isSuccess}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 ml-1">Contraseña</label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-clover-500 transition-colors" size={20} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-clover-500 focus:border-transparent outline-none transition-all hover:border-clover-300"
                                    placeholder="••••••••"
                                    required
                                    disabled={isSuccess}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-clover-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || isSuccess}
                            className={`w-full bg-clover-600 text-white py-3 rounded-xl font-bold hover:bg-clover-700 transition-all shadow-lg shadow-clover-200 transform overflow-hidden relative ${isLoading || isSuccess ? 'opacity-80 cursor-not-allowed' : 'hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98]'}`}
                        >
                            <span className={`relative z-10 flex justify-center items-center gap-2 ${isSuccess ? 'opacity-0' : 'opacity-100'} transition-opacity`}>
                                {isLoading ? 'Verificando...' : 'Ingresar al Sistema'}
                            </span>
                            {isSuccess && (
                                <span className="absolute inset-0 flex items-center justify-center z-20 text-white font-bold animate-bounce hidden">
                                    {/* Text hidden here as the screen transition takes over */}
                                    ¡Bienvenido!
                                </span>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
