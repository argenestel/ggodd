import { NextRequest, NextResponse } from "next/server";
import { searchSteamUsers } from "@/lib/steam";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");

  if (!q || q.length < 2) {
    return NextResponse.json({ users: [] });
  }

  const users = await searchSteamUsers(q);
  return NextResponse.json({ users });
}
