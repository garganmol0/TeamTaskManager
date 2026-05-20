import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import axios from 'axios'

function Dashboard() {
  const { user, logout } = useContext(AuthContext)
  const [projects, setProjects] = useState([])
  const [selectedProjectId, setSelectedProjectId] = useState(null)
  const [tasks, setTasks] = useState([])
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)

  // Modals state
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [taskModalColumn, setTaskModalColumn] = useState('todo')

  // Forms state
  const [projectForm, setProjectForm] = useState({ title: '', description: '' })
  const [taskForm, setTaskForm] = useState({ title: '', description: '', assignee: '', priority: 'medium', dueDate: '' })
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteSuccess, setInviteSuccess] = useState('')
  const [inviteError, setInviteError] = useState('')

  // Selected project details
  const activeProject = projects.find(p => p._id === selectedProjectId)

  useEffect(() => {
    fetchInitialData()
  }, [])

  useEffect(() => {
    if (selectedProjectId) {
      fetchTasks(selectedProjectId)
    } else {
      setTasks([])
    }
  }, [selectedProjectId])

  const fetchInitialData = async () => {
    try {
      setLoading(true)
      const resProj = await axios.get('/api/projects')
      setProjects(resProj.data)
      if (resProj.data.length > 0) {
        setSelectedProjectId(resProj.data[0]._id)
      }
      const resAct = await axios.get('/api/activity')
      setActivities(resAct.data)
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchProjects = async () => {
    try {
      const res = await axios.get('/api/projects')
      setProjects(res.data)
      return res.data
    } catch (err) {
      console.error(err)
    }
  }

  const fetchTasks = async (projectId) => {
    try {
      const res = await axios.get(`/api/tasks/${projectId}`)
      setTasks(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchActivities = async () => {
    try {
      const res = await axios.get('/api/activity')
      setActivities(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleCreateProject = async (e) => {
    e.preventDefault()
    try {
      const res = await axios.post('/api/projects', projectForm)
      const updated = await fetchProjects()
      setSelectedProjectId(res.data._id)
      setProjectForm({ title: '', description: '' })
      setShowProjectModal(false)
      fetchActivities()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeleteProject = async (projectId, e) => {
    e.stopPropagation()
    if (confirm('Are you sure you want to delete this project? All associated tasks will be deleted.')) {
      try {
        await axios.delete(`/api/projects/${projectId}`)
        const updated = await fetchProjects()
        if (selectedProjectId === projectId) {
          setSelectedProjectId(updated && updated.length > 0 ? updated[0]._id : null)
        }
        fetchActivities()
      } catch (err) {
        console.error(err)
      }
    }
  }

  const handleCreateTask = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        ...taskForm,
        project: selectedProjectId,
        status: taskModalColumn,
        assignee: taskForm.assignee || undefined
      }
      await axios.post('/api/tasks', payload)
      fetchTasks(selectedProjectId)
      setTaskForm({ title: '', description: '', assignee: '', priority: 'medium', dueDate: '' })
      setShowTaskModal(false)
      fetchActivities()
    } catch (err) {
      console.error(err)
    }
  }

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      await axios.put(`/api/tasks/${taskId}`, { status: newStatus })
      fetchTasks(selectedProjectId)
      fetchActivities()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeleteTask = async (taskId) => {
    if (confirm('Are you sure you want to delete this task?')) {
      try {
        await axios.delete(`/api/tasks/${taskId}`)
        fetchTasks(selectedProjectId)
        fetchActivities()
      } catch (err) {
        console.error(err)
      }
    }
  }

  const handleInviteMember = async (e) => {
    e.preventDefault()
    setInviteError('')
    setInviteSuccess('')
    try {
      await axios.post(`/api/projects/${selectedProjectId}/invite`, { email: inviteEmail })
      setInviteSuccess(`Successfully added ${inviteEmail} to project!`)
      setInviteEmail('')
      await fetchProjects()
      fetchActivities()
    } catch (err) {
      setInviteError(err.response?.data?.message || 'Failed to invite user')
    }
  }

  // Helper to check if current user is owner of active project or Admin role
  const canManageProject = () => {
    if (!activeProject || !user) return false
    return activeProject.owner._id === user.id || user.role === 'admin'
  }

  // Get initials for avatar
  const getInitials = (name) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
  }

  // Color mappings
  const priorityColors = {
    high: 'bg-rose-500/10 text-rose-400 border border-rose-500/30',
    medium: 'bg-amber-500/10 text-amber-400 border border-amber-500/30',
    low: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
  }

  // Calculate project metrics
  const totalTasksCount = tasks.length
  const todoTasksCount = tasks.filter(t => t.status === 'todo').length
  const progressTasksCount = tasks.filter(t => t.status === 'in-progress').length
  const doneTasksCount = tasks.filter(t => t.status === 'done').length
  
  const overdueTasksCount = tasks.filter(t => {
    if (t.status === 'done' || !t.dueDate) return false
    return new Date(t.dueDate) < new Date()
  }).length

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 font-medium">Loading workspace...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Header */}
      <header className="bg-slate-900/50 backdrop-blur-md border-b border-slate-800/60 sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-md shadow-indigo-600/30">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">TaskForge</h1>
            <p className="text-xs text-slate-500 font-medium">Team Collaboration Suite</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-full">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-inner">
              {getInitials(user?.name)}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-semibold text-slate-200 leading-tight">{user?.name}</p>
              <p className="text-[10px] text-slate-400 font-medium uppercase leading-none mt-0.5">{user?.role}</p>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${user?.role === 'admin' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-slate-700 text-slate-300'}`}>
              {user?.role}
            </span>
          </div>

          <button 
            onClick={logout}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-400 hover:text-rose-400 bg-slate-900/60 hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/20 rounded-lg transition-all duration-200 active:scale-95"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 overflow-hidden">
        
        {/* Left Column: Projects Sidebar */}
        <aside className="bg-slate-900/30 border-r border-slate-800/60 p-6 flex flex-col gap-6 overflow-y-auto">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Projects ({projects.length})</h2>
            <button 
              onClick={() => setShowProjectModal(true)}
              className="p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md shadow-md shadow-indigo-600/10 transition-colors duration-150 active:scale-95"
              title="Create new project"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          <div className="flex flex-col gap-2.5">
            {projects.length === 0 ? (
              <div className="text-center py-8 px-4 bg-slate-900/40 rounded-xl border border-dashed border-slate-800/80">
                <p className="text-sm text-slate-500 mb-3">No projects yet</p>
                <button 
                  onClick={() => setShowProjectModal(true)}
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                >
                  + Create Project
                </button>
              </div>
            ) : (
              projects.map(p => {
                const isSelected = p._id === selectedProjectId
                const isOwner = p.owner?._id === user?.id
                return (
                  <div
                    key={p._id}
                    onClick={() => setSelectedProjectId(p._id)}
                    className={`group relative p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                      isSelected 
                        ? 'bg-slate-900/80 border-indigo-500/80 shadow-md shadow-indigo-950/20' 
                        : 'bg-slate-900/40 border-slate-800/50 hover:bg-slate-900/60 hover:border-slate-700/60'
                    }`}
                  >
                    <div className="flex flex-col gap-1 pr-6">
                      <h3 className={`font-semibold text-sm transition-colors ${isSelected ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                        {p.title}
                      </h3>
                      {p.description && (
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {p.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-800/40">
                        <span className="text-[10px] font-medium text-slate-500">
                          Owner: {isOwner ? 'Me' : p.owner?.name || 'Unknown'}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 bg-slate-950 border border-slate-800 text-slate-400 rounded-full font-medium flex items-center gap-1">
                          👤 {p.members?.length || 1}
                        </span>
                      </div>
                    </div>

                    {/* Delete project button (only for owners or admins) */}
                    {(isOwner || user?.role === 'admin') && (
                      <button
                        onClick={(e) => handleDeleteProject(p._id, e)}
                        className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 p-1 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-all duration-150"
                        title="Delete project"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </aside>

        {/* Middle Columns: Active Project Workspace (Kanban & Metrics) */}
        <main className="col-span-1 lg:col-span-2 border-r border-slate-800/60 flex flex-col overflow-y-auto bg-slate-950">
          {activeProject ? (
            <div className="p-6 flex flex-col gap-6 flex-1">
              
              {/* Project Header details */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-900">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold text-white tracking-tight">{activeProject.title}</h2>
                    {activeProject.owner?._id === user?.id && (
                      <span className="text-[10px] px-2 py-0.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold rounded-full uppercase">Owner</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-400 mt-1 max-w-xl">{activeProject.description || 'No description provided'}</p>
                </div>
                
                <button
                  onClick={() => {
                    setTaskModalColumn('todo')
                    setShowTaskModal(true)
                  }}
                  className="self-start sm:self-center flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold shadow-md shadow-indigo-600/20 transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                  </svg>
                  Add Task
                </button>
              </div>

              {/* Stats/Metrics Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-900/40 border border-slate-850 p-3.5 rounded-xl flex flex-col">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Tasks</span>
                  <span className="text-2xl font-bold text-white mt-1">{totalTasksCount}</span>
                </div>
                <div className="bg-slate-900/40 border border-slate-850 p-3.5 rounded-xl flex flex-col">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending</span>
                  <span className="text-2xl font-bold text-indigo-400 mt-1">{todoTasksCount + progressTasksCount}</span>
                </div>
                <div className="bg-slate-900/40 border border-slate-850 p-3.5 rounded-xl flex flex-col">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completed</span>
                  <span className="text-2xl font-bold text-emerald-400 mt-1">{doneTasksCount}</span>
                </div>
                <div className={`border p-3.5 rounded-xl flex flex-col transition-colors ${overdueTasksCount > 0 ? 'bg-rose-500/5 border-rose-500/30' : 'bg-slate-900/40 border-slate-850'}`}>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overdue</span>
                  <span className={`text-2xl font-bold mt-1 ${overdueTasksCount > 0 ? 'text-rose-400 animate-pulse' : 'text-slate-400'}`}>{overdueTasksCount}</span>
                </div>
              </div>

              {/* Kanban Board columns */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-2 flex-1">
                
                {/* Column: To Do */}
                <div className="flex flex-col gap-3 min-h-[300px]">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-2 px-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                      <h3 className="font-bold text-sm text-slate-300">To Do</h3>
                      <span className="text-xs px-2 py-0.5 bg-slate-900 border border-slate-800 text-slate-400 rounded-full font-bold">{todoTasksCount}</span>
                    </div>
                    <button
                      onClick={() => {
                        setTaskModalColumn('todo')
                        setShowTaskModal(true)
                      }}
                      className="p-1 hover:bg-slate-900 border border-transparent hover:border-slate-850 rounded text-slate-400 hover:text-white transition-colors"
                      title="Add task to To Do"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="flex flex-col gap-3 flex-grow rounded-xl bg-slate-900/10 border border-dashed border-slate-900 p-2.5">
                    {tasks.filter(t => t.status === 'todo').map(task => (
                      <TaskCard 
                        key={task._id} 
                        task={task} 
                        priorityColors={priorityColors}
                        onUpdateStatus={handleUpdateTaskStatus}
                        onDelete={handleDeleteTask}
                        projectOwnerId={activeProject.owner?._id}
                        currentUser={user}
                      />
                    ))}
                    {todoTasksCount === 0 && (
                      <p className="text-xs text-slate-600 text-center py-6">No tasks in queue</p>
                    )}
                  </div>
                </div>

                {/* Column: In Progress */}
                <div className="flex flex-col gap-3 min-h-[300px]">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-2 px-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                      <h3 className="font-bold text-sm text-slate-300">In Progress</h3>
                      <span className="text-xs px-2 py-0.5 bg-slate-900 border border-slate-800 text-slate-400 rounded-full font-bold">{progressTasksCount}</span>
                    </div>
                    <button
                      onClick={() => {
                        setTaskModalColumn('in-progress')
                        setShowTaskModal(true)
                      }}
                      className="p-1 hover:bg-slate-900 border border-transparent hover:border-slate-850 rounded text-slate-400 hover:text-white transition-colors"
                      title="Add task to In Progress"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>

                  <div className="flex flex-col gap-3 flex-grow rounded-xl bg-slate-900/10 border border-dashed border-slate-900 p-2.5">
                    {tasks.filter(t => t.status === 'in-progress').map(task => (
                      <TaskCard 
                        key={task._id} 
                        task={task} 
                        priorityColors={priorityColors}
                        onUpdateStatus={handleUpdateTaskStatus}
                        onDelete={handleDeleteTask}
                        projectOwnerId={activeProject.owner?._id}
                        currentUser={user}
                      />
                    ))}
                    {progressTasksCount === 0 && (
                      <p className="text-xs text-slate-600 text-center py-6">No active tasks</p>
                    )}
                  </div>
                </div>

                {/* Column: Completed */}
                <div className="flex flex-col gap-3 min-h-[300px]">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-2 px-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                      <h3 className="font-bold text-sm text-slate-300">Completed</h3>
                      <span className="text-xs px-2 py-0.5 bg-slate-900 border border-slate-800 text-slate-400 rounded-full font-bold">{doneTasksCount}</span>
                    </div>
                    <button
                      onClick={() => {
                        setTaskModalColumn('done')
                        setShowTaskModal(true)
                      }}
                      className="p-1 hover:bg-slate-900 border border-transparent hover:border-slate-850 rounded text-slate-400 hover:text-white transition-colors"
                      title="Add task to Completed"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>

                  <div className="flex flex-col gap-3 flex-grow rounded-xl bg-slate-900/10 border border-dashed border-slate-900 p-2.5">
                    {tasks.filter(t => t.status === 'done').map(task => (
                      <TaskCard 
                        key={task._id} 
                        task={task} 
                        priorityColors={priorityColors}
                        onUpdateStatus={handleUpdateTaskStatus}
                        onDelete={handleDeleteTask}
                        projectOwnerId={activeProject.owner?._id}
                        currentUser={user}
                      />
                    ))}
                    {doneTasksCount === 0 && (
                      <p className="text-xs text-slate-600 text-center py-6">No tasks completed yet</p>
                    )}
                  </div>
                </div>

              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-950">
              <div className="bg-indigo-500/10 p-6 rounded-full text-indigo-400 border border-indigo-500/20 mb-5">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No Project Selected</h3>
              <p className="text-slate-400 max-w-sm text-sm mb-6 leading-relaxed">
                Select a project from the sidebar to view tasks, or create a brand new one to assemble your team.
              </p>
              <button
                onClick={() => setShowProjectModal(true)}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold shadow-lg shadow-indigo-600/15 transition-all duration-150 active:scale-95"
              >
                Create New Project
              </button>
            </div>
          )}
        </main>

        {/* Right Column: Project Members & Activity Feed */}
        <aside className="bg-slate-900/30 p-6 flex flex-col gap-6 overflow-y-auto">
          {activeProject ? (
            <div className="flex flex-col gap-6">
              {/* Member list section */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Project Members ({activeProject.members?.length || 0})</h3>
                <div className="flex flex-col gap-2.5">
                  {activeProject.members?.map(member => (
                    <div key={member._id} className="flex items-center justify-between p-2.5 bg-slate-900/40 border border-slate-850 rounded-xl">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200 font-bold text-xs">
                          {getInitials(member.name)}
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-semibold text-slate-200">{member.name}</p>
                          <p className="text-[10px] text-slate-500">{member.email}</p>
                        </div>
                      </div>
                      
                      {activeProject.owner?._id === member._id ? (
                        <span className="text-[9px] px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold rounded uppercase">Owner</span>
                      ) : (
                        <span className="text-[9px] px-1.5 py-0.5 bg-slate-800 text-slate-400 font-semibold rounded uppercase">{member.role}</span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Invite member section (shown to project owner or admins) */}
                {canManageProject() && (
                  <form onSubmit={handleInviteMember} className="mt-4 border-t border-slate-900 pt-4 flex flex-col gap-2">
                    <h4 className="text-xs font-bold text-slate-400">Invite new member</h4>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        placeholder="User email address"
                        required
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        className="flex-grow bg-slate-950 border border-slate-850 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs text-slate-200 p-2.5 rounded-lg focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md active:scale-95 transition-all"
                      >
                        Add
                      </button>
                    </div>
                    {inviteError && <p className="text-[11px] text-rose-400 font-medium">{inviteError}</p>}
                    {inviteSuccess && <p className="text-[11px] text-emerald-400 font-medium">{inviteSuccess}</p>}
                  </form>
                )}
              </div>
            </div>
          ) : null}

          {/* Activity Feed log */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Recent Activity</h3>
            <div className="flex flex-col gap-3 max-h-[350px] overflow-y-auto pr-1">
              {activities.length === 0 ? (
                <p className="text-xs text-slate-600 text-center py-4">No team activity yet</p>
              ) : (
                activities.slice(0, 20).map(act => (
                  <div key={act._id} className="p-3 bg-slate-900/30 border border-slate-850/60 rounded-xl flex flex-col gap-1.5">
                    <p className="text-xs text-slate-300 leading-normal font-medium">
                      {act.message}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>👤 {act.user?.name || 'System'}</span>
                      <span>{new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>

      </div>

      {/* Modal: Create Project */}
      {showProjectModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setShowProjectModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white hover:bg-slate-800 p-1.5 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="text-lg font-bold text-white mb-1">Create Project</h3>
            <p className="text-xs text-slate-400 mb-5">Set up a space to manage tasks with your crew.</p>

            <form onSubmit={handleCreateProject} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400">Project Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Design System revamp"
                  value={projectForm.title}
                  onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                  className="bg-slate-950 border border-slate-800 text-sm text-slate-200 p-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400">Description (Optional)</label>
                <textarea
                  placeholder="Describe the goals or context of this project..."
                  rows="3"
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                  className="bg-slate-950 border border-slate-800 text-sm text-slate-200 p-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 mt-3 pt-4 border-t border-slate-800/60">
                <button
                  type="button"
                  onClick={() => setShowProjectModal(false)}
                  className="px-4 py-2 border border-slate-700 hover:bg-slate-800 text-slate-300 rounded-lg text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold shadow-lg shadow-indigo-600/10 active:scale-95 transition-all"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Task */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setShowTaskModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white hover:bg-slate-800 p-1.5 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="text-lg font-bold text-white mb-1">Add Task</h3>
            <p className="text-xs text-slate-400 mb-5">Create a task under the {activeProject?.title} board.</p>

            <form onSubmit={handleCreateTask} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="What needs to be done?"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  className="bg-slate-950 border border-slate-800 text-sm text-slate-200 p-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400">Description (Optional)</label>
                <textarea
                  placeholder="Provide details about the task requirements..."
                  rows="2"
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  className="bg-slate-950 border border-slate-800 text-sm text-slate-200 p-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400">Priority</label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                    className="bg-slate-950 border border-slate-800 text-sm text-slate-200 p-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="low">🟢 Low</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="high">🔴 High</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400">Due Date</label>
                  <input
                    type="date"
                    required
                    value={taskForm.dueDate}
                    onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                    className="bg-slate-950 border border-slate-800 text-sm text-slate-200 p-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400">Assignee</label>
                <select
                  value={taskForm.assignee}
                  onChange={(e) => setTaskForm({ ...taskForm, assignee: e.target.value })}
                  className="bg-slate-950 border border-slate-800 text-sm text-slate-200 p-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Unassigned</option>
                  {activeProject?.members?.map(m => (
                    <option key={m._id} value={m._id}>
                      {m.name} ({m.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-3 pt-4 border-t border-slate-800/60">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="px-4 py-2 border border-slate-700 hover:bg-slate-800 text-slate-300 rounded-lg text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold shadow-lg shadow-indigo-600/10 active:scale-95 transition-all"
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}

// Sub-component for individual Kanban cards
function TaskCard({ task, priorityColors, onUpdateStatus, onDelete, projectOwnerId, currentUser }) {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done'
  const isOwnerOrAdmin = currentUser && (projectOwnerId === currentUser.id || currentUser.role === 'admin')

  // Get initial letters of assignee name
  const getAssigneeInitials = (assignee) => {
    if (!assignee || !assignee.name) return '?'
    return assignee.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
  }

  const formattedDate = task.dueDate 
    ? new Date(task.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })
    : 'No due date'

  return (
    <div className="bg-slate-900 border border-slate-850 hover:border-slate-700 p-4 rounded-xl shadow transition-all duration-150 group/card relative flex flex-col gap-2.5">
      {/* Upper row: priority and delete */}
      <div className="flex items-center justify-between">
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${priorityColors[task.priority] || ''}`}>
          {task.priority}
        </span>
        
        {isOwnerOrAdmin && (
          <button
            onClick={() => onDelete(task._id)}
            className="text-slate-500 hover:text-rose-400 p-0.5 rounded opacity-0 group-hover/card:opacity-100 transition-opacity"
            title="Delete task"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>

      {/* Title & description */}
      <div className="text-left">
        <h4 className="text-sm font-semibold text-slate-100 tracking-tight leading-snug">{task.title}</h4>
        {task.description && (
          <p className="text-xs text-slate-400 mt-1 line-clamp-3 leading-relaxed">{task.description}</p>
        )}
      </div>

      {/* Lower details: assignee & due date */}
      <div className="flex items-center justify-between border-t border-slate-900 pt-3 mt-1.5">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-slate-850 border border-slate-700 flex items-center justify-center text-[9px] text-slate-300 font-bold" title={task.assignee ? `Assigned to ${task.assignee.name}` : 'Unassigned'}>
            {getAssigneeInitials(task.assignee)}
          </div>
          <span className="text-[10px] text-slate-400 truncate max-w-[80px]">
            {task.assignee ? task.assignee.name.split(' ')[0] : 'Unassigned'}
          </span>
        </div>

        <div className={`flex items-center gap-1 text-[10px] font-medium ${isOverdue ? 'text-rose-400 font-semibold' : 'text-slate-500'}`}>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>{formattedDate}</span>
          {isOverdue && <span className="text-[8px] px-1 bg-rose-500/10 text-rose-400 rounded-full font-bold ml-0.5">Overdue</span>}
        </div>
      </div>

      {/* Transition control buttons */}
      <div className="flex gap-1.5 border-t border-slate-900 pt-2.5 mt-1">
        {task.status === 'todo' && (
          <button
            onClick={() => onUpdateStatus(task._id, 'in-progress')}
            className="flex-1 text-center py-1.5 bg-slate-850 hover:bg-indigo-600/15 border border-slate-800 hover:border-indigo-500/30 text-indigo-400 rounded-lg text-[10px] font-bold transition-all"
          >
            Start Work →
          </button>
        )}
        {task.status === 'in-progress' && (
          <>
            <button
              onClick={() => onUpdateStatus(task._id, 'todo')}
              className="flex-1 text-center py-1.5 bg-slate-850 hover:bg-slate-800 border border-slate-800 text-slate-400 rounded-lg text-[10px] font-bold transition-all"
            >
              ← Back
            </button>
            <button
              onClick={() => onUpdateStatus(task._id, 'done')}
              className="flex-1 text-center py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold shadow-md shadow-emerald-600/15 transition-all"
            >
              Finish ✓
            </button>
          </>
        )}
        {task.status === 'done' && (
          <button
            onClick={() => onUpdateStatus(task._id, 'in-progress')}
            className="flex-grow text-center py-1.5 bg-slate-850 hover:bg-slate-800 border border-slate-800 text-slate-400 rounded-lg text-[10px] font-semibold transition-all"
          >
            ↩ Reopen Task
          </button>
        )}
      </div>
    </div>
  )
}

export default Dashboard
