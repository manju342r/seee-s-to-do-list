'use client'

import { useState } from 'react'
import { useWorkspaceStore } from '@/store/workspace'
import { format, isToday } from 'date-fns'
import { CheckSquare, FileText, CheckCircle2, Circle, Clock, Bell, Plus } from 'lucide-react'
import Link from 'next/link'
import { Task } from '@/types'
import { TaskEditDialog } from '@/components/task-edit-dialog'

export default function AppHome() {
  const tasks = useWorkspaceStore(state => state.tasks)
  const pages = useWorkspaceStore(state => state.pages)
  const updateTask = useWorkspaceStore(state => state.updateTask)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  
  const todayTasks = tasks.filter(t => !t.due_date || (t.due_date && isToday(new Date(t.due_date))))
  const recentPages = pages.filter(p => !p.is_trash).slice(0, 5)

  const handleToggleTask = (id: string, status: string) => {
    updateTask(id, { status: status === 'done' ? 'todo' : 'done' })
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Good morning</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Here is your daily schedule overview. Scheduled tasks will remind you 5 minutes before start.
          </p>
        </div>
        <Link 
          href="/app/tasks" 
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" /> New Task
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Today's Tasks */}
        <div className="border border-border rounded-xl p-6 bg-card text-card-foreground shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-primary" /> Today's Tasks
            </h2>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full font-medium">
              {todayTasks.length}
            </span>
          </div>
          
          {todayTasks.length === 0 ? (
            <div className="text-muted-foreground text-sm py-8 text-center flex flex-col items-center gap-2">
              <p>No tasks for today. Take a break!</p>
              <Link href="/app/tasks" className="text-xs text-primary hover:underline">
                Create a scheduled task →
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {todayTasks.map(task => (
                <div 
                  key={task.id} 
                  className="flex items-start gap-3 group p-2.5 hover:bg-muted/50 rounded-lg transition-colors cursor-pointer"
                  onClick={() => setEditingTask(task)}
                >
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      handleToggleTask(task.id, task.status)
                    }}
                    className="mt-0.5 text-muted-foreground hover:text-primary shrink-0"
                  >
                    {task.status === 'done' ? (
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-medium truncate ${task.status === 'done' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                      {task.title}
                    </div>

                    <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground">
                      {task.due_time && (
                        <span className="flex items-center gap-1 bg-muted px-1.5 py-0.5 rounded font-medium">
                          <Clock className="w-3 h-3" />
                          {task.due_time}
                        </span>
                      )}
                      {task.due_time && (
                        <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded font-medium ${
                          task.reminder_sent ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary'
                        }`}>
                          <Bell className="w-3 h-3" />
                          {task.reminder_sent ? 'Alerted' : '5m reminder'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Recent Pages */}
        <div className="border border-border rounded-xl p-6 bg-card text-card-foreground shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" /> Recent Pages
            </h2>
          </div>
          
          {recentPages.length === 0 ? (
            <div className="text-muted-foreground text-sm py-8 text-center">
              You haven't visited any pages yet.
            </div>
          ) : (
            <div className="space-y-2">
              {recentPages.map(page => (
                <Link key={page.id} href={`/app/pages/${page.id}`} className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-lg transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    {page.icon || <FileText className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{page.title || 'Untitled'}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      Updated {format(new Date(page.updated_at), 'MMM d, yyyy')}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <TaskEditDialog
        task={editingTask}
        isOpen={Boolean(editingTask)}
        onClose={() => setEditingTask(null)}
      />
    </div>
  )
}
