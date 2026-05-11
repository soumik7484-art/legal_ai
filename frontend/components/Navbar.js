'use client';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Shield } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();

    return (
        <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-black/20 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-2">
                        <Shield className="w-8 h-8 text-purple-500" />
                        <Link href="/" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">
                            Legal Guardian Angel
                        </Link>
                    </div>
                    <div className="flex items-center gap-6">
                        {user ? (
                            <>
                                <Link href="/dashboard" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                                    Dashboard
                                </Link>
                                <div className="flex items-center gap-4 border-l border-white/10 pl-6">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                                            <User className="w-4 h-4 text-white" />
                                        </div>
                                        <span className="text-sm font-medium hidden sm:block">{user.name}</span>
                                    </div>
                                    <button 
                                        onClick={logout}
                                        className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-all"
                                        title="Logout"
                                    >
                                        <LogOut className="w-5 h-5" />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link href="/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                                    Login
                                </Link>
                                <Link 
                                    href="/signup" 
                                    className="px-4 py-2 rounded-full bg-white text-black text-sm font-bold hover:bg-gray-200 transition-all"
                                >
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
