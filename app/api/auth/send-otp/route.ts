import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    // Find the user
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP with expiration time (10 minutes)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);
    
    await db.otpCode.upsert({
      where: { userId: user.id },
      update: { 
        code: otp,
        expiresAt
      },
      create: {
        userId: user.id,
        code: otp,
        expiresAt
      }
    });

    // Log OTP for development/testing
    console.log(`🔐 OTP for ${email}: ${otp}`);
    
    // Check if email credentials are configured
    const hasEmailConfig = process.env.EMAIL_HOST && 
                         process.env.EMAIL_USER && 
                         process.env.EMAIL_PASSWORD;

    if (hasEmailConfig) {
      try {
        // Send email with OTP
        const transporter = nodemailer.createTransport({
          host: process.env.EMAIL_HOST,
          port: parseInt(process.env.EMAIL_PORT || "587"),
          secure: process.env.EMAIL_SECURE === "true",
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
          },
        });

        await transporter.sendMail({
          from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
          to: email,
          subject: "Your Verification Code",
          text: `Your verification code is: ${otp}. It will expire in 10 minutes.`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Your Verification Code</h2>
              <p>Use the following code to complete your login:</p>
              <h1 style="font-size: 32px; letter-spacing: 5px; text-align: center; padding: 10px; background: #f0f0f0; border-radius: 4px;">${otp}</h1>
              <p>This code will expire in 10 minutes.</p>
              <p>If you didn't request this code, please ignore this email.</p>
            </div>
          `,
        });
        
        console.log(`Email sent to ${email} with OTP`);
      } catch (emailError) {
        console.error("Failed to send email:", emailError);
        // Continue execution - we've already saved the OTP to the database
      }
    } else {
      console.log("Email sending skipped - no email configuration found");
    }

    // Return success even if email fails - the OTP is in the database
    return NextResponse.json({ 
      message: "OTP generated successfully",
      devNote: !hasEmailConfig ? "Email not sent (no config). Check console for OTP." : undefined
    });
    
  } catch (error) {
    console.error("Error generating OTP:", error);
    return NextResponse.json(
      { message: "Failed to send OTP" },
      { status: 500 }
    );
  }
}