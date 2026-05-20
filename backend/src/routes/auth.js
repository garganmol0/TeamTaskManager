const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { body, validationResult } = require('express-validator')
const User = require('../models/User')
const router = express.Router()
router.post('/signup', body('name').notEmpty(), body('email').isEmail(), body('password').isLength({ min: 6 }), async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
  try {
    const { name, email, password } = req.body
    const existing = await User.findOne({ email })
    if (existing) return res.status(400).json({ message: 'Email exists' })
    const hash = await bcrypt.hash(password, 10)
    const user = await User.create({ name, email, password: hash })
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' })
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } })
  } catch (err) {
    next(err)
  }
})
router.post('/login', body('email').isEmail(), body('password').notEmpty(), async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user) return res.status(400).json({ message: 'Invalid credentials' })
    const match = await bcrypt.compare(password, user.password)
    if (!match) return res.status(400).json({ message: 'Invalid credentials' })
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' })
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } })
  } catch (err) {
    next(err)
  }
})
module.exports = router
