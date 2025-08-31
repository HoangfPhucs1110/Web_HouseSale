import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { errorHandler } from "../utils/error.js";
import jwt from "jsonwebtoken";

const COOKIE_OPTIONS = {
  httpOnly: true,
  // Nếu FE và BE cùng domain (Render 1 service): để Lax là đủ.
  sameSite: process.env.NODE_ENV === "production" ? "lax" : "lax",
  secure: process.env.NODE_ENV === "production", // Render dùng HTTPS -> true
  // maxAge: 7 * 24 * 60 * 60 * 1000, // (tuỳ chọn) 7 ngày
};

export const signup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body || {};

    if (!username || !email || !password) {
      return next(errorHandler(400, "Missing username/email/password"));
    }
    if (String(password).length < 6) {
      return next(errorHandler(400, "Password must be at least 6 characters"));
    }
    if (!process.env.JWT_SECRET) {
      return next(errorHandler(500, "Server misconfigured (JWT_SECRET)"));
    }

    // Hash password (async)
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });

    await newUser.save();

    // (tuỳ chọn) tự đăng nhập sau khi đăng ký
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    const { password: pass, ...rest } = newUser._doc;
    return res
      .cookie("access_token", token, COOKIE_OPTIONS)
      .status(201)
      .json({ message: "User created successfully", rest });
  } catch (error) {
    // Bắt duplicate key của Mongo (trùng email)
    if (error?.code === 11000) {
      return next(errorHandler(409, "User already exists"));
    }
    return next(error);
  }
};

export const signin = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return next(errorHandler(400, "Missing email/password"));
    }
    if (!process.env.JWT_SECRET) {
      return next(errorHandler(500, "Server misconfigured (JWT_SECRET)"));
    }

    const validUser = await User.findOne({ email });
    if (!validUser) return next(errorHandler(404, "User not found"));

    const validPassword = await bcrypt.compare(password, validUser.password);
    if (!validPassword) return next(errorHandler(401, "Wrong credentials"));

    const token = jwt.sign({ id: validUser._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    const { password: pass, ...rest } = validUser._doc;

    return res.cookie("access_token", token, COOKIE_OPTIONS).status(200).json({ rest });
  } catch (error) {
    return next(error);
  }
};

export const google = async (req, res, next) => {
  try {
    const { email, name, photo } = req.body || {};
    if (!email) return next(errorHandler(400, "Missing email"));
    if (!process.env.JWT_SECRET) {
      return next(errorHandler(500, "Server misconfigured (JWT_SECRET)"));
    }

    const user = await User.findOne({ email });

    if (user) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
      const { password: pass, ...userData } = user._doc;
      return res.cookie("access_token", token, COOKIE_OPTIONS).status(200).json({ rest: userData });
    }

    // Tạo username ngắn gọn & an toàn
    const base = (name || email.split("@")[0] || "user")
      .toString()
      .replace(/\s+/g, "")
      .toLowerCase()
      .slice(0, 16);
    const randomSuffix = Math.random().toString(36).slice(-4);

    const generatedPassword =
      Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

    const newUser = new User({
      username: `${base}${randomSuffix}`,
      email,
      password: hashedPassword,
      avatar: photo,
    });

    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    const { password: pass, ...userData } = newUser._doc;
    return res.cookie("access_token", token, COOKIE_OPTIONS).status(200).json({ rest: userData });
  } catch (error) {
    // Nếu lỗi do trùng email (đua điều kiện), vẫn trả 200 như nhánh user tồn tại
    if (error?.code === 11000) {
      try {
        const existing = await User.findOne({ email: req.body.email });
        if (existing) {
          const token = jwt.sign({ id: existing._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
          const { password: pass, ...userData } = existing._doc;
          return res
            .cookie("access_token", token, COOKIE_OPTIONS)
            .status(200)
            .json({ rest: userData });
        }
      } catch (_) {}
      return next(errorHandler(409, "User already exists"));
    }
    return next(error);
  }
};

export const signout = async (req, res, next) => {
  try {
    res.clearCookie("access_token", {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "lax" : "lax",
      secure: process.env.NODE_ENV === "production",
    });
    res.status(200).json({ message: "Đăng xuất thành công" });
  } catch (error) {
    next(error);
  }
};
