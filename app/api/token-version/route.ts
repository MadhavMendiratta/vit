import { NextResponse } from "next/server";
import { SERVER_TOKEN_VERSION } from "@/lib/jwt";

export async function GET() {
  return NextResponse.json({ version: SERVER_TOKEN_VERSION });
}