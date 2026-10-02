'use client'

import { useState } from 'react'
import { useWorkspaceStore } from '@/store/workspace'
import { CheckCircle2, Circle, Plus, Inbox as InboxIcon } from 'lucide-react'

export default function InboxPage() {
  const tasks = useWorkspaceStore(state => state.tasks)
  const addTask = useWorkspaceStore(state => state.addTask)
  const updateTask = useWorkspaceStore(state => state.updateTask)
  
  // Inbox tasks: tasks without a project assigned
  const inboxTasks = tasks.filter(t => !t.project_id)
  const [newTaskTitle, setNewTaskTitle] = useState('')

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskTitle.trim()) return
    
    addTask({ title: newTaskTitle })
    setNewTaskTitle('')
  }

  const handleToggleTask = (id: string, status: string) => {
    updateTask(id, { status: status === 'done' ? 'todo' : 'done' })
  }

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <InboxIcon className="w-8 h-8 text-primary" /> Inbox
        </h1>
      </div>
      
      <form onSubmit={handleCreateTask} className="mb-8">
        <div className="relative flex items-center">
          <Plus className="absolute left-3 w-5 h-5 text-muted-foreground" />
          <input 
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Capture a task to your Inbox..."
            className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </form>
      
      <div className="bg-background border border-border rounded-lg shadow-sm overflow-hidden">
        {inboxTasks.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            Your inbox is completely clear!
          </div>
        ) : (
          <div className="divide-y divide-border">
            {inboxTasks.map(task => (
              <div key={task.id} className="flex items-center gap-4 p-4 hover:bg-muted/30 group transition-colors">
                <button 
                  onClick={() => handleToggleTask(task.id, task.status)}
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
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
