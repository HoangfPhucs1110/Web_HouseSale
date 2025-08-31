import express from "express";
import { createListing, getListing, deleteListing, updateListing, getListings } from "../controllers/listing.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

router.post("/create", verifyToken, createListing);
router.get("/get/:id", getListing);
router.delete("/delete/:id", verifyToken, deleteListing);
router.post("/update/:id", verifyToken, updateListing);
router.get('/get/:id', getListing); // lấy thông tin bài đăng
router.get('/get', getListings);

export default router;