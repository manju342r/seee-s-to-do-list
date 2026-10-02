'use client'

import { useWorkspaceStore } from '@/store/workspace'
import { FileText, Plus } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function PagesIndexPage() {
  const pages = useWorkspaceStore(state => state.pages)
  const addPage = useWorkspaceStore(state => state.addPage)
  const router = useRouter()

  const handleCreatePage = () => {
    // Generates a new ID inside the store
    // To navigate to it, we need to know the ID, so we might need a different approach
    // We can generate ID here and pass it
    const id = crypto.randomUUID()
    addPage({ id, title: 'Untitled Page', content: [{ id: crypto.randomUUID(), type: 'p', text: '' }] })
    router.push(`/app/pages/${id}`)
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Pages</h1>
        <button 
          onClick={handleCreatePage}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90"
        >
          <Plus className="w-4 h-4" />
          New Page
        </button>
      </div>
      
      <div className="grid gap-4">
        {pages.filter(p => !p.is_trash).map(page => (
          <Link key={page.id} href={`/app/pages/${page.id}`}>
            <div className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg shadow-sm hover:border-primary/50 transition-colors">
              <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                {page.icon || <FileText className="w-5 h-5 text-muted-foreground" />}
              </div>
              <div className="flex-1">
                <h3 className="font-medium">{page.title || 'Untitled Page'}</h3>
                <p className="text-xs text-muted-foreground mt-1">Last edited {new Date(page.updated_at).toLocaleDateString()}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
