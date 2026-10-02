'use client'

import React, { useState } from 'react'
import { Task, TaskPriority, TaskStatus } from '@/types'
import { useWorkspaceStore } from '@/store/workspace'
import { X, Bell, Calendar, Clock, AlertCircle } from 'lucide-react'

interface TaskEditDialogProps {
  task: Task | null
  isOpen: boolean
  onClose: () => void
}

export function TaskEditDialog({ task, isOpen, onClose }: TaskEditDialogProps) {
  const updateTask = useWorkspaceStore(state => state.updateTask)
  const projects = useWorkspaceStore(state => state.projects)

  const [title, setTitle] = useState(task?.title || '')
  const [description, setDescription] = useState(task?.description || '')
  const [status, setStatus] = useState<TaskStatus>(task?.status || 'todo')
  const [priority, setPriority] = useState<TaskPriority>(task?.priority || 'none')
  const [dueDate, setDueDate] = useState(task?.due_date || '')
  const [dueTime, setDueTime] = useState(task?.due_time || '')
  const [reminderMinutes, setReminderMinutes] = useState<number>(task?.reminder_minutes ?? 5)
  const [reminderEnabled, setReminderEnabled] = useState<boolean>(task?.reminder_enabled ?? true)
  const [projectId, setProjectId] = useState<string>(task?.project_id || '')

  React.useEffect(() => {
    if (task) {
      setTitle(task.title || '')
      setDescription(task.description || '')
      setStatus(task.status || 'todo')
      setPriority(task.priority || 'none')
      setDueDate(task.due_date || '')
      setDueTime(task.due_time || '')
      setReminderMinutes(task.reminder_minutes ?? 5)
      setReminderEnabled(task.reminder_enabled ?? true)
      setProjectId(task.project_id || '')
    }
  }, [task])

  if (!isOpen || !task) return null

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    updateTask(task.id, {
      title,
      description,
      status,
      priority,
      due_date: dueDate || undefined,
      due_time: dueTime || undefined,
      reminder_minutes: reminderMinutes,
      reminder_enabled: reminderEnabled,
      project_id: projectId || undefined,
      reminder_sent: false, // reset so updated schedule will trigger reminder
    })

    onClose()
  }

  // Quick preset helper to test reminder in next 5-6 minutes easily!
  const setQuickTestSchedule = (minutesFromNow: number) => {
    const d = new Date(Date.now() + minutesFromNow * 60 * 1000)
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    const hh = String(d.getHours()).padStart(2, '0')
    const min = String(d.getMinutes()).padStart(2, '0')

    setDueDate(`${yyyy}-${mm}-${dd}`)
    setDueTime(`${hh}:${min}`)
    setReminderMinutes(5)
    setReminderEnabled(true)
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-border bg-muted/20">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-lg">Task Schedule & Reminders</h3>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-1 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
              Task Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              required
            />
          </div>

          {/* Schedule Section */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <Clock className="w-4 h-4" /> Notification Schedule
              </span>
              <button
                type="button"
                onClick={() => setQuickTestSchedule(5)}
                className="text-xs text-primary hover:underline font-medium"
              >
                ⚡ Set to 5 min from now (Test)
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Due Time</label>
                <input
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>

            {/* Reminder timing dropdown */}
            <div className="pt-2 border-t border-primary/10 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="reminderEnabled"
                  checked={reminderEnabled}
                  onChange={(e) => setReminderEnabled(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                />
                <label htmlFor="reminderEnabled" className="text-xs font-medium cursor-pointer">
                  Send reminder before
                </label>
              </div>

              <select
                disabled={!reminderEnabled}
                value={reminderMinutes}
                onChange={(e) => setReminderMinutes(Number(e.target.value))}
                className="bg-background border border-border rounded-md px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 font-medium"
              >
                <option value={5}>5 minutes before (Recommended)</option>
                <option value={10}>10 minutes before</option>
                <option value={15}>15 minutes before</option>
                <option value={30}>30 minutes before</option>
                <option value={60}>1 hour before</option>
              </select>
            </div>

            {reminderEnabled && dueDate && dueTime && (
              <p className="text-[11px] text-primary/80 flex items-center gap-1">
                <Bell className="w-3.5 h-3.5" />
                Notification will arrive {reminderMinutes} min before {dueTime} on {dueDate}
              </p>
            )}
          </div>

          {/* Priority & Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
              >
                <option value="none">None</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
              >
                <option value="todo">To Do</option>
                <option value="incomplete">Incomplete</option>
                <option value="review">Mark for Review</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
              Description / Notes
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add extra context for this task..."
              className="w-full px-3.5 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-muted-foreground hover:bg-muted rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
            >
              Save Schedule & Reminder
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
