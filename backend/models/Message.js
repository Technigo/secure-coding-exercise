import mongoose from "mongoose"

const MessageSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
    minlength: 5
  },
  hearts: {
    type: Number,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

export const Message = mongoose.model("Message", MessageSchema)