"use client";

import { useEffect, useState } from "react";
import TaskForm from "@/components/TaskForm";
import TaskCard from "@/components/TaskCard";
import Filters from "@/components/Filters";
import useDebounce from "@/hooks/useDebounce";
import type { Task } from "@prisma/client";
import { Shield } from "lucide-react";
import { useJWTSession } from "@/hooks/useJWTSession";

export default function DashboardPage() {
  const { user, loading, logout, checkProtected, isAuthenticated, token } =
    useJWTSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [tasksLoading, setTasksLoading] = useState(false);

  useEffect(() => {
    checkProtected();
  }, [loading, isAuthenticated]);

  async function fetchTasks() {
    setTasksLoading(true);
    const url = `/api/tasks?filter=${filter}&search=${encodeURIComponent(
      debouncedSearch
    )}`;
    const res = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const data = await res.json();
    setTasks(data.tasks ?? []);
    setTasksLoading(false);
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchTasks();
    }
  }, [filter, debouncedSearch, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || tasks.length === 0) return;

    const checkPendingTasks = () => {
      const pendingCount = tasks.filter((t) => t.status === "PENDING").length;

      if (pendingCount > 0) {
        console.log(
          `📧 Email sent to ${user?.email} — You have ${pendingCount} pending task${
            pendingCount > 1 ? "s" : ""
          }`
        );
      } else {
        console.log(`✅ No pending tasks for ${user?.email}`);
      }
    };

    checkPendingTasks();

    const interval = setInterval(checkPendingTasks, 20 * 60 * 1000);

    return () => clearInterval(interval);
  }, [tasks, isAuthenticated, user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-100 p-4">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">
              Task Manager Dashboard
            </h1>
            <Shield className="h-5 w-5 text-green-600" />
          </div>
          <div className="flex items-center gap-3">
            {user && (
              <span className="text-sm text-gray-600">{user.email}</span>
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

        {tasksLoading ? (
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
