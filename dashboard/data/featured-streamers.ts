export interface FeaturedStreamer {
  id: string;
  name: string;
  game: string;
  tags: string[];
  vanityUrl?: string;
  steamId?: string;
  youtube: string;
  twitch?: string;
  twitter?: string;
  description: string;
}

export const featuredStreamers: FeaturedStreamer[] = [
  {
    id: "ymfah",
    name: "ymfah",
    game: "Elden Ring",
    tags: ["Challenge Runs", "Elden Ring", "Skyrim"],
    vanityUrl: "ymfah",
    youtube: "https://www.youtube.com/@ymfah",
    twitch: "https://www.twitch.tv/ymfah",
    description: "Can you beat Elden Ring with only...",
  },
  {
    id: "ironpineapple",
    name: "Iron Pineapple",
    game: "Dark Souls",
    tags: ["Challenge Runs", "Dark Souls", "Sekiro"],
    vanityUrl: "ironpineapple",
    youtube: "https://www.youtube.com/@IronPineapple",
    twitch: "https://www.twitch.tv/iron_pineapple",
    description: "Creative challenge runs and PvP content",
  },
  {
    id: "distortion2",
    name: "Distortion2",
    game: "Elden Ring",
    tags: ["Speedrun", "Elden Ring", "Dark Souls"],
    vanityUrl: "distortion2",
    youtube: "https://www.youtube.com/@Distortion2",
    twitch: "https://www.twitch.tv/distortion2",
    description: "World record speedrunner for FromSoft games",
  },
  {
    id: "lilaggy",
    name: "LilAggy",
    game: "Elden Ring",
    tags: ["No-Hit", "Elden Ring", "Challenge Runs"],
    vanityUrl: "lilaggy",
    youtube: "https://www.youtube.com/@LilAggy",
    twitch: "https://www.twitch.tv/lilaggy",
    description: "No-hit runs and extreme challenges",
  },
  {
    id: "ginomachino",
    name: "GinoMachino",
    game: "Dark Souls",
    tags: ["No-Hit", "Dark Souls", "Elden Ring"],
    vanityUrl: "ginomachino",
    youtube: "https://www.youtube.com/@GinoMachino",
    twitch: "https://www.twitch.tv/ginomachino",
    description: "No-hit specialist across Souls games",
  },
  {
    id: "pointcrow",
    name: "PointCrow",
    game: "Zelda",
    tags: ["Challenge Runs", "Zelda", "Variety"],
    vanityUrl: "pointcrow",
    youtube: "https://www.youtube.com/@PointCrow",
    twitch: "https://www.twitch.tv/pointcrow",
    description: "Randomizers, challenge runs, and variety",
  },
  {
    id: "smallant",
    name: "Smallant",
    game: "Variety",
    tags: ["Challenge Runs", "Nintendo", "Speedrun"],
    vanityUrl: "smallant",
    youtube: "https://www.youtube.com/@Smallant",
    twitch: "https://www.twitch.tv/smallant",
    description: "Nintendo challenges and speedruns",
  },
  {
    id: "mittensquad",
    name: "Mitten Squad",
    game: "Fallout",
    tags: ["Challenge Runs", "Fallout", "Skyrim"],
    vanityUrl: "mittensquad",
    youtube: "https://www.youtube.com/@MittenSquad",
    description: "Can you beat games with absurd restrictions?",
  },
  {
    id: "hob",
    name: "Hob",
    game: "Elden Ring",
    tags: ["Challenge Runs", "Elden Ring", "Sekiro"],
    vanityUrl: "hob",
    youtube: "https://www.youtube.com/@Hob",
    twitch: "https://www.twitch.tv/hob",
    description: "Extreme challenge runs and meme builds",
  },
  {
    id: "limitbreakers",
    name: "Limit Breakers",
    game: "Elden Ring",
    tags: ["Challenge Runs", "Elden Ring", "Souls"],
    vanityUrl: "limitbreakers",
    youtube: "https://www.youtube.com/@LimitBreakers",
    description: "Breaking the limits of FromSoft games",
  },
];

export const gameFilterOptions = [
  "All",
  "Elden Ring",
  "Dark Souls",
  "Sekiro",
  "Zelda",
  "Fallout",
  "Skyrim",
  "Variety",
];
