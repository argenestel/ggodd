import { NextRequest, NextResponse } from "next/server";
import { createSessionToken } from "@/lib/auth";
import { getSteamProfile } from "@/lib/steam";
import { upsertUser } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
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
      return NextResponse.redirect(new URL("/dashboard?error=steam_verify_failed", req.url));
    }

  // Extract Steam ID
    const claimedId = params.get("openid.claimed_id");
    if (!claimedId) {
      return NextResponse.redirect(new URL("/dashboard?error=no_steam_id", req.url));
    }

    const profileMatch = claimedId.match(/\/profiles\/(\d+)/);
    const idMatch = claimedId.match(/\/id\/([^/]+)/);
    const steamId = profileMatch?.[1] || idMatch?.[1] || claimedId.split("/").pop();
    if (!steamId) {
      return NextResponse.redirect(new URL("/dashboard?error=steam_id_parse_failed", req.url));
    }

  // Get profile
    const profile = await getSteamProfile(steamId);
    const displayName = profile?.personaname || steamId;
    const avatarUrl = profile?.avatarfull || "";

  // Save to DB
    await upsertUser({
      steam_id: steamId,
      display_name: displayName,
      avatar_url: avatarUrl,
    });

  // Create session
    const token = await createSessionToken({
      steamId,
      displayName,
      avatarUrl,
    });

    const response = NextResponse.redirect(new URL("/dashboard", req.url));
    response.cookies.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Steam callback error:", error);
    return NextResponse.redirect(new URL("/dashboard?error=steam_callback_failed", req.url));
  }
}
