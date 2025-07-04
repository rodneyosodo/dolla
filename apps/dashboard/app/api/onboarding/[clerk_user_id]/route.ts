import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:9010";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ clerk_user_id: string }> },
) {
  try {
    const body = await request.json();
    const params = await context.params;
    const { clerk_user_id } = params;

    const response = await fetch(`${BACKEND_URL}/onboarding/${clerk_user_id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || "Failed to complete onboarding" },
        { status: response.status },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error completing onboarding:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ clerk_user_id: string }> },
) {
  try {
    const params = await context.params;
    const { clerk_user_id } = params;

    const response = await fetch(`${BACKEND_URL}/profile/${clerk_user_id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.status === 404) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || "Failed to get profile" },
        { status: response.status },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error getting profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
