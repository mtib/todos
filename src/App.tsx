import { useEffect } from 'react'
import { useTodos } from './hooks/useTodos'
import { TodoTree } from './components/TodoTree'
import { TodoForm } from './components/TodoForm'
import { Footer } from './components/Footer'

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

  useEffect(() => {
    const root = window.document.documentElement
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    root.classList.toggle('dark', prefersDark)
    root.classList.toggle('light', !prefersDark)
  }, [])

  const toggleUserSelection = (userId: number) => {
    setSelectedUserIds((prev: number[]) =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-300 flex flex-col items-center p-4 sm:p-6">
      <div className="w-full max-w-4xl mt-4 flex-grow">
        <div className="space-y-8 sm:space-y-10">
          <div className="relative">
            <TodoForm
              onAddTodo={(text) => addTodo(text)}
              onSearch={setSearchQuery}
              searchQuery={searchQuery}
              showCompleted={showCompleted}
              onToggleCompleted={() => setShowCompleted(!showCompleted)}
              users={users}
              selectedUserIds={selectedUserIds}
              toggleUserSelection={toggleUserSelection}
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
      <Footer stats={stats} />
    </div>
  )
}

export default App
