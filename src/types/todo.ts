export interface Todo {
    id: number
    text: string
    description?: string
    labels?: string[]
    completed: boolean
    parent_id: number | null
    created_at: string
}

export interface TodoNode extends Todo {
    children: TodoNode[]
    progress: number
    childCount: number
}
