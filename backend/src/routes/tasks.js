const express = require('express')
const { body, validationResult } = require('express-validator')
const Task = require('../models/Task')
const Project = require('../models/Project')
const Activity = require('../models/Activity')
const { protect } = require('../middlewares/auth')
const router = express.Router()
router.post('/', protect, body('title').notEmpty(), body('project').notEmpty(), async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
  try {
    const project = await Project.findById(req.body.project)
    if (!project) return res.status(404).json({ message: 'Project not found' })
    if (!project.members.some(m => m.toString() === req.user._id.toString())) return res.status(403).json({ message: 'Forbidden' })
    const task = await Task.create({
      title: req.body.title,
      description: req.body.description,
      project: project._id,
      assignee: req.body.assignee ? req.body.assignee : undefined,
      priority: req.body.priority,
      dueDate: req.body.dueDate
    })
    await Activity.create({ type: 'task', message: `Task created: ${task.title}`, user: req.user._id, project: project._id, task: task._id })
    res.json(task)
  } catch (err) {
    next(err)
  }
})
router.get('/:projectId', protect, async (req, res, next) => {
  try {
    const tasks = await Task.find({ project: req.params.projectId }).populate('assignee')
    res.json(tasks)
  } catch (err) {
    next(err)
  }
})
router.put('/:id', protect, async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
    if (!task) return res.status(404).json({ message: 'Not found' })
    const project = await Project.findById(task.project)
    if (!project) return res.status(404).json({ message: 'Project not found' })
    if (!project.members.some(m => m.toString() === req.user._id.toString()) && req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' })
    task.title = req.body.title || task.title
    task.description = req.body.description || task.description
    task.status = req.body.status || task.status
    task.priority = req.body.priority || task.priority
    task.assignee = req.body.assignee !== undefined ? (req.body.assignee ? req.body.assignee : null) : task.assignee
    task.dueDate = req.body.dueDate || task.dueDate
    await task.save()
    await Activity.create({ type: 'task', message: `Task updated: ${task.title}`, user: req.user._id, project: project._id, task: task._id })
    res.json(task)
  } catch (err) {
    next(err)
  }
})
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
    if (!task) return res.status(404).json({ message: 'Not found' })
    const project = await Project.findById(task.project)
    if (!project) return res.status(404).json({ message: 'Project not found' })
    if (!project.owner.equals(req.user._id) && req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' })
    await Task.deleteOne({ _id: task._id })
    await Activity.create({ type: 'task', message: `Task deleted: ${task.title}`, user: req.user._id, project: project._id })
    res.json({ message: 'Deleted' })
  } catch (err) {
    next(err)
  }
})
module.exports = router
