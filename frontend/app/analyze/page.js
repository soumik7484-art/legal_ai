'use client';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import RiskScore from '../../components/RiskScore';
import ClauseCard from '../../components/ClauseCard';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Send, MessageSquare, ChevronLeft, Loader2, 
    Download, Share2, Info, CheckCircle2, Zap 
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '../../lib/api';

export default function AnalyzePage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [result, setResult] = useState(null);
    const [fileName, setFileName] = useState("");
    const [extractedText, setExtractedText] = useState("");
    
    // Chat states
    const [question, setQuestion] = useState("");
    const [chatHistory, setChatHistory] = useState([]);
    const [isChatLoading, setIsChatLoading] = useState(false);
    const chatEndRef = useRef(null);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
        
        const storedResult = sessionStorage.getItem("analysisResult");
        const storedFileName = sessionStorage.getItem("fileName");
        const storedText = sessionStorage.getItem("extractedText");

        if (storedResult) {
            setResult(JSON.parse(storedResult));
            setFileName(storedFileName || "Contract");
            setExtractedText(storedText || "");
        } else {
            router.push("/dashboard");
        }
    }, [user, loading, router]);

    const handleChat = async (e) => {
        e.preventDefault();
        if (!question.trim() || isChatLoading) return;

        const userMsg = { role: "user", content: question };
        setChatHistory(prev => [...prev, userMsg]);
        setQuestion("");
        setIsChatLoading(true);

        try {
            const { data } = await api.post('/contracts/chat', {
                text: extractedText,
                question: question,
                history: chatHistory.map(m => ({ role: m.role, content: m.content }))
            });

            setChatHistory(prev => [...prev, { role: "assistant", content: data.response }]);
        } catch (err) {
            setChatHistory(prev => [...prev, { role: "assistant", content: "Sorry, I encountered an error. Please try again." }]);
        } finally {
            setIsChatLoading(false);
            chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    };

    if (loading || !user || !result) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#030014]">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            </div>
        );
    }

    return (
        <>
            <Navbar />
            <main className="pt-24 pb-16 px-6">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Sidebar: Score & Summary */}
                    <div className="lg:col-span-4 space-y-6">
                        <button 
                            onClick={() => router.push('/dashboard')}
                            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-4"
                        >
                            <ChevronLeft className="w-4 h-4" /> Back to Dashboard
                        </button>
                        
                        <RiskScore score={result.riskScore} />
                        
                        <div className="p-6 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4 flex items-center gap-2">
                                <Info className="w-4 h-4" /> AI Summary
                            </h3>
                            <p className="text-sm text-gray-300 leading-relaxed">
                                {result.summary}
                            </p>
                        </div>

                        <div className="p-6 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">Key Terms Found</h3>
                            <div className="flex flex-wrap gap-2">
                                {result.keyTerms?.map((term, i) => (
                                    <span key={i} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-400">
                                        {term}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Main Content: Clauses & Chat */}
                    <div className="lg:col-span-8 space-y-8">
                        <section>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold">Identified <span className="text-purple-500">Risks</span></h2>
                                <div className="flex gap-2">
                                    <button className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                                        <Download className="w-4 h-4" />
                                    </button>
                                    <button className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                                        <Share2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                {result.dangerousClauses?.map((c, i) => (
                                    <ClauseCard key={i} {...c} index={i} />
                                ))}
                            </div>
                        </section>

                        <section className="p-1 rounded-3xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-white/10">
                            <div className="p-6 rounded-[22px] bg-[#030014]/80 backdrop-blur-3xl">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                                        <MessageSquare className="w-5 h-5 text-purple-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold">Ask Legal Angel</h3>
                                        <p className="text-xs text-gray-500">Chat with AI about your contract</p>
                                    </div>
                                </div>

                                <div className="h-[400px] flex flex-col">
                                    <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-2 scrollbar-hide">
                                        <div className="flex gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                                                <Zap className="w-4 h-4 text-purple-400" />
                                            </div>
                                            <div className="p-3 rounded-2xl rounded-tl-none bg-white/5 border border-white/10 text-sm text-gray-300 max-w-[80%]">
                                                Hello! I've analyzed your contract. Is there anything specific you'd like me to explain?
                                            </div>
                                        </div>

                                        {chatHistory.map((msg, i) => (
                                            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-cyan-500/20' : 'bg-purple-500/20'}`}>
                                                    {msg.role === 'user' ? <CheckCircle2 className="w-4 h-4 text-cyan-400" /> : <Zap className="w-4 h-4 text-purple-400" />}
                                                </div>
                                                <div className={`p-3 rounded-2xl text-sm max-w-[80%] ${msg.role === 'user' ? 'rounded-tr-none bg-cyan-500/10 border border-cyan-500/20 text-cyan-50' : 'rounded-tl-none bg-white/5 border border-white/10 text-gray-300'}`}>
                                                    {msg.content}
                                                </div>
                                            </div>
                                        ))}
                                        {isChatLoading && (
                                            <div className="flex gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                                                    <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                                                </div>
                                                <div className="p-3 rounded-2xl rounded-tl-none bg-white/5 border border-white/10 text-sm text-gray-500 italic">
                                                    Legal Angel is thinking...
                                                </div>
                                            </div>
                                        )}
                                        <div ref={chatEndRef} />
                                    </div>

                                    <form onSubmit={handleChat} className="relative">
                                        <input 
                                            type="text"
                                            value={question}
                                            onChange={(e) => setQuestion(e.target.value)}
                                            placeholder="Ask about specific clauses, liability, etc..."
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-4 pr-14 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                                        />
                                        <button 
                                            type="submit"
                                            disabled={isChatLoading || !question.trim()}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-50 disabled:hover:bg-purple-600 transition-all shadow-lg shadow-purple-500/20"
                                        >
                                            <Send className="w-4 h-4" />
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </>
    );
}
