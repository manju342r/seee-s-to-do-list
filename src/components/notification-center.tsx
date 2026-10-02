'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Bell, Check, Clock, Trash2, X, ExternalLink, ShieldAlert } from 'lucide-react'
import { useWorkspaceStore } from '@/store/workspace'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { ActiveToast } from '@/hooks/use-reminder-notifier'

interface NotificationCenterProps {
  activeToasts: ActiveToast[]
  onDismissToast: (id: string) => void
  onRequestDesktopPermission: () => Promise<string>
}

export function NotificationCenter({
  activeToasts,
  onDismissToast,
  onRequestDesktopPermission,
}: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [browserPermission, setBrowserPermission] = useState<string>('default')
  const dropdownRef = useRef<HTMLDivElement>(null)

  const notifications = useWorkspaceStore(state => state.notifications)
  const markNotificationAsRead = useWorkspaceStore(state => state.markNotificationAsRead)
  const clearAllNotifications = useWorkspaceStore(state => state.clearAllNotifications)
  const updateTask = useWorkspaceStore(state => state.updateTask)

  const unreadCount = notifications.filter(n => !n.read).length

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setBrowserPermission(Notification.permission)
    }
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const handleRequestPermission = async () => {
    const perm = await onRequestDesktopPermission()
    setBrowserPermission(perm)
  }

  const handleCompleteTask = (taskId: string, toastId: string) => {
    updateTask(taskId, { status: 'done' })
    onDismissToast(toastId)
  }

  return (
    <>
      {/* Topbar Notification Icon */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Notifications"
          className="relative p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Dropdown Panel - Solid Opaque Background */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-border bg-popover text-popover-foreground shadow-2xl z-50 overflow-hidden">
            <div className="flex items-center justify-between border-b border-border p-3.5 bg-muted/50">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">Notifications</span>
                {unreadCount > 0 && (
                  <span className="text-xs bg-primary/15 text-primary font-medium px-2 py-0.5 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {notifications.length > 0 && (
                <button
                  onClick={clearAllNotifications}
                  className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear
                </button>
              )}
            </div>

            {/* Desktop Notification Banner Prompt */}
            {browserPermission !== 'granted' && (
              <div className="p-3 bg-primary/10 border-b border-border flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-foreground font-medium">Desktop Reminders</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Allow notifications to receive 5-min pre-alerts even when this tab is in background.
                  </p>
                  <button
                    onClick={handleRequestPermission}
                    className="mt-2 text-xs bg-primary text-primary-foreground font-medium px-2.5 py-1 rounded shadow-sm hover:bg-primary/90 transition-all"
                  >
                    Enable Notifications
                  </button>
                </div>
              </div>
            )}

            {/* Notification List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-border bg-popover">
              {notifications.length === 0 ? (
                <div className="py-10 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
                  <Clock className="w-8 h-8 opacity-40" />
                  <p className="font-medium text-foreground">No reminder notifications yet.</p>
                  <p className="text-xs max-w-[220px]">
                    Tasks scheduled with a date & time will notify you 5 minutes before.
                  </p>
                </div>
              ) : (
                notifications.map(notif => (
                  <div
                    key={notif.id}
                    onClick={() => markNotificationAsRead(notif.id)}
                    className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer ${
                      notif.read ? 'opacity-70 hover:bg-muted/40' : 'bg-primary/5 hover:bg-primary/10'
                    }`}
                  >
                    <div className="mt-0.5 rounded-full p-1.5 bg-primary/10 text-primary shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className={`text-xs font-semibold truncate ${notif.read ? 'text-foreground' : 'text-primary'}`}>
                          {notif.title}
                        </p>
                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {notif.message}
                      </p>
                      <p className="text-[10px] text-muted-foreground/80 mt-1.5">
                        {formatDistanceToNow(parseISO(notif.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Floating Active Toasts (When 5-Minute Reminder Triggers) */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {activeToasts.map(toast => (
          <div
            key={toast.id}
            className="pointer-events-auto bg-card border-2 border-primary/40 text-card-foreground p-4 rounded-xl shadow-2xl flex items-start gap-3 animate-in slide-in-from-bottom-5 duration-300"
          >
            <div className="p-2 rounded-lg bg-primary/15 text-primary shrink-0 animate-bounce">
              <Clock className="w-5 h-5" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  ⏰ Reminder (In 5 Minutes)
                </span>
                <button
                  onClick={() => onDismissToast(toast.id)}
                  className="text-muted-foreground hover:text-foreground p-0.5 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <h4 className="font-semibold text-sm text-foreground mt-1 truncate">
                {toast.title}
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                {toast.message}
              </p>

              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={() => handleCompleteTask(toast.taskId, toast.id)}
                  className="text-xs bg-primary text-primary-foreground font-medium px-3 py-1.5 rounded-md hover:bg-primary/90 flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Check className="w-3.5 h-3.5" /> Mark Done
                </button>
                <button
                  onClick={() => onDismissToast(toast.id)}
                  className="text-xs text-muted-foreground hover:bg-muted px-2.5 py-1.5 rounded-md transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
