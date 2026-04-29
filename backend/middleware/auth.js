import jwt from "jsonwebtoken"

export const authenticateUser = (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "")
    if (!token) {
      return res.status(401).json({ message: "Authentication missing" })
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = { _id: decoded.userId, email: decoded.email }
    next()
  } catch (error) {
    res.status(401).json({ message: "Authentication missing / invalid" })
  }
}
