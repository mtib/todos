import { useEffect, useState } from 'react'
import { useTodos } from './hooks/useTodos'
import { TodoTree } from './components/TodoTree'
import { TodoForm } from './components/TodoForm'
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"

function App() {
  const {
    todoTree,
    expanded,
    setExpanded,
    subtaskInputs,
    setSubtaskInputs,
    addTodo,
    toggleTodo,
    deleteTodo,
    renameTodo,
    updateTodo,
    toggleRecursive,
    searchQuery,
    setSearchQuery,
    showCompleted,
    setShowCompleted
  } = useTodos()

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    // Rely on classes initially set by the inline script in index.html to avoid state mismatch
    if (typeof window !== 'undefined') {
      if (document.documentElement.classList.contains('dark')) return 'dark'
      if (document.documentElement.classList.contains('light')) return 'light'

      const saved = localStorage.getItem('theme')
      if (saved === 'light' || saved === 'dark') return saved
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return 'light'
  })

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Theme Toggle in absolute position */}
      <div className="fixed top-4 right-4 z-50">
        <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full shadow-sm bg-background/50 backdrop-blur-sm border hover:bg-muted transition-colors">
          {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </Button>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="space-y-10">
          <TodoForm
            onAddTodo={(text) => addTodo(text)}
            onSearch={setSearchQuery}
            searchQuery={searchQuery}
            showCompleted={showCompleted}
            onToggleCompleted={() => setShowCompleted(!showCompleted)}
          />

          <div className="w-full">
            <TodoTree
              tree={todoTree}
              expanded={expanded}
              subtaskInputs={subtaskInputs}
              onToggleExpand={(id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }))}
              onToggleTodo={toggleTodo}
              onDeleteTodo={deleteTodo}
              onRenameTodo={renameTodo}
              onAddSubtask={addTodo}
              onToggleRecursive={toggleRecursive}
              onSubtaskInputChange={(id, text) => setSubtaskInputs(prev => ({ ...prev, [id]: text }))}
              onUpdateTodo={updateTodo}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
