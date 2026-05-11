import { NextResponse } from "next/server";
import { featuredStreamers } from "@/data/featured-streamers";
import { searchSteamUsers, getSteamProfile } from "@/lib/steam";
import { listMarkets } from "@/lib/db";

export async function GET() {
  const results = await Promise.all(
    featuredStreamers.map(async (fs) => {
      let profile: {
        steamid: string;
        personaname: string;
        avatarfull: string;
        profileurl: string;
        gameextrainfo?: string;
      } | null = null;

      try {
        if (fs.steamId) {
          const p = await getSteamProfile(fs.steamId);
          if (p) profile = p;
        } else if (fs.vanityUrl) {
          const users = await searchSteamUsers(fs.vanityUrl);
          if (users.length > 0) {
            profile = users[0];
          }
        }
      } catch {
        // ignore resolution errors
      }

      let activeMarkets = 0;
      let totalVolume = 0;
      let latestAchievement: string | null = null;

      if (profile) {
        try {
          const markets = await listMarkets({ streamerId: profile.steamid });
          activeMarkets = markets.filter((m: any) => !m.resolved).length;
          totalVolume = markets.reduce(
            (sum: number, m: any) =>
              sum + (m.total_yes_sol || 0) + (m.total_no_sol || 0),
            0
          );
          const latest = markets[0];
          if (latest) latestAchievement = latest.achievement_name;
        } catch {
          // ignore db errors
        }
      }

      return {
        ...fs,
        resolved: !!profile,
        steamProfile: profile
          ? {
              steamid: profile.steamid,
              personaname: profile.personaname,
              avatarfull: profile.avatarfull,
              profileurl: profile.profileurl,
              gameextrainfo: profile.gameextrainfo,
            }
          : null,
        activeMarkets,
        totalVolume,
        latestAchievement,
      };
    })
  );

  const publicOnly = results.filter((s) => s.resolved && s.steamProfile);
  return NextResponse.json({ streamers: publicOnly });
}
