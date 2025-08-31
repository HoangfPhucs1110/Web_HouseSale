import express from 'express';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import Listing from '../models/listing.model.js';
import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

const { isValidObjectId, Types } = mongoose;
const router = express.Router();

function getUserId(req) {
  const raw =
    req.cookies?.access_token ||
    req.headers.authorization?.replace('Bearer ', '');
  if (!raw) return null;
  try {
    return jwt.verify(raw, process.env.JWT_SECRET)?.id || null;
  } catch {
    return null;
  }
}

// Tạo / lấy hội thoại theo listing; server tự xác định seller
router.post('/conversations', async (req, res, next) => {
  try {
    const buyerId = getUserId(req);
    const { listingId } = req.body;

    if (!buyerId) return res.status(401).json({ success: false, message: 'Bạn cần đăng nhập để chat' });
    if (!isValidObjectId(listingId)) return res.status(400).json({ success: false, message: 'listingId không hợp lệ' });

    const listing = await Listing.findById(listingId).lean();
    if (!listing || !listing.userRef) return res.status(404).json({ success: false, message: 'Không tìm thấy bài đăng hoặc thiếu chủ sở hữu' });

    const sellerId = String(listing.userRef);
    if (!isValidObjectId(sellerId)) return res.status(400).json({ success: false, message: 'Chủ sở hữu không hợp lệ' });

    const pair = [String(buyerId), String(sellerId)].sort();
    const [p0, p1] = pair.map((id) => new Types.ObjectId(id));
    const listingObj = new Types.ObjectId(listingId);

    let convo = await Conversation.findOne({
      listingId: listingObj,
      'participants.0': p0,
      'participants.1': p1,
    });

    if (!convo) {
      convo = await Conversation.create({ listingId: listingObj, participants: [p0, p1] });
    }

    const seller = await User.findById(sellerId).select('_id username email').lean();

    res.json({
      success: true,
      conversationId: String(convo._id),
      seller: seller ? { id: String(seller._id), username: seller.username || '', email: seller.email || '' } : null,
    });
  } catch (e) {
    next(e);
  }
});

// Danh sách hội thoại của người dùng (mới nhất trước)
// Danh sách hội thoại của người dùng CHỈ gồm các đoạn đã có tin nhắn
router.get('/conversations', async (req, res, next) => {
  try {
    const uid = getUserId(req);
    if (!uid) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const meId = new Types.ObjectId(uid);

    const items = await Conversation.aggregate([
      // mình là 1 trong 2 participants
      { $match: { participants: meId } },

      // đếm số tin trong từng conversation
      {
        $lookup: {
          from: 'messages',
          let: { convoId: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$conversation', '$$convoId'] } } },
            { $sort: { createdAt: -1 } },
            { $group: { _id: '$conversation', count: { $sum: 1 }, latest: { $first: '$$ROOT' } } },
          ],
          as: 'msgAgg',
        },
      },

      // chỉ giữ những convo đã có tin nhắn
      { $match: { msgAgg: { $ne: [] } } },

      // lấy user info để hiện Gmail người kia
      {
        $lookup: {
          from: 'users',
          localField: 'participants',
          foreignField: '_id',
          as: 'participantsDocs',
        },
      },

      // dựng peer (người còn lại), lastMessage, updatedAt theo tin mới nhất
      {
        $project: {
          listingId: 1,
          lastMessage: { $ifNull: [{ $arrayElemAt: ['$msgAgg.latest.text', 0] }, '' ] },
          updatedAt: { $ifNull: [{ $arrayElemAt: ['$msgAgg.latest.createdAt', 0] }, '$updatedAt'] },
          participants: '$participants',
          participantsDocs: {
            $map: {
              input: '$participantsDocs',
              as: 'u',
              in: { id: '$$u._id', email: '$$u.email', username: '$$u.username' },
            },
          },
        },
      },

      // xác định peer khác mình
      {
        $addFields: {
          peer: {
            $let: {
              vars: {
                others: {
                  $filter: {
                    input: '$participantsDocs',
                    as: 'p',
                    cond: { $ne: ['$$p.id', meId] },
                  },
                },
              },
              in: { $arrayElemAt: ['$$others', 0] },
            },
          },
        },
      },

      // sắp xếp theo thời điểm tin nhắn mới nhất
      { $sort: { updatedAt: -1 } },
    ]);

    // chuẩn hóa id về string
    const normalized = items.map((c) => ({
      _id: String(c._id),
      listingId: String(c.listingId),
      lastMessage: c.lastMessage || '',
      updatedAt: c.updatedAt,
      peer: c.peer
        ? { id: String(c.peer.id), email: c.peer.email || '', username: c.peer.username || '' }
        : null,
    }));

    res.json({ success: true, items: normalized });
  } catch (e) {
    next(e);
  }
});



// Lấy lịch sử tin nhắn của 1 hội thoại
router.get('/messages/:conversationId', async (req, res, next) => {
  try {
    const uid = getUserId(req);
    if (!uid) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const { conversationId } = req.params;
    if (!isValidObjectId(conversationId)) {
      return res.status(400).json({ success: false, message: 'conversationId không hợp lệ' });
    }
    const items = await Message.find({ conversation: conversationId }).sort('createdAt');
    res.json({ success: true, items });
  } catch (e) {
    next(e);
  }
});

// Gửi tin nhắn
router.post('/messages', async (req, res, next) => {
  try {
    const uid = getUserId(req);
    if (!uid) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const { conversationId, text } = req.body;
    if (!isValidObjectId(conversationId) || !text?.trim()) {
      return res.status(400).json({ success: false, message: 'Thiếu dữ liệu' });
    }
    const msg = await Message.create({
      conversation: conversationId,
      sender: uid,
      text: text.trim(),
    });
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: msg.text,
      updatedAt: new Date(),
    });
    res.json({ success: true, message: msg });
  } catch (e) {
    next(e);
  }
});

// Đánh dấu đã đọc tất cả tin nhắn đến trong hội thoại
router.post('/read', async (req, res, next) => {
  try {
    const uid = getUserId(req);
    const { conversationId } = req.body;
    if (!uid) return res.status(401).json({ success: false, message: 'Unauthorized' });
    if (!isValidObjectId(conversationId)) {
      return res.status(400).json({ success: false, message: 'conversationId không hợp lệ' });
    }
    const r = await Message.updateMany(
      { conversation: conversationId, sender: { $ne: uid }, readAt: { $exists: false } },
      { $set: { readAt: new Date() } }
    );
    res.json({ success: true, matched: r.matchedCount ?? r.n, modified: r.modifiedCount ?? r.nModified });
  } catch (e) {
    next(e);
  }
});

// Lấy các hội thoại có tin chưa đọc và số lượng chưa đọc (để hiển thị badge)
router.get('/pending', async (req, res, next) => {
  try {
    const uid = getUserId(req);
    if (!uid) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const agg = await Message.aggregate([
      { $match: { sender: { $ne: new Types.ObjectId(uid) }, readAt: { $exists: false } } },
      { $group: { _id: '$conversation', unread: { $sum: 1 } } },
      { $sort: { unread: -1 } },
    ]);

    res.json({ success: true, items: agg.map((i) => ({ conversationId: String(i._id), unread: i.unread })) });
  } catch (e) {
    next(e);
  }
});

export default router;
