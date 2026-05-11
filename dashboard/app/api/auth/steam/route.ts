import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const realm = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;
  const returnTo = `${realm}/api/auth/steam/callback`;

  const params = new URLSearchParams({
    "openid.ns": "http://specs.openid.net/auth/2.0",
    "openid.mode": "checkid_setup",
    "openid.return_to": returnTo,
    "openid.realm": realm,
    "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select",
    "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
  });

  const redirectUrl = `https://steamcommunity.com/openid/login?${params.toString()}`;
  return NextResponse.redirect(redirectUrl);
}
