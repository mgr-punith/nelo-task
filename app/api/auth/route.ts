import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json(
      { success: false, message: "Email and password required." },
      { status: 400 }
    );
  }

  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    const hashedPassword = await bcrypt.hash(password, 10);

    user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    return NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email },
      message: "User created successfully.",
    });
  }

  const validPassword = await bcrypt.compare(password, user.password);

  if (!validPassword) {
    return NextResponse.json(
      { success: false, message: "Invalid credentials." },
      { status: 401 }
    );
  }

  return NextResponse.json({
    success: true,
    user: { id: user.id, email: user.email },
    message: "Login successful.",
  });
}
