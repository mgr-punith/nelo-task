// /components/TaskForm.tsx
"use client";

import { useState, FormEvent } from "react";
import { Priority } from "@prisma/client";

type Props = {
  onCreated: () => void;
};

const defaultForm = {
  title: "",
  description: "",
  priority: "MEDIUM" as Priority,
  dueDate: "",
};

const getUserIdFromToken = (): number | null => {
  if (typeof window === 'undefined') return null;
  
  const token = sessionStorage.getItem('taskflow_jwt_token');
  if (!token) {
    console.error('No token found in sessionStorage');
    return null;
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('Decoded token payload:', payload);
    return payload.userId || null;
  } catch (e) {
    console.error('Error decoding token:', e);
    return null;
  }
};

export default function TaskForm({ onCreated }: Props) {
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.title || !form.priority || !form.dueDate) {
      setError("Title, Priority and Due Date are required.");
      return;
    }

    const userId = getUserIdFromToken();
    console.log('Retrieved userId:', userId);

    if (!userId) {
      setError("You must be logged in to create tasks.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, userId }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok || !data.success) {
        setError(data.message || "Failed to create task.");
        return;
      }

      setForm(defaultForm);
      onCreated();
    } catch (err) {
      setLoading(false);
      setError("Network error. Please try again.");
      console.error(err);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <h2 className="text-xl font-bold mb-4 text-gray-900">Create Task</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          className="border p-2 mb-2 w-full rounded text-gray-900"
          placeholder="Task Title"
          required
        />
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          className="border p-2 mb-2 w-full rounded text-gray-900"
          placeholder="Description"
        />
        <div className="grid grid-cols-2 gap-2">
          <select
            name="priority"
            value={form.priority}
            onChange={handleChange}
            className="border p-2 mb-2 w-full rounded text-gray-900"
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
            className="border p-2 mb-2 w-full rounded text-gray-900"
            required
          />
        </div>
        {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Adding..." : "Add Task"}
        </button>
      </form>
    </div>
  );
}
