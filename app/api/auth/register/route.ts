import { NextResponse } from "next/server";
import { hash } from "bcrypt";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { name, email, password, useOtp } = await request.json();
    console.log("Registration attempt for:", email);

    // Validation
    if (!name || !email || !password) {
      console.log("Missing required fields");
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log("Invalid email format");
      return NextResponse.json(
        { message: "Please provide a valid email address" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log("Email already registered:", email);
      return NextResponse.json(
        { message: "Email already registered" },
        { status: 409 }
      );
    }

    // Password strength check
    if (password.length < 8) {
      return NextResponse.json(
        { message: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await hash(password, 10);

    try {
      // Create the user
      const user = await db.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          useOtp: Boolean(useOtp), // Ensure boolean type
          role: "user",
        },
      });

      console.log("User registered successfully:", user.id);

      // Return success without exposing sensitive data
      return NextResponse.json(
        {
          message: "User registered successfully",
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
          },
        },
        { status: 201 }
      );
    } catch (dbError: any) {
      console.error("Database error during registration:", dbError);
      
      // Handle specific database errors
      if (dbError.code === "P2002") {
        return NextResponse.json(
          { message: "This email is already registered" },
          { status: 409 }
        );
      }
      
      throw dbError; // Re-throw to be caught by outer catch
    }
  } catch (error: any) {
    console.error("Registration error:", error);
    
    // Return a more descriptive error message for debugging
    return NextResponse.json(
      { 
        message: "Error creating user", 
        details: process.env.NODE_ENV === "development" ? error.message : undefined
      },
      { status: 500 }
    );
  }
}