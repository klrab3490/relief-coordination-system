const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const refreshTokenSchema = new Schema({
  token: {
    type: String,
    required: true,
    unique: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  issuedAt: {
    type: Date,
    default: Date.now,
    expires: "7d", // Auto-expire tokens after 7 days
  },
});

// Create indexes for better query performance
refreshTokenSchema.index({ userId: 1 });

module.exports = mongoose.model("RefreshToken", refreshTokenSchema);
