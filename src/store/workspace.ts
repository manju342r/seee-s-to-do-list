import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'
import { Task, Project, Page, AppNotification } from '@/types'

interface WorkspaceState {
  tasks: Task[]
  projects: Project[]
  pages: Page[]
  notifications: AppNotification[]
  desktopNotificationAllowed: boolean
  
  // Actions
  addTask: (task: Partial<Task>) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  
  addProject: (project: Partial<Project>) => void
  updateProject: (id: string, updates: Partial<Project>) => void
  deleteProject: (id: string) => void
  
  addPage: (page: Partial<Page>) => void
  updatePage: (id: string, updates: Partial<Page>) => void
  deletePage: (id: string) => void
  
  // Notifications
  addNotification: (notification: Omit<AppNotification, 'id' | 'created_at' | 'read'>) => void
  markNotificationAsRead: (id: string) => void
  clearAllNotifications: () => void
  setDesktopNotificationAllowed: (allowed: boolean) => void

  seedData: () => void
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      tasks: [],
      projects: [],
      pages: [],
      notifications: [],
      desktopNotificationAllowed: false,
      
      addTask: (task) => set((state) => {
        const newTask: Task = {
          id: uuidv4(),
          workspace_id: 'default',
          title: 'New Task',
          status: 'todo',
          priority: 'none',
          is_recurring: false,
          reminder_minutes: 5,
          reminder_enabled: true,
          reminder_sent: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...task
        }
        return { tasks: [...state.tasks, newTask] }
      }),
      
      updateTask: (id, updates) => set((state) => ({
        tasks: state.tasks.map(t => {
          if (t.id !== id) return t
          
          // Reset reminder_sent if time or date is updated
          const timeChanged = updates.due_time !== undefined && updates.due_time !== t.due_time
          const dateChanged = updates.due_date !== undefined && updates.due_date !== t.due_date
          const resetReminder = timeChanged || dateChanged
          
          return {
            ...t,
            ...updates,
            reminder_sent: resetReminder ? false : (updates.reminder_sent ?? t.reminder_sent),
            updated_at: new Date().toISOString()
          }
        })
      })),
      
      deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter(t => t.id !== id),
        notifications: state.notifications.filter(n => n.task_id !== id)
      })),
      
      addProject: (project) => set((state) => {
        const newProject: Project = {
          id: uuidv4(),
          workspace_id: 'default',
          name: 'New Project',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...project
        }
        return { projects: [...state.projects, newProject] }
      }),
      
      updateProject: (id, updates) => set((state) => ({
        projects: state.projects.map(p => p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p)
      })),
      
      deleteProject: (id) => set((state) => ({
        projects: state.projects.filter(p => p.id !== id)
      })),
      
      addPage: (page) => set((state) => {
        const newPage: Page = {
          id: uuidv4(),
          workspace_id: 'default',
          title: 'Untitled Page',
          content: [],
          is_favorite: false,
          is_archived: false,
          is_trash: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...page
        }
        return { pages: [...state.pages, newPage] }
      }),
      
      updatePage: (id, updates) => set((state) => ({
        pages: state.pages.map(p => p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p)
      })),
      
      deletePage: (id) => set((state) => ({
        pages: state.pages.map(p => p.id === id ? { ...p, is_trash: true, updated_at: new Date().toISOString() } : p)
      })),
      
      addNotification: (notif) => set((state) => ({
        notifications: [
          {
            id: uuidv4(),
            created_at: new Date().toISOString(),
            read: false,
            ...notif
          },
          ...state.notifications
        ].slice(0, 50) // keep last 50 notifications
      })),

      markNotificationAsRead: (id) => set((state) => ({
        notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n)
      })),

      clearAllNotifications: () => set(() => ({
        notifications: []
      })),

      setDesktopNotificationAllowed: (allowed) => set(() => ({
        desktopNotificationAllowed: allowed
      })),

      seedData: () => set(() => {
        const projId = uuidv4()
        return {
          projects: [{
            id: projId,
            workspace_id: 'default',
            name: 'Welcome Project',
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }],
          tasks: [
            {
              id: uuidv4(),
              workspace_id: 'default',
              project_id: projId,
              title: 'Explore the workspace features',
              status: 'todo',
              priority: 'high',
              is_recurring: false,
              reminder_minutes: 5,
              reminder_enabled: true,
              reminder_sent: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            {
              id: uuidv4(),
              workspace_id: 'default',
              project_id: projId,
              title: 'Set up your first scheduled reminder',
              status: 'todo',
              priority: 'urgent',
              is_recurring: false,
              reminder_minutes: 5,
              reminder_enabled: true,
              reminder_sent: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }
          ],
          pages: [
            {
              id: uuidv4(),
              workspace_id: 'default',
              title: 'Getting Started',
              content: [{ id: uuidv4(), type: 'p', text: 'Welcome to your unified workspace! Tasks with schedule send reminders 5 minutes before start.' }],
              is_favorite: true,
              is_archived: false,
              is_trash: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }
          ],
          notifications: []
        }
      })
    }),
    {
      name: 'workspace-storage',
    }
  )
)
