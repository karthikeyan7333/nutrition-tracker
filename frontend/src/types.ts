export interface User {
  id: string;
  email: string;
  createdAt: string;
}

export interface UserGoals {
  userId: string;
  calories: number;   // kcal (e.g., 2500)
  protein: number;    // g (e.g., 120)
  fiber: number;      // g (e.g., 30)
  water: number;      // ml (e.g., 3500)
  vitamins: number;   // % (e.g., 100)
  minerals: number;   // % (e.g., 100)
  updatedAt: string;
}

export interface FoodLog {
  id: string;
  userId: string;
  foodName: string;
  weight: number;     // grams
  calories: number;   // calculated based on weight
  protein: number;    // calculated based on weight (g)
  fiber: number;      // calculated based on weight (g)
  vitamins: number;   // calculated based on weight (% Daily Value)
  minerals: number;   // calculated based on weight (% Daily Value)
  date: string;       // YYYY-MM-DD
  time: string;       // HH:MM
  createdAt: string;
}

export interface WaterLog {
  id: string;
  userId: string;
  amount: number;     // ml logged
  date: string;       // YYYY-MM-DD
  createdAt: string;
}

export interface NutritionSummary {
  calories: { current: number; goal: number };
  protein: { current: number; goal: number };
  fiber: { current: number; goal: number };
  water: { current: number; goal: number };
  vitamins: { current: number; goal: number };
  minerals: { current: number; goal: number };
}

export interface DailySummary {
  date: string;
  calories: number;
  protein: number;
  water: number;
}

export interface ChartDayData {
  date: string;
  label: string;
  calories: number;
  protein: number;
  water: number;
}

