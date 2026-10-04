'use client'

import { useWorkspaceStore } from '@/store/workspace'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Bell, Volume2, ShieldCheck, Plus, Check } from 'lucide-react'
import { playNotificationChime } from '@/lib/sound'
import { format } from 'date-fns'

export default function SettingsPage() {
  const seedData = useWorkspaceStore(state => state.seedData)
  const addTask = useWorkspaceStore(state => state.addTask)
  const addNotification = useWorkspaceStore(state => state.addNotification)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [permission, setPermission] = useState<string>('default')
  const [testSent, setTestSent] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission)
    }
  }, [])

  const handleRequestPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const res = await Notification.requestPermission()
      setPermission(res)
    }
  }

  const handleTestNotification = () => {
    playNotificationChime()

    addNotification({
      title: 'Reminder: Scheduled Meeting',
      message: 'Starts in ~5 min (11:45 AM). Click to view details.',
      due_at: 'Today 11:45'
    })

    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('⏰ Reminder: Scheduled Meeting', {
        body: 'Starts in ~5 minutes! Your scheduled task is coming up.',
        icon: '/favicon.ico'
      })
    }

    setTestSent(true)
    setTimeout(() => setTestSent(false), 3000)
  }

  const handleCreate5MinTask = () => {
    const target = new Date(Date.now() + 5 * 60 * 1000)
    const yyyy = target.getFullYear()
    const mm = String(target.getMonth() + 1).padStart(2, '0')
    const dd = String(target.getDate()).padStart(2, '0')
    const hh = String(target.getHours()).padStart(2, '0')
    const min = String(target.getMinutes()).padStart(2, '0')

    addTask({
      title: 'Upcoming Scheduled Task (5 min test)',
      due_date: `${yyyy}-${mm}-${dd}`,
      due_time: `${hh}:${min}`,
      reminder_minutes: 5,
      reminder_enabled: true,
      reminder_sent: false
    })

    setTestSent(true)
    setTimeout(() => setTestSent(false), 3000)
  }

  const workspaceName = useWorkspaceStore(state => state.workspaceName)
  const setWorkspaceName = useWorkspaceStore(state => state.setWorkspaceName)

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
      
      <div className="space-y-8">
        {/* Workspace Profile */}
        <section>
          <h2 className="text-xl font-semibold mb-4 border-b border-border pb-2 flex items-center gap-2">
            Workspace Profile
          </h2>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-card border border-border rounded-xl gap-4">
              <div>
                <div className="font-medium text-sm">Workspace Name</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Display name shown in the sidebar and document headers.
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={workspaceName || "Habit Tracker"}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  className="px-3 py-1.5 bg-background border border-border rounded-lg text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Workspace Name"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Notifications & Reminders */}
        <section>
          <h2 className="text-xl font-semibold mb-4 border-b border-border pb-2 flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" /> Reminders & Notifications
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-card border border-border rounded-xl">
              <div>
                <div className="font-medium text-sm">Browser Desktop Notifications</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Receive system alerts 5 minutes before scheduled tasks even when the tab is hidden.
                </div>
                <div className="text-xs font-semibold text-primary mt-1.5 capitalize">
                  Current Status: {permission}
                </div>
              </div>
              {permission !== 'granted' ? (
                <button
                  onClick={handleRequestPermission}
                  className="px-3.5 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-lg hover:bg-primary/90 transition-colors shadow-sm shrink-0"
                >
                  Enable Permissions
                </button>
              ) : (
                <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 font-semibold bg-green-500/10 px-3 py-1.5 rounded-lg shrink-0">
                  <ShieldCheck className="w-4 h-4" /> Enabled
                </div>
              )}
            </div>

            <div className="flex items-center justify-between p-4 bg-card border border-border rounded-xl">
              <div>
                <div className="font-medium text-sm">5-Minute Pre-Alert Chime Test</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Play the reminder audio chime and trigger a test reminder alert immediately.
                </div>
              </div>
              <button
                onClick={handleTestNotification}
                className="px-3.5 py-1.5 bg-muted hover:bg-muted/80 text-foreground text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
              >
                {testSent ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Volume2 className="w-3.5 h-3.5" />}
                {testSent ? 'Alert Triggered!' : 'Play Test Alert'}
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-card border border-border rounded-xl">
              <div>
                <div className="font-medium text-sm">Auto-create 5-Min Scheduled Task</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Creates a sample task scheduled exactly 5 minutes from right now to test the real-time reminder.
                </div>
              </div>
              <button
                onClick={handleCreate5MinTask}
                className="px-3.5 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" /> Schedule Test Task
              </button>
            </div>
          </div>
        </section>

        {/* Appearance */}
        <section>
          <h2 className="text-xl font-semibold mb-4 border-b border-border pb-2">Appearance</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-card border border-border rounded-xl">
              <div>
                <div className="font-medium text-sm">Theme</div>
                <div className="text-xs text-muted-foreground mt-0.5">Change the appearance of the workspace.</div>
              </div>
              {mounted && (
                <select 
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="bg-background border border-border rounded-md px-3 py-1.5 text-xs font-medium"
                >
                  <option value="system">System</option>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              )}
            </div>
          </div>
        </section>

        {/* Developer / Debug */}
        <section>
          <h2 className="text-xl font-semibold mb-4 border-b border-border pb-2">Data & Storage</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-card border border-border rounded-xl">
              <div>
                <div className="font-medium text-sm">Reset Sample Data</div>
                <div className="text-xs text-muted-foreground mt-0.5">Reload the workspace with seed tasks and projects.</div>
              </div>
              <button 
                onClick={() => seedData()}
                className="bg-muted text-foreground px-4 py-2 rounded-md text-xs font-medium hover:bg-muted/80"
              >
                Reset to Seed Data
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
