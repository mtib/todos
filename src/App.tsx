import { useEffect, useState } from 'react'
import { useTodos } from './hooks/useTodos'
import { TodoTree } from './components/TodoTree'
import { TodoForm } from './components/TodoForm'
import { TopBar } from './components/TopBar'

function App() {
  const {
    todoTree,
    stats,
    users,
    selectedUserIds,
    setSelectedUserIds,
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

  const toggleUserSelection = (userId: number) => {
    setSelectedUserIds((prev: number[]) =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-300 px-4 sm:px-6">
      <TopBar
        stats={stats}
        users={users}
        selectedUserIds={selectedUserIds}
        toggleUserSelection={toggleUserSelection}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      <div className="max-w-4xl mx-auto py-8 lg:pt-16">
        <div className="space-y-8 sm:space-y-10">
          <div className="relative pt-0 sm:pt-0">
            <TodoForm
              onAddTodo={(text) => addTodo(text)}
              onSearch={setSearchQuery}
              searchQuery={searchQuery}
              showCompleted={showCompleted}
              onToggleCompleted={() => setShowCompleted(!showCompleted)}
            />
          </div>

          <div className="w-full">
            <TodoTree
              tree={todoTree}
              expanded={expanded}
              subtaskInputs={subtaskInputs}
              onToggleExpand={(id) => setExpanded((prev: Record<number, boolean>) => ({ ...prev, [id]: !prev[id] }))}
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
