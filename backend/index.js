// require('dotenv').config()
import cors from "cors"
import express from "express"
import mongoose from "mongoose"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { Message } from "./models/Message.js"
import { User } from "./models/User.js"
import { authenticateUser } from "./middleware/auth.js"
import listEndpoints from "express-list-endpoints"

const PORT = process.env.PORT || '3000'
const app = express()
app.use(cors())
app.use(express.json())

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/secure-coding-exercise-messages"
mongoose.connect(mongoUrl)

mongoose.connection.once("open", () => {
  console.log("Connected to mongodb", mongoUrl)
})

mongoose.connection.on("error", err => {
  console.error("connection error:", err)
})

app.get('/', async (req, res) => {
  res.send(listEndpoints(app))
})

// register
app.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body

    const existingUser = await User.findOne({
      email: email.toLowerCase()
    })

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists"
      })
    }

    const salt = bcrypt.genSaltSync()
    const hashedPassword = bcrypt.hashSync(password, salt)
    const user = new User({ email, password: hashedPassword })

    await user.save()

    res.status(200).json({
      success: true,
      message: "User created successfully",
      response: {
        email: user.email,
        id: user._id,
        accessToken: user.accessToken,
      },
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Could not create user',
      response: error,
    })
  }
})

// login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email: email.toLowerCase() })

    if (user && bcrypt.compareSync(password, user.password)) {
      res.json({
        success: true,
        message: "Logged in successfully",
        response: {
          email: user.email,
          id: user._id,
          accessToken: user.accessToken
        },
      })
    } else {
      res.status(401).json({
        success: false,
        message: "Wrong e-mail or password",
        response: null,
      })
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      response: error
    })
  }
})

app.get('/messages', async (req, res) => {
  const messages = await Message.find().sort({ createdAt: 'desc' }).limit(20).populate("user", "email").exec()
  res.json(messages)
})

app.post('/messages', authenticateUser, async (req, res) => {
  const message = new Message({ ...req.body, user: req.user._id })

  try {
    const saved = await message.save()
    res.status(201).json(saved)
  } catch (err) {
    res.status(400).json({ message: 'Could not save message', errors: err.errors })
  }
})

app.patch('/messages/:id/like', authenticateUser, async (req, res) => {
  try {
    const message = await Message.findOneAndUpdate({ _id: req.params.id }, { $inc: { hearts: 1 } }, { new: true })
    res.json(message)
  } catch (err) {
    res.status(400).json({ message: 'Could not save heart', errors: err.errors })
  }
})

app.patch("/messages/:id", authenticateUser, async (req, res) => {
  try {
    const { id } = req.params
    const { editedMessage } = req.body
    const message = await Message.findById(id)
    if (!message) {
      return res.status(404).json({ error: "Message not found" })
    }
    if (message.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "You can only edit your own messages" })
    }
    message.message = editedMessage
    await message.save()
    const updatedMessage = await message.populate("user", "email")
    res.json(updatedMessage)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

app.delete("/messages/:id", authenticateUser, async (req, res) => {
  try {
    const { id } = req.params
    const message = await Message.findById(id)
    if (!message) {
      return res.status(404).json({ error: "Message not found" })
    }
    if (message.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "You can only delete your own messages" })
    }
    await message.deleteOne()
    res.status(204).send()
  } catch (error) {
    res.status(400).json({ error: "Invalid ID format" })
  }
})

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`)
})
