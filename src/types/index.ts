export type Workspace = {
  id: string
  name: string
  created_at: string
  updated_at: string
}

export type Project = {
  id: string
  workspace_id: string
  name: string
  description?: string
  icon?: string
  color?: string
  status: 'active' | 'archived'
  created_at: string
  updated_at: string
}

export type TaskStatus = 'todo' | 'incomplete' | 'in_progress' | 'review' | 'done'
export type TaskPriority = 'none' | 'low' | 'medium' | 'high' | 'urgent'

export type Task = {
  id: string
  workspace_id: string
  project_id?: string
  parent_id?: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  due_date?: string // YYYY-MM-DD
  due_time?: string // HH:MM
  reminder_minutes?: number // e.g. 5 for 5 minutes before
  reminder_enabled?: boolean
  reminder_sent?: boolean
  assignee_id?: string
  is_recurring: boolean
  recurring_rule?: string
  created_by?: string
  completed_at?: string
  created_at: string
  updated_at: string
}

export type AppNotification = {
  id: string
  task_id?: string
  title: string
  message: string
  due_at?: string
  created_at: string
  read: boolean
}

export type Page = {
  id: string
  workspace_id: string
  parent_id?: string
  project_id?: string
  title: string
  icon?: string
  cover_image?: string
  content: any
  is_favorite: boolean
  is_archived: boolean
  is_trash: boolean
  created_by?: string
  created_at: string
  updated_at: string
}
