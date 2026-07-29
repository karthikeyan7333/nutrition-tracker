import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Sparkles, Scale, Search, Check, AlertCircle } from "lucide-react";

interface AddFoodCardProps {
  onAddFood: (foodName: string, weight: number) => Promise<void>;
}

export default function AddFoodCard({ onAddFood }: AddFoodCardProps) {
  const [foodName, setFoodName] = useState("");
  const [weight, setWeight] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Quick suggestions for premium user logging
  const suggestions = [
    { name: "Sweet Potato", defaultWeight: 200 },
    { name: "Chicken Breast", defaultWeight: 150 },
    { name: "Avocado", defaultWeight: 100 },
    { name: "Banana", defaultWeight: 120 },
    { name: "Whole Egg", defaultWeight: 100 },
    { name: "Broccoli", defaultWeight: 100 },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodName.trim() || !weight) {
      setError("Please specify both a food name and weight.");
      return;
    }

    const weightNum = Number(weight);
    if (isNaN(weightNum) || weightNum <= 0) {
      setError("Please specify a valid weight greater than 0g.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      await onAddFood(foodName.trim(), weightNum);
      setFoodName("");
      setWeight("");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to analyze food. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSuggestion = (suggestedName: string, suggestedWeight: number) => {
    setFoodName(suggestedName);
    setWeight(String(suggestedWeight));
    setError("");
  };

  return (
    <div id="add-food-card" className="bg-[#1B1B1B] border border-[#2A2A2A] rounded-2xl p-6 relative overflow-hidden">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-green-500/10 rounded-lg border border-green-500/20 green-glow">
          <Plus className="w-5 h-5 text-[#22C55E]" />
        </div>
        <div>
          <h3 className="text-lg font-bold font-display text-white">Add Food</h3>
          <p className="text-xs text-[#B3B3B3]">Log your meal. Gemini will extract exact nutrient facts.</p>
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs mb-5 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
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
          <span>Food successfully logged and added to your tracker!</span>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Food Name input */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[#B3B3B3] block">Food Name</label>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#555555]" />
            <input
              type="text"
              required
              disabled={loading}
              value={foodName}
              onChange={(e) => setFoodName(e.target.value)}
              placeholder="e.g., Sweet Potato, Grilled Salmon, Oats..."
              className="w-full bg-[#141414] border border-[#2A2A2A] rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-[#555555] focus:outline-none focus:border-[#22C55E] focus:ring-1 focus:ring-[#22C55E] transition disabled:opacity-50"
            />
          </div>
        </div>

        {/* Weight input */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[#B3B3B3] block">Weight (grams)</label>
          <div className="relative">
            <Scale className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#555555]" />
            <input
              type="number"
              required
              disabled={loading}
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="e.g., 200"
              min="1"
              className="w-full bg-[#141414] border border-[#2A2A2A] rounded-xl py-3 pl-11 pr-14 text-sm text-white placeholder-[#555555] focus:outline-none focus:border-[#22C55E] focus:ring-1 focus:ring-[#22C55E] transition disabled:opacity-50"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#555555]">grams</span>
          </div>
        </div>

        {/* Action Button */}
        <button
          id="add-food-btn"
          type="submit"
          disabled={loading}
          className="w-full bg-[#22C55E] hover:bg-[#16A34A] text-white rounded-xl py-3 text-sm font-semibold transition flex items-center justify-center gap-2 hover:shadow-[0_0_15px_rgba(34,197,94,0.3)] disabled:opacity-75 disabled:cursor-wait"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span className="flex items-center gap-1">
                Gemini AI Extracting...
                <Sparkles className="w-3.5 h-3.5 animate-pulse text-amber-300" />
              </span>
            </div>
          ) : (
            <>
              Add Food Log
              <Sparkles className="w-4 h-4 text-white" />
            </>
          )}
        </button>
      </form>

      {/* Suggested Quick Food Logs */}
      <div className="mt-6 pt-5 border-t border-[#2A2A2A]/40">
        <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-wider mb-2.5">Quick Suggestions</p>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((item) => (
            <button
              key={item.name}
              type="button"
              disabled={loading}
              onClick={() => handleSelectSuggestion(item.name, item.defaultWeight)}
              className="text-xs bg-[#141414] hover:bg-[#1E1E1E] text-white border border-[#2A2A2A] hover:border-green-500/40 rounded-lg px-2.5 py-1.5 transition duration-150 flex items-center gap-1 disabled:opacity-50"
            >
              <span>{item.name}</span>
              <span className="text-[10px] font-mono text-[#888888] bg-[#1B1B1B] px-1 py-0.5 rounded border border-[#2A2A2A]/20">{item.defaultWeight}g</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
