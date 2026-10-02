'use client'

import { useWorkspaceStore } from '@/store/workspace'
import { FileText, RotateCcw, Trash2 } from 'lucide-react'

export default function TrashPage() {
  const pages = useWorkspaceStore(state => state.pages)
  const updatePage = useWorkspaceStore(state => state.updatePage)
  // we would need a hard delete in store for empty trash
  const trashedPages = pages.filter(p => p.is_trash)

  const handleRestore = (id: string) => {
    updatePage(id, { is_trash: false })
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Trash2 className="w-8 h-8" /> Trash
        </h1>
      </div>
      
      {trashedPages.length === 0 ? (
        <div className="text-center p-12 bg-card border border-border rounded-lg text-muted-foreground">
          Trash is empty
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
          <div className="divide-y divide-border">
            {trashedPages.map(page => (
              <div key={page.id} className="flex items-center justify-between p-4 hover:bg-muted/30">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{page.title || 'Untitled'}</div>
                    <div className="text-xs text-muted-foreground">Deleted recently</div>
                  </div>
                </div>
                <button 
                  onClick={() => handleRestore(page.id)}
                  className="flex items-center gap-2 text-sm text-primary hover:bg-primary/10 px-3 py-1.5 rounded transition-colors"
                >
                  <RotateCcw className="w-4 h-4" /> Restore
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
