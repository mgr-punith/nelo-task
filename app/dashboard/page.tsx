"use client";

import { useEffect, useState } from "react";
import TaskForm from "@/components/TaskForm";
import TaskCard from "@/components/TaskCard";
import Filters from "@/components/Filters";
import useDebounce from "@/hooks/useDebounce";
import type { Task } from "@prisma/client";

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [loading, setLoading] = useState(false);

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
        <h1 className="mb-4 text-2xl font-bold">Task Manager Dashboard</h1>
        <TaskForm onCreated={fetchTasks} />
        <Filters filter={filter} setFilter={setFilter} />
        <input
          type="text"
          placeholder="Search tasks..."
          className="w-full p-2 mb-4 rounded border"
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
