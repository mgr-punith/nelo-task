// /app/page.tsx
'use client'

import { useEffect, useState } from 'react'
import TaskForm from '@/components/TaskForm'
import TaskCard from '@/components/TaskCard'
import type { Task } from '@prisma/client'

export default function HomePage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)

  const loadTasks = async () => {
    setLoading(true)
    const res = await fetch('/api/tasks')
    const data = await res.json()
    setTasks(data.tasks ?? [])
    setLoading(false)
  }

  useEffect(() => {
    loadTasks()
  }, [])

  return (
    <main className="min-h-screen bg-gray-100 p-4">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-4 text-2xl font-bold">Task Manager</h1>
        <TaskForm onCreated={loadTasks} />
        {loading ? (
          <p>Loading tasks...</p>
        ) : tasks.length === 0 ? (
          <p className="text-sm text-gray-600">No tasks yet. Add your first one.</p>
        ) : (
          <div className="mt-4 grid gap-3">
            {tasks.map(t => (
              <TaskCard key={t.id} task={t} onChanged={loadTasks} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
