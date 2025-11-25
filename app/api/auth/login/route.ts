// /app/api/auth/login/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const { email, password } = await req.json()

  if (!email || !password) {
    return NextResponse.json(
      { success: false, message: 'Email and password are required.' },
      { status: 400 }
    )
  }

  // Find user
  const user = await prisma.user.findUnique({ where: { email } })

  if (!user) {
    return NextResponse.json(
      { success: false, message: 'User not found. Please register first.' },
      { status: 404 }
    )
  }

  // Check password
  if (user.password !== password) {
    return NextResponse.json(
      { success: false, message: 'Invalid password.' },
      { status: 401 }
    )
  }

  return NextResponse.json({
    success: true,
    user: { id: user.id, email: user.email },
  })
}
