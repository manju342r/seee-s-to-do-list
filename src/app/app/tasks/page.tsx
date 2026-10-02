'use client'

import { useState } from 'react'
import { useWorkspaceStore } from '@/store/workspace'
import { CheckCircle2, Circle, Plus, Calendar as CalendarIcon, Clock, Bell, MoreHorizontal, Edit2 } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { Task } from '@/types'
import { TaskEditDialog } from '@/components/task-edit-dialog'

export default function TasksPage() {
  const tasks = useWorkspaceStore(state => state.tasks)
  const addTask = useWorkspaceStore(state => state.addTask)
  const updateTask = useWorkspaceStore(state => state.updateTask)
  const deleteTask = useWorkspaceStore(state => state.deleteTask)
  
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskDate, setNewTaskDate] = useState('')
  const [newTaskTime, setNewTaskTime] = useState('')
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskTitle.trim()) return
    
    addTask({ 
      title: newTaskTitle,
      due_date: newTaskDate || undefined,
      due_time: newTaskTime || undefined,
      reminder_minutes: 5,
      reminder_enabled: Boolean(newTaskDate && newTaskTime),
      reminder_sent: false
    })
    setNewTaskTitle('')
    setNewTaskDate('')
    setNewTaskTime('')
  }

  const handleToggleTask = (id: string, status: string) => {
    updateTask(id, { status: status === 'done' ? 'todo' : 'done' })
  }

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">All Tasks</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Tasks with a date and time trigger a reminder notification 5 minutes before scheduled start.
          </p>
        </div>
      </div>
      
      {/* Quick Add with Schedule */}
      <form onSubmit={handleCreateTask} className="mb-8 bg-card p-2 rounded-xl border border-border shadow-sm flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[240px]">
          <Plus className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
          <input 
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Add a new task (e.g., Team Sync, Review PR)..."
            className="w-full pl-10 pr-3 py-2.5 bg-transparent border-none text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>

        <div className="flex items-center gap-2 border-l border-border pl-2">
          <input
            type="date"
            value={newTaskDate}
            onChange={(e) => setNewTaskDate(e.target.value)}
            className="bg-muted/40 border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary"
            title="Due Date"
          />

          <input
            type="time"
            value={newTaskTime}
            onChange={(e) => setNewTaskTime(e.target.value)}
            className="bg-muted/40 border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary"
            title="Due Time (Reminds 5 min before)"
          />

          <button
            type="submit"
            className="px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:bg-primary/90 transition-colors shadow-sm shrink-0"
          >
            Add Task
          </button>
        </div>
      </form>
      
      {/* Task List */}
      <div className="bg-background border border-border rounded-xl shadow-sm overflow-hidden">
        {tasks.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground flex flex-col items-center gap-2">
            <CalendarIcon className="w-8 h-8 opacity-40" />
            <p>No tasks yet. Create one above to try out reminders!</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {tasks.map(task => (
              <div 
                key={task.id} 
                className="flex items-center gap-4 p-4 hover:bg-muted/30 group transition-colors cursor-pointer"
                onClick={() => setEditingTask(task)}
              >
                <button 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleToggleTask(task.id, task.status)
                  }}
                  className="text-muted-foreground hover:text-primary shrink-0"
                >
                  {task.status === 'done' ? (
                    <CheckCircle2 className="w-6 h-6 text-primary" />
                  ) : (
                    <Circle className="w-6 h-6" />
                  )}
                </button>
                
                <div className="flex-1 min-w-0 flex flex-col">
                  <div className={`text-sm font-medium truncate ${task.status === 'done' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                    {task.title}
                  </div>
                  
                  {/* Badges for due date, time, and 5-min reminder */}
                  <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                    {task.due_date && (
                      <span className="flex items-center gap-1 bg-muted px-2 py-0.5 rounded text-[11px]">
                        <CalendarIcon className="w-3 h-3" />
                        {task.due_date}
                      </span>
                    )}

                    {task.due_time && (
                      <span className="flex items-center gap-1 bg-muted px-2 py-0.5 rounded text-[11px]">
                        <Clock className="w-3 h-3" />
                        {task.due_time}
                      </span>
                    )}

                    {task.due_time && task.reminder_enabled !== false && (
                      <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${
                        task.reminder_sent 
                          ? 'bg-muted text-muted-foreground' 
                          : 'bg-primary/10 text-primary animate-pulse'
                      }`}>
                        <Bell className="w-3 h-3" />
                        {task.reminder_sent 
                          ? 'Reminder Sent' 
                          : `Alerts ${task.reminder_minutes ?? 5}m before`}
                      </span>
                    )}

                    {task.priority && task.priority !== 'none' && (
                      <span className={`px-2 py-0.5 rounded text-[11px] font-medium uppercase ${
                        task.priority === 'urgent' || task.priority === 'high' 
                          ? 'bg-red-500/10 text-red-600 dark:text-red-400' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {task.priority}
                      </span>
                    )}
                  </div>
                </div>
                
                <div 
                  className="opacity-0 group-hover:opacity-100 flex items-center gap-2 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button 
                    onClick={() => setEditingTask(task)}
                    className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded"
                    title="Edit & Schedule"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => deleteTask(task.id)}
                    className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded"
                    title="Delete"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Task Edit / Schedule Dialog */}
      <TaskEditDialog
        task={editingTask}
        isOpen={Boolean(editingTask)}
        onClose={() => setEditingTask(null)}
      />
    </div>
  )
}
