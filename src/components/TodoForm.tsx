import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus, Eye, EyeOff, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"

interface TodoFormProps {
    onAddTodo: (text: string) => void
    onSearch: (query: string) => void
    searchQuery: string
    showCompleted: boolean
    onToggleCompleted: () => void
    users: {
        id: number,
        username: string
    }[],
    selectedUserIds: number[],
    toggleUserSelection: (userId: number) => void
}

export function TodoForm({
    onAddTodo,
    onSearch,
    searchQuery,
    showCompleted,
    onToggleCompleted,
    users,
    selectedUserIds,
    toggleUserSelection,
}: TodoFormProps) {
    const [isUserFilterOpen, setIsUserFilterOpen] = useState(false)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            onAddTodo(searchQuery)
            onSearch('')
        }
    }

    return (
        <div className="flex items-center gap-2">
            {users.length > 1 && (
                <div className="relative">
                    <Button variant="ghost" size="icon" onClick={() => setIsUserFilterOpen(!isUserFilterOpen)} className="rounded-full shadow-sm bg-background/50 backdrop-blur-sm border hover:bg-muted transition-colors h-10 w-10">
                        <Users className="h-5 w-5" />
                    </Button>
                    {isUserFilterOpen && (
                        <div className="absolute top-12 left-0 bg-background z-50 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl p-1.5 shadow-xl flex flex-col max-h-[400px] overflow-y-auto w-48">
                            <div className="flex flex-col gap-0.5 mt-1">
                                {users.map(user => {
                                    const isSelected = selectedUserIds.includes(user.id)
                                    return (
                                        <label
                                            key={user.id}
                                            className={cn(
                                                "flex items-center gap-3 p-2 rounded-xl transition-all hover:bg-muted group/user cursor-pointer",
                                                isSelected ? "text-primary bg-primary/5" : "text-muted-foreground"
                                            )}
                                        >
                                            <Checkbox
                                                checked={isSelected}
                                                onCheckedChange={() => toggleUserSelection(user.id)}
                                                className="h-5 w-5 shrink-0"
                                            />
                                            <span className="text-xs truncate">
                                                {user.username}
                                            </span>
                                        </label>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}
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

            <form onSubmit={handleSubmit} className="flex-1 flex gap-2">
                <Input
                    placeholder="Search by label (@name), text, or T<id>... or add a new todo"
                    value={searchQuery}
                    onChange={(e) => onSearch(e.target.value)}
                    className="flex-1 h-10 text-base px-5 border shadow-sm rounded-full bg-background/50 focus:bg-background transition-all focus:ring-2 focus:ring-primary/20"
                />
                <Button type="submit" size="icon" className="h-10 w-10 shrink-0 rounded-full shadow-md hover:scale-105 transition-transform active:scale-95">
                    <Plus className="h-5 w-5" />
                </Button>
            </form>
        </div>
    )
}
