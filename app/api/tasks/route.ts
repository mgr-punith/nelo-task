
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Priority, Status } from "@prisma/client";

export async function GET() {
  const tasks = await prisma.task.findMany({
    orderBy: { dueDate: "asc" },
  });
  return NextResponse.json({ tasks });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { title, description, priority, dueDate } = body;

  if (!title || !priority || !dueDate) {
    return NextResponse.json(
      { success: false, message: "Title, priority and due date are required." },
      { status: 400 }
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
    },
  });

  return NextResponse.json({ success: true, task });
}

export async function PUT(req: Request) {
  const body = await req.json();
  const { id, ...rest } = body;

  if (!id) {
    return NextResponse.json(
      { success: false, message: "Task id is required." },
      { status: 400 }
    );
  }

  const data: any = {};

  if (rest.title !== undefined) data.title = rest.title;
  if (rest.description !== undefined) data.description = rest.description;
  if (rest.priority !== undefined) {
    if (!Object.values(Priority).includes(rest.priority)) {
      return NextResponse.json(
        { success: false, message: "Invalid priority." },
        { status: 400 }
      );
    }
    data.priority = rest.priority;
  }
  if (rest.dueDate !== undefined) data.dueDate = new Date(rest.dueDate);
  if (rest.status !== undefined) {
    if (!Object.values(Status).includes(rest.status)) {
      return NextResponse.json(
        { success: false, message: "Invalid status." },
        { status: 400 }
      );
    }
    data.status = rest.status;
  }

  const updated = await prisma.task.update({
    where: { id: Number(id) },
    data,
  });

  return NextResponse.json({ success: true, task: updated });
}

export async function DELETE(req: Request) {
  const body = await req.json();
  const { id } = body;

  if (!id) {
    return NextResponse.json(
      { success: false, message: "Task id is required." },
      { status: 400 }
    );
  }

  await prisma.task.delete({
    where: { id: Number(id) },
  });

  return NextResponse.json({ success: true });
}
