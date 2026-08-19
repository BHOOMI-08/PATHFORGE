import mongoose from "mongoose";

const connectDB = async () => {
  // Register Mongoose connection state event listeners
  mongoose.connection.on("connected", () => {
    console.log("Mongoose state: connected");
  });

  mongoose.connection.on("error", (err) => {
    console.error(`Mongoose state: error: ${err.message}`);
  });

  mongoose.connection.on("disconnected", () => {
    console.log("Mongoose state: disconnected");
  });

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`\n======================================================`);
    console.log(`MongoDB Connected successfully!`);
    console.log(`Database Host: ${conn.connection.host}`);
    console.log(`Database Name: ${conn.connection.name}`);
    console.log(`======================================================\n`);
  } catch (error) {
    console.error(`MongoDB Initial Connection Failure: ${error.message}`);
    throw error;
  }
};

export default connectDB;
