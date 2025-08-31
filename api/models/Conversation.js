import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema(
  {
    listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }], // [buyer, seller] đã sort
    lastMessage: { type: String, default: '' }
  },
  { timestamps: true }
);

// sort 2 ObjectId theo thứ tự cố định để tránh [A,B] vs [B,A]
conversationSchema.pre('validate', function (next) {
  if (Array.isArray(this.participants) && this.participants.length === 2) {
    this.participants = this.participants.map(String).sort().map(id => new mongoose.Types.ObjectId(id));
  }
  next();
});

// unique dựa trên listing + 2 vị trí đã sort
conversationSchema.index(
  { listingId: 1, 'participants.0': 1, 'participants.1': 1 },
  { unique: true }
);

export default mongoose.model('Conversation', conversationSchema);
