import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const isConfigured = Boolean(
    process.env.BHARATCODE_API_KEY && process.env.BHARATCODE_API_KEY.trim().length > 0
  );
  const model = process.env.BHARATCODE_MODEL || "qwen-3.8-27b";

  return NextResponse.json({
    aiConfigured: isConfigured,
    modelName: isConfigured ? model : null,
    provider: "BharatCode",
  });
}

