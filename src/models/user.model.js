import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowecase: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    avatar: {
      type: String, // cloudinary url
      required: true,
    },
    coverImage: {
      type: String, // cloudinary url
    },
    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video"
      }
    ],
    password: {
      type: String,
      required: [true, 'Password is required']
    },
    refreshToken: {
      type: String
    }

  },
  { timestamps: true }
);
userSchema.pre("save", async function (next) {  // This middleware hashes the password before saving the user
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});
userSchema.methods.comparePassword = async function (candidatePassword) {   // This custom function compares the provided password with the hashed password
  return await bcrypt.compare(candidatePassword, this.password);
}

userSchema.methods.generateAccessToken = function () {
  return jwt.sign({
    _id: this._id, email: this.email,
    username: this.username,
    fullName: this.fullName
  }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" });
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign({ _id: this._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
};

export const User = mongoose.model("User", userSchema);
