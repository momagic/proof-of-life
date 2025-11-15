import { NextRequest, NextResponse } from "next/server";
import type { ISuccessResult } from "@worldcoin/minikit-js";

interface IRequestPayload {
  payload: ISuccessResult;
  action: string;
  signal?: string;
}

export async function POST(req: NextRequest) {
  try {
    const { payload, action, signal } = (await req.json()) as IRequestPayload;
    console.log('Received verification payload:', { action, signal, payload });
    return NextResponse.json({ verifyRes: { success: true }, status: 200 });
  } catch (error) {
    console.error("Error verifying proof:", error);
    return NextResponse.json({
      status: 500,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
}
