'use client';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import { motion } from 'framer-motion';
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await login(email, password);
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid email or password');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            <main className="flex min-h-screen items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md"
                >
                    <div className="relative p-8 rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-3xl shadow-2xl overflow-hidden">
                        {/* Glow effect */}
                        <div className="absolute -top-24 -left-24 w-48 h-48 bg-purple-500/20 rounded-full blur-[80px]" />
                        
                        <div className="relative z-10">
                            {/* Auth Toggle */}
                            <div className="flex bg-black/40 p-1.5 rounded-2xl mb-8 border border-white/5 backdrop-blur-md">
                                <button className="flex-1 py-2.5 rounded-xl bg-white text-black text-xs font-black shadow-xl transition-all">
                                    LOG IN
                                </button>
                                <Link href="/signup" className="flex-1 py-2.5 rounded-xl text-gray-500 text-xs font-black hover:text-white transition-all text-center flex items-center justify-center">
                                    SIGN UP
                                </Link>
                            </div>

                            <h2 className="text-3xl font-bold text-center mb-2 tracking-tight">Welcome Back</h2>
                            <p className="text-gray-400 text-center mb-8 text-sm">
                                Enter your credentials to access your legal dashboard
                            </p>

                            {error && (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-xs font-medium mb-6 text-center"
                                >
                                    {error}
                                </motion.div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 z-10" />
                                        <input 
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="name@example.com"
                                            required
                                            className="w-full bg-white/95 border border-white/20 rounded-2xl py-4 pl-12 pr-4 text-black font-medium placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-purple-500/20 transition-all shadow-inner"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between ml-1">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
                                            Password
                                        </label>
                                        <Link href="#" className="text-[10px] font-bold text-purple-400 hover:text-purple-300 uppercase tracking-wider">
                                            Forgot?
                                        </Link>
                                    </div>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 z-10" />
                                        <input 
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            required
                                            className="w-full bg-white/95 border border-white/20 rounded-2xl py-4 pl-12 pr-4 text-black font-medium placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-purple-500/20 transition-all shadow-inner"
                                        />
                                    </div>
                                </div>

                                <button 
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full group relative flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-cyan-600 hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] text-white font-black uppercase tracking-widest text-xs py-5 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            Sign In to Account
                                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </form>

                            <p className="text-center mt-8 text-xs text-gray-500 font-medium">
                                Don't have an account yet?{' '}
                                <Link href="/signup" className="text-white font-bold hover:text-purple-400 transition-colors underline underline-offset-4 decoration-purple-500/50">
                                    Create one now
                                </Link>
                            </p>
                        </div>
                    </div>
                </motion.div>
            </main>
        </>
    );
}
