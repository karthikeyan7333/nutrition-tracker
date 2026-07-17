import express, { Request, Response, NextFunction } from "express";
import path from "path";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { dbService } from "./server-db";
import { fetchNutritionFromGemini } from "./server-gemini";

dotenv.config();

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "premium_nutrition_secret_key_change_me_in_production";

app.use(express.json());

// Extend Express Request type to include user
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

// Authentication Middleware
function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired session. Please log in again." });
    }
    req.user = decoded as { id: string; email: string };
    next();
  });
}

// ==========================================
// AUTHENTICATION ENDPOINTS
// ==========================================

app.post("/api/auth/register", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters long" });
  }

  try {
    const existing = await dbService.findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: "Email is already registered" });
    }

    const newUser = await dbService.createUser(email, password);
    const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET, {
      expiresIn: "7d",
    });

    const goals = dbService.getUserGoals(newUser.id);

    res.status(201).json({
      token,
      user: newUser,
      goals,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to register user" });
  }
});

app.post("/api/auth/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const user = await dbService.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const bcrypt = await import("bcryptjs");
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "7d",
    });

    const goals = dbService.getUserGoals(user.id);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
      },
      goals,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to login" });
  }
});

app.get("/api/auth/me", authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });

  try {
    const goals = dbService.getUserGoals(req.user.id);
    res.json({
      user: req.user,
      goals,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to load user info" });
  }
});

// ==========================================
// USER GOALS ENDPOINTS
// ==========================================

app.get("/api/goals", authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });

  try {
    const goals = dbService.getUserGoals(req.user.id);
    res.json(goals);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to load goals" });
  }
});

app.put("/api/goals", authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });

  const { calories, protein, fiber, water, vitamins, minerals } = req.body;

  try {
    const updated = dbService.updateUserGoals(req.user.id, {
      calories: calories ? Number(calories) : undefined,
      protein: protein ? Number(protein) : undefined,
      fiber: fiber ? Number(fiber) : undefined,
      water: water ? Number(water) : undefined,
      vitamins: vitamins ? Number(vitamins) : undefined,
      minerals: minerals ? Number(minerals) : undefined,
    });
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to update goals" });
  }
});

// ==========================================
// FOOD LOG ENDPOINTS
// ==========================================

app.get("/api/food-log", authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });

  const date = (req.query.date as string) || new Date().toISOString().split("T")[0];

  try {
    const logs = dbService.getFoodLogs(req.user.id, date);
    res.json(logs);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to load food logs" });
  }
});

app.post("/api/food-log", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });

  const { foodName, weight, date, time } = req.body;

  if (!foodName || !weight) {
    return res.status(400).json({ error: "Food Name and Weight (grams) are required" });
  }

  const weightNum = Number(weight);
  if (isNaN(weightNum) || weightNum <= 0) {
    return res.status(400).json({ error: "Weight must be a positive number" });
  }

  const logDate = date || new Date().toISOString().split("T")[0];
  const logTime = time || new Date().toLocaleTimeString("en-US", { hour12: false }).substring(0, 5);

  try {
    // Call Gemini API to fetch nutritional facts per 100g
    const rawNutrition = await fetchNutritionFromGemini(foodName);

    // Scale facts based on entered weight
    const scale = weightNum / 100;
    const calories = Math.round(rawNutrition.calories * scale);
    const protein = Math.round(rawNutrition.protein * scale * 10) / 10;
    const fiber = Math.round(rawNutrition.fiber * scale * 10) / 10;
    const vitamins = Math.round(rawNutrition.vitamins * scale);
    const minerals = Math.round(rawNutrition.minerals * scale);

    const newLog = dbService.addFoodLog(req.user.id, {
      foodName: foodName.trim(),
      weight: weightNum,
      calories,
      protein,
      fiber,
      vitamins,
      minerals,
      date: logDate,
      time: logTime,
    });

    res.status(201).json(newLog);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to save food log" });
  }
});

app.put("/api/food-log/:id", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });

  const logId = req.params.id;
  const { foodName, weight, date, time } = req.body;

  if (!foodName || !weight) {
    return res.status(400).json({ error: "Food Name and Weight (grams) are required" });
  }

  const weightNum = Number(weight);
  if (isNaN(weightNum) || weightNum <= 0) {
    return res.status(400).json({ error: "Weight must be a positive number" });
  }

  try {
    const logs = dbService.getFoodLogs(req.user.id, date || new Date().toISOString().split("T")[0]);
    const existingLog = logs.find((l) => l.id === logId);

    if (!existingLog) {
      return res.status(404).json({ error: "Food log not found" });
    }

    let calories = existingLog.calories;
    let protein = existingLog.protein;
    let fiber = existingLog.fiber;
    let vitamins = existingLog.vitamins;
    let minerals = existingLog.minerals;

    // Check if food name changed. If so, re-retrieve nutrition. If only weight changed, scale nutrients.
    if (existingLog.foodName.toLowerCase() !== foodName.toLowerCase()) {
      const rawNutrition = await fetchNutritionFromGemini(foodName);
      const scale = weightNum / 100;
      calories = Math.round(rawNutrition.calories * scale);
      protein = Math.round(rawNutrition.protein * scale * 10) / 10;
      fiber = Math.round(rawNutrition.fiber * scale * 10) / 10;
      vitamins = Math.round(rawNutrition.vitamins * scale);
      minerals = Math.round(rawNutrition.minerals * scale);
    } else if (existingLog.weight !== weightNum) {
      const scaleFactor = weightNum / existingLog.weight;
      calories = Math.round(existingLog.calories * scaleFactor);
      protein = Math.round(existingLog.protein * scaleFactor * 10) / 10;
      fiber = Math.round(existingLog.fiber * scaleFactor * 10) / 10;
      vitamins = Math.round(existingLog.vitamins * scaleFactor);
      minerals = Math.round(existingLog.minerals * scaleFactor);
    }

    const updated = dbService.updateFoodLog(req.user.id, logId, {
      foodName: foodName.trim(),
      weight: weightNum,
      calories,
      protein,
      fiber,
      vitamins,
      minerals,
      date,
      time,
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to update food log" });
  }
});

app.delete("/api/food-log/:id", authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });

  const logId = req.params.id;

  try {
    dbService.deleteFoodLog(req.user.id, logId);
    res.json({ message: "Food log deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to delete food log" });
  }
});

// ==========================================
// WATER LOG ENDPOINTS
// ==========================================

app.get("/api/water-log", authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });

  const date = (req.query.date as string) || new Date().toISOString().split("T")[0];

  try {
    const logs = dbService.getWaterLogs(req.user.id, date);
    res.json(logs);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to load water logs" });
  }
});

app.post("/api/water-log", authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });

  const { amount, date } = req.body;

  if (!amount) {
    return res.status(400).json({ error: "Water amount is required" });
  }

  const amountNum = Number(amount);
  if (isNaN(amountNum) || amountNum <= 0) {
    return res.status(400).json({ error: "Amount must be a positive number" });
  }

  const logDate = date || new Date().toISOString().split("T")[0];

  try {
    const log = dbService.addWaterLog(req.user.id, amountNum, logDate);
    res.status(201).json(log);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to save water log" });
  }
});

// ==========================================
// PROGRESS ENDPOINTS (WEEKLY / MONTHLY)
// ==========================================

// Helpers for date ranges
function getDatesArray(startDateStr: string, endDateStr: string): string[] {
  const dates: string[] = [];
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(d.toISOString().split("T")[0]);
  }
  return dates;
}

app.get("/api/progress/weekly", authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });

  try {
    // Last 7 days including today
    const dates: string[] = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      dates.push(d.toISOString().split("T")[0]);
    }

    const startDate = dates[0];
    const endDate = dates[dates.length - 1];

    const foodLogs = dbService.getFoodLogsRange(req.user.id, startDate, endDate);
    const waterLogs = dbService.getWaterLogsRange(req.user.id, startDate, endDate);

    const progress = dates.map((dateStr) => {
      const foods = foodLogs.filter((f) => f.date === dateStr);
      const waters = waterLogs.filter((w) => w.date === dateStr);

      const calories = foods.reduce((sum, f) => sum + f.calories, 0);
      const protein = foods.reduce((sum, f) => sum + f.protein, 0);
      const water = waters.reduce((sum, w) => sum + w.amount, 0);

      // Extract day label (e.g. Mon, Tue)
      const dateObj = new Date(dateStr);
      const dayName = dateObj.toLocaleDateString("en-US", { weekday: "short" });

      return {
        date: dateStr,
        label: dayName,
        calories,
        protein: Math.round(protein * 10) / 10,
        water,
      };
    });

    res.json(progress);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to load weekly progress" });
  }
});

app.get("/api/progress/monthly", authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });

  try {
    // Last 30 days including today
    const dates: string[] = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      dates.push(d.toISOString().split("T")[0]);
    }

    const startDate = dates[0];
    const endDate = dates[dates.length - 1];

    const foodLogs = dbService.getFoodLogsRange(req.user.id, startDate, endDate);
    const waterLogs = dbService.getWaterLogsRange(req.user.id, startDate, endDate);

    let totalCal = 0;
    let totalProt = 0;
    let totalWat = 0;

    const chartData = dates.map((dateStr) => {
      const foods = foodLogs.filter((f) => f.date === dateStr);
      const waters = waterLogs.filter((w) => w.date === dateStr);

      const calories = foods.reduce((sum, f) => sum + f.calories, 0);
      const protein = foods.reduce((sum, f) => sum + f.protein, 0);
      const water = waters.reduce((sum, w) => sum + w.amount, 0);

      totalCal += calories;
      totalProt += protein;
      totalWat += water;

      // Formatting date label as e.g. "Jul 6"
      const dateObj = new Date(dateStr);
      const label = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });

      return {
        date: dateStr,
        label,
        calories,
        protein: Math.round(protein * 10) / 10,
        water,
      };
    });

    const activeDaysCount = dates.length; // 30 days

    res.json({
      summary: {
        avgCalories: Math.round(totalCal / activeDaysCount),
        avgProtein: Math.round((totalProt / activeDaysCount) * 10) / 10,
        avgWater: Math.round(totalWat / activeDaysCount),
      },
      chartData,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to load monthly progress" });
  }
});

// ==========================================
// VITE OR STATIC FILE SERVING MIDDLEWARE
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development server middleware loaded.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving built static files in production.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
