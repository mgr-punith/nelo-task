"use client";

import { useEffect, useState } from "react";
import TaskForm from "@/components/TaskForm";
import TaskCard from "@/components/TaskCard";
import Filters from "@/components/Filters";
import useDebounce from "@/hooks/useDebounce";
import type { Task } from "@prisma/client";
import { useSession } from "@/hooks/useSession";

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 700);
  const [loading, setLoading] = useState(false);
  const { checkProtected, logout, user } = useSession();

  useEffect(() => {
    checkProtected();
  }, []);

  async function fetchTasks() {
    setLoading(true);
    const url = `/api/tasks?filter=${filter}&search=${encodeURIComponent(
      debouncedSearch
    )}`;
    const res = await fetch(url);
    const data = await res.json();
    setTasks(data.tasks ?? []);
    setLoading(false);
  }

  useEffect(() => {
    fetchTasks();
  }, [filter, debouncedSearch]);

  return (
    <main className="min-h-screen bg-gray-100 p-4">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-800">Task Manager Dashboard</h1>
          <div className="flex items-center gap-3">
            {user && (
              <span className="text-sm text-gray-800">{user.email}</span>
            )}
            <button
              onClick={logout}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
        <TaskForm onCreated={fetchTasks} />
        <Filters filter={filter} setFilter={setFilter} />
        <input
          type="text"
          placeholder="Search tasks..."
          className="w-full p-2 mb-4 rounded border text-gray-900"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {loading ? (
          <p>Loading...</p>
        ) : tasks.length === 0 ? (
          <p className="text-gray-600">No tasks found.</p>
        ) : (
          <div className="grid gap-3">
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} onChanged={fetchTasks} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
