// /app/api/tasks/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Priority, Status } from "@prisma/client";

// Helper to extract userId from token
const getUserIdFromToken = (authHeader: string | null): number | null => {
  if (!authHeader?.startsWith("Bearer ")) return null;
  try {
    const token = authHeader.replace("Bearer ", "");
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.userId;
  } catch {
    return null;
  }
};

// Helper to verify task ownership
const verifyTaskOwnership = async (taskId: number, userId: number) => {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task || task.userId !== userId) {
    throw new Error("Task not found or unauthorized");
  }
  return task;
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const filter = searchParams.get("filter") || "all";
  const search = searchParams.get("search")?.toLowerCase() || "";

  const userId = getUserIdFromToken(req.headers.get("Authorization"));
  if (!userId) return NextResponse.json({ tasks: [] });

  const where: any = { userId };

  // Apply filter
  if (filter === "completed" || filter === "pending") {
    where.status = filter.toUpperCase() as Status;
  } else if (["HIGH", "MEDIUM", "LOW"].includes(filter)) {
    where.priority = filter as Priority;
  }

  // Apply search
  if (search) {
    //Elastic Search Flow
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const tasks = await prisma.task.findMany({
    where,
    orderBy: { dueDate: "asc" },
  });
  return NextResponse.json({ tasks });
}

export async function POST(req: Request) {
  const body = await req.json();
  let { title, description, priority, dueDate, userId } = body;

  // If userId not provided, extract from Authorization header
  if (!userId) {
    const authHeader = req.headers.get("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        userId = payload.userId;
      } catch (e) {}
    }
  }

  if (!title || !priority || !dueDate) {
    return NextResponse.json(
      { success: false, message: "Title, priority and due date are required." },
      { status: 400 }
    );
  }

  if (!userId) {
    return NextResponse.json(
      { success: false, message: "User ID is required." },
      { status: 401 }
    );
  }

  if (!Object.values(Priority).includes(priority)) {
    return NextResponse.json(
      { success: false, message: "Invalid priority." },
      { status: 400 }
    );
  }

  const task = await prisma.task.create({
    data: {
      title,
      description: description ?? "",
      priority,
      dueDate: new Date(dueDate),
      status: Status.PENDING,
      userId,
    },
  });

  return NextResponse.json({ success: true, task });
}

export async function PUT(req: Request) {
  const { id, userId, ...updates } = await req.json();

  if (!id) {
    return NextResponse.json(
      { success: false, message: "Task id is required." },
      { status: 400 }
    );
  }

  try {
    await verifyTaskOwnership(Number(id), userId);
  } catch {
    return NextResponse.json(
      { success: false, message: "Task not found or unauthorized." },
      { status: 403 }
    );
  }

  // Validate and build data object
  const data: any = {};
  if (updates.title !== undefined) data.title = updates.title;
  if (updates.description !== undefined) data.description = updates.description;
  if (updates.dueDate !== undefined) data.dueDate = new Date(updates.dueDate);

  if (updates.priority !== undefined) {
    if (!Object.values(Priority).includes(updates.priority)) {
      return NextResponse.json(
        { success: false, message: "Invalid priority." },
        { status: 400 }
      );
    }
    data.priority = updates.priority;
  }

  if (updates.status !== undefined) {
    if (!Object.values(Status).includes(updates.status)) {
      return NextResponse.json(
        { success: false, message: "Invalid status." },
        { status: 400 }
      );
    }
    data.status = updates.status;
  }

  const task = await prisma.task.update({ where: { id: Number(id) }, data });
  return NextResponse.json({ success: true, task });
}

export async function DELETE(req: Request) {
  const { id, userId } = await req.json();

  if (!id) {
    return NextResponse.json(
      { success: false, message: "Task id is required." },
      { status: 400 }
    );
  }

  try {
    await verifyTaskOwnership(Number(id), userId);
  } catch {
    return NextResponse.json(
      { success: false, message: "Task not found or unauthorized." },
      { status: 403 }
    );
  }

  await prisma.task.delete({ where: { id: Number(id) } });
  return NextResponse.json({ success: true });
}
