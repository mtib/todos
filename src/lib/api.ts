const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const api = {
    async fetchTodos(userIds?: number[]) {
        let url = `${API_BASE_URL}/api/todos`;
        if (userIds && userIds.length > 0) {
            url += `?users=${userIds.join(',')}`;
        }
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch todos');
        return res.json();
    },

    async fetchStats() {
        const res = await fetch(`${API_BASE_URL}/api/stats`);
        if (!res.ok) throw new Error('Failed to fetch stats');
        return res.json();
    },

    async fetchUsers() {
        const res = await fetch(`${API_BASE_URL}/api/users`);
        if (!res.ok) throw new Error('Failed to fetch users');
        return res.json();
    },

    async addTodo(text: string, parentId: number | null = null) {
        const res = await fetch(`${API_BASE_URL}/api/todos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, parent_id: parentId }),
        });
        if (!res.ok) throw new Error('Failed to add todo');
        return res.json();
    },

    async updateTodo(id: number, updates: { text?: string; completed?: boolean; description?: string }) {
        const res = await fetch(`${API_BASE_URL}/api/todos/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
        });
        if (!res.ok) throw new Error('Failed to update todo');
        return res.json();
    },

    async renameTodo(id: number, text: string) {
        return this.updateTodo(id, { text });
    },

    async toggleTodo(id: number, completed: boolean) {
        return this.updateTodo(id, { completed: !completed });
    },

    async deleteTodo(id: number) {
        const res = await fetch(`${API_BASE_URL}/api/todos/${id}`, {
            method: 'DELETE',
        });
        if (!res.ok) throw new Error('Failed to delete todo');
    },

    getWebSocket(onUpdate: () => void) {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        let wsUrl: string;

        if (API_BASE_URL && (API_BASE_URL.startsWith('http://') || API_BASE_URL.startsWith('https://'))) {
            const url = new URL(API_BASE_URL);
            const wsProtocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
            wsUrl = `${wsProtocol}//${url.host}/api/ws`;
        } else {
            wsUrl = `${protocol}//${window.location.host}/api/ws`;
        }

        const socket = new WebSocket(wsUrl);
        socket.onmessage = (event) => {
            if (event.data === 'update') {
                onUpdate();
            }
        };
        return socket;
    }
};
