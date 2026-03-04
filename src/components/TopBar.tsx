import { Moon, Sun, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"

const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const TopBar = ({
    stats,
    users,
    selectedUserIds,
    toggleUserSelection,
    theme,
    toggleTheme
}: {
    stats: {
        username: string,
        currentUserTasks: number,
        taskCount: number,
        dbSize: number,
        memory: number
    },
    users: {
        id: number,
        username: string
    }[],
    selectedUserIds: number[],
    toggleUserSelection: (userId: number) => void,
    theme: 'light' | 'dark',
    toggleTheme: () => void
}) => {
    return (
        <>
            <div className="lg:hidden flex justify-between items-center">
                {/* User Selector */}
                <div className="group">
                    <div className="flex flex-col gap-2">
                        <div className="bg-background/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl p-1.5 shadow-xl flex flex-col max-h-[400px] overflow-y-auto w-12 group-hover:w-48 transition-all duration-300 ease-in-out">
                            <div className="flex items-center gap-3 p-2 text-muted-foreground">
                                <Users className="h-5 w-5 shrink-0" />
                                <span className="text-xs font-bold truncate opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Filter Users</span>
                            </div>

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
                                            <span className="text-xs truncate opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                {user.username}
                                            </span>
                                        </label>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* System Stats */}
                {stats && (
                    <div className="text-[10px] font-mono text-muted-foreground/40 space-x-3 bg-background/20 backdrop-blur-[2px] px-4 py-1.5 rounded-full border border-slate-200/10 shadow-sm flex items-center">
                        <span className="flex items-center gap-1.5">
                            <span className="text-primary/60">{stats.username}:</span>
                            <span className="font-bold text-foreground/60">{stats.currentUserTasks}/{stats.taskCount}</span>
                        </span>
                        <span className="w-px h-3 bg-slate-200/10" />
                        <span>DB: {formatBytes(stats.dbSize)}</span>
                        <span>Mem: {formatBytes(stats.memory)}</span>
                    </div>
                )}

                {/* Theme Toggle */}
                <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full shadow-sm bg-background/50 backdrop-blur-sm border hover:bg-muted transition-colors h-10 w-10">
                    {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                </Button>
            </div>

            <div className="hidden lg:block">
                {/* System Stats - Center Top */}
                {stats && (
                    <div className="fixed top-2 left-0 right-0 z-40 flex justify-center pointer-events-none">
                        <div className="text-[10px] font-mono text-muted-foreground/40 space-x-3 bg-background/20 backdrop-blur-[2px] px-4 py-1.5 rounded-full border border-slate-200/10 shadow-sm flex items-center">
                            <span className="flex items-center gap-1.5">
                                <span className="text-primary/60">{stats.username}:</span>
                                <span className="font-bold text-foreground/60">{stats.currentUserTasks}/{stats.taskCount}</span>
                            </span>
                            <span className="w-px h-3 bg-slate-200/10" />
                            <span>DB: {formatBytes(stats.dbSize)}</span>
                            <span>Mem: {formatBytes(stats.memory)}</span>
                        </div>
                    </div>
                )}

                {/* User Selector - Top Left */}
                <div className="fixed top-4 left-4 z-50 group">
                    <div className="flex flex-col gap-2">
                        <div className="bg-background/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl p-1.5 shadow-xl flex flex-col max-h-[400px] overflow-y-auto w-12 group-hover:w-48 transition-all duration-300 ease-in-out">
                            <div className="flex items-center gap-3 p-2 text-muted-foreground">
                                <Users className="h-5 w-5 shrink-0" />
                                <span className="text-xs font-bold truncate opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Filter Users</span>
                            </div>

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
                                            <span className="text-xs truncate opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                {user.username}
                                            </span>
                                        </label>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Theme Toggle - Positioned for mobile accessibility without overlap */}
                <div className="fixed top-4 right-4 z-50 sm:top-6 sm:right-6">
                    <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full shadow-sm bg-background/50 backdrop-blur-sm border hover:bg-muted transition-colors h-10 w-10">
                        {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                    </Button>
                </div>
            </div>
        </>
    )
}
