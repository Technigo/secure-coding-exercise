import mongoose from "mongoose"

const MessageSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
  },
  hearts: {
    type: Number,
    default: 0,
    min: 0
  },
  likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
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