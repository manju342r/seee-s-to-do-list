'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Command } from 'cmdk'
import { Search, FolderKanban, CheckSquare, FileText, Settings, Moon, Sun } from 'lucide-react'
import { useWorkspaceStore } from '@/store/workspace'
import { useTheme } from 'next-themes'

export function CommandMenu() {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()
  const { setTheme, theme } = useTheme()
  const { pages, projects } = useWorkspaceStore()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false)
    command()
  }, [])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-start justify-center pt-[20vh]">
      <div className="w-full max-w-lg bg-background border border-border rounded-xl shadow-2xl overflow-hidden">
        <Command label="Command Menu" className="flex flex-col w-full" shouldFilter={false}>
          <div className="flex items-center border-b border-border px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Command.Input 
              autoFocus
              placeholder="Type a command or search..." 
              className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
            <span className="text-xs text-muted-foreground">ESC to close</span>
          </div>
          
          <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden p-2">
            <Command.Empty className="py-6 text-center text-sm">No results found.</Command.Empty>
            
            <Command.Group heading="Pages" className="text-xs font-medium text-muted-foreground px-2 py-1.5">
              {pages.filter(p => !p.is_trash).slice(0, 5).map((page) => (
                <Command.Item
                  key={page.id}
                  onSelect={() => runCommand(() => router.push(`/app/pages/${page.id}`))}
                  className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-muted aria-selected:text-foreground text-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  {page.title || 'Untitled'}
                </Command.Item>
              ))}
            </Command.Group>
            
            <Command.Group heading="Projects" className="text-xs font-medium text-muted-foreground px-2 py-1.5 mt-2">
              {projects.slice(0, 5).map((project) => (
                <Command.Item
                  key={project.id}
                  onSelect={() => runCommand(() => router.push(`/app/projects/${project.id}`))}
                  className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-muted aria-selected:text-foreground text-foreground"
                >
                  <FolderKanban className="mr-2 h-4 w-4" />
                  {project.name}
                </Command.Item>
              ))}
            </Command.Group>

            <Command.Group heading="Actions" className="text-xs font-medium text-muted-foreground px-2 py-1.5 mt-2">
              <Command.Item
                onSelect={() => runCommand(() => router.push('/app/tasks'))}
                className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-muted aria-selected:text-foreground text-foreground"
              >
                <CheckSquare className="mr-2 h-4 w-4" />
                Go to Tasks
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => router.push('/app/settings'))}
                className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-muted aria-selected:text-foreground text-foreground"
              >
                <Settings className="mr-2 h-4 w-4" />
                Go to Settings
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => setTheme(theme === 'dark' ? 'light' : 'dark'))}
                className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-muted aria-selected:text-foreground text-foreground"
              >
                {theme === 'dark' ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
                Toggle Theme
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  )
}
