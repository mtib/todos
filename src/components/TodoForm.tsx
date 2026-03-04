import { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Plus, Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"

interface TodoFormProps {
    onAddTodo: (text: string) => void
    onSearch: (query: string) => void
    searchQuery: string
    showCompleted: boolean
    onToggleCompleted: () => void
}

export function TodoForm({
    onAddTodo,
    onSearch,
    searchQuery,
    showCompleted,
    onToggleCompleted
}: TodoFormProps) {
    const [text, setText] = useState('')
    const [isSearchMode, setIsSearchMode] = useState(false)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (isSearchMode) return

        if (text.trim()) {
            onAddTodo(text)
            setText('')
        }
    }

    const toggleMode = () => {
        setIsSearchMode(!isSearchMode)
        if (isSearchMode) {
            onSearch('')
        }
    }

    return (
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 group/modes">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleMode}
                    className={cn(
                        "h-10 w-10 shrink-0 rounded-full transition-all",
                        isSearchMode ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                    )}
                    title={isSearchMode ? "Exit Search" : "Search Tasks"}
                >
                    <Search className="h-5 w-5" />
                </Button>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onToggleCompleted}
                    className={cn(
                        "h-10 w-10 shrink-0 rounded-full transition-all",
                        !showCompleted ? "bg-orange-500/10 text-orange-600 dark:text-orange-400" : "text-muted-foreground hover:bg-muted"
                    )}
                    title={showCompleted ? "Hide Completed" : "Show Completed"}
                >
                    {showCompleted ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 flex gap-2">
                <Input
                    placeholder={isSearchMode ? "Search by label (@name), text, or T<id>..." : "What needs to be done?"}
                    value={isSearchMode ? searchQuery : text}
                    onChange={(e) => isSearchMode ? onSearch(e.target.value) : setText(e.target.value)}
                    className="flex-1 h-10 text-base px-5 border shadow-sm rounded-full bg-background/50 focus:bg-background transition-all focus:ring-2 focus:ring-primary/20"
                    autoFocus={isSearchMode}
                />
                {!isSearchMode && (
                    <Button type="submit" size="icon" className="h-10 w-10 shrink-0 rounded-full shadow-md hover:scale-105 transition-transform active:scale-95">
                        <Plus className="h-5 w-5" />
                    </Button>
                )}
            </form>
        </div>
    )
}
