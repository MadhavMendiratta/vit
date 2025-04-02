import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { signJwtAccessToken } from "@/lib/jwt";

export async function POST(request: Request) {
  try {
    const { email, otp } = await request.json();
    
    // Validate input
    if (!email || !otp) {
      return NextResponse.json(
        { message: "Email and OTP are required" },
        { status: 400 }
      );
    }

    // Find the user
    const user = await db.user.findUnique({
      where: { email },
      include: { otpCode: true },
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }
    
    if (!user.otpCode) {
      return NextResponse.json(
        { message: "No OTP found. Please request a new verification code" },
        { status: 400 }
      );
    }

    // Check if OTP has expired
    if (new Date() > new Date(user.otpCode.expiresAt)) {
      // Delete expired OTP
      await db.otpCode.delete({
        where: { userId: user.id },
      });
      
      return NextResponse.json(
        { message: "OTP has expired. Please request a new verification code" },
        { status: 400 }
      );
    }

    // Check if OTP matches
    if (user.otpCode.code !== otp) {
      return NextResponse.json(
        { message: "Invalid OTP. Please try again" },
        { status: 400 }
      );
    }

    // Clear the OTP after successful verification
    await db.otpCode.delete({
      where: { userId: user.id },
    });

    // Optional: Update user verification status if needed
    // await db.user.update({
    //   where: { id: user.id },
    //   data: { emailVerified: new Date() },
    // });

    // Create session token
    const token = signJwtAccessToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    // Add a Set-Cookie header to set the token as a cookie
    const headers = new Headers();
    headers.append('Set-Cookie', `auth-token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`);

    return NextResponse.json(
      {
        message: "OTP verified successfully",
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
      { 
        status: 200,
        headers 
      }
    );
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return NextResponse.json(
      { message: "Failed to verify OTP" },
      { status: 500 }
    );
  }
}