import React, { useState } from "react";
import { motion } from "motion/react";
import { GlassWater, Plus, Sparkles, Check, ChevronRight } from "lucide-react";

interface WaterTrackerProps {
  currentWater: number; // in ml
  waterGoal: number; // in ml
  onAddWater: (amount: number) => Promise<void>;
}

export default function WaterTracker({ currentWater, waterGoal, onAddWater }: WaterTrackerProps) {
  const [customAmount, setCustomAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Conversion for displaying in Liters
  const currentL = (currentWater / 1000).toFixed(2);
  const goalL = (waterGoal / 1000).toFixed(2);
  const progressPercent = Math.min(100, (currentWater / (waterGoal || 1)) * 100);

  const handleQuickAdd = async (amount: number) => {
    setLoading(true);
    setSuccess(false);
    try {
      await onAddWater(amount);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      console.error("Failed to log water", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(customAmount);
    if (!amount || isNaN(amount) || amount <= 0) {
      return;
    }

    setLoading(true);
    setSuccess(false);
    try {
      await onAddWater(amount);
      setCustomAmount("");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      console.error("Failed to log custom water", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="water-tracker-card" className="bg-[#1B1B1B] border border-[#2A2A2A] rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between h-full">
      {/* Glow Effect when full */}
      {progressPercent >= 100 && (
        <div className="absolute -right-12 -top-12 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />
      )}

      <div>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sky-500/10 rounded-lg border border-sky-500/20 green-glow">
              <GlassWater className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-display text-white">Water Tracker</h3>
              <p className="text-xs text-[#B3B3B3]">Log your hydration. Aim for your daily fluid target.</p>
            </div>
          </div>
          <span className="text-xs text-sky-400 font-mono font-bold bg-sky-500/10 px-2.5 py-1 rounded-full">
            {Math.round(progressPercent)}%
          </span>
        </div>

        {/* Liters Display & Progress Ring/Bar */}
        <div className="bg-[#141414] border border-[#2A2A2A]/40 rounded-xl p-4 mb-5 flex items-center justify-between relative overflow-hidden">
          <div>
            <span className="text-xs text-[#888888]">Today's Consumption</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-bold font-mono text-white">{currentL}</span>
              <span className="text-xs text-[#555555]">/</span>
              <span className="text-sm font-mono text-[#888888]">{goalL} L</span>
            </div>
          </div>

          {/* Sizable Visual Water Cup Indicator */}
          <div className="w-10 h-14 border-2 border-sky-500/30 rounded-b-xl rounded-t-sm relative overflow-hidden bg-[#1B1B1B]">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${progressPercent}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-sky-600 to-sky-400"
            />
            <div className="absolute inset-0 flex items-center justify-center text-[8px] font-bold font-mono text-white mix-blend-difference z-10">
              H₂O
            </div>
          </div>
        </div>

        {/* Quick buttons */}
        <div className="space-y-2 mb-5">
          <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-wider">Quick Hydrate</p>
          <div className="grid grid-cols-3 gap-2">
            {[250, 500, 1000].map((amount) => (
              <button
                key={amount}
                onClick={() => handleQuickAdd(amount)}
                disabled={loading}
                className="py-2.5 bg-[#141414] hover:bg-sky-500/10 text-white hover:text-sky-300 border border-[#2A2A2A] hover:border-sky-500/40 rounded-xl text-xs font-semibold transition flex flex-col items-center justify-center gap-0.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+{amount} ml</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Custom input */}
      <form onSubmit={handleCustomSubmit} className="space-y-2 pt-4 border-t border-[#2A2A2A]/40 mt-auto">
        <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-wider">Log Custom Amount</p>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="number"
              required
              disabled={loading}
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              placeholder="Enter amount (ml)"
              min="1"
              className="w-full bg-[#141414] border border-[#2A2A2A] rounded-xl py-2.5 px-3 text-xs text-white placeholder-[#555555] focus:outline-none focus:border-[#22C55E] focus:ring-1 focus:ring-[#22C55E] transition"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#555555]">ml</span>
          </div>
          <button
            type="submit"
            disabled={loading || !customAmount}
            className="px-4 bg-[#22C55E] hover:bg-[#16A34A] disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition duration-150 flex items-center justify-center gap-1 shrink-0"
          >
            {loading ? (
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : success ? (
              <Check className="w-3.5 h-3.5" />
            ) : (
              <>
                Log
                <ChevronRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
