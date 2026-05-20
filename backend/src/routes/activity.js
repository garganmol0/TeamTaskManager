const express = require('express')
const Activity = require('../models/Activity')
const { protect } = require('../middlewares/auth')
const router = express.Router()
router.get('/', protect, async (req, res, next) => {
  try {
    const activities = await Activity.find().sort({ createdAt: -1 }).limit(50).populate('user project task')
    res.json(activities)
  } catch (err) {
    next(err)
  }
})
module.exports = router
