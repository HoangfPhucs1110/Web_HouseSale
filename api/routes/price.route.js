import express from "express";
import axios from "axios";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

router.post("/predict", verifyToken, async (req, res) => {
  try {
    const mlUrl = process.env.ML_SERVICE_URL || "http://localhost:8001";
    const resp = await axios.post(
      `${mlUrl}/predict`,
      { data: req.body.data },
      { timeout: 10000 }
    );
    return res.json(resp.data);
  } catch (err) {
    const status = err.response?.status || 500;
    const detail = err.response?.data || { message: err.message || "ML service error" };
    return res.status(status).json({ success: false, detail });
  }
});

export default router;
