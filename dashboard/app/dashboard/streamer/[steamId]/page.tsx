import { notFound } from "next/navigation";
import { getSteamProfile, getOwnedGames, formatPlaytime, getGameHeaderUrl } from "@/lib/steam";
import { StreamerProfileClient } from "@/components/dashboard/streamer-profile-client";

interface Props {
  params: Promise<{ steamId: string }>;
}

export default async function StreamerProfilePage({ params }: Props) {
  const { steamId } = await params;
  const [profile, games] = await Promise.all([
    getSteamProfile(steamId),
    getOwnedGames(steamId),
  ]);

  if (!profile) {
    notFound();
  }

  return <StreamerProfileClient profile={profile} games={games} />;
}
