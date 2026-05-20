const mongoose = require('mongoose')
const activitySchema = new mongoose.Schema({
  type: { type: String, required: true },
  message: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' }
}, { timestamps: true })
module.exports = mongoose.model('Activity', activitySchema)
