import User from '../models/user.model.js';
import Listing from '../models/listing.model.js';
import { errorHandler } from '../utils/error.js';

// ===== USERS =====
export const adminListUsers = async (req,res,next) => {
  try {
    const { page=1, limit=10, search='' } = req.query;
    const q = search
      ? { $or: [
          { username: { $regex: search, $options: 'i' } },
          { email:    { $regex: search, $options: 'i' } }
        ]}
      : {};
    const skip = (Number(page)-1)*Number(limit);
    const [items, total] = await Promise.all([
      User.find(q).select('-password').sort({createdAt:-1}).skip(skip).limit(Number(limit)),
      User.countDocuments(q)
    ]);
    res.json({ items, total, page:Number(page), limit:Number(limit) });
  } catch(e){ next(e); }
};

export const adminUpdateUser = async (req,res,next) => {
  try {
    const { id } = req.params;
    // Cho phép update: username, email, isAdmin, avatar
    const allowed = ['username','email','isAdmin','avatar'];
    const $set = {};
    for (const k of allowed) if (k in req.body) $set[k] = req.body[k];

    const doc = await User.findByIdAndUpdate(id, { $set }, { new:true }).select('-password');
    if (!doc) return next(errorHandler(404,'User not found'));
    res.json(doc);
  } catch(e){ next(e); }
};

export const adminDeleteUser = async (req,res,next) => {
  try {
    const { id } = req.params;
    // Xoá user + các listing thuộc user đó (tuỳ yêu cầu)
    await Promise.all([
      User.findByIdAndDelete(id),
      Listing.deleteMany({ userRef: id })
    ]);
    res.json({ success:true });
  } catch(e){ next(e); }
};

// ===== LISTINGS =====
export const adminListListings = async (req,res,next) => {
  try {
    const { page=1, limit=10, search='' } = req.query;
    const q = search
      ? { name: { $regex: search, $options:'i' } }
      : {};
    const skip = (Number(page)-1)*Number(limit);
    const [items, total] = await Promise.all([
      Listing.find(q).sort({createdAt:-1}).skip(skip).limit(Number(limit)),
      Listing.countDocuments(q)
    ]);
    res.json({ items, total, page:Number(page), limit:Number(limit) });
  } catch(e){ next(e); }
};

export const adminUpdateListing = async (req,res,next) => {
  try {
    const { id } = req.params;
    const allowed = [
      'name','description','address','regularPrice','discountPrice',
      'bathrooms','bedrooms','furnished','parking','type','offer',
      'imageUrls'
    ];
    const $set = {};
    for (const k of allowed) if (k in req.body) $set[k] = req.body[k];

    const doc = await Listing.findByIdAndUpdate(id, { $set }, { new:true });
    if (!doc) return next(errorHandler(404,'Listing not found'));
    res.json(doc);
  } catch(e){ next(e); }
};

export const adminDeleteListing = async (req,res,next) => {
  try {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    res.json({ success:true });
  } catch(e){ next(e); }
};
