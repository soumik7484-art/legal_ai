'use client';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import { motion } from 'framer-motion';
import { Shield, Zap, Scale, ArrowRight, Gavel, FileSearch, Sparkles } from 'lucide-react';

export default function Home() {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            
            {/* Hero Section */}
            <section className="pt-32 pb-20 px-6 relative overflow-hidden">
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400 text-xs font-bold uppercase tracking-widest"
                        >
                            <Sparkles className="w-3 h-3" />
                            Next-Gen Legal AI is here
                        </motion.div>

                        <motion.h1 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-6xl md:text-8xl font-black tracking-tight leading-tight"
                        >
                            Protect Your <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-white to-cyan-400">Future</span><br />
                            With Every Signature.
                        </motion.h1>

                        <motion.p 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-gray-400 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed"
                        >
                            Legal Guardian Angel uses advanced AI to audit your contracts in seconds. 
                            Understand the risks, uncover hidden fees, and sign with absolute confidence.
                        </motion.p>

                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
                        >
                            <Link 
                                href="/signup" 
                                className="group relative px-8 py-4 rounded-2xl bg-white text-black font-bold text-lg hover:bg-gray-200 transition-all flex items-center gap-2"
                            >
                                Start Auditing Now
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link 
                                href="/login" 
                                className="px-8 py-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl font-bold text-lg hover:bg-white/10 transition-all"
                            >
                                Sign In
                            </Link>
                        </motion.div>
                    </div>
                </div>

                {/* Visual Elements */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-500/10 rounded-full blur-[120px] -z-10 animate-pulse" />
            </section>

            {/* Features Section */}
            <section className="py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: Gavel, title: "Clause Detection", desc: "Our AI identifies specific legal clauses that put you at risk.", color: "text-purple-400" },
                            { icon: FileSearch, title: "Plain English", desc: "We translate complex legal jargon into simple, actionable insights.", color: "text-cyan-400" },
                            { icon: Shield, title: "Full Compliance", desc: "Built with industry standards to ensure maximum protection.", color: "text-yellow-400" }
                        ].map((feature, i) => (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl hover:border-white/20 transition-all group"
                            >
                                <feature.icon className={`w-12 h-12 ${feature.color} mb-6 group-hover:scale-110 transition-transform`} />
                                <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                                <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-6">
                <div className="max-w-5xl mx-auto p-12 rounded-[40px] bg-gradient-to-br from-purple-900/40 to-cyan-900/40 border border-white/10 text-center relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to sign smarter?</h2>
                        <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
                            Join thousands of users who trust Legal Guardian Angel to protect their interests.
                        </p>
                        <Link 
                            href="/signup" 
                            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold text-lg hover:shadow-2xl hover:shadow-purple-500/40 transition-all"
                        >
                            Get Started for Free
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </section>

            <footer className="mt-auto py-10 border-t border-white/10 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:row items-center justify-between gap-6">
                    <div className="flex items-center gap-2">
                        <Shield className="w-6 h-6 text-purple-500" />
                        <span className="font-bold">Legal Guardian Angel</span>
                    </div>
                    <p className="text-sm text-gray-500">
                        © 2026 Legal Guardian Angel. All rights reserved. Not legal advice.
                    </p>
                </div>
            </footer>
        </div>
    );
}
