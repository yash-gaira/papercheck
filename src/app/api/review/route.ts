import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { QuestionSchema, PaperMetadataSchema } from "@/types/paper";
import { performBharatCodeReview } from "@/lib/bharatcode";

export const dynamic = "force-dynamic";

const ReviewRequestSchema = z.object({
  questions: z.array(QuestionSchema).max(20),
  metadata: PaperMetadataSchema,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const parseResult = ReviewRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request payload format.",
          details: parseResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { questions, metadata } = parseResult.data;

    const result = await performBharatCodeReview(questions, metadata);

    return NextResponse.json(result, {
      status: result.success ? 200 : result.errorCode === "MISSING_API_KEY" ? 200 : 500,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error while processing paper review.",
        message: (error as Error)?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}

