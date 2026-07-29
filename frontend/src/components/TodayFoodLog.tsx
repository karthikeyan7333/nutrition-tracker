import { useState } from "react";
import { Edit2, Trash2, Check, X, AlertCircle, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { FoodLog } from "../types";

interface TodayFoodLogProps {
  logs: FoodLog[];
  onUpdateFood: (logId: string, foodName: string, weight: number, date: string, time: string) => Promise<void>;
  onDeleteFood: (logId: string) => Promise<void>;
}

export default function TodayFoodLog({ logs, onUpdateFood, onDeleteFood }: TodayFoodLogProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editWeight, setEditWeight] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [errorId, setErrorId] = useState<string | null>(null);

  const handleStartEdit = (log: FoodLog) => {
    setEditingId(log.id);
    setEditName(log.foodName);
    setEditWeight(String(log.weight));
    setErrorId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditWeight("");
    setErrorId(null);
  };

  const handleSave = async (log: FoodLog) => {
    if (!editName.trim() || !editWeight) {
      setErrorId(log.id);
      return;
    }

    const weightNum = Number(editWeight);
    if (isNaN(weightNum) || weightNum <= 0) {
      setErrorId(log.id);
      return;
    }

    setUpdatingId(log.id);
    setErrorId(null);

    try {
      await onUpdateFood(log.id, editName.trim(), weightNum, log.date, log.time);
      setEditingId(null);
    } catch (err) {
      console.error(err);
      setErrorId(log.id);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div id="today-food-log" className="bg-[#1B1B1B] border border-[#2A2A2A] rounded-2xl overflow-hidden">
      <div className="p-6 border-b border-[#2A2A2A]/60 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold font-display text-white">Today's Food Log</h3>
          <p className="text-xs text-[#B3B3B3]">Manage your meals and review individual nutrients.</p>
        </div>
        <span className="text-xs bg-[#141414] text-green-400 font-mono px-3 py-1 rounded-full border border-[#2A2A2A]">
          {logs.length} logged
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-[#2A2A2A]/40 bg-[#141414]/50 text-[#888888] text-[11px] font-semibold uppercase tracking-wider font-display">
              <th className="px-6 py-4">Food</th>
              <th className="px-4 py-4">Weight</th>
              <th className="px-4 py-4">Calories</th>
              <th className="px-4 py-4">Protein</th>
              <th className="px-4 py-4">Fiber</th>
              <th className="px-4 py-4">Vitamins</th>
              <th className="px-4 py-4">Minerals</th>
              <th className="px-4 py-4">Time</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2A2A2A]/40 text-sm">
            <AnimatePresence initial={false}>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-[#555555]">
                      <AlertCircle className="w-8 h-8 mb-2" />
                      <p className="text-sm font-semibold text-[#888888]">No food logged today</p>
                      <p className="text-xs text-[#555555] mt-1">Use the "Add Food" card above to analyze and register meals.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const isEditing = editingId === log.id;
                  const isUpdating = updatingId === log.id;

                  return (
                    <motion.tr
                      key={log.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={`hover:bg-[#1E1E1E]/40 transition-colors ${
                        isEditing ? "bg-green-500/[0.02]" : ""
                      }`}
                    >
                      {/* Food Name */}
                      <td className="px-6 py-4 font-medium text-white">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            disabled={isUpdating}
                            className="bg-[#141414] border border-[#2A2A2A] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#22C55E] w-full max-w-[150px]"
                          />
                        ) : (
                          log.foodName
                        )}
                        {errorId === log.id && (
                          <p className="text-[10px] text-red-400 mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Fill correct values
                          </p>
                        )}
                      </td>

                      {/* Weight */}
                      <td className="px-4 py-4 text-[#B3B3B3]">
                        {isEditing ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={editWeight}
                              onChange={(e) => setEditWeight(e.target.value)}
                              disabled={isUpdating}
                              min="1"
                              className="bg-[#141414] border border-[#2A2A2A] rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-[#22C55E] w-16"
                            />
                            <span className="text-[10px] text-[#555555]">g</span>
                          </div>
                        ) : (
                          `${log.weight} g`
                        )}
                      </td>

                      {/* Calories */}
                      <td className="px-4 py-4 font-mono font-semibold text-white">
                        {isEditing && isUpdating ? (
                          <RefreshCw className="w-4.5 h-4.5 animate-spin text-[#22C55E]" />
                        ) : (
                          `${log.calories} kcal`
                        )}
                      </td>

                      {/* Protein */}
                      <td className="px-4 py-4 text-[#B3B3B3] font-mono">
                        {isEditing && isUpdating ? "..." : `${log.protein}g`}
                      </td>

                      {/* Fiber */}
                      <td className="px-4 py-4 text-[#B3B3B3] font-mono">
                        {isEditing && isUpdating ? "..." : `${log.fiber}g`}
                      </td>

                      {/* Vitamins */}
                      <td className="px-4 py-4 text-purple-400 font-mono">
                        {isEditing && isUpdating ? "..." : `${log.vitamins}%`}
                      </td>

                      {/* Minerals */}
                      <td className="px-4 py-4 text-teal-400 font-mono">
                        {isEditing && isUpdating ? "..." : `${log.minerals}%`}
                      </td>

                      {/* Time */}
                      <td className="px-4 py-4 text-[#B3B3B3] font-mono">{log.time}</td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2.5">
                          {isEditing ? (
                            <>
                              <button
                                onClick={() => handleSave(log)}
                                disabled={isUpdating}
                                className="p-1.5 bg-green-500/10 hover:bg-green-500/20 text-[#22C55E] border border-green-500/20 rounded-lg transition"
                                title="Save changes"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                disabled={isUpdating}
                                className="p-1.5 bg-[#2A2A2A] hover:bg-[#3A3A3A] text-[#B3B3B3] hover:text-white rounded-lg transition"
                                title="Cancel"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleStartEdit(log)}
                                className="p-1.5 bg-[#141414] hover:bg-[#2A2A2A] text-[#B3B3B3] hover:text-white border border-[#2A2A2A] rounded-lg transition"
                                title="Edit entry"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onDeleteFood(log.id)}
                                className="p-1.5 bg-red-500/5 hover:bg-red-500/15 text-red-400 border border-red-500/10 hover:border-red-500/20 rounded-lg transition"
                                title="Delete entry"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}
