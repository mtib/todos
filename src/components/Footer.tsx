import { Button } from "@/components/ui/button"

const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const Footer = ({
    stats,
}: {
    stats: {
        username: string,
        currentUserTasks: number,
        taskCount: number,
        dbSize: number,
        memory: number
    }
}) => {
    return (
        <div className="flex justify-center items-center w-full mt-4">
            {stats && (
                <div className="text-[10px] font-mono text-muted-foreground/60 space-x-4 bg-background/20 backdrop-blur-[2px] px-4 py-1.5 rounded-full border border-slate-200/10 shadow-sm flex items-center justify-center">
                    <span>{stats.username}: {stats.currentUserTasks}/{stats.taskCount}</span>
                    <span className="w-px h-3 bg-slate-200/20" />
                    <span>DB: {formatBytes(stats.dbSize)}</span>
                    <span className="w-px h-3 bg-slate-200/20" />
                    <span>Mem: {formatBytes(stats.memory)}</span>
                </div>
            )}
        </div>
    )
}
