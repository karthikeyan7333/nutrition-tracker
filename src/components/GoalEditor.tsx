import React, { useState } from "react";
import { UserGoals } from "../types";
import { motion } from "motion/react";
import { User, Flame, Dumbbell, GlassWater, Apple, ShieldCheck, Sparkles, Check, AlertCircle } from "lucide-react";

interface GoalEditorProps {
  initialGoals: UserGoals;
  onSaveGoals: (goals: Partial<UserGoals>) => Promise<void>;
}

export default function GoalEditor({ initialGoals, onSaveGoals }: GoalEditorProps) {
  const [calories, setCalories] = useState(String(initialGoals.calories));
  const [protein, setProtein] = useState(String(initialGoals.protein));
  const [fiber, setFiber] = useState(String(initialGoals.fiber));
  const [water, setWater] = useState(String(initialGoals.water));
  const [vitamins, setVitamins] = useState(String(initialGoals.vitamins));
  const [minerals, setMinerals] = useState(String(initialGoals.minerals));

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Validate inputs
    const calVal = Number(calories);
    const protVal = Number(protein);
    const fibVal = Number(fiber);
    const watVal = Number(water);
    const vitVal = Number(vitamins);
    const minVal = Number(minerals);

    if (
      isNaN(calVal) || calVal <= 0 ||
      isNaN(protVal) || protVal <= 0 ||
      isNaN(fibVal) || fibVal <= 0 ||
      isNaN(watVal) || watVal <= 0 ||
      isNaN(vitVal) || vitVal <= 0 ||
      isNaN(minVal) || minVal <= 0
    ) {
      setError("Please specify valid positive numbers for all goal targets.");
      return;
    }

    setLoading(true);
    try {
      await onSaveGoals({
        calories: calVal,
        protein: protVal,
        fiber: fibVal,
        water: watVal,
        vitamins: vitVal,
        minerals: minVal,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to update goals. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="goal-editor-card" className="bg-[#1B1B1B] border border-[#2A2A2A] rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-green-500/10 rounded-lg border border-green-500/20 green-glow">
          <User className="w-5 h-5 text-[#22C55E]" />
        </div>
        <div>
          <h3 className="text-lg font-bold font-display text-white">Daily Nutrient Goals</h3>
          <p className="text-xs text-[#B3B3B3]">Customize your daily nutrition targets. Dashboard trackers will sync automatically.</p>
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs mb-5 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-3.5 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-xs mb-5 flex items-center gap-2"
        >
          <Check className="w-4 h-4 text-[#22C55E] shrink-0" />
          <span>Goals updated successfully! Dashboard computations have been synced.</span>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Calories Goal */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#B3B3B3] flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-orange-400" />
              Daily Calories Goal
            </label>
            <div className="relative">
              <input
                type="number"
                required
                disabled={loading}
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                placeholder="2500"
                className="w-full bg-[#141414] border border-[#2A2A2A] rounded-xl py-3 px-4 text-sm text-white placeholder-[#555555] focus:outline-none focus:border-[#22C55E] focus:ring-1 focus:ring-[#22C55E] transition"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#555555]">kcal</span>
            </div>
          </div>

          {/* Protein Goal */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#B3B3B3] flex items-center gap-1.5">
              <Dumbbell className="w-4 h-4 text-blue-400" />
              Daily Protein Goal
            </label>
            <div className="relative">
              <input
                type="number"
                required
                disabled={loading}
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                placeholder="120"
                className="w-full bg-[#141414] border border-[#2A2A2A] rounded-xl py-3 px-4 text-sm text-white placeholder-[#555555] focus:outline-none focus:border-[#22C55E] focus:ring-1 focus:ring-[#22C55E] transition"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#555555]">grams</span>
            </div>
          </div>

          {/* Fiber Goal */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#B3B3B3] flex items-center gap-1.5">
              <Apple className="w-4 h-4 text-emerald-400" />
              Daily Fiber Goal
            </label>
            <div className="relative">
              <input
                type="number"
                required
                disabled={loading}
                value={fiber}
                onChange={(e) => setFiber(e.target.value)}
                placeholder="30"
                className="w-full bg-[#141414] border border-[#2A2A2A] rounded-xl py-3 px-4 text-sm text-white placeholder-[#555555] focus:outline-none focus:border-[#22C55E] focus:ring-1 focus:ring-[#22C55E] transition"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#555555]">grams</span>
            </div>
          </div>

          {/* Water Goal */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#B3B3B3] flex items-center gap-1.5">
              <GlassWater className="w-4 h-4 text-sky-400" />
              Daily Water Goal
            </label>
            <div className="relative">
              <input
                type="number"
                required
                disabled={loading}
                value={water}
                onChange={(e) => setWater(e.target.value)}
                placeholder="3500"
                className="w-full bg-[#141414] border border-[#2A2A2A] rounded-xl py-3 px-4 text-sm text-white placeholder-[#555555] focus:outline-none focus:border-[#22C55E] focus:ring-1 focus:ring-[#22C55E] transition"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#555555]">ml</span>
            </div>
          </div>

          {/* Vitamin Goal */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#B3B3B3] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              Vitamin Goal
            </label>
            <div className="relative">
              <input
                type="number"
                required
                disabled={loading}
                value={vitamins}
                onChange={(e) => setVitamins(e.target.value)}
                placeholder="100"
                className="w-full bg-[#141414] border border-[#2A2A2A] rounded-xl py-3 px-4 text-sm text-white placeholder-[#555555] focus:outline-none focus:border-[#22C55E] focus:ring-1 focus:ring-[#22C55E] transition"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#555555]">% DV</span>
            </div>
          </div>

          {/* Mineral Goal */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#B3B3B3] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-teal-400" />
              Mineral Goal
            </label>
            <div className="relative">
              <input
                type="number"
                required
                disabled={loading}
                value={minerals}
                onChange={(e) => setMinerals(e.target.value)}
                placeholder="100"
                className="w-full bg-[#141414] border border-[#2A2A2A] rounded-xl py-3 px-4 text-sm text-white placeholder-[#555555] focus:outline-none focus:border-[#22C55E] focus:ring-1 focus:ring-[#22C55E] transition"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#555555]">% DV</span>
            </div>
          </div>
        </div>

        <button
          id="update-goals-btn"
          type="submit"
          disabled={loading}
          className="w-full bg-[#22C55E] hover:bg-[#16A34A] text-white rounded-xl py-3 text-sm font-semibold transition hover:shadow-[0_0_15px_rgba(34,197,94,0.3)] flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
        >
          {loading ? (
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              Update Nutrient Targets
              <Check className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
