import { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Trash2, Plus, ChevronDown, ChevronRight, FileText, Link as LinkIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TodoNode } from '../types/todo'
import ReactMarkdown from 'react-markdown'

interface TodoItemProps {
    node: TodoNode
    depth?: number
    isExpanded: boolean
    onToggleExpand: (id: number) => void
    onToggleTodo: (id: number, completed: boolean) => void
    onDeleteTodo: (id: number) => void
    onRenameTodo: (id: number, text: string) => void
    onUpdateTodo: (id: number, updates: { description?: string }) => void
    onAddSubtask: (text: string, parentId: number) => void
    onToggleRecursive: (node: TodoNode, expand: boolean) => void
    subtaskInput: string
    onSubtaskInputChange: (parentId: number, text: string) => void
    renderChildren: (node: TodoNode, depth: number) => React.ReactNode
}

export function TodoItem({
    node,
    depth = 0,
    isExpanded,
    onToggleExpand,
    onToggleTodo,
    onDeleteTodo,
    onRenameTodo,
    onUpdateTodo,
    onAddSubtask,
    onToggleRecursive,
    subtaskInput,
    onSubtaskInputChange,
    renderChildren
}: TodoItemProps) {
    const [editingId, setEditingId] = useState<number | null>(null)
    const [editingText, setEditingText] = useState('')
    const [showDescription, setShowDescription] = useState(false)
    const [editingDescription, setEditingDescription] = useState(false)
    const [descriptionText, setDescriptionText] = useState(node.description || '')

    const hasChildren = node.children.length > 0

    const handleRename = () => {
        if (editingText.trim() && editingText !== node.text) {
            onRenameTodo(node.id, editingText)
        }
        setEditingId(null)
    }

    const handleDescriptionSubmit = () => {
        onUpdateTodo(node.id, { description: descriptionText })
        setEditingDescription(false)
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
    }

    // Component to render labels in markdown
    const MarkdownComponents = {
        p: ({ children }: any) => {
            const processChild = (child: any): any => {
                if (typeof child === 'string') {
                    const parts = child.split(/(@\w+)/g);
                    return parts.map((part, i) =>
                        part.startsWith('@') ? <span key={i} className="todo-label">{part}</span> : part
                    );
                }
                return child;
            };

            const content = Array.isArray(children) ? children.map(processChild) : processChild(children);
            return <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed m-0">{content}</p>;
        }
    }

    const handleDescriptionToggle = (e: React.MouseEvent) => {
        e.stopPropagation()
        setShowDescription(!showDescription)
        if (!showDescription && !node.description) {
            setEditingDescription(true)
        }
    }

    const handleDescriptionClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (!editingDescription) {
            setDescriptionText(node.description || '')
            setEditingDescription(true)
        }
    }

    return (
        <div className="group/item py-1">
            <div
                style={{ marginLeft: `${Math.min(depth * 16, 120)}px` }}
                className={cn(
                    "flex flex-col rounded-lg transition-all duration-200 border relative overflow-hidden",
                    "bg-card/40 dark:bg-card/10 border-slate-200 dark:border-slate-800 shadow-sm",
                    depth > 0 ? "border-l-primary/40" : "border-slate-200 dark:border-slate-800",
                    "hover:border-slate-300 dark:hover:border-slate-700 hover:bg-card/60 dark:hover:bg-card/15 hover:shadow-md",
                    "active:scale-[0.99] md:active:scale-100 transition-transform",
                    node.completed && "opacity-80"
                )}
            >
                {/* Main Header Row */}
                <div className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2.5">
                    <div
                        className="cursor-pointer text-muted-foreground hover:text-foreground shrink-0 transition-transform active:scale-95 p-1"
                        onClick={() => onToggleExpand(node.id)}
                    >
                        {hasChildren ? (
                            isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
                        ) : (
                            <div className="w-4" />
                        )}
                    </div>

                    <Checkbox
                        checked={!!node.completed}
                        onCheckedChange={() => onToggleTodo(node.id, !!node.completed)}
                        className="h-5 w-5 sm:h-4 sm:w-4 shrink-0 transition-shadow"
                    />

                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                        <div
                            className="hidden sm:flex items-center gap-1 bg-muted/60 rounded px-1.5 py-0.5 group/id cursor-pointer hover:bg-muted transition-colors shrink-0"
                            onClick={(e) => {
                                e.stopPropagation()
                                copyToClipboard(`T${node.id}`)
                            }}
                            title="Copy ID"
                        >
                            <LinkIcon className="h-2.5 w-2.5 text-muted-foreground/70" />
                            <span className="text-[10px] font-mono text-muted-foreground leading-none">
                                T{node.id}
                            </span>
                        </div>

                        <div className="flex-1 min-w-0">
                            {editingId === node.id ? (
                                <Input
                                    autoFocus
                                    value={editingText}
                                    onChange={(e) => setEditingText(e.target.value)}
                                    onBlur={handleRename}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleRename()
                                        if (e.key === 'Escape') setEditingId(null)
                                    }}
                                    className="h-7 py-0 px-1 text-sm bg-background border-none focus-visible:ring-1"
                                />
                            ) : (
                                <span
                                    className={cn(
                                        "text-sm font-medium cursor-text truncate block select-none",
                                        node.completed && "line-through text-muted-foreground/60"
                                    )}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setEditingId(node.id)
                                        setEditingText(node.text)
                                    }}
                                >
                                    {node.text}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover/item:opacity-100 transition-opacity shrink-0">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleDescriptionToggle}
                            className={cn(
                                "h-8 w-8 sm:h-7 sm:w-7 rounded-md",
                                (showDescription || node.description) ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-muted"
                            )}
                        >
                            <FileText className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                        </Button>

                        <form
                            onSubmit={(e) => {
                                e.preventDefault()
                                onAddSubtask(subtaskInput, node.id)
                            }}
                            className="flex items-center space-x-1"
                        >
                            <Input
                                placeholder="Add..."
                                value={subtaskInput}
                                onChange={(e) => onSubtaskInputChange(node.id, e.target.value)}
                                className="h-8 w-8 sm:h-7 sm:w-20 text-[11px] bg-muted/20 border-dashed focus:w-40 transition-all p-1.5 border-slate-200 dark:border-slate-800"
                            />
                            <Button type="submit" variant="ghost" size="icon" className="hidden sm:flex h-7 w-7 rounded-md hover:bg-primary/10 hover:text-primary">
                                <Plus className="h-3.5 w-3.5" />
                            </Button>
                        </form>

                        {hasChildren && (
                            <div className="flex items-center h-6 border-l border-slate-200 dark:border-slate-800 ml-1 pl-1.5 gap-1.5">
                                <div
                                    className="text-[10px] font-bold text-muted-foreground w-7 text-center cursor-help"
                                    title={`${node.progress}% complete`}
                                >
                                    {node.progress}%
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 rounded-md"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onToggleRecursive(node, !isExpanded)
                                    }}
                                    title={isExpanded ? "Collapse All" : "Expand All"}
                                >
                                    {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                                </Button>
                            </div>
                        )}

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                                e.stopPropagation()
                                onDeleteTodo(node.id)
                            }}
                            className="h-8 w-8 sm:h-7 sm:w-7 rounded-md text-destructive hover:bg-destructive/10"
                        >
                            <Trash2 className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                        </Button>
                    </div>
                </div>

                {/* Seamless Integrated Description Section */}
                {(showDescription || (node.description && !editingDescription)) && (
                    <div className="px-3 sm:px-10 pb-4">
                        {editingDescription ? (
                            <div className="flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
                                <textarea
                                    autoFocus
                                    className="w-full text-[16px] sm:text-sm bg-background p-3 rounded-md border border-slate-200 dark:border-slate-800 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
                                    value={descriptionText}
                                    onChange={(e) => setDescriptionText(e.target.value)}
                                    placeholder="Add description..."
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleDescriptionSubmit()
                                        if (e.key === 'Escape') setEditingDescription(false)
                                    }}
                                    onBlur={() => {
                                        if (descriptionText === (node.description || '')) {
                                            setEditingDescription(false)
                                        }
                                    }}
                                />
                                <div className="flex justify-end gap-2">
                                    <Button variant="ghost" size="sm" className="h-8 text-xs px-3" onClick={() => setEditingDescription(false)}>Cancel</Button>
                                    <Button size="sm" className="h-8 text-xs px-4" onClick={handleDescriptionSubmit}>Save</Button>
                                </div>
                            </div>
                        ) : node.description ? (
                            <div
                                className="cursor-text group/desc relative border-t border-slate-100 dark:border-slate-800/50 pt-3"
                                onClick={handleDescriptionClick}
                            >
                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                    <ReactMarkdown components={MarkdownComponents}>
                                        {node.description}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        ) : showDescription && (
                            <div className="border-t border-slate-100 dark:border-slate-800/50 pt-3">
                                <Button
                                    variant="ghost"
                                    className="h-10 sm:h-8 w-full border border-dashed text-xs text-muted-foreground hover:text-foreground"
                                    onClick={() => setEditingDescription(true)}
                                >
                                    Add a description...
                                </Button>
                            </div>
                        )}
                    </div>
                )}

                {/* Progress Bar along the bottom */}
                {hasChildren && (
                    <div className="absolute bottom-0 left-0 right-0 h-[4px] sm:h-[3px] bg-slate-100/30 dark:bg-purple-900/10">
                        <div
                            className="h-full bg-purple-600 shadow-[0_0_10px_rgba(168,85,247,0.5)] transition-all duration-700 ease-in-out"
                            style={{ width: `${node.progress}%` }}
                        />
                    </div>
                )}
            </div>

            {isExpanded && node.children.length > 0 && (
                <div className="mt-1">
                    {node.children.map(child => renderChildren(child, depth + 1))}
                </div>
            )}
        </div>
    )
}
