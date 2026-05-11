"use client";
import { motion } from "framer-motion";
import { AlertCircle, AlertTriangle, Info, Zap } from "lucide-react";

const riskConfig = {
  LOW: { label: "Low Risk", icon: Info, iconColor: "#10B981", borderColor: "rgba(16,185,129,0.2)", glowColor: "rgba(16,185,129,0.05)" },
  MEDIUM: { label: "Medium Risk", icon: AlertTriangle, iconColor: "#F59E0B", borderColor: "rgba(245,158,11,0.3)", glowColor: "rgba(245,158,11,0.05)" },
  HIGH: { label: "High Risk", icon: AlertCircle, iconColor: "#EF4444", borderColor: "rgba(239,68,68,0.3)", glowColor: "rgba(239,68,68,0.05)" },
  CRITICAL: { label: "Critical", icon: Zap, iconColor: "#DC2626", borderColor: "rgba(220,38,38,0.4)", glowColor: "rgba(220,38,38,0.08)" },
};

export default function ClauseCard({ clause, risk, explanation, index }) {
  const config = riskConfig[risk] || riskConfig.LOW;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="p-5 rounded-2xl border bg-white/5 backdrop-blur-sm"
      style={{ borderColor: config.borderColor, boxShadow: `inset 0 0 20px ${config.glowColor}` }}
    >
      <div className="flex gap-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: config.glowColor, border: `1px solid ${config.borderColor}` }}>
          <Icon className="w-5 h-5" style={{ color: config.iconColor }} />
        </div>
        <div className="flex-1">
          <div className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2" style={{ background: config.glowColor, color: config.iconColor, border: `1px solid ${config.borderColor}` }}>
            {config.label}
          </div>
          <p className="text-sm text-gray-300 italic mb-3 border-l-2 pl-3 border-white/10">&ldquo;{clause}&rdquo;</p>
          <p className="text-sm text-gray-400 leading-relaxed">{explanation}</p>
        </div>
      </div>
    </motion.div>
  );
}
