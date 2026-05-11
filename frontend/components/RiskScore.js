"use client";
import { motion } from "framer-motion";

function getScoreConfig(score) {
  if (score <= 25) return { label: "Very Safe", color: "#10B981", trackColor: "rgba(16,185,129,0.2)", grade: "A" };
  if (score <= 50) return { label: "Low Risk", color: "#34D399", trackColor: "rgba(52,211,153,0.2)", grade: "B" };
  if (score <= 65) return { label: "Moderate Risk", color: "#F59E0B", trackColor: "rgba(245,158,11,0.2)", grade: "C" };
  if (score <= 80) return { label: "High Risk", color: "#EF4444", trackColor: "rgba(239,68,68,0.2)", grade: "D" };
  return { label: "Critical Risk", color: "#DC2626", trackColor: "rgba(220,38,38,0.2)", grade: "F" };
}

export default function RiskScore({ score }) {
  const config = getScoreConfig(score);
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="p-6 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl flex flex-col items-center gap-4">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-500">
        Risk Assessment
      </h3>

      <div className="relative w-48 h-48 flex items-center justify-center">
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 180 180">
          <circle cx="90" cy="90" r={radius} fill="none" stroke={config.trackColor} strokeWidth="12" />
          <motion.circle
            cx="90" cy="90" r={radius} fill="none" stroke={config.color} strokeWidth="12" strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            style={{ filter: `drop-shadow(0 0 8px ${config.color}80)` }}
          />
        </svg>
        <div className="relative z-10 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="text-5xl font-black" style={{ color: config.color }}>{score}</div>
            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">Score / 100</div>
          </motion.div>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 w-full bg-white/5 p-3 rounded-2xl border border-white/5">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl font-black" style={{ background: config.trackColor, border: `1px solid ${config.color}40`, color: config.color }}>
          {config.grade}
        </div>
        <div>
          <div className="font-bold text-sm" style={{ color: config.color }}>{config.label}</div>
          <div className="text-[10px] text-gray-500 font-medium">Detailed AI Evaluation</div>
        </div>
      </motion.div>
    </div>
  );
}
