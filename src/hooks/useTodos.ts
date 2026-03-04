import { useState, useEffect, useMemo, useCallback } from 'react'
import type { Todo, TodoNode } from '../types/todo'
import { api } from '../lib/api'

export interface SystemStats {
    taskCount: number;
    currentUserTasks: number;
    dbSize: number;
    memory: number;
    username: string;
}

export interface User {
    id: number;
    username: string;
}

export function useTodos() {
    const [todos, setTodos] = useState<Todo[]>([])
    const [users, setUsers] = useState<User[]>([])
    const [stats, setStats] = useState<SystemStats | null>(null)
    const [expanded, setExpanded] = useState<Record<number, boolean>>({})
    const [subtaskInputs, setSubtaskInputs] = useState<Record<number, string>>({})
    const [isLoading, setIsLoading] = useState(true)
    const [showCompleted, setShowCompleted] = useState<boolean>(() => {
        const saved = localStorage.getItem('showCompleted')
        return saved === null ? true : saved === 'true'
    })

    const [selectedUserIds, setSelectedUserIds] = useState<number[]>(() => {
        const saved = localStorage.getItem('selectedUserIds')
        return saved ? JSON.parse(saved) : []
    })

    const fetchData = useCallback(async () => {
        try {
            const [usersData, statsData] = await Promise.all([
                api.fetchUsers(),
                api.fetchStats()
            ])
            setUsers(usersData)
            setStats(statsData)

            // If no users selected, by default select all
            let currentSelected = selectedUserIds
            if (currentSelected.length === 0 && usersData.length > 0) {
                currentSelected = usersData.map((u: User) => u.id)
                setSelectedUserIds(currentSelected)
                localStorage.setItem('selectedUserIds', JSON.stringify(currentSelected))
            }

            const todosData = await api.fetchTodos(currentSelected)
            setTodos(todosData)
        } catch (error) {
            console.error("Failed to fetch data:", error)
        } finally {
            setIsLoading(false)
        }
    }, [selectedUserIds])

    useEffect(() => {
        localStorage.setItem('showCompleted', String(showCompleted))
    }, [showCompleted])

    useEffect(() => {
        localStorage.setItem('selectedUserIds', JSON.stringify(selectedUserIds))
    }, [selectedUserIds])

    useEffect(() => {
        fetchData()

        const socket = api.getWebSocket(fetchData)

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                fetchData()
            }
        }
        document.addEventListener('visibilitychange', handleVisibilityChange)

        return () => {
            socket.close()
            document.removeEventListener('visibilitychange', handleVisibilityChange)
        }
    }, [fetchData])

    const addTodo = async (text: string, parentId: number | null = null) => {
        if (!text.trim()) return

        try {
            await api.addTodo(text, parentId)
            if (parentId !== null) {
                setSubtaskInputs(prev => ({ ...prev, [parentId]: '' }))
                setExpanded(prev => ({ ...prev, [parentId]: true }))
            }
            fetchData()
        } catch (error) {
            console.error("Failed to add todo:", error)
        }
    }

    const updateTodo = async (id: number, updates: { text?: string; completed?: boolean; description?: string }) => {
        try {
            await api.updateTodo(id, updates)
            fetchData()
        } catch (error) {
            console.error("Failed to update todo:", error)
        }
    }

    const renameTodo = async (id: number, text: string) => {
        if (!text.trim()) return
        updateTodo(id, { text })
    }

    const toggleTodo = async (id: number, completed: boolean) => {
        updateTodo(id, { completed: !completed })
    }

    const deleteTodo = async (id: number) => {
        try {
            await api.deleteTodo(id)
            fetchData()
        } catch (error) {
            console.error("Failed to delete todo:", error)
        }
    }

    const toggleRecursive = (node: TodoNode, expand: boolean) => {
        const idsToToggle: Record<number, boolean> = {}
        const traverse = (n: TodoNode) => {
            idsToToggle[n.id] = expand
            n.children.forEach(traverse)
        }
        traverse(node)
        setExpanded(prev => ({ ...prev, ...idsToToggle }))
    }

    const [searchQuery, setSearchQuery] = useState('')

    const todoTree = useMemo(() => {
        const q = searchQuery.trim().toLowerCase()
        const idMatch = q.match(/^t(\d+)$/)
        const searchId = idMatch ? parseInt(idMatch[1]) : null

        const filteredTodos = todos.filter(todo => {
            const isIdMatch = searchId === todo.id;

            if (!showCompleted && todo.completed && !isIdMatch) return false

            if (!q) return true
            if (isIdMatch) return true

            return todo.labels?.some(l => l.toLowerCase().includes(q)) ||
                todo.text.toLowerCase().includes(q) ||
                todo.description?.toLowerCase().includes(q)
        })

        const nodes: Record<number, TodoNode> = {}

        // Initial tree construction to get actual child counts
        todos.forEach(todo => {
            nodes[todo.id] = { ...todo, children: [], progress: 0, childCount: 0 }
        })

        todos.forEach(todo => {
            const node = nodes[todo.id]
            if (todo.parent_id && nodes[todo.parent_id]) {
                nodes[todo.parent_id].children.push(node)
                nodes[todo.parent_id].childCount++
            }
        })

        const visibleIds = new Set(filteredTodos.map(t => t.id))

        const calculateProgress = (node: TodoNode) => {
            if (node.children.length === 0) {
                return node.completed ? 100 : 0
            }
            const completedChildren = node.children.filter(child => child.completed).length
            node.progress = Math.round((completedChildren / node.children.length) * 100)
            node.children.forEach(calculateProgress)
        }

        const topLevelNodes: TodoNode[] = []
        todos.forEach(todo => {
            if (!todo.parent_id || !nodes[todo.parent_id]) {
                topLevelNodes.push(nodes[todo.id])
            }
        })

        topLevelNodes.forEach(calculateProgress)

        const filterBySearch = (nodes: TodoNode[]): TodoNode[] => {
            return nodes.filter(node => {
                const nodeMatches = visibleIds.has(node.id)
                const childrenMatch = filterBySearch(node.children)

                if (!q) {
                    if (nodeMatches) {
                        node.children = childrenMatch
                        return true
                    }
                    return false
                }

                if (nodeMatches || childrenMatch.length > 0) {
                    node.children = childrenMatch
                    return true
                }
                return false
            })
        }

        return (q || !showCompleted) ? filterBySearch(topLevelNodes) : topLevelNodes
    }, [todos, searchQuery, showCompleted])

    return {
        todos,
        todoTree,
        stats,
        users,
        selectedUserIds,
        setSelectedUserIds,
        expanded,
        setExpanded,
        subtaskInputs,
        setSubtaskInputs,
        isLoading,
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
    }
}
