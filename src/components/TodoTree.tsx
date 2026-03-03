import type { TodoNode } from '../types/todo'
import { TodoItem } from './TodoItem'

interface TodoTreeProps {
    tree: TodoNode[]
    expanded: Record<number, boolean>
    subtaskInputs: Record<number, string>
    onToggleExpand: (id: number) => void
    onToggleTodo: (id: number, completed: boolean) => void
    onDeleteTodo: (id: number) => void
    onRenameTodo: (id: number, text: string) => void
    onUpdateTodo: (id: number, updates: { description?: string }) => void
    onAddSubtask: (text: string, parentId: number) => void
    onToggleRecursive: (node: TodoNode, expand: boolean) => void
    onSubtaskInputChange: (parentId: number, text: string) => void
}

export function TodoTree({
    tree,
    expanded,
    subtaskInputs,
    onToggleExpand,
    onToggleTodo,
    onDeleteTodo,
    onRenameTodo,
    onUpdateTodo,
    onAddSubtask,
    onToggleRecursive,
    onSubtaskInputChange
}: TodoTreeProps) {
    const renderTodo = (node: TodoNode, depth: number = 0) => (
        <TodoItem
            key={node.id}
            node={node}
            depth={depth}
            isExpanded={!!expanded[node.id]}
            onToggleExpand={onToggleExpand}
            onToggleTodo={onToggleTodo}
            onDeleteTodo={onDeleteTodo}
            onRenameTodo={onRenameTodo}
            onUpdateTodo={onUpdateTodo}
            onAddSubtask={onAddSubtask}
            onToggleRecursive={onToggleRecursive}
            subtaskInput={subtaskInputs[node.id] || ''}
            onSubtaskInputChange={onSubtaskInputChange}
            renderChildren={renderTodo}
        />
    )

    if (tree.length === 0) {
        return (
            <div className="text-center py-20 border-2 border-dashed rounded-xl bg-muted/20">
                <p className="text-muted-foreground text-lg">No tasks categorized yet.</p>
                <p className="text-xs text-muted-foreground mt-1">Start by adding a root task above.</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {tree.map((node) => renderTodo(node))}
        </div>
    )
}
