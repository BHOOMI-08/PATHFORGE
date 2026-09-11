import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "./config/db.js";
import validateEnvironment from "./config/env.js";
import { app } from "./app.js";

validateEnvironment();

const PORT = process.env.PORT || 5000;

let server;

// Connect to MongoDB Atlas first, then bootstrap application listener
connectDB()
  .then(() => {
    server = app.listen(PORT, () => {
      console.log(`\n======================================================`);
      console.log(`Server Running successfully!`);
      console.log(`Port Number: ${PORT}`);
      console.log(`Access Root API at http://localhost:${PORT}/`);
      console.log(`======================================================\n`);
    });
  })
  .catch((err) => {
    console.error("Database connection failure. Server startup aborted: ", err.message);
    process.exit(1);
  });

// Graceful Shutdown handler
const handleGracefulShutdown = (signal) => {
  console.log(`\nReceived ${signal}. Shutting down application servers gracefully...`);
  
  if (server) {
    server.close(() => {
      console.log("HTTP server closed.");
      mongoose.connection.close(false)
        .then(() => {
          console.log("MongoDB connection closed.");
          process.exit(0);
        })
        .catch((err) => {
          console.error("Error closing MongoDB connection:", err.message);
          process.exit(1);
        });
    });
  } else {
    process.exit(0);
  }
};

// Listen for termination signals and uncaught errors
process.on("SIGINT", () => handleGracefulShutdown("SIGINT"));
process.on("SIGTERM", () => handleGracefulShutdown("SIGTERM"));

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection detected at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception thrown:", error.message, error.stack);
  handleGracefulShutdown("uncaughtException");
});

