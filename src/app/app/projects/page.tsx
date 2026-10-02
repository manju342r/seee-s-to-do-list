'use client'

import { useState } from 'react'
import { useWorkspaceStore } from '@/store/workspace'
import { FolderKanban, Plus } from 'lucide-react'
import Link from 'next/link'

export default function ProjectsPage() {
  const projects = useWorkspaceStore(state => state.projects)
  const addProject = useWorkspaceStore(state => state.addProject)
  
  const [newProjectName, setNewProjectName] = useState('')

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newProjectName.trim()) return
    
    addProject({ name: newProjectName })
    setNewProjectName('')
  }

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Projects</h1>
      </div>
      
      <form onSubmit={handleCreateProject} className="mb-8">
        <div className="relative flex items-center">
          <Plus className="absolute left-3 w-5 h-5 text-muted-foreground" />
          <input 
            type="text"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            placeholder="Create a new project..."
            className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </form>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(project => (
          <Link key={project.id} href={`/app/projects/${project.id}`}>
            <div className="bg-card border border-border rounded-lg p-6 shadow-sm hover:border-primary/50 transition-colors cursor-pointer group">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center text-primary">
                  <FolderKanban className="w-5 h-5" />
                </div>
                <h3 className="font-semibold group-hover:text-primary transition-colors">{project.name}</h3>
              </div>
              {project.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
