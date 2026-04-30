import mongoose from "mongoose"

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Username is required"],
    unique: true,
    trim: true,
    minlength: [2, "Username must be at least 2 characters"],
    maxlength: [30, "Username must be at most 30 characters"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Password is required"],
  },
})

export const User = mongoose.model("User", UserSchema)
