'use client'

import { useState } from 'react'
import { useWorkspaceStore } from '@/store/workspace'
import { CheckCircle2, Circle, Plus, Calendar as CalendarIcon, Clock, Bell, Edit2 } from 'lucide-react'
import { format, isToday } from 'date-fns'
import { Task } from '@/types'
import { TaskEditDialog } from '@/components/task-edit-dialog'

export default function TodayPage() {
  const tasks = useWorkspaceStore(state => state.tasks)
  const addTask = useWorkspaceStore(state => state.addTask)
  const updateTask = useWorkspaceStore(state => state.updateTask)
  
  const todayTasks = tasks.filter(t => !t.due_date || (t.due_date && isToday(new Date(t.due_date))))
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskTime, setNewTaskTime] = useState('')
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskTitle.trim()) return
    
    // Default due date to today
    addTask({ 
      title: newTaskTitle, 
      due_date: format(new Date(), 'yyyy-MM-dd'),
      due_time: newTaskTime || undefined,
      reminder_minutes: 5,
      reminder_enabled: true,
      reminder_sent: false
    })
    setNewTaskTitle('')
    setNewTaskTime('')
  }

  const handleToggleTask = (id: string, status: string) => {
    updateTask(id, { status: status === 'done' ? 'todo' : 'done' })
  }

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            Today <span className="text-sm font-normal text-muted-foreground">{format(new Date(), 'EEEE, MMM d')}</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Tasks with a scheduled time automatically trigger a reminder notification 5 minutes prior.
          </p>
        </div>
      </div>
      
      {/* Quick Add with Time */}
      <form onSubmit={handleCreateTask} className="mb-8 bg-card p-2 rounded-xl border border-border shadow-sm flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[240px]">
          <Plus className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
          <input 
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Add a task for today..."
            className="w-full pl-10 pr-3 py-2 bg-transparent border-none text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>

        <div className="flex items-center gap-2 border-l border-border pl-2">
          <input
            type="time"
            value={newTaskTime}
            onChange={(e) => setNewTaskTime(e.target.value)}
            className="bg-muted/40 border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary"
            title="Scheduled time (5m pre-alert)"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
          >
            Add Task
          </button>
        </div>
      </form>
      
      <div className="bg-background border border-border rounded-xl shadow-sm overflow-hidden">
        {todayTasks.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No tasks for today. Enjoy your day!
          </div>
        ) : (
          <div className="divide-y divide-border">
            {todayTasks.map(task => (
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
                  <div className={`text-sm font-medium truncate ${task.status === 'done' ? 'line-through text-muted-foreground' : ''}`}>
                    {task.title}
                  </div>

                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    {task.due_time && (
                      <span className="flex items-center gap-1 bg-muted px-2 py-0.5 rounded text-[11px]">
                        <Clock className="w-3 h-3" />
                        {task.due_time}
                      </span>
                    )}

                    {task.due_time && (
                      <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${
                        task.reminder_sent 
                          ? 'bg-muted text-muted-foreground' 
                          : 'bg-primary/10 text-primary'
                      }`}>
                        <Bell className="w-3 h-3" />
                        {task.reminder_sent ? 'Notified' : `Reminds ${task.reminder_minutes ?? 5}m before`}
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
                    title="Edit Schedule"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <TaskEditDialog
        task={editingTask}
        isOpen={Boolean(editingTask)}
        onClose={() => setEditingTask(null)}
      />
    </div>
  )
}
