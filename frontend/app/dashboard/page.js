'use client';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Upload, FileText, Shield, Zap, Scale, 
    ChevronRight, File, X, Loader2, AlertCircle 
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '../../lib/api';

export default function DashboardPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const fileInputRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingStep, setProcessingStep] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    const handleFile = (file) => {
        const validTypes = ["application/pdf", "image/png", "image/jpeg", "image/jpg", "image/webp"];
        if (!validTypes.includes(file.type)) {
            setError("Please upload a PDF or image file (PNG, JPG, WebP).");
            return;
        }
        if (file.size > 20 * 1024 * 1024) {
            setError("File size must be under 20MB.");
            return;
        }
        setError("");
        setSelectedFile(file);
    };

    const handleAnalyze = async () => {
        if (!selectedFile) return;
        setIsProcessing(true);
        setError("");
        setProcessingStep("Uploading and processing document...");

        try {
            const formData = new FormData();
            formData.append('file', selectedFile);

            const { data } = await api.post('/contracts/analyze', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Store result in sessionStorage for the results page
            sessionStorage.setItem("analysisResult", JSON.stringify(data));
            sessionStorage.setItem("fileName", selectedFile.name);
            sessionStorage.setItem("extractedText", data.extractedText);
            
            router.push("/analyze");
        } catch (err) {
            setError(err.response?.data?.message || "Analysis failed. Please try again.");
        } finally {
            setIsProcessing(false);
            setProcessingStep("");
        }
    };

    if (loading || !user) {
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
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-12"
                    >
                        <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
                            Your Legal <span className="text-purple-500">Workspace</span>
                        </h1>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            Upload a contract to start the AI analysis. We'll help you find hidden risks and explain clauses in plain English.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl overflow-hidden"
                    >
                        <div 
                            className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
                                isDragging ? 'border-purple-500 bg-purple-500/5' : 'border-white/10 hover:border-white/20'
                            }`}
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={(e) => {
                                e.preventDefault();
                                setIsDragging(false);
                                const file = e.dataTransfer.files[0];
                                if (file) handleFile(file);
                            }}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input 
                                ref={fileInputRef}
                                type="file"
                                className="hidden"
                                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                            />

                            <AnimatePresence mode="wait">
                                {selectedFile ? (
                                    <motion.div 
                                        key="file"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex flex-col items-center gap-4"
                                    >
                                        <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20">
                                            <File className="w-10 h-10 text-purple-400" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-lg">{selectedFile.name}</p>
                                            <p className="text-sm text-gray-500">
                                                {(selectedFile.size / 1024).toFixed(1)} KB · {selectedFile.type.split('/')[1].toUpperCase()}
                                            </p>
                                        </div>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                                            className="text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
                                        >
                                            <X className="w-3 h-3" /> Remove
                                        </button>
                                    </motion.div>
                                ) : (
                                    <motion.div 
                                        key="empty"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex flex-col items-center gap-4"
                                    >
                                        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                                            <Upload className="w-10 h-10 text-gray-400" />
                                        </div>
                                        <div>
                                            <p className="text-lg font-semibold">Drop your file here</p>
                                            <p className="text-sm text-gray-500">Supports PDF, PNG, JPG, WebP (Max 20MB)</p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {error && (
                            <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                {error}
                            </div>
                        )}

                        <button
                            onClick={handleAnalyze}
                            disabled={!selectedFile || isProcessing}
                            className="w-full mt-8 py-4 px-6 rounded-2xl font-bold bg-gradient-to-r from-purple-600 to-cyan-600 text-white flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-purple-500/20 transition-all"
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    {processingStep}
                                </>
                            ) : (
                                <>
                                    <Zap className="w-5 h-5 text-yellow-400" />
                                    Analyze Contract
                                    <ChevronRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </motion.div>

                    <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { icon: Shield, title: "Secure", desc: "Your documents are processed securely and never stored." },
                            { icon: Scale, title: "Precise", desc: "Granular risk scoring based on industry standards." },
                            { icon: Zap, title: "Fast", desc: "Get full insights in less than 30 seconds." }
                        ].map((f, i) => (
                            <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10">
                                <f.icon className="w-6 h-6 text-purple-500 mb-3" />
                                <h3 className="font-bold mb-1">{f.title}</h3>
                                <p className="text-sm text-gray-400">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </>
    );
}
