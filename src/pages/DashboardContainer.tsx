import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Calendar, Leaf, Sparkles, Flame, User, BarChart3, Clock, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import api from "../lib/api";
import { FoodLog, WaterLog, UserGoals, NutritionSummary, ChartDayData } from "../types";

import Sidebar from "../components/Sidebar";
import DashboardOverview from "../components/DashboardOverview";
import AddFoodCard from "../components/AddFoodCard";
import TodayFoodLog from "../components/TodayFoodLog";
import WaterTracker from "../components/WaterTracker";
import ProgressCharts from "../components/ProgressCharts";
import GoalEditor from "../components/GoalEditor";

export default function DashboardContainer() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // User details
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [goals, setGoals] = useState<UserGoals | null>(null);

  // Today's Logs
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);
  const [waterLogs, setWaterLogs] = useState<WaterLog[]>([]);

  // Progress Logs
  const [weeklyData, setWeeklyData] = useState<ChartDayData[]>([]);
  const [monthlyData, setMonthlyData] = useState<ChartDayData[]>([]);
  const [monthlySummary, setMonthlySummary] = useState<{
    avgCalories: number;
    avgProtein: number;
    avgWater: number;
  } | undefined>(undefined);

  const navigate = useNavigate();
  const todayDateStr = new Date().toISOString().split("T")[0];

  // Load user and initialize session
  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem("nutrition_tracker_token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const res = await api.get("/auth/me");
        setUser(res.data.user);
        setGoals(res.data.goals);

        // Fetch today's data immediately
        await Promise.all([fetchTodayFood(todayDateStr), fetchTodayWater(todayDateStr)]);
      } catch (err) {
        console.error("Session verification failed", err);
        localStorage.removeItem("nutrition_tracker_token");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, [navigate]);

  // Fetch contextual progress data depending on activeTab
  useEffect(() => {
    if (!user) return;

    if (activeTab === "weekly") {
      fetchWeeklyProgress();
    } else if (activeTab === "monthly") {
      fetchMonthlyProgress();
    }
  }, [activeTab, user]);

  // API Call: Fetch today's food logs
  const fetchTodayFood = async (date: string) => {
    try {
      const res = await api.get(`/food-log?date=${date}`);
      setFoodLogs(res.data);
    } catch (err) {
      console.error("Error loading food logs", err);
    }
  };

  // API Call: Fetch today's water logs
  const fetchTodayWater = async (date: string) => {
    try {
      const res = await api.get(`/water-log?date=${date}`);
      setWaterLogs(res.data);
    } catch (err) {
      console.error("Error loading water logs", err);
    }
  };

  // API Call: Fetch weekly progress data
  const fetchWeeklyProgress = async () => {
    try {
      const res = await api.get("/progress/weekly");
      setWeeklyData(res.data);
    } catch (err) {
      console.error("Error loading weekly stats", err);
    }
  };

  // API Call: Fetch monthly progress data
  const fetchMonthlyProgress = async () => {
    try {
      const res = await api.get("/progress/monthly");
      setMonthlyData(res.data.chartData);
      setMonthlySummary(res.data.summary);
    } catch (err) {
      console.error("Error loading monthly stats", err);
    }
  };

  // Handler: Add Food Log
  const handleAddFood = async (foodName: string, weight: number) => {
    const res = await api.post("/food-log", {
      foodName,
      weight,
      date: todayDateStr,
    });
    // Append and trigger live computation
    setFoodLogs((prev) => [...prev, res.data]);
  };

  // Handler: Update Food Log inline
  const handleUpdateFood = async (logId: string, foodName: string, weight: number, date: string, time: string) => {
    const res = await api.put(`/food-log/${logId}`, {
      foodName,
      weight,
      date,
      time,
    });
    setFoodLogs((prev) => prev.map((l) => (l.id === logId ? res.data : l)));
  };

  // Handler: Delete Food Log
  const handleDeleteFood = async (logId: string) => {
    await api.delete(`/food-log/${logId}`);
    setFoodLogs((prev) => prev.filter((l) => l.id !== logId));
  };

  // Handler: Add Water Log
  const handleAddWater = async (amount: number) => {
    const res = await api.post("/water-log", {
      amount,
      date: todayDateStr,
    });
    setWaterLogs((prev) => [...prev, res.data]);
  };

  // Handler: Update goals target from settings
  const handleSaveGoals = async (updatedGoals: Partial<UserGoals>) => {
    const res = await api.put("/goals", updatedGoals);
    setGoals(res.data);
  };

  // Handler: Logout user session
  const handleLogout = () => {
    localStorage.removeItem("nutrition_tracker_token");
    localStorage.removeItem("nutrition_tracker_user");
    navigate("/login");
  };

  // Recalculate nutrient totals live
  const computeNutritionSummary = (): NutritionSummary => {
    const defGoals = goals || {
      calories: 2500,
      protein: 120,
      fiber: 30,
      water: 3500,
      vitamins: 100,
      minerals: 100,
    };

    const totals = {
      calories: foodLogs.reduce((sum, f) => sum + f.calories, 0),
      protein: foodLogs.reduce((sum, f) => sum + f.protein, 0),
      fiber: foodLogs.reduce((sum, f) => sum + f.fiber, 0),
      vitamins: foodLogs.reduce((sum, f) => sum + f.vitamins, 0),
      minerals: foodLogs.reduce((sum, f) => sum + f.minerals, 0),
      water: waterLogs.reduce((sum, w) => sum + w.amount, 0),
    };

    return {
      calories: { current: totals.calories, goal: defGoals.calories },
      protein: { current: totals.protein, goal: defGoals.protein },
      fiber: { current: totals.fiber, goal: defGoals.fiber },
      vitamins: { current: totals.vitamins, goal: defGoals.vitamins },
      minerals: { current: totals.minerals, goal: defGoals.minerals },
      water: { current: totals.water, goal: defGoals.water },
    };
  };

  const activeSummary = computeNutritionSummary();

  // Date formatted for header: e.g. "Monday, July 6, 2026"
  const formattedToday = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0B0B] flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-4 border-[#2A2A2A] border-t-[#22C55E] animate-spin" />
          <Leaf className="w-5 h-5 text-[#22C55E] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
        <span className="text-xs text-[#B3B3B3] font-medium tracking-wider">Syncing secure connection...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white flex flex-col md:flex-row relative">
      {/* Side rail navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userEmail={user?.email}
        onLogout={handleLogout}
        mobileOpen={mobileMenuOpen}
        setMobileOpen={setMobileMenuOpen}
      />

      {/* Main Workspace Frame */}
      <main className="flex-1 flex flex-col overflow-y-auto h-screen relative">
        {/* Mobile Top Bar */}
        <header className="md:hidden flex items-center justify-between px-6 py-4 bg-[#141414] border-b border-[#2A2A2A] sticky top-0 z-30">
          <div className="flex items-center gap-2.5">
            <Leaf className="w-5 h-5 text-[#22C55E]" />
            <span className="font-display font-bold text-sm tracking-tight text-white">NUTRITION</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 bg-[#1B1B1B] border border-[#2A2A2A] rounded-xl text-white hover:border-[#3A3A3A]"
          >
            <Menu className="w-5 h-5" />
          </button>
        </header>

        {/* Dashboard Frame Content */}
        <div className="p-6 md:p-8 space-y-8 max-w-7xl w-full mx-auto pb-20">
          {/* Top Banner Context Section */}
          <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#141414] border border-[#2A2A2A]/50 rounded-2xl p-6 relative overflow-hidden">
            {/* Background Gradient Accent */}
            <div className="absolute right-0 bottom-0 w-64 h-64 bg-green-500/[0.02] rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-1.5 z-10">
              <span className="text-[10px] uppercase font-bold text-[#22C55E] tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Premium Personal Tracker
              </span>
              <h2 className="text-xl md:text-2xl font-bold font-display tracking-tight text-white">
                Core Nutrition Analytics
              </h2>
              <div className="flex items-center gap-2 text-xs text-[#B3B3B3]">
                <Calendar className="w-4 h-4 text-[#888888]" />
                <span>{formattedToday}</span>
              </div>
            </div>

            {/* Quick dashboard stats tag */}
            <div className="flex items-center gap-3 z-10 bg-[#1B1B1B] border border-[#2A2A2A]/60 px-4 py-3 rounded-xl sm:self-center shrink-0">
              <div className="p-2 bg-orange-500/10 rounded-lg border border-orange-500/20">
                <Flame className="w-4.5 h-4.5 text-orange-400" />
              </div>
              <div>
                <p className="text-[9px] uppercase font-semibold text-[#888888] tracking-wider leading-none">Logged Today</p>
                <p className="text-sm font-bold font-mono text-white mt-1 leading-none">
                  {activeSummary.calories.current} kcal
                </p>
              </div>
            </div>
          </section>

          {/* Dynamic Tab Switching View */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-8"
            >
              {/* TAB: DASHBOARD */}
              {activeTab === "dashboard" && (
                <>
                  {/* Dashboard Metrics Grid */}
                  <DashboardOverview summary={activeSummary} />

                  {/* Food entry form and water logger side-by-side */}
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    <div className="lg:col-span-3">
                      <AddFoodCard onAddFood={handleAddFood} />
                    </div>
                    <div className="lg:col-span-2">
                      <WaterTracker
                        currentWater={activeSummary.water.current}
                        waterGoal={activeSummary.water.goal}
                        onAddWater={handleAddWater}
                      />
                    </div>
                  </div>

                  {/* Today's logged food entries */}
                  <TodayFoodLog
                    logs={foodLogs}
                    onUpdateFood={handleUpdateFood}
                    onDeleteFood={handleDeleteFood}
                  />
                </>
              )}

              {/* TAB: ADD FOOD VIEW */}
              {activeTab === "add-food" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    <AddFoodCard onAddFood={handleAddFood} />
                    <TodayFoodLog
                      logs={foodLogs}
                      onUpdateFood={handleUpdateFood}
                      onDeleteFood={handleDeleteFood}
                    />
                  </div>
                  <div className="lg:col-span-1">
                    {/* Informative instructions sidebar */}
                    <div className="bg-[#1B1B1B] border border-[#2A2A2A] rounded-2xl p-6 space-y-4">
                      <div className="p-2.5 bg-green-500/10 rounded-xl border border-green-500/20 w-fit">
                        <Leaf className="w-5 h-5 text-[#22C55E]" />
                      </div>
                      <h4 className="text-sm font-bold font-display text-white">Gemini AI Technology</h4>
                      <p className="text-xs text-[#B3B3B3] leading-relaxed">
                        Rather than selecting items from stale static database files, your food logs are analyzed live using the advanced Gemini model.
                      </p>
                      <p className="text-xs text-[#B3B3B3] leading-relaxed">
                        Simply write the name of the meal and specify the weight in grams. Gemini instantly calculates custom calorie targets, protein, fiber, vitamins, and mineral percentages tailored directly to your input weight.
                      </p>
                      <div className="bg-[#141414] rounded-xl p-3 border border-[#2A2A2A]/40 text-[11px] font-mono text-[#888888] flex items-start gap-2">
                        <Clock className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
                        <span>Calculations are fully scaled. E.g. logging 200g of a sweet potato registers double the nutrients of a 100g serving automatically.</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: WEEKLY PROGRESS */}
              {activeTab === "weekly" && (
                <ProgressCharts data={weeklyData} type="weekly" />
              )}

              {/* TAB: MONTHLY PROGRESS */}
              {activeTab === "monthly" && (
                <ProgressCharts data={monthlyData} type="monthly" summary={monthlySummary} />
              )}

              {/* TAB: PROFILE / GOALS SETTINGS */}
              {activeTab === "profile" && goals && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <GoalEditor initialGoals={goals} onSaveGoals={handleSaveGoals} />
                  </div>
                  <div className="lg:col-span-1 space-y-6">
                    <div className="bg-[#1B1B1B] border border-[#2A2A2A] rounded-2xl p-6">
                      <h4 className="text-sm font-bold font-display text-white mb-3">User Information</h4>
                      <div className="space-y-3.5 text-xs">
                        <div>
                          <span className="text-[#888888]">Email Address</span>
                          <p className="text-white font-mono mt-0.5 truncate">{user?.email}</p>
                        </div>
                        <div>
                          <span className="text-[#888888]">Current Local Date</span>
                          <p className="text-white mt-0.5">{formattedToday}</p>
                        </div>
                        <div>
                          <span className="text-[#888888]">Database Node</span>
                          <p className="text-white font-mono mt-0.5 text-[11px]">Local Document Store</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#1B1B1B] border border-[#2A2A2A] rounded-2xl p-6 text-xs text-[#B3B3B3] leading-relaxed space-y-3">
                      <h5 className="font-bold text-white flex items-center gap-1.5">
                        <HelpCircle className="w-4 h-4 text-[#22C55E]" />
                        About Daily Targets
                      </h5>
                      <p>
                        Vitamins and Minerals targets are calibrated to represent 100% of standard Daily Value (DV) guidelines.
                      </p>
                      <p>
                        When modifying targets (e.g. updating Calories Goal from 2500 kcal to 3000 kcal), progress bar computations across the dashboard will recalibrate in real-time.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
