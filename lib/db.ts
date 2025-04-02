import { PrismaClient } from "@prisma/client";


const globalForPrisma = global as unknown as { prisma: PrismaClient };

// First declare the variable
let prismaClient: PrismaClient;

// Initialize it in the try-catch block
try {
  prismaClient = 
    globalForPrisma.prisma || 
    new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prismaClient;
  }
} catch (error) {
  console.error("Failed to initialize Prisma Client:", error);
  throw new Error("Database connection failed");
}

// Now export the initialized client
export const db = prismaClient;

// Add a connection test function
export async function testConnection() {
  try {
    // Try a simple query to test the connection
    await db.$queryRaw`SELECT 1`;
    console.log("Database connection successful");
    return true;
  } catch (error) {
    console.error("Database connection failed:", error);
    return false;
  }
}