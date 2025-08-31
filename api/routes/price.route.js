import express from "express";
import axios from "axios";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

const ML_BASE = (process.env.ML_SERVICE_URL || "http://localhost:8001").replace(/\/+$/, "");

router.post("/predict", verifyToken, async (req, res) => {
  try {
    const payload = { features: req.body?.features || req.body?.data || {} };

    const resp = await axios.post(`${ML_BASE}/predict`, payload, { timeout: 10000 });
    return res.json(resp.data);
  } catch (err) {
    const status = err.response?.status || 400;
    const detail = err.response?.data || err.message;
    return res.status(status).json({ success: false, detail });
  }
});

export default router;
