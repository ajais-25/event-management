import express from "express";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

import userRoutes from "./routes/user.routes.js";
import eventRoutes from "./routes/event.routes.js";

app.use("/api/users", userRoutes);
app.use("/api/events", eventRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
