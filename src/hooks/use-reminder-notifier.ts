'use client'

import { useEffect, useState, useRef } from 'react'
import { useWorkspaceStore } from '@/store/workspace'
import { playNotificationChime } from '@/lib/sound'

export type ActiveToast = {
  id: string
  taskId: string
  title: string
  message: string
  timeStr: string
}

export function useReminderNotifier() {
  const tasks = useWorkspaceStore(state => state.tasks)
  const updateTask = useWorkspaceStore(state => state.updateTask)
  const addNotification = useWorkspaceStore(state => state.addNotification)
  const [activeToasts, setActiveToasts] = useState<ActiveToast[]>([])

  // Request browser permission helper
  const requestDesktopPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission()
        useWorkspaceStore.getState().setDesktopNotificationAllowed(perm === 'granted')
        return perm
      } catch (e) {
        console.warn('Error requesting notification permission:', e)
      }
    }
    return 'denied'
  }

  const dismissToast = (id: string) => {
    setActiveToasts(prev => prev.filter(t => t.id !== id))
  }

  useEffect(() => {
    // Check every 5 seconds for timely 5-minute pre-alerts
    const checkReminders = () => {
      const now = Date.now()

      tasks.forEach(task => {
        // Skip done tasks or tasks without schedule or disabled reminders
        if (task.status === 'done' || !task.due_date || task.reminder_sent) {
          return
        }

        if (task.reminder_enabled === false) {
          return
        }

        // Parse scheduled time
        // If due_time is not set, default to 09:00 AM on that day
        const timePart = task.due_time ? task.due_time : '09:00'
        const scheduledDate = new Date(`${task.due_date}T${timePart}:00`)
        const scheduledTime = scheduledDate.getTime()

        if (isNaN(scheduledTime)) return

        const reminderMinutes = task.reminder_minutes ?? 5
        const reminderThresholdTime = scheduledTime - (reminderMinutes * 60 * 1000)

        // If current time is past reminderThreshold and task is within 1 hour after scheduled time
        const isWithinReminderWindow = now >= reminderThresholdTime && now <= (scheduledTime + (60 * 60 * 1000))

        if (isWithinReminderWindow) {
          const diffMinutes = Math.max(0, Math.round((scheduledTime - now) / 60000))
          const timeDescription = diffMinutes > 0 
            ? `Starts in ~${diffMinutes} min (at ${timePart})` 
            : `Scheduled time reached (${timePart})`

          const notifMessage = `${timeDescription}. ${task.description || ''}`.trim()

          // 1. Add to In-App Notification Center
          addNotification({
            task_id: task.id,
            title: `Reminder: ${task.title}`,
            message: notifMessage,
            due_at: `${task.due_date} ${timePart}`
          })

          // 2. Play gentle audio chime
          playNotificationChime()

          // 3. Show Native Desktop/Browser Notification if permitted
          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            try {
              new Notification(`⏰ Reminder (5 min): ${task.title}`, {
                body: `${timeDescription}. Click to open workspace.`,
                icon: '/favicon.ico',
                tag: `reminder-${task.id}`,
              })
            } catch (err) {
              console.warn('Native notification failed:', err)
            }
          }

          // 4. Trigger in-app floating banner toast
          const toastId = `${task.id}-${now}`
          setActiveToasts(prev => [
            {
              id: toastId,
              taskId: task.id,
              title: task.title,
              message: timeDescription,
              timeStr: timePart
            },
            ...prev
          ])

          // Auto-dismiss toast after 8 seconds
          setTimeout(() => {
            dismissToast(toastId)
          }, 8000)

          // 5. Mark task as reminder sent to prevent duplicate alerts
          updateTask(task.id, { reminder_sent: true })
        }
      })
    }

    // Initial check
    checkReminders()

    const interval = setInterval(checkReminders, 5000)
    return () => clearInterval(interval)
  }, [tasks, updateTask, addNotification])

  return {
    activeToasts,
    dismissToast,
    requestDesktopPermission
  }
}
