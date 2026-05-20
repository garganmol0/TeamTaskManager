const express = require('express')
const { body, validationResult } = require('express-validator')
const Project = require('../models/Project')
const User = require('../models/User')
const Activity = require('../models/Activity')
const { protect, authorize } = require('../middlewares/auth')
const router = express.Router()
router.post('/', protect, body('title').notEmpty(), async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
  try {
    const project = await Project.create({ title: req.body.title, description: req.body.description, owner: req.user._id, members: [req.user._id] })
    await Activity.create({ type: 'project', message: `Project created: ${project.title}`, user: req.user._id, project: project._id })
    res.json(project)
  } catch (err) {
    next(err)
  }
})
router.get('/', protect, async (req, res, next) => {
  try {
    const projects = await Project.find({ members: req.user._id }).populate('owner members')
    res.json(projects)
  } catch (err) {
    next(err)
  }
})
router.put('/:id', protect, async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
    if (!project) return res.status(404).json({ message: 'Not found' })
    if (!project.owner.equals(req.user._id) && req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' })
    project.title = req.body.title || project.title
    project.description = req.body.description || project.description
    await project.save()
    await Activity.create({ type: 'project', message: `Project updated: ${project.title}`, user: req.user._id, project: project._id })
    res.json(project)
  } catch (err) {
    next(err)
  }
})
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
    if (!project) return res.status(404).json({ message: 'Not found' })
    if (!project.owner.equals(req.user._id) && req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' })
    const Task = require('../models/Task')
    await Task.deleteMany({ project: project._id })
    await Project.deleteOne({ _id: project._id })
    await Activity.create({ type: 'project', message: `Project deleted: ${project.title}`, user: req.user._id })
    res.json({ message: 'Deleted' })
  } catch (err) {
    next(err)
  }
})
router.post('/:id/invite', protect, body('email').isEmail(), async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
  try {
    const project = await Project.findById(req.params.id)
    if (!project) return res.status(404).json({ message: 'Not found' })
    if (!project.owner.equals(req.user._id) && req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' })
    const user = await User.findOne({ email: req.body.email })
    if (!user) return res.status(404).json({ message: 'User not found' })
    if (!project.members.some(m => m.toString() === user._id.toString())) {
      project.members.push(user._id)
    }
    await project.save()
    await Activity.create({ type: 'project', message: `Member added: ${user.email} to ${project.title}`, user: req.user._id, project: project._id })
    res.json(project)
  } catch (err) {
    next(err)
  }
})
module.exports = router
