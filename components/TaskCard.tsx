// /components/TaskCard.tsx
"use client";

import { useState } from "react";
import type { Task, Priority, Status } from "@prisma/client";

const priorityBadge: Record<Priority, string> = {
  HIGH: "bg-red-500",
  MEDIUM: "bg-yellow-500",
  LOW: "bg-green-500",
};

type Props = {
  task: Task;
  onChanged: () => void;
};

export default function TaskCard({ task, onChanged }: Props) {
  const [editing, setEditing] = useState(false);
  const [local, setLocal] = useState({
    title: task.title,
    description: task.description,
    priority: task.priority,
    dueDate: task.dueDate.toString().slice(0, 10),
  });
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setLocal((prev) => ({ ...prev, [name]: value }));
  };

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!local.title || !local.priority || !local.dueDate) return;
    setSaving(true);
    await fetch("/api/tasks", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: task.id,
        ...local,
      }),
    });
    setSaving(false);
    setEditing(false);
    onChanged();
  };

  const deleteTask = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    await fetch("/api/tasks", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: task.id }),
    });
    onChanged();
  };

  const toggleStatus = async () => {
    const nextStatus: Status =
      task.status === "COMPLETED" ? "PENDING" : "COMPLETED";
    await fetch("/api/tasks", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: task.id, status: nextStatus }),
    });
    onChanged();
  };

  return (
    <div className="flex flex-col gap-2 rounded-lg bg-white p-4 shadow">
      {editing ? (
        <form onSubmit={saveEdit}>
          <input
            name="title"
            value={local.title}
            onChange={handleChange}
            className="mb-2 w-full rounded border p-2"
            required
          />
          <textarea
            name="description"
            value={local.description}
            onChange={handleChange}
            className="mb-2 w-full rounded border p-2"
          />
          <div className="mb-2 flex flex-col gap-2 sm:flex-row">
            <select
              name="priority"
              value={local.priority}
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
              value={local.dueDate}
              onChange={handleChange}
              className="w-full rounded border p-2 sm:w-1/2"
              required
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded bg-gray-300 px-3 py-1 text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{task.title}</h3>
            <span
              className={`rounded px-2 py-1 text-xs font-semibold uppercase text-white ${
                priorityBadge[task.priority]
              }`}
            >
              {task.priority}
            </span>
          </div>
          <p className="text-sm text-gray-700">{task.description}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
            <span className="font-medium">
              Due: {new Date(task.dueDate).toLocaleDateString()}
            </span>
            <span
              className={`rounded px-2 py-1 font-semibold ${
                task.status === "COMPLETED"
                  ? "bg-green-600 text-white"
                  : "bg-gray-300 text-gray-800"
              }`}
            >
              {task.status === "COMPLETED" ? "Completed" : "Pending"}
            </span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => setEditing(true)}
              className="rounded bg-blue-500 px-3 py-1 text-xs font-medium text-white hover:bg-blue-600"
            >
              Edit
            </button>
            <button
              onClick={toggleStatus}
              className="rounded bg-purple-500 px-3 py-1 text-xs font-medium text-white hover:bg-purple-600"
            >
              {task.status === "COMPLETED" ? "Mark Pending" : "Mark Complete"}
            </button>
            <button
              onClick={deleteTask}
              className="rounded bg-red-500 px-3 py-1 text-xs font-medium text-white hover:bg-red-600"
            >
              {confirmDelete ? "Confirm Delete" : "Delete"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
