import { useState } from "react";
import { Flame, Dumbbell, GlassWater, BarChart3, TrendingUp, Info } from "lucide-react";
import { motion } from "motion/react";
import { ChartDayData } from "../types";

interface ProgressChartsProps {
  data: ChartDayData[];
  type: "weekly" | "monthly";
  summary?: {
    avgCalories: number;
    avgProtein: number;
    avgWater: number;
  };
}

export default function ProgressCharts({ data, type, summary }: ProgressChartsProps) {
  const [activeMetric, setActiveMetric] = useState<"calories" | "protein" | "water">("calories");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="bg-[#1B1B1B] border border-[#2A2A2A] rounded-2xl p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
        <BarChart3 className="w-10 h-10 text-[#555555] mb-2 animate-pulse" />
        <p className="text-sm font-semibold text-[#888888]">Insufficient Progress Data</p>
        <p className="text-xs text-[#555555] mt-1">Start logging your meals and hydration to view progress trends.</p>
      </div>
    );
  }

  // Get max value in data to scale heights appropriately
  const maxVal = Math.max(
    ...data.map((d) => d[activeMetric]),
    10 // Fallback minimum scale
  );

  // Dimension helpers for custom SVG charts
  const width = 800;
  const height = 280;
  const paddingX = 40;
  const paddingY = 30;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  // Get metric visual facts
  const getMetricDetails = () => {
    switch (activeMetric) {
      case "calories":
        return {
          label: "Calories",
          unit: "kcal",
          color: "#22C55E", // primary theme green
          gradientId: "calGlow",
          icon: Flame,
          iconColor: "text-orange-400",
          bgColor: "bg-orange-500/10",
        };
      case "protein":
        return {
          label: "Protein",
          unit: "g",
          color: "#3B82F6", // blue
          gradientId: "protGlow",
          icon: Dumbbell,
          iconColor: "text-blue-400",
          bgColor: "bg-blue-500/10",
        };
      case "water":
        return {
          label: "Water",
          unit: "ml",
          color: "#0EA5E9", // sky blue
          gradientId: "waterGlow",
          icon: GlassWater,
          iconColor: "text-sky-400",
          bgColor: "bg-sky-500/10",
        };
    }
  };

  const metric = getMetricDetails();

  // Draw Line / Area chart for monthly, or Bar columns for weekly
  const points = data.map((d, index) => {
    const x = paddingX + (index / (data.length - 1 || 1)) * chartWidth;
    const y = height - paddingY - (d[activeMetric] / maxVal) * chartHeight;
    return { x, y, value: d[activeMetric], label: d.label, date: d.date };
  });

  // SVG Path drawings
  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`
    : "";

  return (
    <div className="space-y-6">
      {/* Metric Selector Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold font-display text-white">
            {type === "weekly" ? "Weekly Progress" : "Monthly Progress"}
          </h3>
          <p className="text-xs text-[#B3B3B3]">
            {type === "weekly"
              ? "Select a daily metric below to monitor the last 7 days."
              : "Review 30 days history and average baseline stats."}
          </p>
        </div>

        <div className="flex bg-[#141414] border border-[#2A2A2A] rounded-xl p-1 gap-1 shrink-0">
          <button
            onClick={() => setActiveMetric("calories")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              activeMetric === "calories"
                ? "bg-[#22C55E] text-white"
                : "text-[#B3B3B3] hover:text-white"
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            Calories
          </button>
          <button
            onClick={() => setActiveMetric("protein")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              activeMetric === "protein"
                ? "bg-blue-500 text-white"
                : "text-[#B3B3B3] hover:text-white"
            }`}
          >
            <Dumbbell className="w-3.5 h-3.5" />
            Protein
          </button>
          <button
            onClick={() => setActiveMetric("water")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              activeMetric === "water"
                ? "bg-sky-500 text-white"
                : "text-[#B3B3B3] hover:text-white"
            }`}
          >
            <GlassWater className="w-3.5 h-3.5" />
            Water
          </button>
        </div>
      </div>

      {/* Monthly Summary Bento Cards */}
      {type === "monthly" && summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#141414] border border-[#2A2A2A]/60 rounded-xl p-4 flex items-center gap-4">
            <div className="p-2.5 bg-orange-500/10 rounded-xl border border-orange-500/20">
              <Flame className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <span className="text-[10px] text-[#888888] uppercase tracking-wider font-semibold">Average Calories</span>
              <p className="text-lg font-bold font-mono text-white mt-0.5">{summary.avgCalories} kcal</p>
            </div>
          </div>
          <div className="bg-[#141414] border border-[#2A2A2A]/60 rounded-xl p-4 flex items-center gap-4">
            <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20">
              <Dumbbell className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <span className="text-[10px] text-[#888888] uppercase tracking-wider font-semibold">Average Protein</span>
              <p className="text-lg font-bold font-mono text-white mt-0.5">{summary.avgProtein}g</p>
            </div>
          </div>
          <div className="bg-[#141414] border border-[#2A2A2A]/60 rounded-xl p-4 flex items-center gap-4">
            <div className="p-2.5 bg-sky-500/10 rounded-xl border border-sky-500/20">
              <GlassWater className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <span className="text-[10px] text-[#888888] uppercase tracking-wider font-semibold">Average Water</span>
              <p className="text-lg font-bold font-mono text-white mt-0.5">{(summary.avgWater / 1000).toFixed(2)} L</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Chart Container Card */}
      <div className="bg-[#1B1B1B] border border-[#2A2A2A] rounded-2xl p-4 md:p-6 relative overflow-hidden">
        {/* Dynamic Tooltip Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#22C55E]" />
            <span className="text-xs font-semibold text-[#B3B3B3]">
              {metric.label} Trend analysis
            </span>
          </div>

          <div className="h-5 flex items-center">
            {hoveredIndex !== null && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-xs font-mono text-white flex items-center gap-1.5"
              >
                <span className="text-[#888888]">{points[hoveredIndex].date}:</span>
                <span className="font-bold text-[#22C55E]">
                  {points[hoveredIndex].value} {metric.unit}
                </span>
              </motion.div>
            )}
          </div>
        </div>

        {/* Custom Responsive SVG rendering */}
        <div className="relative w-full overflow-hidden" style={{ aspectRatio: "800/280" }}>
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-full select-none"
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={metric.color} stopOpacity={0.25} />
                <stop offset="100%" stopColor={metric.color} stopOpacity={0} />
              </linearGradient>
            </defs>

            {/* Horizontal Gridlines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
              const y = paddingY + ratio * chartHeight;
              const value = Math.round(maxVal * (1 - ratio));
              return (
                <g key={i} className="opacity-20">
                  <line
                    x1={paddingX}
                    y1={y}
                    x2={width - paddingX}
                    y2={y}
                    stroke="#2A2A2A"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={paddingX - 10}
                    y={y + 4}
                    fill="#888888"
                    fontSize="10"
                    fontFamily="monospace"
                    textAnchor="end"
                  >
                    {value}
                  </text>
                </g>
              );
            })}

            {/* Render Weekly columns */}
            {type === "weekly" ? (
              points.map((p, index) => {
                const colWidth = Math.min(45, chartWidth / data.length - 12);
                const colHeight = (p.value / maxVal) * chartHeight;
                const rx = 6; // rounded corner

                return (
                  <g
                    key={index}
                    onMouseEnter={() => setHoveredIndex(index)}
                    className="cursor-pointer group"
                  >
                    {/* Background trigger column */}
                    <rect
                      x={p.x - colWidth / 2 - 8}
                      y={paddingY}
                      width={colWidth + 16}
                      height={chartHeight}
                      fill="transparent"
                    />

                    {/* Active columns */}
                    <motion.rect
                      initial={{ height: 0, y: height - paddingY }}
                      animate={{ height: colHeight, y: height - paddingY - colHeight }}
                      transition={{ duration: 0.6, delay: index * 0.04, ease: "easeOut" }}
                      x={p.x - colWidth / 2}
                      width={colWidth}
                      fill={hoveredIndex === index ? "#22C55E" : metric.color}
                      opacity={hoveredIndex === index ? 1 : 0.8}
                      rx={rx}
                    />

                    {/* Column values on top (if hovered) */}
                    {hoveredIndex === index && (
                      <text
                        x={p.x}
                        y={height - paddingY - colHeight - 8}
                        fill="#FFFFFF"
                        fontSize="10"
                        fontWeight="bold"
                        fontFamily="monospace"
                        textAnchor="middle"
                      >
                        {p.value}
                      </text>
                    )}
                  </g>
                );
              })
            ) : (
              // Render Monthly Area Line
              <>
                {/* Area Gradient Fill */}
                <motion.path
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8 }}
                  d={areaPath}
                  fill="url(#chartGradient)"
                />

                {/* Line path drawing */}
                <motion.path
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1, ease: "easeInOut" }}
                  d={linePath}
                  fill="none"
                  stroke={metric.color}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Hotspot triggers and dots */}
                {points.map((p, index) => {
                  const isHovered = hoveredIndex === index;

                  // Skip some labels if there are too many data points (e.g. show every 5th label)
                  const shouldShowLabel = data.length <= 7 || index % 5 === 0 || index === data.length - 1;

                  return (
                    <g key={index}>
                      {/* Interactive hover circle */}
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={isHovered ? 6 : 3}
                        fill={isHovered ? "#22C55E" : metric.color}
                        stroke="#1B1B1B"
                        strokeWidth={isHovered ? 2 : 1}
                        className="transition-all duration-150 pointer-events-none"
                      />

                      {/* Transparent hotspot for easier touch/hover */}
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r="14"
                        fill="transparent"
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredIndex(index)}
                      />
                    </g>
                  );
                })}
              </>
            )}

            {/* X-Axis labels */}
            {points.map((p, index) => {
              // Skip some labels on mobile/high density ranges to avoid overlap
              const labelInterval = type === "weekly" ? 1 : data.length > 15 ? 5 : 3;
              if (index % labelInterval !== 0 && index !== data.length - 1) return null;

              return (
                <text
                  key={index}
                  x={p.x}
                  y={height - paddingY + 18}
                  fill="#888888"
                  fontSize="10"
                  fontFamily="sans-serif"
                  textAnchor="middle"
                >
                  {p.label}
                </text>
              );
            })}
          </svg>
        </div>

        {/* Footer info tip */}
        <div className="mt-5 pt-4 border-t border-[#2A2A2A]/40 flex items-center gap-2 text-[10px] text-[#888888]">
          <Info className="w-3.5 h-3.5 text-[#22C55E]" />
          <span>Hover over individual data nodes to analyze fine-grained metric values on that specific day.</span>
        </div>
      </div>
    </div>
  );
}
