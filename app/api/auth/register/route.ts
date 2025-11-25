import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateToken } from "@/lib/jwt";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json(
      { success: false, message: "Email and password are required." },
      { status: 400 }
    );
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    return NextResponse.json(
      { success: false, message: "User already exists. Please login." },
      { status: 409 }
    );
  }

  // Create new user
  const user = await prisma.user.create({
    data: { email, password },
  });

  // Generate JWT token
  const token = generateToken({
    userId: user.id,
    email: user.email,
  });

  return NextResponse.json({
    success: true,
    message: "Account created successfully!",
    token,
    user: { id: user.id, email: user.email },
  });
}
