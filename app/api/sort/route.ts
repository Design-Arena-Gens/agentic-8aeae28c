import { NextRequest, NextResponse } from "next/server";
import { sortEmails } from "../../../lib/rules";
import type { SortRequest } from "../../../types/email";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as SortRequest;

    if (!Array.isArray(body?.emails) || !Array.isArray(body?.rules)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const result = sortEmails(body);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
