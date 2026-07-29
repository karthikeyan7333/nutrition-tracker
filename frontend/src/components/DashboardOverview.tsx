import { Flame, Dumbbell, GlassWater, Apple, ShieldCheck, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { NutritionSummary } from "../types";

interface DashboardOverviewProps {
  summary: NutritionSummary;
}

export default function DashboardOverview({ summary }: DashboardOverviewProps) {
  // Format Water to Liters for user presentation: e.g. 2.0 / 3.5 L
  const waterCurrentL = (summary.water.current / 1000).toFixed(1);
  const waterGoalL = (summary.water.goal / 1000).toFixed(1);

  const statCards = [
    {
      id: "calories",
      title: "Calories",
      current: `${summary.calories.current}`,
      goal: `${summary.calories.goal} kcal`,
      percentage: Math.min(100, (summary.calories.current / (summary.calories.goal || 1)) * 100),
      color: "from-amber-500 to-orange-500",
      icon: Flame,
      iconColor: "text-orange-400",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/20",
    },
    {
      id: "protein",
      title: "Protein",
      current: `${Math.round(summary.protein.current * 10) / 10}g`,
      goal: `${summary.protein.goal}g`,
      percentage: Math.min(100, (summary.protein.current / (summary.protein.goal || 1)) * 100),
      color: "from-blue-500 to-indigo-500",
      icon: Dumbbell,
      iconColor: "text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
    },
    {
      id: "fiber",
      title: "Fiber",
      current: `${Math.round(summary.fiber.current * 10) / 10}g`,
      goal: `${summary.fiber.goal}g`,
      percentage: Math.min(100, (summary.fiber.current / (summary.fiber.goal || 1)) * 100),
      color: "from-emerald-500 to-green-500",
      icon: Apple,
      iconColor: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
    },
    {
      id: "vitamins",
      title: "Vitamins",
      current: `${summary.vitamins.current}%`,
      goal: `${summary.vitamins.goal}%`,
      percentage: Math.min(100, (summary.vitamins.current / (summary.vitamins.goal || 1)) * 100),
      color: "from-purple-500 to-fuchsia-500",
      icon: ShieldCheck,
      iconColor: "text-purple-400",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20",
    },
    {
      id: "minerals",
      title: "Minerals",
      current: `${summary.minerals.current}%`,
      goal: `${summary.minerals.goal}%`,
      percentage: Math.min(100, (summary.minerals.current / (summary.minerals.goal || 1)) * 100),
      color: "from-teal-500 to-cyan-500",
      icon: Sparkles,
      iconColor: "text-teal-400",
      bgColor: "bg-teal-500/10",
      borderColor: "border-teal-500/20",
    },
    {
      id: "water",
      title: "Water",
      current: `${waterCurrentL}L`,
      goal: `${waterGoalL}L`,
      percentage: Math.min(100, (summary.water.current / (summary.water.goal || 1)) * 100),
      color: "from-sky-500 to-blue-500",
      icon: GlassWater,
      iconColor: "text-sky-400",
      bgColor: "bg-sky-500/10",
      borderColor: "border-sky-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {statCards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            className="bg-[#1B1B1B] border border-[#2A2A2A] rounded-2xl p-5 hover:border-[#3A3A3A] hover:bg-[#1E1E1E] transition-all duration-300 flex flex-col justify-between group h-full relative overflow-hidden"
          >
            {/* Background Hover Accent */}
            <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-[#22C55E]/20 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />

            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-xs md:text-sm font-medium text-[#B3B3B3]">
                  {card.title}
                </span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-xl md:text-2xl font-bold text-white font-mono leading-none">
                    {card.current}
                  </span>
                  <span className="text-xs text-[#888888]">/</span>
                  <span className="text-xs font-medium text-[#888888]">
                    {card.goal}
                  </span>
                </div>
              </div>
              <div className={`p-2.5 ${card.bgColor} rounded-xl border ${card.borderColor} transition-transform group-hover:scale-105 duration-300`}>
                <Icon className={`w-5 h-5 ${card.iconColor}`} />
              </div>
            </div>

            {/* Progress Bar & percentage */}
            <div className="space-y-1.5 mt-auto">
              <div className="flex justify-between text-[10px] md:text-xs">
                <span className="text-[#888888] font-mono">
                  {Math.round(card.percentage)}%
                </span>
                {card.percentage >= 100 && (
                  <span className="text-[#22C55E] font-medium tracking-tight">
                    Goal Reached
                  </span>
                )}
              </div>
              <div className="w-full h-1.5 md:h-2 bg-[#262626] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${card.percentage}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className={`h-full rounded-full bg-gradient-to-r ${
                    card.percentage >= 100 ? "from-[#22C55E] to-[#4ADE80] green-glow" : card.color
                  }`}
                />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
