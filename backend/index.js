import "dotenv/config"
import helmet from "helmet"
import rateLimit from "express-rate-limit"
import cors from "cors"
import express from "express"
import mongoose from "mongoose"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { Message } from "./models/Message.js"
import { User } from "./models/User.js"
import { authenticateUser } from "./middleware/auth.js"
import listEndpoints from "express-list-endpoints"

if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not set in .env")

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: "Too many attempts, please try again later" }
})

const PORT = process.env.PORT || '3000'
const app = express()
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
}))
app.use(express.json())

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/secure-coding-exercise-messages"
mongoose.connect(mongoUrl)

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB")
})

mongoose.connection.on("error", err => {
  console.error("connection error:", err)
})

app.get('/', async (req, res) => {
  res.send(listEndpoints(app))
})

// register
app.post("/register", authLimiter, async (req, res) => {
  try {
    const { email, password, username } = req.body

    if (!username || username.trim().length < 2) {
      return res.status(400).json({ success: false, message: "Username must be at least 2 characters" })
    }

    if (!password || password.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters" })
    }
    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
      return res.status(400).json({ success: false, message: "Password must contain at least one uppercase letter, one number, and one special character" })
    }

    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username: username.trim() }]
    })

    if (existingUser) {
      const field = existingUser.email === email.toLowerCase() ? "email" : "username"
      return res.status(400).json({
        success: false,
        message: `A user with this ${field} already exists`
      })
    }

    const salt = bcrypt.genSaltSync()
    const hashedPassword = bcrypt.hashSync(password, salt)
    const user = new User({ username: username.trim(), email, password: hashedPassword })

    await user.save()

    const accessToken = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    )

    res.status(200).json({
      success: true,
      message: "User created successfully",
      response: {
        username: user.username,
        id: user._id,
        accessToken,
      },
    })
  } catch (error) {
    console.error("Register error:", error)
    res.status(400).json({
      success: false,
      message: 'Could not create user',
    })
  }
})

// login
app.post("/login", authLimiter, async (req, res) => {
  try {
    const { login, password } = req.body
    const user = await User.findOne({
      $or: [{ username: login }, { email: login?.toLowerCase() }]
    })

    if (user && bcrypt.compareSync(password, user.password)) {
      const accessToken = jwt.sign(
        { userId: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "2h" }
      )
      res.json({
        success: true,
        message: "Logged in successfully",
        response: {
          username: user.username,
          id: user._id,
          accessToken,
        },
      })
    } else {
      res.status(401).json({
        success: false,
        message: "Wrong username/email or password",
        response: null,
      })
    }
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({
      success: false,
      message: "Something went wrong",
    })
  }
})

app.get('/messages', async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: 'desc' }).limit(20).populate("user", "username").exec()
    res.json(messages)
  } catch (error) {
    res.status(500).json({ message: "Could not fetch messages" })
  }
})

app.post('/messages', authenticateUser, async (req, res) => {
  const { message: messageText } = req.body
  const message = new Message({ message: messageText, user: req.user._id })

  try {
    const saved = await message.save()
    res.status(201).json(saved)
  } catch (err) {
    res.status(400).json({ message: 'Could not save message', errors: err.errors })
  }
})

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id)

app.patch('/messages/:id/like', authenticateUser, async (req, res) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ message: "Invalid message ID" })
  try {
    const message = await Message.findById(req.params.id)
    if (!message) return res.status(404).json({ message: 'Message not found' })

    if (message.likedBy.includes(req.user._id)) {
      message.likedBy.pull(req.user._id)
      message.hearts -= 1
    } else {
      message.likedBy.push(req.user._id)
      message.hearts += 1
    }
    await message.save()
    res.json(message)
  } catch (err) {
    res.status(400).json({ message: 'Could not save heart' })
  }
})

app.patch("/messages/:id", authenticateUser, async (req, res) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ error: "Invalid message ID" })
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
    const updatedMessage = await message.populate("user", "username")
    res.json(updatedMessage)
  } catch (error) {
    res.status(400).json({ error: "Could not update message" })
  }
})

app.delete("/messages/:id", authenticateUser, async (req, res) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ error: "Invalid message ID" })
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
