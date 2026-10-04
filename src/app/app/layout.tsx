'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  Inbox, 
  CalendarDays, 
  Calendar, 
  CheckSquare, 
  FolderKanban, 
  Settings, 
  Menu,
  Plus,
  FileText,
  Trash2
} from 'lucide-react'
import { useWorkspaceStore } from '@/store/workspace'
import { CommandMenu } from '@/components/command-menu'
import { NotificationCenter } from '@/components/notification-center'
import { useReminderNotifier } from '@/hooks/use-reminder-notifier'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const pathname = usePathname()
  const { tasks, projects, pages, habits, workspaceName, seedData } = useWorkspaceStore()
  const { activeToasts, dismissToast, requestDesktopPermission } = useReminderNotifier()

  useEffect(() => {
    if (workspaceName === "Shruthe's Workspace") {
      useWorkspaceStore.getState().setWorkspaceName("Habit Tracker")
    }
  }, [workspaceName])

  useEffect(() => {
    if (tasks.length === 0 && projects.length === 0 && pages.length === 0 && habits.length === 0) {
      seedData()
    }
  }, [tasks.length, projects.length, pages.length, habits.length, seedData])

  const navItems = [
    { name: 'Home', href: '/app', icon: Home },
    { name: 'Inbox', href: '/app/inbox', icon: Inbox },
    { name: 'Today', href: '/app/today', icon: Calendar },
    { name: 'Upcoming', href: '/app/upcoming', icon: CalendarDays },
    { name: 'All Tasks', href: '/app/tasks', icon: CheckSquare },
    { name: 'Habits', href: '/app/habits', icon: CheckSquare },
    { name: 'Trash', href: '/app/trash', icon: Trash2 },
  ]

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <div 
        className={`${sidebarOpen ? 'w-64' : 'w-0'} flex-shrink-0 transition-all duration-300 ease-in-out border-r border-border bg-muted/20 overflow-y-auto`}
      >
        <div className="p-4 w-64">
          <div className="flex items-center gap-2.5 px-2 mb-6">
            <div className="w-7 h-7 rounded-lg bg-primary text-primary-foreground font-bold flex items-center justify-center text-xs shadow-sm shrink-0">
              {workspaceName ? workspaceName.charAt(0).toUpperCase() : 'H'}
            </div>
            <div className="font-semibold text-sm truncate">
              {workspaceName || "Habit Tracker"}
            </div>
          </div>
          
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = item.href === '/app' ? pathname === item.href : (pathname === item.href || pathname.startsWith(item.href + '/'))
              return (
                <Link 
                  key={item.name} 
                  href={item.href}
                  className={`flex items-center gap-3 px-2 py-1.5 rounded-md text-sm font-medium transition-colors ${active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
          
          <div className="mt-8">
            <div className="flex items-center justify-between px-2 mb-2 group">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pages</span>
              <button className="text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <nav className="space-y-1">
              {pages.filter(p => !p.is_trash).slice(0, 5).map(page => (
                <Link key={page.id} href={`/app/pages/${page.id}`} className={`flex items-center gap-3 px-2 py-1.5 rounded-md text-sm ${pathname.includes(page.id) ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
                  <FileText className="w-4 h-4 shrink-0" />
                  <span className="truncate">{page.title || 'Untitled'}</span>
                </Link>
              ))}
              <Link href="/app/pages" className="flex items-center gap-3 px-2 py-1.5 rounded-md text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
                <FileText className="w-4 h-4 shrink-0" />
                View all pages
              </Link>
            </nav>
          </div>
          
          <div className="mt-8">
            <div className="flex items-center justify-between px-2 mb-2 group">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Projects</span>
              <button className="text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <nav className="space-y-1">
              <Link href="/app/projects" className="flex items-center gap-3 px-2 py-1.5 rounded-md text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
                <FolderKanban className="w-4 h-4" />
                View all projects
              </Link>
            </nav>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-14 border-b border-border flex items-center px-4 gap-4 flex-shrink-0">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-md text-muted-foreground hover:bg-muted"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex-1" />
          
          <NotificationCenter 
            activeToasts={activeToasts}
            onDismissToast={dismissToast}
            onRequestDesktopPermission={requestDesktopPermission}
          />

          <Link href="/app/settings" className="p-1.5 rounded-md text-muted-foreground hover:bg-muted">
            <Settings className="w-5 h-5" />
          </Link>
        </header>
        
        {/* Page content */}
        <main className="flex-1 overflow-y-auto relative">
          {children}
        </main>
      </div>
      <CommandMenu />
    </div>
  )
}
