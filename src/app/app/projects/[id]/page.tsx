'use client'

import { useWorkspaceStore } from '@/store/workspace'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { TaskStatus, Task } from '@/types'
import { Plus, Clock, Bell, Calendar } from 'lucide-react'
import { TaskEditDialog } from '@/components/task-edit-dialog'

export default function ProjectBoardPage() {
  const params = useParams()
  const projectId = params.id as string
  
  const project = useWorkspaceStore(state => state.projects.find(p => p.id === projectId))
  const allTasks = useWorkspaceStore(state => state.tasks)
  const projectTasks = allTasks.filter(t => t.project_id === projectId)
  
  const addTask = useWorkspaceStore(state => state.addTask)
  const updateTask = useWorkspaceStore(state => state.updateTask)
  
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  
  // Ordered exactly as requested: To Do -> Incomplete -> Mark for Review -> Done
  const columns: { id: TaskStatus; title: string }[] = [
    { id: 'todo', title: 'To Do' },
    { id: 'incomplete', title: 'Incomplete' },
    { id: 'review', title: 'Mark for Review' },
    { id: 'done', title: 'Done' }
  ]

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId)
    e.dataTransfer.setData('text/plain', taskId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault()
    const taskId = e.dataTransfer.getData('text/plain')
    if (taskId) {
      updateTask(taskId, { status })
    }
    setDraggedTaskId(null)
  }

  const handleQuickAdd = (status: TaskStatus) => {
    const title = window.prompt('New task title:')
    if (title && title.trim()) {
      addTask({ 
        title, 
        status, 
        project_id: projectId,
        reminder_minutes: 5,
        reminder_enabled: true,
        reminder_sent: false
      })
    }
  }

  if (!project) return <div className="p-8">Project not found</div>

  return (
    <div className="h-full flex flex-col p-8">
      <div className="flex flex-col mb-8">
        <h1 className="text-3xl font-bold">{project.name}</h1>
        {project.description && <p className="text-muted-foreground mt-2">{project.description}</p>}
      </div>
      
      <div className="flex-1 flex gap-6 overflow-x-auto pb-4">
        {columns.map(col => {
          const colTasks = projectTasks.filter(t => {
            if (col.id === 'incomplete') {
              return t.status === 'incomplete' || t.status === 'in_progress'
            }
            return t.status === col.id
          })
          
          return (
            <div 
              key={col.id} 
              className="flex-shrink-0 w-80 bg-muted/30 rounded-xl flex flex-col max-h-full border border-border/50"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              <div className="p-4 flex items-center justify-between font-semibold text-sm">
                <div className="flex items-center gap-2">
                  <span>{col.title}</span>
                  <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-medium">
                    {colTasks.length}
                  </span>
                </div>
                <button 
                  onClick={() => handleQuickAdd(col.id)}
                  className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                  title={`Add task to ${col.title}`}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-3 pt-0 space-y-3 min-h-[160px]">
                {colTasks.map(task => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onClick={() => setEditingTask(task)}
                    className="bg-card text-card-foreground p-3.5 rounded-lg shadow-sm border border-border cursor-grab active:cursor-grabbing hover:border-primary/50 transition-all group select-none"
                  >
                    <div className="text-sm font-medium">{task.title}</div>
                    
                    {(task.due_date || task.due_time) && (
                      <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-muted-foreground">
                        {task.due_date && (
                          <span className="flex items-center gap-1 bg-muted px-1.5 py-0.5 rounded text-[11px]">
                            <Calendar className="w-3 h-3" />
                            {task.due_date}
                          </span>
                        )}
                        {task.due_time && (
                          <span className="flex items-center gap-1 bg-muted px-1.5 py-0.5 rounded text-[11px]">
                            <Clock className="w-3 h-3" />
                            {task.due_time}
                          </span>
                        )}
                        {task.due_time && task.reminder_enabled !== false && (
                          <span className="flex items-center gap-1 text-[11px] text-primary bg-primary/10 px-1.5 py-0.5 rounded font-medium">
                            <Bell className="w-3 h-3" />
                            5m alert
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <TaskEditDialog
        task={editingTask}
        isOpen={Boolean(editingTask)}
        onClose={() => setEditingTask(null)}
      />
    </div>
  )
}
