import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { User, UserGoals, FoodLog, WaterLog } from "./src/types";

const DB_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DB_DIR, "db.json");

interface DatabaseSchema {
  users: Array<User & { passwordHash: string }>;
  goals: UserGoals[];
  foodLogs: FoodLog[];
  waterLogs: WaterLog[];
}

// Ensure database directory and file exist
function initializeDb() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    const initialData: DatabaseSchema = {
      users: [],
      goals: [],
      foodLogs: [],
      waterLogs: [],
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), "utf-8");
  }
}

// Synchronously read database
function readDb(): DatabaseSchema {
  initializeDb();
  try {
    const data = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(data) as DatabaseSchema;
  } catch (err) {
    console.error("Error reading database file, returning default schema", err);
    return { users: [], goals: [], foodLogs: [], waterLogs: [] };
  }
}

// Synchronously write database
function writeDb(data: DatabaseSchema) {
  initializeDb();
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing database file", err);
  }
}

// Generate secure random string for IDs
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export const dbService = {
  // Users
  async findUserByEmail(email: string) {
    const db = readDb();
    return db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  },

  async createUser(email: string, passwordPlain: string) {
    const db = readDb();
    const existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      throw new Error("User already exists");
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(passwordPlain, salt);
    const userId = generateId();

    const newUser = {
      id: userId,
      email: email.toLowerCase(),
      createdAt: new Date().toISOString(),
      passwordHash,
    };

    // Create default goals for user
    const defaultGoals: UserGoals = {
      userId,
      calories: 2500,
      protein: 120,
      fiber: 30,
      water: 3500,
      vitamins: 100,
      minerals: 100,
      updatedAt: new Date().toISOString(),
    };

    db.users.push(newUser);
    db.goals.push(defaultGoals);
    writeDb(db);

    return {
      id: newUser.id,
      email: newUser.email,
      createdAt: newUser.createdAt,
    };
  },

  // Goals
  getUserGoals(userId: string): UserGoals {
    const db = readDb();
    let goals = db.goals.find((g) => g.userId === userId);
    if (!goals) {
      // Lazy init default goals if missing
      goals = {
        userId,
        calories: 2500,
        protein: 120,
        fiber: 30,
        water: 3500,
        vitamins: 100,
        minerals: 100,
        updatedAt: new Date().toISOString(),
      };
      db.goals.push(goals);
      writeDb(db);
    }
    return goals;
  },

  updateUserGoals(userId: string, newGoals: Partial<UserGoals>): UserGoals {
    const db = readDb();
    const index = db.goals.findIndex((g) => g.userId === userId);
    const currentGoals = index !== -1 ? db.goals[index] : {
      userId,
      calories: 2500,
      protein: 120,
      fiber: 30,
      water: 3500,
      vitamins: 100,
      minerals: 100,
      updatedAt: new Date().toISOString(),
    };

    const updated: UserGoals = {
      ...currentGoals,
      ...newGoals,
      userId, // secure
      updatedAt: new Date().toISOString(),
    };

    if (index !== -1) {
      db.goals[index] = updated;
    } else {
      db.goals.push(updated);
    }

    writeDb(db);
    return updated;
  },

  // Food Logs
  getFoodLogs(userId: string, date: string): FoodLog[] {
    const db = readDb();
    return db.foodLogs.filter((f) => f.userId === userId && f.date === date);
  },

  getFoodLogsRange(userId: string, startDate: string, endDate: string): FoodLog[] {
    const db = readDb();
    return db.foodLogs.filter((f) => {
      return f.userId === userId && f.date >= startDate && f.date <= endDate;
    });
  },

  addFoodLog(userId: string, log: Omit<FoodLog, "id" | "userId" | "createdAt">): FoodLog {
    const db = readDb();
    const newLog: FoodLog = {
      ...log,
      id: generateId(),
      userId,
      createdAt: new Date().toISOString(),
    };
    db.foodLogs.push(newLog);
    writeDb(db);
    return newLog;
  },

  updateFoodLog(userId: string, logId: string, update: Partial<Omit<FoodLog, "id" | "userId" | "createdAt">>): FoodLog {
    const db = readDb();
    const index = db.foodLogs.findIndex((f) => f.id === logId && f.userId === userId);
    if (index === -1) {
      throw new Error("Food log not found");
    }

    const current = db.foodLogs[index];
    const updated: FoodLog = {
      ...current,
      ...update,
      id: current.id, // prevent overwrite
      userId: current.userId,
    };

    db.foodLogs[index] = updated;
    writeDb(db);
    return updated;
  },

  deleteFoodLog(userId: string, logId: string) {
    const db = readDb();
    const initialLength = db.foodLogs.length;
    db.foodLogs = db.foodLogs.filter((f) => !(f.id === logId && f.userId === userId));
    if (db.foodLogs.length === initialLength) {
      throw new Error("Food log not found");
    }
    writeDb(db);
  },

  // Water Logs
  getWaterLogs(userId: string, date: string): WaterLog[] {
    const db = readDb();
    return db.waterLogs.filter((w) => w.userId === userId && w.date === date);
  },

  getWaterLogsRange(userId: string, startDate: string, endDate: string): WaterLog[] {
    const db = readDb();
    return db.waterLogs.filter((w) => {
      return w.userId === userId && w.date >= startDate && w.date <= endDate;
    });
  },

  addWaterLog(userId: string, amount: number, date: string): WaterLog {
    const db = readDb();
    // Check if there is already a water log for this date to append/update, or keep them as individual entries.
    // The prompt says "Today's Water" Quick buttons +250ml etc. or custom input.
    // Let's create an entry. We can either have multiple log entries for a day, or sum them.
    // It's clean to just save individual entries so the logs have fine-grained records, or keep them simple.
    // Saving individual entries is excellent.
    const newLog: WaterLog = {
      id: generateId(),
      userId,
      amount,
      date,
      createdAt: new Date().toISOString(),
    };
    db.waterLogs.push(newLog);
    writeDb(db);
    return newLog;
  },
};
