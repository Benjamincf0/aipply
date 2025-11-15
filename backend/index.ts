import express from "express";
import applicationRoutes from "./routes/apply.js";
import searchRoutes from "./routes/search.js";

const app = express();

app.use(express.json());
app.use("/apply", applicationRoutes);
app.use("/search", searchRoutes);

app.listen(8000);
