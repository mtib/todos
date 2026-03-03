import { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

interface TodoFormProps {
    onAddTodo: (text: string) => void
    onSearch: (query: string) => void
    searchQuery: string
}

export function TodoForm({
    onAddTodo,
    onSearch,
    searchQuery
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
            <Button
                variant="ghost"
                size="icon"
                onClick={toggleMode}
                className={cn("h-10 w-10 shrink-0 rounded-full", isSearchMode && "bg-primary text-primary-foreground")}
            >
                <Search className="h-5 w-5" />
            </Button>

            <form onSubmit={handleSubmit} className="flex-1 flex gap-2">
                <Input
                    placeholder={isSearchMode ? "Search by label (@name), text, or T<id>..." : "What needs to be done?"}
                    value={isSearchMode ? searchQuery : text}
                    onChange={(e) => isSearchMode ? onSearch(e.target.value) : setText(e.target.value)}
                    className="flex-1 h-10 text-base px-4 border shadow-sm rounded-full bg-background/50 focus:bg-background transition-all"
                    autoFocus={isSearchMode}
                />
                {!isSearchMode && (
                    <Button type="submit" size="icon" className="h-10 w-10 shrink-0 rounded-full shadow-md">
                        <Plus className="h-5 w-5" />
                    </Button>
                )}
            </form>
        </div>
    )
}
