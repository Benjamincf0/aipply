import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
  res.send("Session route is working!");
});

export default router;