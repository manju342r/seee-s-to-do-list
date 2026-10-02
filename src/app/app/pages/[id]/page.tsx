'use client'

import { useWorkspaceStore } from '@/store/workspace'
import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'

type Block = { id: string, type: 'h1' | 'h2' | 'h3' | 'p' | 'todo', text: string, checked?: boolean }

export default function EditorPage() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()
  
  const page = useWorkspaceStore(state => state.pages.find(p => p.id === id))
  const updatePage = useWorkspaceStore(state => state.updatePage)
  const deletePage = useWorkspaceStore(state => state.deletePage)
  
  const [title, setTitle] = useState(page?.title || '')
  const [blocks, setBlocks] = useState<Block[]>(page?.content || [{ id: crypto.randomUUID(), type: 'p', text: '' }])
  const saveTimeout = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (page) {
      setTitle(page.title)
      setBlocks(page.content?.length ? page.content : [{ id: crypto.randomUUID(), type: 'p', text: '' }])
    }
  }, [page?.id])

  const handleSave = (newTitle: string, newBlocks: Block[]) => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current)
    saveTimeout.current = setTimeout(() => {
      updatePage(id, { title: newTitle, content: newBlocks })
    }, 500)
  }

  const updateBlock = (index: number, updates: Partial<Block>) => {
    const newBlocks = [...blocks]
    newBlocks[index] = { ...newBlocks[index], ...updates }
    setBlocks(newBlocks)
    handleSave(title, newBlocks)
  }

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      const currentBlock = blocks[index]
      
      // Handle slash commands check here in a real app
      
      const newBlocks = [...blocks]
      newBlocks.splice(index + 1, 0, { id: crypto.randomUUID(), type: 'p', text: '' })
      setBlocks(newBlocks)
      handleSave(title, newBlocks)
      
      // Focus next block via ref in a real app
      setTimeout(() => {
        const nextEl = document.getElementById(`block-${index + 1}`)
        if (nextEl) nextEl.focus()
      }, 0)
    }
    
    if (e.key === 'Backspace' && blocks[index].text === '' && blocks.length > 1) {
      e.preventDefault()
      const newBlocks = [...blocks]
      newBlocks.splice(index, 1)
      setBlocks(newBlocks)
      handleSave(title, newBlocks)
      
      setTimeout(() => {
        const prevEl = document.getElementById(`block-${index - 1}`)
        if (prevEl) {
          prevEl.focus()
          // Move cursor to end
          const range = document.createRange()
          const sel = window.getSelection()
          if (sel) {
            range.selectNodeContents(prevEl)
            range.collapse(false)
            sel.removeAllRanges()
            sel.addRange(range)
          }
        }
      }, 0)
    }
    
    if (e.key === '/') {
       // Open slash command menu logic
    }
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value)
    handleSave(e.target.value, blocks)
  }

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this page?')) {
      deletePage(id)
      router.push('/app/pages')
    }
  }

  if (!page) return null

  return (
    <div className="max-w-3xl mx-auto p-12">
      <div className="flex justify-between items-center mb-12">
        <div className="text-sm text-muted-foreground">Workspace / Pages / {title || 'Untitled'}</div>
        <button onClick={handleDelete} className="text-sm text-destructive hover:underline">Delete</button>
      </div>
      
      <input
        type="text"
        value={title}
        onChange={handleTitleChange}
        placeholder="Untitled"
        className="text-4xl font-bold border-none outline-none w-full bg-transparent mb-8 placeholder:text-muted-foreground/30"
      />
      
      <div className="space-y-2">
        {blocks.map((block, i) => (
          <div key={block.id || `block-${i}`} className="relative group flex items-start -ml-6 pl-6">
            <div 
              contentEditable
              suppressContentEditableWarning
              id={`block-${i}`}
              className={`w-full outline-none min-h-[1.5em] 
                ${block.text === '' ? 'before:content-[attr(data-placeholder)] before:text-muted-foreground/50' : ''}
                ${block.type === 'h1' ? 'text-3xl font-bold mt-6 mb-4' : ''}
                ${block.type === 'h2' ? 'text-2xl font-semibold mt-5 mb-3' : ''}
                ${block.type === 'h3' ? 'text-xl font-medium mt-4 mb-2' : ''}
                ${block.type === 'todo' ? 'pl-8 relative' : ''}
              `}
              onInput={(e) => updateBlock(i, { text: e.currentTarget.textContent || '' })}
              onKeyDown={(e) => handleKeyDown(e, i)}
              data-placeholder={block.type === 'p' ? "Type '/' for commands" : `${block.type}`}
            >
              {block.text}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
