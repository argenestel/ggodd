import { NextRequest, NextResponse } from "next/server";
import { createSessionToken } from "@/lib/auth";
import { getSteamProfile } from "@/lib/steam";
import { getDbInstance, initDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const params = url.searchParams;

  // Verify OpenID response with Steam
  const verifyParams = new URLSearchParams();
  for (const [key, value] of params) {
    verifyParams.append(key, value);
  }
  verifyParams.set("openid.mode", "check_authentication");

  const verifyRes = await fetch("https://steamcommunity.com/openid/login", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: verifyParams.toString(),
  });

  const verifyBody = await verifyRes.text();
  if (!verifyBody.includes("is_valid:true")) {
    return NextResponse.redirect("/dashboard?error=steam_auth_failed");
  }

  // Extract Steam ID
  const claimedId = params.get("openid.claimed_id");
  if (!claimedId) {
    return NextResponse.redirect("/dashboard?error=no_steam_id");
  }

  const match = claimedId.match(/\/id\/(\d+)$/);
  const steamId = match ? match[1] : claimedId.split("/").pop();
  if (!steamId) {
    return NextResponse.redirect("/dashboard?error=no_steam_id");
  }

  // Get profile
  const profile = await getSteamProfile(steamId);
  const displayName = profile?.personaname || steamId;
  const avatarUrl = profile?.avatarfull || "";

  // Save to DB
  initDb();
  const db = getDbInstance();
  db.prepare(
    `INSERT INTO users (steam_id, display_name, avatar_url) VALUES (?, ?, ?)
     ON CONFLICT(steam_id) DO UPDATE SET display_name=excluded.display_name, avatar_url=excluded.avatar_url`
  ).run(steamId, displayName, avatarUrl);
  db.close();

  // Create session
  const token = await createSessionToken({
    steamId,
    displayName,
    avatarUrl,
  });

  const response = NextResponse.redirect("/dashboard");
  response.cookies.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });

  return response;
}
