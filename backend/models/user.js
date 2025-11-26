const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
      lowercase: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/.+\@.+\..+/, "Please fill a valid email address"],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      match: [
        /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number.",
      ],
    },
    role: {
      type: String,
      enum: ["user", "volunteer", "admin"],
      default: "user",
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },
    phone: {
      type: String,
      trim: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    skills: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

// Indexes for performance
UserSchema.index({ username: 1 });
UserSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("User", UserSchema);
