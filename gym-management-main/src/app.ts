import express from "express";
import cors from "cors";
import helmet from "helmet";
import userRoutes from "./routes/user.routes";
import workoutRoutes from "./routes/workout.routes";
import coachRoutes from "./routes/coach.routes";

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Routes
app.use('/dev/workouts', workoutRoutes);

app.use('/dev/coaches', coachRoutes);
export default app;
