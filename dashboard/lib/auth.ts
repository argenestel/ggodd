import { SignJWT, jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "dev-secret-change-me-in-production"
);

export interface SteamSession {
  steamId: string;
  displayName: string;
  avatarUrl?: string;
}

export async function createSessionToken(session: SteamSession): Promise<string> {
  return new SignJWT({ ...session })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET);
}

export async function verifySessionToken(token: string): Promise<SteamSession | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET, { clockTolerance: 60 });
    return {
      steamId: payload.steamId as string,
      displayName: payload.displayName as string,
      avatarUrl: payload.avatarUrl as string | undefined,
    };
  } catch {
    return null;
  }
}
