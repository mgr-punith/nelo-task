// /components/TaskForm.tsx
'use client'

import { useState } from 'react'
import type { Priority } from '@prisma/client'

const defaultForm = {
  title: '',
  description: '',
  priority: 'MEDIUM' as Priority,
  dueDate: '',
}

type Props = {
  onCreated: () => void
}

export default function TaskForm({ onCreated }: Props) {
  const [form, setForm] = useState(defaultForm)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!form.title || !form.priority || !form.dueDate) {
      setError('Title, Priority and Due Date are required.')
      return
    }

    setLoading(true)
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setLoading(false)

    if (!res.ok || !data.success) {
      setError(data.message || 'Failed to create task.')
      return
    }

    setForm(defaultForm) // clear form after submit
    onCreated()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 rounded-lg bg-white p-6 shadow"
    >
      <h2 className="mb-4 text-lg font-semibold">Create Task</h2>

      <input
        name="title"
        value={form.title}
        onChange={handleChange}
        placeholder="Title"
        className="mb-3 w-full rounded border p-2"
        required
      />

      <textarea
        name="description"
        value={form.description}
        onChange={handleChange}
        placeholder="Description"
        className="mb-3 w-full rounded border p-2"
      />

      <div className="mb-3 flex flex-col gap-3 sm:flex-row">
        <select
          name="priority"
          value={form.priority}
          onChange={handleChange}
          className="w-full rounded border p-2 sm:w-1/2"
          required
        >
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>

        <input
          type="date"
          name="dueDate"
          value={form.dueDate}
          onChange={handleChange}
          className="w-full rounded border p-2 sm:w-1/2"
          required
        />
      </div>

      {error && <p className="mb-2 text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {loading ? 'Saving...' : 'Add Task'}
      </button>
    </form>
  )
}
