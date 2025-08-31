import express from "express";
import axios from "axios";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

const ML_BASE = (process.env.ML_SERVICE_URL || "http://localhost:8001").replace(/\/+$/, "");

router.post("/predict", verifyToken, async (req, res) => {
  try {
    const features = req.body?.features || req.body?.data;
    if (!features) {
      return res.status(400).json({ success: false, message: "Missing 'features' in body" });
    }
    const resp = await axios.post(`${ML_BASE}/predict`, { features }, { timeout: 15000 });
    return res.json(resp.data);
  } catch (err) {
    const status = err.response?.status || 500;
    const detail = err.response?.data || err.message;
    return res.status(status).json({ success: false, message: detail });
  }
});

export default router;
