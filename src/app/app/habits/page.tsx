'use client'

import { useState, useMemo } from 'react'
import { Plus, Trash2, Edit2 } from 'lucide-react'
import { useWorkspaceStore } from '@/store/workspace'
import { format, subDays, eachDayOfInterval } from 'date-fns'

export default function HabitsPage() {
  const { habits, habitLogs, addHabit, updateHabit, deleteHabit, toggleHabitLog } = useWorkspaceStore()
  const [isAdding, setIsAdding] = useState(false)
  const [newHabitName, setNewHabitName] = useState('')

  // Generate the last 30 days
  const days = useMemo(() => {
    const end = new Date()
    const start = subDays(end, 29)
    return eachDayOfInterval({ start, end })
  }, [])

  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newHabitName.trim()) return
    addHabit({ name: newHabitName })
    setNewHabitName('')
    setIsAdding(false)
  }

  return (
    <div className="p-8 max-w-full overflow-x-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Habit Tracker</h1>
          <p className="text-muted-foreground">30 days habit tracker.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Habit
        </button>
      </div>

      <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden min-w-max">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="px-4 py-3 font-medium text-muted-foreground min-w-[200px]">Name</th>
              {days.map((day, i) => (
                <th key={i} className="px-2 py-3 font-medium text-muted-foreground text-center min-w-[32px]">
                  {format(day, 'd')}
                </th>
              ))}
              <th className="px-4 py-3 font-medium text-muted-foreground text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {habits.map(habit => (
              <tr key={habit.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-medium">
                  {habit.name}
                </td>
                {days.map((day, i) => {
                  const dateStr = format(day, 'yyyy-MM-dd')
                  const isLogged = habitLogs.some(l => l.habit_id === habit.id && l.completed_date === dateStr)
                  return (
                    <td key={i} className="px-2 py-3 text-center">
                      <button
                        onClick={() => toggleHabitLog(habit.id, dateStr)}
                        className={`w-5 h-5 rounded flex items-center justify-center transition-colors border ${
                          isLogged 
                            ? 'bg-primary border-primary text-primary-foreground' 
                            : 'border-border hover:border-primary/50 text-transparent'
                        }`}
                      >
                        {isLogged && (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        )}
                      </button>
                    </td>
                  )
                })}
                <td className="px-4 py-3 text-right">
                  <button 
                    onClick={() => deleteHabit(habit.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            
            {isAdding && (
              <tr>
                <td className="px-4 py-3" colSpan={days.length + 2}>
                  <form onSubmit={handleAddHabit} className="flex gap-2">
                    <input 
                      autoFocus
                      type="text" 
                      placeholder="e.g. Wake up 04:30" 
                      className="flex-1 bg-background border border-input rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      value={newHabitName}
                      onChange={e => setNewHabitName(e.target.value)}
                    />
                    <button 
                      type="submit"
                      className="bg-primary text-primary-foreground px-3 py-1.5 rounded-md text-sm hover:bg-primary/90 transition-colors"
                    >
                      Save
                    </button>
                    <button 
                      type="button"
                      onClick={() => setIsAdding(false)}
                      className="bg-muted text-muted-foreground px-3 py-1.5 rounded-md text-sm hover:bg-muted/80 transition-colors"
                    >
                      Cancel
                    </button>
                  </form>
                </td>
              </tr>
            )}
            
            {!isAdding && habits.length === 0 && (
              <tr>
                <td colSpan={days.length + 2} className="px-4 py-8 text-center text-muted-foreground">
                  No habits yet. Add one to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
