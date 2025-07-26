import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Additional server-side validations can go here
    // For example: check if user is banned, rate limiting, etc.

    return NextResponse.json({
      success: true,
      message: 'Validation passed'
    });

  } catch (error: any) {
    console.error('Validation error:', error);
    
    return NextResponse.json(
      { error: 'Validation failed' },
      { status: 500 }
    );
  }
}