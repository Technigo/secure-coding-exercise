import mongoose from "mongoose"
// import bcrypt from "bcrypt"
import crypto from "crypto"

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"]
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: 6
  },
  accessToken: {
    type: String,
    default: () => crypto.randomBytes(128).toString("hex"),
  }
}, { timestamps: true })

export const User = mongoose.model("User", UserSchema)