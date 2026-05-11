const STEAM_API_KEY = process.env.STEAM_WEB_API_KEY || process.env.STEAM_API_KEY || "";

export interface SteamProfile {
  steamid: string;
  personaname: string;
  profileurl: string;
  avatar: string;
  avatarmedium: string;
  avatarfull: string;
  personastate?: number;
  gameextrainfo?: string;
  gameid?: string;
  loccountrycode?: string;
  timecreated?: number;
}

export interface SteamGame {
  appid: number;
  name: string;
  playtime_forever: number;
  playtime_2weeks?: number;
  img_icon_url?: string;
  img_logo_url?: string;
  has_community_visible_stats?: boolean;
}

export interface SteamAchievement {
  name: string;
  displayName: string;
  description: string;
  icon: string;
  icongray: string;
  achieved: number;
  unlocktime?: number;
}

export interface SteamAchievementSchema {
  name: string;
  displayName: string;
  description: string;
  icon: string;
  icongray: string;
  hidden: number;
}

export async function getSteamProfile(steamId: string): Promise<SteamProfile | null> {
  if (!STEAM_API_KEY) {
    return {
      steamid: steamId,
      personaname: "Streamer_" + steamId.slice(-4),
      profileurl: `https://steamcommunity.com/profiles/${steamId}`,
      avatar: "",
      avatarmedium: "",
      avatarfull: "",
      personastate: 1,
    };
  }

  const url = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${STEAM_API_KEY}&steamids=${steamId}`;
  const res = await fetch(url, { next: { revalidate: 60 } });
  const data = await res.json();
  const players = data?.response?.players;
  if (!players || players.length === 0) return null;
  const p = players[0];
  return {
    steamid: p.steamid,
    personaname: p.personaname,
    profileurl: p.profileurl,
    avatar: p.avatar,
    avatarmedium: p.avatarmedium,
    avatarfull: p.avatarfull,
    personastate: p.personastate,
    gameextrainfo: p.gameextrainfo,
    gameid: p.gameid,
    loccountrycode: p.loccountrycode,
    timecreated: p.timecreated,
  };
}

export async function searchSteamUsers(query: string): Promise<SteamProfile[]> {
  if (!STEAM_API_KEY) {
    return [
      {
        steamid: "76561198000000001",
        personaname: `${query}_ProGamer`,
        profileurl: "https://steamcommunity.com/id/demo1",
        avatar: "",
        avatarmedium: "",
        avatarfull: "",
      },
      {
        steamid: "76561198000000002",
        personaname: `${query}_StreamKing`,
        profileurl: "https://steamcommunity.com/id/demo2",
        avatar: "",
        avatarmedium: "",
        avatarfull: "",
      },
    ];
  }

  if (!/^\d+$/.test(query)) {
    const resolveUrl = `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/?key=${STEAM_API_KEY}&vanityurl=${encodeURIComponent(query)}`;
    const res = await fetch(resolveUrl, { next: { revalidate: 300 } });
    const data = await res.json();
    if (data?.response?.success === 1) {
      const profile = await getSteamProfile(data.response.steamid);
      return profile ? [profile] : [];
    }
  }

  if (/^\d{17}$/.test(query)) {
    const profile = await getSteamProfile(query);
    return profile ? [profile] : [];
  }

  return [];
}

export async function getOwnedGames(steamId: string): Promise<SteamGame[]> {
  if (!STEAM_API_KEY) {
    return [];
  }

  const url = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${STEAM_API_KEY}&steamid=${steamId}&include_appinfo=1&include_played_free_games=1`;
  const res = await fetch(url, { next: { revalidate: 300 } });
  const data = await res.json();
  if (!data?.response?.games) return [];
  
  return data.response.games
    .sort((a: any, b: any) => (b.playtime_forever || 0) - (a.playtime_forever || 0))
    .map((g: any) => ({
      appid: g.appid,
      name: g.name || `App ${g.appid}`,
      playtime_forever: g.playtime_forever || 0,
      playtime_2weeks: g.playtime_2weeks,
      img_icon_url: g.img_icon_url,
      img_logo_url: g.img_logo_url,
      has_community_visible_stats: g.has_community_visible_stats,
    }));
}

export async function getPlayerAchievements(
  steamId: string,
  appId: number
): Promise<SteamAchievement[]> {
  if (!STEAM_API_KEY) {
    return [];
  }

  const url = `https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v1/?key=${STEAM_API_KEY}&steamid=${steamId}&appid=${appId}`;
  const res = await fetch(url, { next: { revalidate: 60 } });
  const data = await res.json();
  if (!data?.playerstats?.achievements) return [];
  
  return data.playerstats.achievements.map((a: any) => ({
    name: a.apiname,
    displayName: a.name,
    description: a.description || "",
    icon: "",
    icongray: "",
    achieved: a.achieved,
    unlocktime: a.unlocktime,
  }));
}

export async function getGameSchema(appId: number): Promise<SteamAchievementSchema[]> {
  if (!STEAM_API_KEY) {
    return [];
  }

  const url = `https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/?key=${STEAM_API_KEY}&appid=${appId}`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  const data = await res.json();
  if (!data?.game?.availableGameStats?.achievements) return [];
  
  return data.game.availableGameStats.achievements.map((a: any) => ({
    name: a.name,
    displayName: a.displayName,
    description: a.description || "",
    icon: a.icon,
    icongray: a.icongray,
    hidden: a.hidden || 0,
  }));
}

export function getGameIconUrl(appId: number, iconHash: string): string {
  if (!iconHash) return "";
  return `https://media.steampowered.com/steamcommunity/public/images/apps/${appId}/${iconHash}.jpg`;
}

export function getGameHeaderUrl(appId: number): string {
  return `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/header.jpg`;
}

export function formatPlaytime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  if (hours < 1) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d ${hours % 24}h`;
}
